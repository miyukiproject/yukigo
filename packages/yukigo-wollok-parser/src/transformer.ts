import * as Yu from "yukigo-ast";
import {
  Assignment,
  Body,
  Catch,
  Class,
  Expression,
  Field,
  If,
  Import,
  List,
  Literal,
  LiteralValue,
  Method,
  Mixin,
  NamedArgument,
  New,
  Node,
  Package,
  Parameter,
  Reference,
  Return,
  Self,
  Send,
  Singleton,
  Super,
  Throw,
  Try,
  Variable,
  Test,
  Describe,
  Program,
} from "wollok-ts";
import { inspect } from "util";

const ARITHMETIC_BINARY_OPS: Record<string, Yu.ArithmeticBinaryOperator> = {
  "+": "Plus",
  "-": "Minus",
  "*": "Multiply",
  "/": "Divide",
  "%": "Modulo",
  "**": "Power",
};

const COMPARISON_OPS: Record<string, Yu.ComparisonOperatorType> = {
  "==": "Equal",
  "!=": "NotEqual",
  "===": "Same",
  "!==": "NotSame",
  ">=": "GreaterOrEqualThan",
  ">": "GreaterThan",
  "<=": "LessOrEqualThan",
  "<": "LessThan",
  like: "Similar",
};

const LOGICAL_BINARY_OPS: Record<string, Yu.LogicalBinaryOperator> = {
  "&&": "And",
  and: "And",
  "||": "Or",
  or: "Or",
};

const BITWISE_BINARY_OPS: Record<string, Yu.BitwiseBinaryOperator> = {
  "|": "BitwiseOr",
  "&": "BitwiseAnd",
  "^": "BitwiseXor",
  "<<": "BitwiseLeftShift",
  ">>": "BitwiseRightShift",
  ">>>": "BitwiseUnsignedRightShift",
};

function mapLocation(wollokNode: Node): Yu.SourceLocation | undefined {
  if (wollokNode.sourceMap && wollokNode.sourceMap.start) {
    return new Yu.SourceLocation(
      wollokNode.sourceMap.start.line,
      wollokNode.sourceMap.start.column,
    );
  }
  return undefined;
}

let anonymousIdCounter = 0;

export class WollokToYukigoTransformer {
  public transform(root: Package): Yu.AST {
    const result = this.visit(root);
    return Array.isArray(result) ? result : [result];
  }
  public transformExpr(root: Node): Yu.Expression {
    const result = this.visit(root);
    return result;
  }

  private visit(node: Node): any {
    const kind = node.kind;
    switch (kind) {
      case "Package":
        return this.visitPackage(node as Package);
      case "Singleton":
        return this.visitSingleton(node as Singleton);
      case "Mixin":
      case "Class":
        return this.visitClass(node as Class | Mixin);
      case "Program":
        return this.visitProgram(node as Program);
      case "Describe":
        return this.visitDescribe(node as Describe);
      case "Test":
        return this.visitTest(node as Test);
      case "Method":
        return this.visitMethod(node as Method);
      case "Body":
        return this.visitBody(node as Body);
      case "Send":
        return this.visitSend(node as Send);
      case "Literal":
        return this.visitLiteral(node as Literal);
      case "Reference":
        return this.visitReference(node as Reference<any>);
      case "Parameter":
        return this.visitParameter(node as Parameter);
      case "Return":
        return this.visitReturn(node as Return);
      case "Variable":
        return this.visitVariable(node as Variable);
      case "New":
        return this.visitNew(node as New);
      case "If":
        return this.visitIf(node as If);
      case "Field":
        return this.visitField(node as Field);
      case "Assignment":
        return this.visitAssignment(node as Assignment);
      case "Throw":
        return this.visitThrow(node as Throw);
      case "Try":
        return this.visitTry(node as Try);
      case "Catch":
        return this.visitCatch(node as Catch);
      case "Self":
        return this.visitSelf(node as Self);
      case "Super":
        return this.visitSuper(node as Super);
      case "NamedArgument":
        return this.visitNamedArgument(node as NamedArgument);
      default:
        throw new Error(`Nodo Wollok desconocido o no soportado: ${kind}`);
    }
  }

  private visitPackage(node: Package): Yu.Statement[] {
    return node.members.map((member: Node) => this.visit(member));
  }

