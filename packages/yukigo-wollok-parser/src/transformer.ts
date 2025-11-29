import * as Yu from "@yukigo/ast";
import {
  Body,
  Class,
  Literal,
  Method,
  Node,
  Package,
  Parameter,
  Reference,
  Return,
  Send,
  Singleton,
} from "wollok-ts";

function mapLocation(wollokNode: Node): Yu.SourceLocation | undefined {
  if (wollokNode.sourceMap && wollokNode.sourceMap.start) {
    return new Yu.SourceLocation(
      wollokNode.sourceMap.start.line,
      wollokNode.sourceMap.start.column
    );
  }
  return undefined;
}

export class WollokToYukigoTransformer {
  public transform(root: Package): Yu.AST {
    const result = this.visit(root);
    return Array.isArray(result) ? result : [result];
  }

  private visit(node: Node): any {
    const nodeType = node.constructor ? node.constructor.name : "Unknown";
    switch (nodeType) {
      case "Package":
        return this.visitPackage(node as Package);
      case "Singleton":
        return this.visitSingleton(node as Singleton);
      case "Class":
        return this.visitClass(node as Class);
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
      // Import
      // Mixin
      // Field
      // Sentence
      // Variable
      // Assignment
      // Self
      // Super
      // New
      // If
      // Throw
      // Try
      // Catch
      default:
        throw new Error(`Nodo Wollok desconocido o no soportado: ${nodeType}`);
    }
  }

  private visitPackage(node: Package): Yu.Statement[] {
    return node.members.map((member: Node) => this.visit(member));
  }

  private visitSingleton(node: Singleton): Yu.Object {
    const identifier = new Yu.SymbolPrimitive(node.name, mapLocation(node));

    const members = node.members.map((m: Node) => this.visit(m));
    const bodyExpression = new Yu.Sequence(members, mapLocation(node));

    return new Yu.Object(identifier, bodyExpression, mapLocation(node));
  }

  private visitClass(node: Class): Yu.Class {
    const identifier = new Yu.SymbolPrimitive(node.name, mapLocation(node));

    const members = node.members.map((m: any) => this.visit(m));
    const bodyExpression = new Yu.Sequence(members, mapLocation(node));
    const classInstance = new Yu.Class(
      identifier,
      undefined,
      undefined,
      bodyExpression,
      mapLocation(node)
    );
    return classInstance;
  }

  private visitMethod(node: Method): Yu.Method {
    const identifier = new Yu.SymbolPrimitive(node.name, mapLocation(node));

    const patterns: Yu.Pattern[] = (node.parameters || []).map((param) =>
      this.visit(param)
    );

    if (node.body === "native")
      throw Error("Native methods not supported yet.");

    const bodySequence = this.visit(node.body);
    const unguardedBody = new Yu.UnguardedBody(
      bodySequence,
      mapLocation(node.body)
    );

    const equation = new Yu.Equation(
      patterns,
      unguardedBody,
      undefined,
      mapLocation(node)
    );

    return new Yu.Method(identifier, [equation], mapLocation(node));
  }
  private visitParameter(node: Parameter): Yu.VariablePattern {
    const nameSymbol = new Yu.SymbolPrimitive(node.name, mapLocation(node));
    return new Yu.VariablePattern(nameSymbol, mapLocation(node));
  }
  private visitReturn(node: Return): Yu.Return {
    const expression = this.visit(node.value);
    return new Yu.Return(expression, mapLocation(node));
  }

  private visitBody(node: Body): Yu.Sequence {
    const statements = node.sentences.map((s: any) => this.visit(s));
    return new Yu.Sequence(statements, mapLocation(node));
  }

  private visitSend(node: Send): Yu.Send | Yu.ArithmeticBinaryOperation {
    const receiver = this.visit(node.receiver);
    const args = node.args.map((arg: any) => this.visit(arg));

    if (this.isArithmeticOperator(node.message) && args.length === 1) {
      return new Yu.ArithmeticBinaryOperation(
        this.mapOperator(node.message),
        receiver,
        args[0],
        mapLocation(node)
      );
    }
    const selector = new Yu.SymbolPrimitive(node.message, mapLocation(node));

    return new Yu.Send(receiver, selector, args, mapLocation(node));
  }

  private isArithmeticOperator(op: string): boolean {
    return ["+", "-", "*", "/", "%"].includes(op);
  }
  private mapOperator(op: string): Yu.ArithmeticBinaryOperator {
    switch (op) {
      case "+":
        return "Plus";
      case "-":
        return "Minus";
      case "*":
        return "Multiply";
      case "/":
        return "Divide";
      case "%":
        return "Modulo";
      default:
        throw new Error(`Operator ${op} not mapped`);
    }
  }

  private visitReference(node: Reference<any>): Yu.SymbolPrimitive {
    return new Yu.SymbolPrimitive(node.name, mapLocation(node));
  }

  private visitLiteral(node: Literal): Yu.Primitive {
    const val = node.value;
    const loc = mapLocation(node);

    if (typeof val === "number") return new Yu.NumberPrimitive(val, loc);
    if (typeof val === "boolean") return new Yu.BooleanPrimitive(val, loc);
    if (val === null) return new Yu.NilPrimitive(null, loc);

    return new Yu.StringPrimitive(String(val), loc);
  }
}
