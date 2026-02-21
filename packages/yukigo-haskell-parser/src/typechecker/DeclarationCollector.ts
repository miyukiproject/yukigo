import {
  ASTNode,
  Record,
  TypeAlias,
  TypeSignature,
  Visitor,
  TestGroup,
  Test,
  Assert,
  TypeClass,
  Instance,
  Equation,
  TypePattern,
  SimpleType,
  ListType,
} from "yukigo-ast";
import {
  functionType,
  Type,
  TypeConstructor,
  TypeScheme,
  TypeVar,
} from "./checker.js";
import { CoreHM } from "./core.js";
import { TypeBuilder } from "./TypeBuilder.js";
import { typeMappings } from "../utils/types.js";

const builder = new TypeBuilder(new CoreHM());

export class DeclarationCollectorVisitor implements Visitor<void> {
  constructor(
    private errors: string[],
    private typeAliasMap: Map<string, Type>,
    private recordMap: Map<string, Type>,
    private signatureMap: Map<string, TypeScheme>,
    private coreHM: CoreHM
  ) {}

  visitTypeAlias(node: TypeAlias) {
    const typeAliasIdentifier = node.identifier.value;
    if (
      this.typeAliasMap.has(typeAliasIdentifier) ||
      this.recordMap.has(typeAliasIdentifier)
    ) {
      this.errors.push(`Multiple declaration of '${typeAliasIdentifier}'.`);
      return;
    }

    const { type, constraints } = builder.build(node.value);
    this.typeAliasMap.set(typeAliasIdentifier, type);
  }
  visitRecord(node: Record) {
    const recordIdentifier = node.name.value;
    if (
      this.typeAliasMap.has(recordIdentifier) ||
      this.recordMap.has(recordIdentifier)
    ) {
      this.errors.push(`Multiple declaration of '${recordIdentifier}'.`);
      return;
    }

    // Save the record type itself
    const recordType: TypeConstructor = {
      type: "TypeConstructor",
      name: recordIdentifier,
      args: [],
    };
    this.recordMap.set(recordIdentifier, recordType);

    // Add constructors to signature map as type schemes
    for (const cons of node.contents) {
      if (this.signatureMap.has(cons.name.value)) {
        this.errors.push(`Constructor '${cons.name}' is already defined`);
        continue;
      }
      const paramTypes = cons.fields.map((field) => builder.build(field.value));
      const returnType: TypeConstructor = {
        type: "TypeConstructor",
        name: recordIdentifier,
        args: paramTypes.map(() => this.coreHM.freshVar()),
      };

      const funcType: Type = paramTypes.reduceRight(
        (acc, param) => functionType(param.type, acc),
        returnType
      );

      // Generalize all free variables in the constructor type
      const scheme = this.coreHM.generalize(new Map(), funcType);
      this.signatureMap.set(cons.name.value, scheme);
    }
  }

  visitTypeClass(node: TypeClass) {
    const className = node.name.value;
    if (this.coreHM.typeClasses.has(className)) {
      // It's fine if it's already there (it might be a built-in one)
    } else {
      this.coreHM.typeClasses.set(className, []);
    }

    // Register method signatures
    for (const sig of node.signatures) {
      this.visitTypeSignature(sig);
    }
  }

  visitInstance(node: Instance) {
    const className = node.className.value;
    let yukigoTypeName = "YuUnknown";

    if (node.type instanceof SimpleType) {
      yukigoTypeName = typeMappings[node.type.value] || node.type.value;
    } else if (node.type instanceof ListType) {
      yukigoTypeName = "YuList";
    }

    let instances = this.coreHM.typeClasses.get(className);
    if (!instances) {
      instances = [];
      this.coreHM.typeClasses.set(className, instances);
    }

    if (!instances.includes(yukigoTypeName)) {
      instances.push(yukigoTypeName);
    }
  }

  visitTypeSignature(node: TypeSignature) {
    const functionName = node.identifier.value;
    if (this.signatureMap.has(functionName)) {
      this.errors.push(
        `Function '${functionName}' has multiple type signatures`
      );
      return;
    }
    const typeVarMap = new Map<string, TypeVar>();
    const { type, constraints } = builder.build(node.body, typeVarMap);
    const quantifiers = Array.from(typeVarMap.values()).map((tv) => tv.id);
    this.signatureMap.set(functionName, {
      type: "TypeScheme",
      quantifiers,
      body: type,
      constraints,
    });
  }
  visitTestGroup(node: TestGroup): void {
    node.group.accept(this);
  }
  visitTest(node: Test): void {
    node.body.accept(this);
  }
  visitAssert(node: Assert): void {
    // assertions don't contain declarations
  }
  visit(node: ASTNode): void {
    node.accept(this);
  }
}