  private visitField(node: Field): Yu.Attribute {
    const identifier = new Yu.SymbolPrimitive(node.name, mapLocation(node));

    let value: Yu.Expression;
    if (node.value) {
      value = this.visit(node.value);
    } else {
      // default to Nil if no initial value provided
      value = new Yu.NilPrimitive(null, mapLocation(node));
    }

    return new Yu.Attribute(identifier, value, mapLocation(node));
  }

  private visitVariable(node: Variable): Yu.Variable {
    const identifier = new Yu.SymbolPrimitive(node.name, mapLocation(node));

    let expression: Yu.Expression;
    if (node.value) {
      expression = this.visit(node.value);
    } else {
      expression = new Yu.NilPrimitive(null, mapLocation(node));
    }

    return new Yu.Variable(
      identifier,
      expression,
      undefined,
      mapLocation(node),
    );
  }

  private visitAssignment(node: Assignment): Yu.Assignment {
    const refName = node.variable.name || node.variable;
    const identifier = new Yu.SymbolPrimitive(
      refName.toString(),
      mapLocation(node),
    );

    const expression = this.visit(node.value);

    return new Yu.Assignment(identifier, expression, mapLocation(node));
  }

  private visitNew(node: New): Yu.New {
    const className = new Yu.SymbolPrimitive(
      node.instantiated.name,
      mapLocation(node),
    );
    const args = (node.args || []).map((arg: any) => this.visit(arg));

    return new Yu.New(className, args, mapLocation(node));
  }

  private visitIf(node: If): Yu.If {
    const condition = this.visit(node.condition);
    const thenExpr = this.visit(node.thenBody);

    let elseExpr: Yu.Expression;
    if (node.elseBody) {
      elseExpr = this.visit(node.elseBody);
    } else {
      elseExpr = new Yu.Sequence([], mapLocation(node));
    }

    return new Yu.If(condition, thenExpr, elseExpr, mapLocation(node));
  }

  private visitNamedArgument(node: NamedArgument): Yu.NamedArgument {
    const expr = this.visit(node.value);
    return new Yu.NamedArgument(
      new Yu.SymbolPrimitive(node.name),
      expr,
      mapLocation(node),
    );
  }

  private visitThrow(node: Throw): Yu.Raise {
    const exception = this.visit(node.exception);
    return new Yu.Raise(exception, mapLocation(node));
  }

  private visitTry(node: Try): Yu.Try {
    const body = this.visit(node.body);
    const rawCatches = node.catches;
    const catchExprs: Yu.Catch[] = rawCatches.map((c: any) =>
      this.visitCatch(c),
    );

    let finallyExpr: Yu.Expression;
    if (node.always) {
      finallyExpr = this.visit(node.always);
    } else {
      finallyExpr = new Yu.Sequence([], mapLocation(node));
    }

    return new Yu.Try(body, catchExprs, finallyExpr, mapLocation(node));
  }

  private visitCatch(node: Catch): Yu.Catch {
    const paramName = node.parameter.name;
    const pattern = new Yu.VariablePattern(
      new Yu.SymbolPrimitive(paramName, mapLocation(node.parameter)),
      mapLocation(node.parameter),
    );

    const body = this.visit(node.body);

    return new Yu.Catch([pattern], body, mapLocation(node));
  }
  private visitSuper(node: Super): Yu.Super {
    return new Yu.Super(
      node.args.map((arg) => this.visit(arg)),
      mapLocation(node),
    );
  }

