import moo, { Lexer, Token } from "moo";
import { keywords } from "../utils/types.js";

// --- 1. Definición de Tipos y Estado ---

interface LayoutState {
  stack: number[]; // Pila de indentación (ej: [0, 4, 8])
  tokenBuffer: Token[]; // Tokens pendientes de entregar
  expectingBlock: boolean; // ¿El último token fue 'where', 'do', etc?
  firstTokenProcessed: boolean;
}

// Necesario para save/restore
interface FullState {
  mooState: any;
  layoutState: LayoutState;
}

// --- 2. Configuración de Moo (Sin cambios mayores) ---
// Es importante capturar WS y NL para calcular posiciones, pero no emitirlos al parser.
export const HaskellLexerConfig = {
  // Comentarios: consumirlos o emitirlos según prefieras (aquí se emiten pero el lexer wrapper los filtra)
  comment: { match: /--.*?$|{-[\s\S]*?-}/, lineBreaks: true },

  // Literales
  number:
    /0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|(?:\d*\.\d+|\d+)(?:[eE][+-]?\d+)?/,
  char: /'(?:\\['\\bfnrtv0]|\\u[0-9a-fA-F]{4}|[^'\\\n\r])?'/,
  string: /"(?:\\["\\bfnrtv0]|\\u[0-9a-fA-F]{4}|[^"\\\n\r])*"/,

  // Estructura
  lparen: "(",
  rparen: ")",
  lbracket: "{",
  rbracket: "}",
  lsquare: "[",
  rsquare: "]",
  semicolon: ";",
  // Operadores y resto
  typeArrow: "->",
  leftArrow: "<-",
  typeEquals: "::",
  fatArrow: "=>",
  op: {
    match:
      /,|>>=|>>|\\\\|\\|\.\.|\.|\+\+|\+|\-|\*\*|\*|===|!==|==|\/=|<=|>=|<|>|&&|\/|\|\||\$|\^\^|\^|#|@|~|!!|!|%|\?|:|&|`/,
    lineBreaks: false,
  },
  assign: "=",
  backslash: "\\",
  pipe: "|",
  at: "@",
  tilde: "~",

  anonymousVariable: "_",

  constructor: {
    match: /[A-Z][a-zA-Z0-9']*/,
    type: moo.keywords({ bool: ["True", "False"] }),
  },
  variable: {
    match: /[a-z_][a-zA-Z0-9_']*/,
    type: moo.keywords({ otherwise: "otherwise", keyword: keywords }),
  }, // 'in' ya está arriba

  // Espacios
  NL: { match: /\r?\n/, lineBreaks: true },
  WS: { match: /[ \t]+/, lineBreaks: false },
  any: { match: /.+/, lineBreaks: true },
};

// --- 3. La Clase Wrapper (Tu "Yulex" ligero) ---

export class HaskellLayoutLexer implements Lexer {
  private mooLexer: Lexer;
  private state: LayoutState;

  // Estos tokens activan la búsqueda de un nuevo bloque
  private readonly layoutTriggers = new Set(["where", "let", "do", "of"]);
  private readonly noSemicolonKeywords = new Set(["in", "then", "else", "of"]);

  constructor() {
    this.mooLexer = moo.compile(HaskellLexerConfig);
    this.state = {
      stack: [1],
      tokenBuffer: [],
      expectingBlock: false,
      firstTokenProcessed: false,
    };
  }

  // --- Implementación de Iterator (para for..of) ---
  [Symbol.iterator](): Iterator<Token> {
    return {
      next: () => {
        const value = this.next();
        return value
          ? { value, done: false }
          : { value: undefined, done: true };
      },
    };
  }

  // --- Reset y Save (Vital para Nearley) ---

  reset(chunk?: string, state?: any): this {
    if (state && state.layoutState) {
      const fullState = state as FullState & { mooIndex?: number };
      this.state = {
        stack: [...fullState.layoutState.stack],
        tokenBuffer: [...fullState.layoutState.tokenBuffer],
        expectingBlock: fullState.layoutState.expectingBlock,
        firstTokenProcessed: fullState.layoutState.firstTokenProcessed,
      };
      this.mooLexer.reset(chunk, fullState.mooState);
      if (typeof fullState.mooIndex === "number") {
        (this.mooLexer as any).index = fullState.mooIndex;
      }
    } else {
      this.state = {
        stack: [1],
        tokenBuffer: [],
        expectingBlock: false,
        firstTokenProcessed: false,
      };
      this.mooLexer.reset(chunk);
    }
    return this;
  }

  save(): any {
    return {
      mooState: this.mooLexer.save(),
      mooIndex: (this.mooLexer as any).index,
      layoutState: {
        stack: [...this.state.stack],
        tokenBuffer: [...this.state.tokenBuffer],
        expectingBlock: this.state.expectingBlock,
        firstTokenProcessed: this.state.firstTokenProcessed,
      },
    };
  }

  // --- Métodos Delegados ---
  pushState(state: string) {
    this.mooLexer.pushState(state);
  }
  popState() {
    return this.mooLexer.popState();
  }
  setState(state: string) {
    this.mooLexer.setState(state);
  }
  formatError(token: Token, message?: string) {
    return this.mooLexer.formatError(token, message);
  }
  has(tokenType: string) {
    return true;
  }

  // --- EL CORAZÓN DE LA LÓGICA (next) ---

  next(): Token | undefined {
    let tokenToReturn: Token | undefined;

    // 1. Intentar sacar del buffer
    if (this.state.tokenBuffer.length > 0) {
      tokenToReturn = this.state.tokenBuffer.shift();
    } else {
      // 2. Si no, leer siguiente token real (saltando WS)
      const { token, crossedNewline } = this.advanceSkippingWhitespace();
      if (!token) return this.emitEOF();

      // Lógica A: Iniciar bloque pendiente (ej: después de do/let/where)
      // Si esperamos bloque, el SIGUIENTE token define la indentación.
      if (this.state.expectingBlock) {
        this.state.expectingBlock = false;
        if (token.type === "lbracket") {
          // Bloque explícito '{', no hacemos magia
          tokenToReturn = token;
        } else {
          // Bloque implícito: inyectamos '{' y apilamos indentación
          this.state.stack.push(token.col);
          this.enqueue(token);
          tokenToReturn = this.createVirtualToken("lbracket", "{", token);
        }
      }
      // Lógica D: Caso especial 'in' (dedent explícito o cierre inline)
      else if (token.value === "in") {
        const stackTop = this.state.stack[this.state.stack.length - 1];
        if (token.col < stackTop) {
          this.enqueue(token);
          tokenToReturn = this.closeBlocksUntil(token.col, token);
        } else {
          // Inline o Aligned: 'in' siempre cierra el bloque actual
          if (this.state.stack.length > 1) {
            this.state.stack.pop();
            this.enqueue(token);
            tokenToReturn = this.createVirtualToken("rbracket", "}", token);
          } else {
            tokenToReturn = token;
          }
        }
      }
      // Lógica B: Manejo de indentación tras salto de línea
      else if (crossedNewline) {
        const currentIndent = token.col;
        const stackTop = this.state.stack[this.state.stack.length - 1];

        if (currentIndent === stackTop) {
          // Misma indentación -> separador ';'
          // EVITAR ';' si es el primer token del archivo
          const isContinuationKeyword =
            token.value && this.noSemicolonKeywords.has(token.value);
          if (this.state.firstTokenProcessed && !isContinuationKeyword) {
            this.enqueue(token);
            tokenToReturn = this.createVirtualToken("semicolon", ";", token);
          } else {
            tokenToReturn = token;
          }
        } else if (currentIndent < stackTop) {
          // Menos indentación -> cerrar bloques '}'
          this.enqueue(token);
          tokenToReturn = this.closeBlocksUntil(currentIndent, token);
        } else {
          // Mayor indentación -> continuación de línea, nada especial
          tokenToReturn = token;
        }
      } else {
        // Token normal
        tokenToReturn = token;
      }
    }

    // Lógica C (FIX): Detectar Triggers SIEMPRE antes de retornar
    // Verificamos si el token que VAMOS a entregar es un trigger.
    if (tokenToReturn && tokenToReturn.value && this.layoutTriggers.has(tokenToReturn.value)) {
      this.state.expectingBlock = true;
    }

    if (tokenToReturn) {
      this.state.firstTokenProcessed = true;
    }

    return tokenToReturn;
  }

  // --- Helpers Privados ---

  // Avanza el lexer interno consumiendo WS y Comments.
  // Devuelve el siguiente token REAL y un flag si cruzamos algún NL.
  private advanceSkippingWhitespace(): {
    token: Token | undefined;
    crossedNewline: boolean;
  } {
    let token = this.mooLexer.next();
    let crossedNewline = false;

    while (
      token &&
      (token.type === "WS" || token.type === "NL" || token.type === "comment")
    ) {
      if (token.type === "NL") {
        crossedNewline = true;
      }
      token = this.mooLexer.next();
    }

    return { token, crossedNewline };
  }

  // Cierra bloques hasta llegar al nivel deseado
  private closeBlocksUntil(targetIndent: number, sourceToken: Token): Token {
    // Sacamos items del buffer temporalmente porque queremos inyectar los '}' PRIMERO
    // Nota: en la lógica de next() ya hicimos enqueue(token), así que el buffer tiene [tokenReal]
    // Queremos que quede: [}, }, ;, tokenReal]

    const ops: Token[] = [];

    while (
      this.state.stack.length > 1 &&
      this.state.stack[this.state.stack.length - 1] > targetIndent
    ) {
      this.state.stack.pop();
      ops.push(this.createVirtualToken("rbracket", "}", sourceToken));
    }

    // Opcional: Si al terminar de cerrar quedamos alineados, metemos un ';'
    // Esto es estilo Haskell:
    //   do a
    //      b
    //   c  <-- Cierra bloque de b, Y añade ; antes de c
    // EXCEPCIÓN: Palabras clave que continúan una expresión (in, then, else, of) no llevan ; antes
    const shouldInjectSemicolon =
      !sourceToken.value || !this.noSemicolonKeywords.has(sourceToken.value);

    // Si es 'in' y estamos alineados, cerramos el bloque en lugar de poner ;
    if (
      this.state.stack.length > 1 &&
      this.state.stack[this.state.stack.length - 1] === targetIndent &&
      sourceToken.value === "in"
    ) {
      this.state.stack.pop();
      ops.push(this.createVirtualToken("rbracket", "}", sourceToken));
    } else if (
      this.state.stack.length > 0 &&
      this.state.stack[this.state.stack.length - 1] === targetIndent &&
      shouldInjectSemicolon
    ) {
      ops.push(this.createVirtualToken("semicolon", ";", sourceToken));
    }

    // Inyectamos los tokens generados AL PRINCIPIO del buffer
    this.state.tokenBuffer.unshift(...ops);

    return this.state.tokenBuffer.shift()!; // Devolvemos el primero
  }

  private emitEOF(): Token | undefined {
    if (this.state.stack.length > 1) {
      // Crear token dummy para EOF
      const dummy = {
        line: 0,
        col: 0,
        text: "",
        value: "",
        offset: 0,
        lineBreaks: 0,
      } as Token;
      // Cerrar todo lo que quede
      const ops: Token[] = [];
      while (this.state.stack.length > 1) {
        this.state.stack.pop();
        ops.push(this.createVirtualToken("rbracket", "}", dummy));
      }
      this.state.tokenBuffer.push(...ops);
      return this.state.tokenBuffer.shift();
    }
    return undefined;
  }

  private enqueue(token: Token) {
    this.state.tokenBuffer.push(token);
  }

  private createVirtualToken(
    type: string,
    value: string,
    source: Token
  ): Token {
    return {
      type,
      value,
      text: value,
      line: source.line,
      col: source.col,
      offset: source.offset,
      lineBreaks: 0,
      toString: () => value,
    };
  }
}

export const HSLexer = new HaskellLayoutLexer();
