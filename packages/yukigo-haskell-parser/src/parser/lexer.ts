import moo, { Lexer, LexerState, Token } from "moo";
import { keywords } from "../utils/types.js";
declare module "moo" {
  interface Lexer {
    index: number; // Add the missing property to the type definition
  }
}

interface LayoutState {
  stack: number[]; // indentation stack (follows moo naming)
  tokenBuffer: Token[];
  expectingBlock: boolean;
  firstTokenProcessed: boolean;
}
type FullState = {
  layoutState: LayoutState;
  mooIndex?: number;
} & LexerState;

export const HaskellLexerConfig = {
  comment: { match: /--.*?$|{-[\s\S]*?-}/, lineBreaks: true },

  number:
    /0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|(?:\d*\.\d+|\d+)(?:[eE][+-]?\d+)?/,
  char: /'(?:\\['\\bfnrtv0]|\\u[0-9a-fA-F]{4}|[^'\\\n\r])?'/,
  string: { match: /"(?:\\[\s\S]|[^"\\])*"/, lineBreaks: true },

  lparen: "(",
  rparen: ")",
  lbracket: "{",
  rbracket: "}",
  lsquare: "[",
  rsquare: "]",
  semicolon: ";",

  typeArrow: "->",
  leftArrow: "<-",
  typeEquals: "::",
  fatArrow: "=>",
  op: {
    match:
    /,|>>=|>>|\\\\|\\|\.\.|\.|\+\+|\+|\-|\*\*|\*|===|!==|==|\/=|<=|>=|<|>|&&|\/|\|\||\$!|\$|\^\^|\^|#|@|~|!!|!|%|\?|:|&|`/,
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
  },

  NL: { match: /\r?\n/, lineBreaks: true },
  WS: { match: /[ \t]+/, lineBreaks: false },
};

export class HaskellLayoutLexer implements Lexer {
  public index: number;
  private mooLexer: Lexer;
  private state: LayoutState;

  private readonly layoutTriggers = new Set(["where", "let", "do", "of"]);
  private readonly noSemicolonKeywords = new Set(["in", "then", "else", "of"]);
  private readonly alwaysNewDeclarationKeywords = new Set([
    "type",
    "data",
    "class",
    "instance",
    "describe",
    "it",
    "module",
    "import",
  ]);

  constructor() {
    this.mooLexer = moo.compile(HaskellLexerConfig);
    this.state = {
      stack: [1],
      tokenBuffer: [],
      expectingBlock: false,
      firstTokenProcessed: false,
    };
  }

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

