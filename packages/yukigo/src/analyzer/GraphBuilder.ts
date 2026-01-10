import {
  Application,
  AST,
  ASTNode,
  Call,
  Class,
  Fact,
  Function,
  Interface,
  Method,
  New,
  Object as YuObject,
  Procedure,
  Rule,
  SymbolPrimitive,
  TraverseVisitor,
  TypeAlias,
  TypeSignature,
  Exist,
} from "yukigo-ast";

type DefinitionMap = Map<string, ASTNode[]>;
type CallsMap = Map<string, string[]>;

export type SymbolGraph = {
  defs: DefinitionMap;
  calls: CallsMap;
};

export class GraphBuilder extends TraverseVisitor {
  private defs: DefinitionMap = new Map();
  private calls: CallsMap = new Map();
  private scope: string = "";

  public build(ast: AST): SymbolGraph {
    ast.forEach((node) => node.accept(this));
    return { defs: this.defs, calls: this.calls };
  }

  private addDefinition(name: string, node: ASTNode): void {
    const existing = this.defs.get(name) || [];
    this.defs.set(name, [...existing, node]);
  }

  visitFunction(node: Function): void {
    this.scope = node.identifier.value;
    this.addDefinition(this.scope, node);
    this.traverseCollection(node.equations);
    this.scope = "";
  }

  visitMethod(node: Method): void {
    this.scope = node.identifier.value;
    this.addDefinition(this.scope, node);
    this.traverseCollection(node.equations);
    this.scope = "";
  }

  visitProcedure(node: Procedure): void {
    this.scope = node.identifier.value;
    this.addDefinition(this.scope, node);
    this.traverseCollection(node.equations);
    this.scope = "";
  }

  visitRule(node: Rule): void {
    this.scope = node.identifier.value;
    this.addDefinition(this.scope, node);
    this.traverseCollection(node.equations);
    this.scope = "";
  }

  visitFact(node: Fact): void {
    this.scope = node.identifier.value;
    this.addDefinition(this.scope, node);
    this.traverseCollection(node.patterns);
    this.scope = "";
  }

  visitClass(node: Class): void {
    this.scope = node.identifier.value;
    this.addDefinition(this.scope, node);
    node.expression.accept(this);
    this.scope = "";
  }

  visitObject(node: YuObject): void {
    this.scope = node.identifier.value;
    this.addDefinition(this.scope, node);
    node.expression.accept(this);
    this.scope = "";
  }

  visitInterface(node: Interface): void {
    this.scope = node.identifier.value;
    this.addDefinition(this.scope, node);
    node.expression.accept(this);
    this.scope = "";
  }

  visitTypeAlias(node: TypeAlias): void {
    this.scope = node.identifier.value;
    this.addDefinition(this.scope, node);
    this.scope = "";
  }

  visitTypeSignature(node: TypeSignature): void {
    this.scope = node.identifier.value;
    this.addDefinition(this.scope, node);
    this.scope = "";
  }

  visitCall(node: Call): void {
    if (!this.scope) return;

    const arr = this.calls.get(this.scope) || [];
    this.calls.set(this.scope, [node.callee.value, ...arr]);
  }

  visitApplication(node: Application): void {
    if (!this.scope) return;

    const arr = this.calls.get(this.scope) || [];
    if (node.functionExpr instanceof SymbolPrimitive)
      this.calls.set(this.scope, [node.functionExpr.value, ...arr]);
    else node.functionExpr.accept(this);
  }

  visitNew(node: New): void {
    if (!this.scope) return;

    const arr = this.calls.get(this.scope) || [];
    this.calls.set(this.scope, [node.identifier.value, ...arr]);
  }

  visitExist(node: Exist): void {
    if (!this.scope) return;

    const arr = this.calls.get(this.scope) || [];
    this.calls.set(this.scope, [node.identifier.value, ...arr]);
  }
}
