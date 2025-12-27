import {
  Class,
  Fact,
  Function,
  Method,
  Object as YuObject,
  Procedure,
  Rule,
  TraverseVisitor,
  Variable,
} from "yukigo-ast";

export interface VisitorConstructor {
  new (...args: any[]): TraverseVisitor;
  IS_INTRANSITIVE?: boolean;
}
export type InspectionMap = Record<string, VisitorConstructor>;

export class ScopedVisitor extends TraverseVisitor {
  protected readonly binding?: string;
  public inScope: boolean;

  constructor(binding?: string) {
    super();
    this.binding = binding;
    this.inScope = !binding; // global (inScope always true) if no binding is provided
  }

  visitVariable(node: Variable): void {
    this.manageScope(node, () => super.visitVariable(node));
  }
  visitFunction(node: Function): void {
    this.manageScope(node, () => super.visitFunction(node));
  }
  visitClass(node: Class): void {
    this.manageScope(node, () => super.visitClass(node));
  }
  visitObject(node: YuObject): void {
    this.manageScope(node, () => super.visitObject(node));
  }
  visitMethod(node: Method): void {
    this.manageScope(node, () => super.visitMethod(node));
  }
  visitRule(node: Rule): void {
    this.manageScope(node, () => super.visitRule(node));
  }
  visitFact(node: Fact): void {
    this.manageScope(node, () => super.visitFact(node));
  }
  visitProcedure(node: Procedure): void {
    this.manageScope(node, () => super.visitProcedure(node));
  }

  private manageScope(node: any, traverse: () => void) {
    const isTarget = node.identifier.value === this.binding;
    if (isTarget) this.inScope = true;
    traverse();
    if (isTarget) this.inScope = false;
  }
}

export function AutoScoped<T extends { new (...args: any[]): any }>(
  constructor: T
) {
  const proto = constructor.prototype;
  const methodNames = Object.getOwnPropertyNames(proto);

  for (const name of methodNames) {
    if (isValidVisitMethod(name)) {
      const originalMethod = proto[name];

      // replace the method on the prototype
      proto[name] = function (this: any, node: any) {
        if (!this.inScope) return;
        // run the inspection logic if in scope
        return originalMethod.call(this, node);
      };
    }
  }
}
function isScopeBoundary(name: string): boolean {
  return [
    "visitFunction",
    "visitMethod",
    "visitProcedure",
    "visitRule",
    "visitFact",
    "visitVariable",
    "visitClass",
    "visitObject",
  ].includes(name);
}
const isValidVisitMethod = (name: string) =>
  name.startsWith("visit") && name !== "constructor" && !isScopeBoundary(name);