  private visitSingleton(node: Singleton): Yu.Object | Yu.Lambda {
    // 1. Detectamos la clausura mirando los supertipos (¡Match exacto con tu JSON!)
    const isClosure = node.supertypes?.some(
      (t: any) => t.reference?.name === "wollok.lang.Closure",
    );

    if (isClosure) {
      // 2. Buscamos el método <apply> (¡Match exacto con tu JSON!)
      const applyMethod = node.members.find(
        (m: any) => m.name === "apply" || m.name === "<apply>",
      ) as Method;

      if (applyMethod && applyMethod.body && applyMethod.body !== "native") {
        const params = (applyMethod.parameters || []).map((p: any) =>
          this.visit(p),
        );
        // Transformamos el cuerpo del <apply> en la secuencia ejecutable del Lambda
        const bodyExpr = this.visit(applyMethod.body);
        return new Yu.Lambda(params, bodyExpr, mapLocation(node));
      }
    }

    // 3. Fallback: Si no es Closure, armamos el objeto anónimo normal
    const name = node.name || `anonymous_object_${anonymousIdCounter++}`;
    const identifier = new Yu.SymbolPrimitive(name, mapLocation(node));

    const members = node.members.map((m: Node) => this.visit(m));
    const bodyExpression = new Yu.Sequence(members, mapLocation(node));

    const obj = new Yu.Object(identifier, bodyExpression, mapLocation(node));
    const supertype = node.supertypes && node.supertypes[0];

    if (supertype && !isClosure) {
      const superclass = new Yu.SymbolPrimitive(
        supertype.reference.name,
        mapLocation(supertype),
      );
      (obj as any).extendsSymbol = superclass;
      (obj as any).extendsArgs = (supertype.args || []).map((arg: any) =>
        this.visit(arg),
      );
    } else {
      (obj as any).extendsSymbol = new Yu.SymbolPrimitive(
        "Object",
        mapLocation(node),
      );
      (obj as any).extendsArgs = [];
    }

    return obj;
  }

  private visitClass(node: Class | Mixin): Yu.Class {
    const identifier = new Yu.SymbolPrimitive(node.name, mapLocation(node));

    const superclass = node.supertypes[0]
      ? new Yu.SymbolPrimitive(
          node.supertypes[0].reference.name,
          mapLocation(node.supertypes[0]),
        )
      : undefined;

    const members = node.members.map((m: any) => this.visit(m));
    const bodyExpression = new Yu.Sequence(members, mapLocation(node));
    const classInstance = new Yu.Class(
      identifier,
      superclass,
      undefined,
      [],
      bodyExpression,
      mapLocation(node),
    );
    return classInstance;
  }

  private visitMethod(node: Method): Yu.Method {
    const identifier = new Yu.SymbolPrimitive(node.name, mapLocation(node));
    const patterns: Yu.Pattern[] = (node.parameters || []).map((param) =>
      this.visit(param),
    );

    const methodBody: Yu.UnguardedBody | Yu.NativeBody = this.getBody(node);

    const equation = new Yu.Equation(
      patterns,
      methodBody,
      undefined,
      mapLocation(node),
    );

    return new Yu.Method(identifier, [equation], mapLocation(node));
  }
  private getBody(node: Method) {
    const body = node.body;

    // Abstract methods have no body
    if (!body)
      return new Yu.UnguardedBody(
        new Yu.Sequence([], mapLocation(node)),
        mapLocation(node),
      );

    if (body === "native") return new Yu.NativeBody(mapLocation(node));

    const bodySequence = this.visit(body);
    return new Yu.UnguardedBody(bodySequence, mapLocation(body));
  }

  private visitParameter(node: Parameter): Yu.VariablePattern {
    const nameSymbol = new Yu.SymbolPrimitive(node.name, mapLocation(node));
    return new Yu.VariablePattern(nameSymbol, mapLocation(node));
  }
  private visitReturn(node: Return): Yu.Return {
    const value = node.value;
    if (!value)
      throw new Error("Parser: In Return, value cannot be undefined.");
    const expression = this.visit(node.value);
    return new Yu.Return(expression, mapLocation(node));
  }

  private visitBody(node: Body): Yu.Sequence {
    const statements = node.sentences.map((s: any) => this.visit(s));
    return new Yu.Sequence(statements, mapLocation(node));
  }

  private visitSend(node: Send): Yu.Expression {
    const receiver = this.visit(node.receiver);
    const args = (node.args || []).map((arg: any) => this.visit(arg));
    const op = node.message;
    const loc = mapLocation(node);

    if (args.length === 1) {
      const binaryExpr = transformBinary(op, receiver, args[0], loc);
      if (binaryExpr) return binaryExpr;
    }

    if (args.length === 0) {
      const unaryExpr = transformUnary(op, receiver, loc);
      // note that binaryExpr and unaryExpr can be null if it transform functions cant match any operation to the selector
      if (unaryExpr) return unaryExpr;
    }

    if (receiver instanceof Yu.NilPrimitive) {
      return new Yu.Send(
        new Yu.SymbolPrimitive(op, loc),
        new Yu.SymbolPrimitive("apply", loc),
        args,
        loc,
      );
    }

    const selector = new Yu.SymbolPrimitive(op, loc);
    return new Yu.Send(receiver, selector, args, loc);
  }