  reset(chunk?: string, state?: FullState): this {
    if (state && state.layoutState) {
      const fullState = state;
      this.state = {
        stack: [...fullState.layoutState.stack],
        tokenBuffer: [...fullState.layoutState.tokenBuffer],
        expectingBlock: fullState.layoutState.expectingBlock,
        firstTokenProcessed: fullState.layoutState.firstTokenProcessed,
      };
      this.mooLexer.reset(chunk, fullState);
      if (typeof fullState.mooIndex === "number") {
        this.mooLexer.index = fullState.mooIndex;
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

  save(): FullState {
    return {
      ...this.mooLexer.save(),
      mooIndex: this.mooLexer.index,
      layoutState: {
        stack: [...this.state.stack],
        tokenBuffer: [...this.state.tokenBuffer],
        expectingBlock: this.state.expectingBlock,
        firstTokenProcessed: this.state.firstTokenProcessed,
      },
    };
  }

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
    return true; // deprecated in moo but Lexer interface requires it.
  }

  next(): Token | undefined {
    let token: Token | undefined;

    if (this.state.tokenBuffer.length > 0) {
      token = this.state.tokenBuffer.shift();
    } else {
      token = this.fetchAndProcessNextToken();
    }

    if (token) {
      this.checkLayoutTrigger(token);
      if (!this.state.firstTokenProcessed && token.col > 1) {
        this.state.stack[0] = token.col;
      }
      this.state.firstTokenProcessed = true;
    }

    return token;
  }

  private fetchAndProcessNextToken(): Token | undefined {
    let { token: rawToken, crossedNewline } =
      this.advanceSkippingWhitespace();

    if (!rawToken) return this.emitEOF();

    // If the token itself crossed lines (like a multiline string),
    // we should treat the NEXT token as if it crossed a newline for layout purposes.
    // However, the current token should also be processed for indentation if it's the first on its line.
    
    if (this.state.expectingBlock) return this.handleBlockStart(rawToken);

    if (this.isInToken(rawToken)) return this.handleInKeyword(rawToken);

    if (crossedNewline) return this.handleIndentationChange(rawToken);

    return rawToken;
  }

  private advanceSkippingWhitespace(): {
    token: Token | undefined;
    crossedNewline: boolean;
  } {
    let token = this.mooLexer.next();
    let crossedNewline = false;

    while (token && this.isSkippableToken(token)) {
      if (this.isNewlineToken(token)) crossedNewline = true;
      token = this.mooLexer.next();
    }
    return { token, crossedNewline };
  }

  private closeBlocksUntil(targetIndent: number, sourceToken: Token): Token {
    const ops: Token[] = [];

    while (
      this.state.stack.length > 1 &&
      this.state.stack[this.state.stack.length - 1] > targetIndent
    ) {
      this.state.stack.pop();
      ops.push(this.createVirtualToken("rbracket", "}", sourceToken));
    }

    const isAlwaysNewDeclaration =
      this.state.stack.length === 1 &&
      sourceToken.type === "keyword" &&
      this.alwaysNewDeclarationKeywords.has(sourceToken.value);

    const shouldInjectSemicolon =
      !sourceToken.value || !this.noSemicolonKeywords.has(sourceToken.value);

    if (
      this.state.stack.length > 1 &&
      this.state.stack[this.state.stack.length - 1] === targetIndent &&
      this.isInToken(sourceToken)
    ) {
      this.state.stack.pop();
      ops.push(this.createVirtualToken("rbracket", "}", sourceToken));
    } else if (
      (this.state.stack.length > 0 &&
        this.state.stack[this.state.stack.length - 1] === targetIndent &&
        shouldInjectSemicolon) ||
      isAlwaysNewDeclaration
    ) {
      ops.push(this.createVirtualToken("semicolon", ";", sourceToken));
    }

    this.state.tokenBuffer.unshift(...ops);

    return this.state.tokenBuffer.shift();
  }

  private emitEOF(): Token | undefined {
    if (this.state.stack.length > 1) {
      const dummy = {
        line: 0,
        col: 0,
        text: "",
        value: "",
        offset: 0,
        lineBreaks: 0,
      };
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

  private handleBlockStart(token: Token) {
    this.state.expectingBlock = false;
    if (token.type === "lbracket") return token;

    this.state.stack.push(token.col);
    this.enqueue(token);
    return this.createVirtualToken("lbracket", "{", token);
  }
  private handleInKeyword(token: Token) {
    const stackTop = this.state.stack[this.state.stack.length - 1];
    if (token.col < stackTop) {
      this.enqueue(token);
      return this.closeBlocksUntil(token.col, token);
    }
    if (this.state.stack.length > 1) {
      this.state.stack.pop();
      this.enqueue(token);
      return this.createVirtualToken("rbracket", "}", token);
    }
    return token;
  }
  private handleIndentationChange(token: Token) {
    const currentIndent = token.col;
    const stackTop = this.state.stack[this.state.stack.length - 1];

    const isAlwaysNewDeclaration =
      this.state.stack.length === 1 &&
      token.type === "keyword" &&
      this.alwaysNewDeclarationKeywords.has(token.value);

    if (currentIndent === stackTop || isAlwaysNewDeclaration) {
      const isContinuationKeyword =
        token.value && this.noSemicolonKeywords.has(token.value);
      if (this.state.firstTokenProcessed && !isContinuationKeyword) {
        this.enqueue(token);
        return this.createVirtualToken("semicolon", ";", token);
      }
      return token;
    } else if (currentIndent < stackTop) {
      this.enqueue(token);
      return this.closeBlocksUntil(currentIndent, token);
    }
    return token;
  }

  private checkLayoutTrigger(token: Token) {
    if (token && token.value && this.layoutTriggers.has(token.value))
      this.state.expectingBlock = true;
  }
  private isSkippableToken(token: Token) {
    return (
      token.type === "WS" ||
      this.isNewlineToken(token) ||
      token.type === "comment"
    );
  }
  private isNewlineToken(token: Token) {
    return token.type === "NL";
  }
  private isInToken(token: Token) {
    return token.type === "keyword" && token.value === "in";
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