  private visitReference(node: Reference<any>): Yu.SymbolPrimitive | Yu.Self {
    if (node.name === "self") return new Yu.Self(mapLocation(node));
    return new Yu.SymbolPrimitive(node.name, mapLocation(node));
  }
  private visitSelf(node: Self): Yu.Self {
    return new Yu.Self(mapLocation(node));
  }

  private visitLiteral(node: Literal): Yu.Primitive {
    const val = node.value;
    const loc = mapLocation(node);

    if (isCollection(val))
      return new Yu.ListPrimitive(
        val[1].map((element) => this.visit(element)),
        loc,
      );
    if (typeof val === "number") return new Yu.NumberPrimitive(val, loc);
    if (typeof val === "boolean") return new Yu.BooleanPrimitive(val, loc);
    if (val === null) return new Yu.NilPrimitive(null, loc);

    return new Yu.StringPrimitive(String(val), loc);
  }

  private visitProgram(node: Program): Yu.Sequence {
    return this.visit(node.body);
  }

  private visitDescribe(node: Describe): Yu.TestGroup {
    const nameExpr = new Yu.StringPrimitive(node.name, mapLocation(node));
    const members = node.members.map((m: any) => {
      const visited = this.visit(m);
      if (visited instanceof Yu.Method) {
        return new Yu.Function(
          visited.identifier,
          visited.equations,
          mapLocation(m),
        );
      }
      return visited;
    });
    const groupSeq = new Yu.Sequence(members, mapLocation(node));
    return new Yu.TestGroup(nameExpr, groupSeq, mapLocation(node));
  }

  private visitTest(node: Test): Yu.Test {
    const nameExpr = new Yu.StringPrimitive(node.name, mapLocation(node));
    const bodySeq = this.visit(node.body);
    return new Yu.Test(nameExpr, bodySeq, [], mapLocation(node));
  }
}

const WollokListTypes = ["wollok.lang.List", "wollok.lang.Set"];
type WollokList = readonly [Reference<Class>, List<Expression>];
const isCollection = (val: LiteralValue): val is WollokList =>
  Array.isArray(val) &&
  "name" in val[0] &&
  WollokListTypes.includes(val[0].name);

function transformBinary(
  op: string,
  left: Yu.Expression,
  right: Yu.Expression,
  loc: Yu.SourceLocation | undefined,
): Yu.Expression | null {
  // RangeExpression
  if (op === "..") return new Yu.RangeExpression(left, right, undefined, loc);

  // Arithmetic
  if (op in ARITHMETIC_BINARY_OPS)
    return new Yu.ArithmeticBinaryOperation(
      ARITHMETIC_BINARY_OPS[op],
      left,
      right,
      loc,
    );

  // Comparison
  if (op in COMPARISON_OPS)
    return new Yu.ComparisonOperation(COMPARISON_OPS[op], left, right, loc);

  // Logical
  if (op in LOGICAL_BINARY_OPS)
    return new Yu.LogicalBinaryOperation(
      LOGICAL_BINARY_OPS[op],
      left,
      right,
      loc,
    );

  // Bitwise
  if (op in BITWISE_BINARY_OPS)
    return new Yu.BitwiseBinaryOperation(
      BITWISE_BINARY_OPS[op],
      left,
      right,
      loc,
    );

  // String Concatenation
  if (op === "++" || op === "concat")
    return new Yu.StringOperation("Concat", left, right, loc);

  return null;
}

function transformUnary(
  op: string,
  receiver: Yu.Expression,
  loc: Yu.SourceLocation | undefined,
): Yu.Expression | null {
  // Logical Negation
  if (["!", "negate"].includes(op))
    return new Yu.LogicalUnaryOperation("Negation", receiver, loc);

  // Arithmetic Negation
  if (["invert", "-"].includes(op))
    return new Yu.ArithmeticUnaryOperation("Negation", receiver, loc);

  // Bitwise Negation
  if (["~", "bitwiseNot"].includes(op))
    return new Yu.BitwiseUnaryOperation("BitwiseNot", receiver, loc);

  return null;
}
