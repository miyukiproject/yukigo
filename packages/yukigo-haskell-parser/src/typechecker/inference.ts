import {
  Application,
  ApplicationPattern,
  ArithmeticBinaryOperation,
  ArithmeticUnaryOperation,
  AsPattern,
  AssignOperation,
  ASTNode,
  BitwiseBinaryOperation,
  BitwiseUnaryOperation,
  BooleanPrimitive,
  CharPrimitive,
  ComparisonOperation,
  CompositionExpression,
  ConsExpression,
  ConsPattern,
  ConstructorPattern,
  DataExpression,
  FieldExpression,
  For,
  FunctorPattern,
  Generator,
  If,
  Lambda,
  LetInExpression,
  ListBinaryOperation,
  ListComprehension,
  ListPattern,
  ListPrimitive,
  ListUnaryOperation,
  LiteralPattern,
  LogicalBinaryOperation,
  LogicalUnaryOperation,
  NilPrimitive,
  NumberPrimitive,
  Otherwise,
  Pattern,
  Print,
  Raise,
  RangeExpression,
  Return,
  StringOperation,
  StringPrimitive,
  Switch,
  SymbolPrimitive,
  TupleExpression,
  TuplePattern,
  TypeCast,
  UnifyOperation,
  UnionPattern,
  VariablePattern,
  Visitor,
  WildcardPattern,
  Yield,
} from "@yukigo/ast";
import {
  Environment,
  getArgumentTypes,
  getArity,
  isFunctionType,
  Result,
  showType,
  Type,
  functionType,
  TypeConstructor,
  TypeScheme,
  isListType,
  isTupleType,
  listType,
  TypeVar,
  booleanType,
  numberType,
  stringType,
  FunctionRegistrarVisitor,
  FunctionCheckerVisitor,
  getReturnType,
} from "./checker.js";
import { CoreHM } from "./core.js";
import { TypeBuilder } from "./TypeBuilder.js";
import { inspect } from "util";

export class PatternVisitor implements Visitor<void> {
  constructor(
    private coreHM: CoreHM,
    private signatureMap: Map<string, TypeScheme>,
    private expectedType: Type,
    private envs: Environment[],
    private inferenceEngine: InferenceEngine
  ) {}

  visitVariablePattern(node: VariablePattern) {
    const varName = node.name.value.toString();
    if (this.envs[0].has(varName))
      throw new Error(`Duplicate variable name '${varName}'`);

    this.envs[0].set(varName, {
      type: "TypeScheme",
      quantifiers: [],
      body: this.expectedType,
      constraints: new Map(),
    });
  }
  visitLiteralPattern(node: LiteralPattern) {
    const value = node.name;

    const inferredLiteral = value.accept(this.inferenceEngine);
    if (inferredLiteral.success === false) throw Error(inferredLiteral.error);

    let literalType: Type = inferredLiteral.value;

    const unifyResult = this.coreHM.unify(literalType, this.expectedType);
    if (unifyResult.success === false)
      throw new Error(
        `Literal pattern type mismatch: expected ${showType(
          this.expectedType
        )} but found ${showType(literalType)}`
      );
  }
  visitApplicationPattern(node: ApplicationPattern) {
    const appCtorScheme = this.signatureMap.get(node.symbol.value);
    if (!appCtorScheme)
      throw new Error(`Unknown constructor: ${node.symbol.value}`);

    const appCtorType = this.coreHM.instantiate(appCtorScheme);

    // Handle both curried and non-curried constructor types
    let currentType = appCtorType;
    let argIndex = 0;

    const patternTypes = getArgumentTypes(appCtorType);
    patternTypes.forEach((argType, i) => {
      node.args[argIndex].accept(
        new PatternVisitor(
          this.coreHM,
          this.signatureMap,
          argType,
          this.envs,
          this.inferenceEngine
        )
      );
    });

    // Check if we've consumed all expected arguments
    const unifyResult = this.coreHM.unify(currentType, this.expectedType);
    if (unifyResult.success === false)
      throw new Error(
        `Constructor ${node.symbol.value} arguments don't match expected type: ${unifyResult.error}`
      );
  }
  visitTuplePattern(node: TuplePattern) {
    let tupleElementTypes: Type[];

    if (this.expectedType.type === "TypeVar") {
      tupleElementTypes = node.elements.map(() => this.coreHM.freshVar());
      const tupleType: Type = {
        type: "TypeConstructor",
        name: "Tuple",
        args: tupleElementTypes,
      };

      const unifyResult = this.coreHM.unify(this.expectedType, tupleType);
      if (unifyResult.success === false)
        throw new Error(`Pattern type mismatch: ${unifyResult.error}`);
    } else if (isTupleType(this.expectedType)) {
      if (node.elements.length !== this.expectedType.args.length)
        throw new Error(`Tuple arity mismatch`);
      tupleElementTypes = this.expectedType.args;
    } else {
      throw new Error(
        `Pattern expects a tuple but found non-tuple type: ${showType(
          this.expectedType
        )}`
      );
    }

    node.elements.forEach((pattern, i) => {
      new PatternVisitor(
        this.coreHM,
        this.signatureMap,
        tupleElementTypes[i],
        this.envs,
        this.inferenceEngine
      ).visit(pattern);
    });
  }
  visitListPattern(node: ListPattern) {
    let elemType: Type;

    if (this.expectedType.type === "TypeVar") {
      elemType = this.coreHM.freshVar();
      const listT = listType(elemType);
      const unifyResult = this.coreHM.unify(this.expectedType, listT);
      if (unifyResult.success === false)
        throw new Error(`Pattern type mismatch: ${unifyResult.error}`);
    } else if (isListType(this.expectedType)) {
      elemType = this.expectedType.args[0];
    } else {
      throw new Error(`Pattern expects a list but found non-list type`);
    }

    node.elements.forEach((pat) => {
      new PatternVisitor(
        this.coreHM,
        this.signatureMap,
        elemType,
        this.envs,
        this.inferenceEngine
      ).visit(pat);
    });
  }
  visitFunctorPattern(node: FunctorPattern): Result<Type> {
    throw new Error("Method not implemented.");
  }
  visitAsPattern(node: AsPattern) {
    // Process the main pattern
    new PatternVisitor(
      this.coreHM,
      this.signatureMap,
      this.expectedType,
      this.envs,
      this.inferenceEngine
    ).visit(node.pattern);

    // Process the alias if it's a variable
    if (node.alias instanceof VariablePattern) {
      const varName = node.alias.name.value.toString();
      if (this.envs[0].has(varName))
        throw new Error(`Duplicate variable name: ${varName}`);

      this.envs[0].set(varName, {
        type: "TypeScheme",
        quantifiers: [],
        body: this.expectedType,
        constraints: new Map(),
      });
    }
  }
  visitWildcardPattern(node: WildcardPattern): Result<Type> {
    return {
      success: true,
      value: this.coreHM.freshVar(),
    };
  }
  visitUnionPattern(node: UnionPattern): Result<Type> {
    throw new Error("Method not implemented.");
  }
  visitConstructorPattern(node: ConstructorPattern) {
    const ctorScheme = this.signatureMap.get(node.constr);
    if (!ctorScheme) throw new Error(`Unknown constructor: ${node.constr}`);

    const ctorType = this.coreHM.instantiate(ctorScheme);
    // Extract argument types and return type from constructor
    const argTypes = getArgumentTypes(ctorType);
    const returnType = getReturnType(ctorType);

    if (argTypes.length !== node.patterns.length)
      throw new Error(
        `Constructor ${node.constr} expects ${argTypes.length} arguments but pattern has ${node.patterns.length}`
      );

    // Unify the constructor's return type with expected pattern type
    const unifyResult = this.coreHM.unify(returnType, this.expectedType);
    if (!unifyResult.success)
      throw new Error(
        `Constructor ${node.constr} return type ${showType(
          returnType
        )} doesn't match expected type ${showType(this.expectedType)}`
      );

    // Apply substitutions to argument types
    const subst = unifyResult.value;
    const unifiedArgTypes = argTypes.map((argType) =>
      this.coreHM.applySubst(subst, argType)
    );

    // Process each argument pattern with its correct type
    node.patterns.forEach((pattern, i) => {
      new PatternVisitor(
        this.coreHM,
        this.signatureMap,
        unifiedArgTypes[i],
        this.envs,
        this.inferenceEngine
      ).visit(pattern);
    });
  }
  visitConsPattern(node: ConsPattern) {
    const elemType = this.coreHM.freshVar();
    const listT = listType(elemType);

    // Unify the expected type with the list type
    const unifyResult = this.coreHM.unify(this.expectedType, listT);
    if (unifyResult.success === false)
      throw new Error(`Pattern type mismatch: ${unifyResult.error}`);

    // After unification, get the element type from the unified type
    const unifiedElemType = this.coreHM.applySubst(unifyResult.value, elemType);

    // Process head pattern with the element type
    new PatternVisitor(
      this.coreHM,
      this.signatureMap,
      unifiedElemType,
      this.envs,
      this.inferenceEngine
    ).visit(node.head);
    // Process tail pattern with a list of the same element type
    const tailType = listType(unifiedElemType);
    new PatternVisitor(
      this.coreHM,
      this.signatureMap,
      tailType,
      this.envs,
      this.inferenceEngine
    ).visit(node.tail);
  }
  visit(node: Pattern): void {
    node.accept(this);
  }
}

export class InferenceEngine implements Visitor<Result<Type>> {
  constructor(
    private signatureMap: Map<string, TypeScheme>,
    private coreHM: CoreHM,
    private envs: Environment[]
  ) {}
  visitNumberPrimitive(node: NumberPrimitive): Result<Type> {
    return {
      success: true,
      value: numberType,
    };
  }
  visitBooleanPrimitive(node: BooleanPrimitive): Result<Type> {
    return {
      success: true,
      value: booleanType,
    };
  }
  visitStringPrimitive(node: StringPrimitive): Result<Type> {
    return {
      success: true,
      value: stringType,
    };
  }
  visitListPrimitive(node: ListPrimitive): Result<Type> {
    if (node.elements.length === 0) {
      // Empty list - polymorphic
      const elemType = this.coreHM.freshVar();
      return {
        success: true,
        value: listType(elemType),
      };
    }

    // Infer type of first element
    const firstResult = node.elements[0].accept(this);
    if (firstResult.success === false) return firstResult;

    // Check all elements match first element's type
    for (const element of node.elements.slice(1)) {
      const elemResult = element.accept(this);
      if (elemResult.success === false) return elemResult;
      const unifyResult = this.coreHM.unify(
        elemResult.value,
        firstResult.value
      );
      if (unifyResult.success === false) {
        return {
          success: false,
          error: `List elements must have the same type`,
        };
      }
    }

    return {
      success: true,
      value: listType(firstResult.value),
    };
  }
  visitNilPrimitive(node: NilPrimitive): Result<Type> {
    return {
      success: true,
      value: {
        type: "TypeConstructor",
        name: "YuNil",
        args: [],
      },
    };
  }
  visitCharPrimitive(node: CharPrimitive): Result<Type> {
    return {
      success: true,
      value: {
        type: "TypeConstructor",
        name: "YuChar",
        args: [],
      },
    };
  }
  visitSymbolPrimitive(node: SymbolPrimitive): Result<Type> {
    const name = node.value;
    const searchRes = searchInEnvironments(this.envs, name);
    if (searchRes.success === false) return searchRes;
    return { success: true, value: this.coreHM.instantiate(searchRes.value) };
  }
  visitArithmeticUnaryOperation(node: ArithmeticUnaryOperation): Result<Type> {
    const operandResult = node.operand.accept(this);
    if (!operandResult.success) return operandResult;

    const unifyOperand = this.coreHM.unify(operandResult.value, numberType);
    if (!unifyOperand.success)
      return {
        success: false,
        error: `Operand of ${node.operator} must be a number`,
      };

    return { success: true, value: numberType };
  }
  visitArithmeticBinaryOperation(
    node: ArithmeticBinaryOperation
  ): Result<Type> {
    const leftResult = node.left.accept(this);
    if (!leftResult.success) return leftResult;

    const rightResult = node.right.accept(this);
    if (!rightResult.success) return rightResult;

    const unifyLeft = this.coreHM.unify(leftResult.value, numberType);
    if (!unifyLeft.success)
      return {
        success: false,
        error: `Left operand of ${node.operator} must be a number`,
      };
    const unifyRight = this.coreHM.unify(rightResult.value, numberType);
    if (!unifyRight.success)
      return {
        success: false,
        error: `Right operand of ${node.operator} must be a number`,
      };

    return { success: true, value: numberType };
  }
  visitListUnaryOperation(node: ListUnaryOperation): Result<Type> {
    switch (node.operator) {
      case "DetectMin":
      case "DetectMax": {
        const operandResult = node.operand.accept(this);

        if (!operandResult.success) return operandResult;

        // Operand must be a list of ordenables (YuNumber, YuString, YuChar)
        const ordType: TypeVar = this.coreHM.freshVar(["Ord"]);
        const listT: TypeConstructor = listType(ordType);
        const unifyOperand = this.coreHM.unify(operandResult.value, listT);
        if (!unifyOperand.success)
          return {
            success: false,
            error: `${node.operator} expects operand to be an Ordenable Type`,
          };
        const finalType = this.coreHM.applySubst(unifyOperand.value, ordType);
        // Result is a the resolved type of the elements of the list
        return { success: true, value: finalType };
      }
      case "Size": {
        const operandResult = node.operand.accept(this);

        if (!operandResult.success) return operandResult;
        // Operand must be a YuList
        const freshInputVar = this.coreHM.freshVar();
        const listInputType: TypeConstructor = listType(freshInputVar);
        const unifyOperand = this.coreHM.unify(
          operandResult.value,
          listInputType
        );

        if (!unifyOperand.success)
          return {
            success: false,
            error: `${node.operator} expects operand must be a YuList`,
          };

        // Result is a YuNumber
        return { success: true, value: numberType };
      }

      default:
        return {
          success: false,
          error: `Unknown Unary List operation with operator ${node.operator}.`,
        };
    }
  }
  visitListBinaryOperation(node: ListBinaryOperation): Result<Type> {
    switch (node.operator) {
      case "Collect": {
        const leftResult = node.left.accept(this);
        if (!leftResult.success) return leftResult;

        const rightResult = node.right.accept(this);
        if (!rightResult.success) return rightResult;

        const funcArity = getArity(leftResult.value);
        if (funcArity !== 1)
          return {
            success: false,
            error: `${node.operator}'s left operand expects to have only one argument`,
          };

        // Right-hand side must be a list [a]
        const freshInputVar = this.coreHM.freshVar();
        const listInputType: TypeConstructor = listType(freshInputVar);

        const unifyRight = this.coreHM.unify(rightResult.value, listInputType);
        if (!unifyRight.success)
          return {
            success: false,
            error: `${node.operator}'s right operand must be a list`,
          };

        const elementType = unifyRight.value.get(freshInputVar.id);

        // Left-hand side must be a function: elementType -> outputType
        const freshOutputVar = this.coreHM.freshVar();
        const funcType: TypeConstructor = functionType(
          elementType,
          freshOutputVar
        );

        const unifyLeft = this.coreHM.unify(leftResult.value, funcType);
        if (!unifyLeft.success) {
          return {
            success: false,
            error: `${
              node.operator
            }'s left operand must be a function of type ${showType(
              elementType
            )} -> a`,
          };
        }

        // Result is a list of the function's output type: [outputType]

        const resultType: TypeConstructor = listType(freshOutputVar);

        const subType = this.coreHM.applySubst(unifyLeft.value, resultType);

        // Return the result type, now fully resolved with substitutions
        return { success: true, value: subType };
      }
      case "Select": {
        const leftResult = node.left.accept(this);
        if (!leftResult.success) return leftResult;

        const rightResult = node.right.accept(this);
        if (!rightResult.success) return rightResult;

        const funcArity = getArity(leftResult.value);
        if (funcArity !== 1)
          return {
            success: false,
            error: `${node.operator}'s left operand expects to have only one argument`,
          };

        // Right-hand side must be a list [a]
        const freshInputVar = this.coreHM.freshVar();
        const listInputType = listType(freshInputVar);

        const unifyRight = this.coreHM.unify(rightResult.value, listInputType);

        if (!unifyRight.success)
          return {
            success: false,
            error: `${node.operator}'s right operand must be a list`,
          };

        const elementType = unifyRight.value.get(freshInputVar.id);

        // Left-hand side must be a function: elementType -> Bool
        const funcType: TypeConstructor = functionType(
          elementType,
          booleanType
        );
        const unifyLeft = this.coreHM.unify(leftResult.value, funcType);
        if (!unifyLeft.success) {
          return {
            success: false,
            error: `${
              node.operator
            }'s left operand must be a function of type ${showType(funcType)}`,
          };
        }

        // Result is a list of the function's output type: [outputType]

        const resultType = listType(elementType);

        const subType = this.coreHM.applySubst(unifyLeft.value, resultType);

        // Return the result type, now fully resolved with substitutions
        return { success: true, value: subType };
      }
      case "Detect": {
        const leftResult = node.left.accept(this);
        if (!leftResult.success) return leftResult;

        const rightResult = node.right.accept(this);
        if (!rightResult.success) return rightResult;

        const funcArity = getArity(leftResult.value);
        if (funcArity !== 1)
          return {
            success: false,
            error: `${node.operator}'s left operand expects to have only one argument`,
          };

        // Right-hand side must be a list [a]
        const freshInputVar = this.coreHM.freshVar();
        const listInputType = listType(freshInputVar);

        const unifyRight = this.coreHM.unify(rightResult.value, listInputType);

        if (!unifyRight.success)
          return {
            success: false,
            error: `${node.operator}'s right operand must be a list`,
          };

        const elementType = unifyRight.value.get(freshInputVar.id);

        // Left-hand side must be a function: elementType -> Bool
        const funcType: TypeConstructor = functionType(
          elementType,
          booleanType
        );
        const unifyLeft = this.coreHM.unify(leftResult.value, funcType);
        if (!unifyLeft.success) {
          return {
            success: false,
            error: `${
              node.operator
            }'s left operand must be a function of type ${showType(funcType)}`,
          };
        }

        // Result is a list of the function's output type: [outputType]
        const subType = this.coreHM.applySubst(unifyLeft.value, elementType);

        // Return the result type, now fully resolved with substitutions
        return { success: true, value: subType };
      }
      case "AnySatisfy":
      case "AllSatisfy": {
        const leftResult = node.left.accept(this);
        if (!leftResult.success) return leftResult;

        const rightResult = node.right.accept(this);
        if (!rightResult.success) return rightResult;

        const funcArity = getArity(leftResult.value);
        if (funcArity !== 1)
          return {
            success: false,
            error: `${node.operator}'s left operand expects to have only one argument`,
          };

        // Right-hand side must be a list [a]
        const freshInputVar = this.coreHM.freshVar();
        const listInputType: TypeConstructor = listType(freshInputVar);

        const unifyRight = this.coreHM.unify(rightResult.value, listInputType);

        if (!unifyRight.success)
          return {
            success: false,
            error: `${node.operator}'s right operand must be a list`,
          };

        const elementType = unifyRight.value.get(freshInputVar.id);

        // Left-hand side must be a function: elementType -> Bool
        const funcType: TypeConstructor = functionType(
          elementType,
          booleanType
        );
        const unifyLeft = this.coreHM.unify(leftResult.value, funcType);
        if (!unifyLeft.success) {
          return {
            success: false,
            error: `${
              node.operator
            }'s left operand must be a function of type ${showType(funcType)}`,
          };
        }

        // Result is a list of the function's output type: [outputType]

        const subType = this.coreHM.applySubst(unifyLeft.value, booleanType);

        // Return the result type, now fully resolved with substitutions
        return { success: true, value: subType };
      }
      case "Concat": {
        const leftResult = node.left.accept(this);
        if (!leftResult.success) return leftResult;

        const rightResult = node.right.accept(this);
        if (!rightResult.success) return rightResult;

        // Create a fresh type variable for the element type
        const elemType = this.coreHM.freshVar();
        const expectedListType = listType(elemType);

        // First, unify left operand with list type
        const unifyLeft = this.coreHM.unify(leftResult.value, expectedListType);
        if (!unifyLeft.success) {
          return {
            success: false,
            error: `Left operand of concat must be a list, got ${showType(
              leftResult.value
            )}`,
          };
        }

        // Apply the substitution from left unification to both the element type
        // and the right operand type
        const substElemType = this.coreHM.applySubst(unifyLeft.value, elemType);
        const substRightType = this.coreHM.applySubst(
          unifyLeft.value,
          rightResult.value
        );
        const expectedRightType = listType(substElemType);

        // Now unify the right operand with the updated expected type
        const unifyRight = this.coreHM.unify(substRightType, expectedRightType);
        if (!unifyRight.success) {
          return {
            success: false,
            error: `Concat operation requires both operands to be lists of the same type.`,
          };
        }

        // Combine substitutions and apply to get final result type
        const combinedSubst = this.coreHM.composeSubst(
          unifyRight.value,
          unifyLeft.value
        );
        const finalType = this.coreHM.applySubst(
          combinedSubst,
          listType(elemType)
        );

        return { success: true, value: finalType };
      }
      case "GetAt": {
        const leftResult = node.left.accept(this);
        if (!leftResult.success) return leftResult;

        const rightResult = node.right.accept(this);
        if (!rightResult.success) return rightResult;

        // Create a fresh type variable for the element type
        const elemType = this.coreHM.freshVar();
        const expectedListType = listType(elemType);

        // First, unify left operand with list type
        const unifyLeft = this.coreHM.unify(leftResult.value, expectedListType);
        if (!unifyLeft.success) {
          return {
            success: false,
            error: `Left operand of concat must be a list, got ${showType(
              leftResult.value
            )}`,
          };
        }

        // Left-hand side must be a number: YuNumber
        const unifyRight = this.coreHM.unify(rightResult.value, numberType);
        if (!unifyRight.success) {
          return {
            success: false,
            error: `${node.operator}'s left operand must be a ${showType(
              numberType
            )}`,
          };
        }
        const substElemType = this.coreHM.applySubst(unifyLeft.value, elemType);

        return { success: true, value: substElemType };
      }
      default:
        return {
          success: false,
          error: `Unknown Binary List operation with operator ${node.operator}.`,
        };
    }
  }
  visitComparisonOperation(node: ComparisonOperation): Result<Type> {
    const leftResult = node.left.accept(this);
    if (!leftResult.success) return leftResult;

    const rightResult = node.right.accept(this);
    if (!rightResult.success) return rightResult;

    const unifyResult = this.coreHM.unify(leftResult.value, rightResult.value);
    if (!unifyResult.success) {
      return {
        success: false,
        error: `Comparison operands must have the same type`,
      };
    }

    return {
      success: true,
      value: booleanType,
    };
  }
  visitLogicalBinaryOperation(node: LogicalBinaryOperation): Result<Type> {
    const operator = node.operator;

    const leftResult = node.left.accept(this);
    if (!leftResult.success) return leftResult;
    const rightResult = node.right.accept(this);
    if (!rightResult.success) return rightResult;

    const leftSub = this.coreHM.unify(leftResult.value, booleanType);
    if (!leftSub.success)
      return {
        success: false,
        error: `Left side of ${operator} must be a boolean`,
      };
    const rightSub = this.coreHM.unify(rightResult.value, booleanType);
    if (!rightSub.success)
      return {
        success: false,
        error: `Right side of ${operator} must be a boolean`,
      };

    return { success: true, value: booleanType };
  }
  visitLogicalUnaryOperation(node: LogicalUnaryOperation): Result<Type> {
    throw new Error("Method not implemented.");
  }
  visitBitwiseBinaryOperation(node: BitwiseBinaryOperation): Result<Type> {
    throw new Error("Method not implemented.");
  }
  visitBitwiseUnaryOperation(node: BitwiseUnaryOperation): Result<Type> {
    throw new Error("Method not implemented.");
  }
  visitStringOperation(node: StringOperation): Result<Type> {
    const leftResult = node.left.accept(this);
    if (!leftResult.success) return leftResult;

    const rightResult = node.right.accept(this);
    if (!rightResult.success) return rightResult;

    const unifyLeft = this.coreHM.unify(leftResult.value, stringType);
    const unifyRight = this.coreHM.unify(rightResult.value, stringType);
    if (!unifyLeft.success || !unifyRight.success)
      return {
        success: false,
        error: `String operation requires string operands`,
      };

    return { success: true, value: stringType };
  }
  visitUnifyOperation(node: UnifyOperation): Result<Type> {
    throw new Error("Method not implemented.");
  }
  visitAssignOperation(node: AssignOperation): Result<Type> {
    throw new Error("Method not implemented.");
  }
  visitTupleExpr(node: TupleExpression): Result<Type> {
    const elementResults = node.elements.map((e) => e.accept(this));
    const errors = elementResults.filter((r) => !r.success);
    if (elementResults.every((res) => res.success === true)) {
      const elementTypes = elementResults.map((r) => r.value);
      const tupleType: TypeConstructor = {
        type: "TypeConstructor",
        name: `Tuple`,
        args: elementTypes,
      };

      return { success: true, value: tupleType };
    } else {
      return errors[0] as Result<Type>;
    }
  }
  visitFieldExpr(node: FieldExpression): Result<Type> {
    throw new Error("Method not implemented.");
  }
  visitDataExpr(node: DataExpression): Result<Type> {
    const ctorScheme = this.signatureMap.get(node.name.value);
    if (!ctorScheme) {
      return {
        success: false,
        error: `Unknown constructor: ${node.name.value}`,
      };
    }

    const ctorType = this.coreHM.instantiate(ctorScheme);

    // Data constructors should be functions
    if (!isFunctionType(ctorType))
      return { success: false, error: "Constructors should be FunctionType" };

    // Check arguments
    let currentType: Type = ctorType;
    for (const arg of node.contents) {
      const argResult = arg.expression.accept(this);
      if (!argResult.success) return argResult;

      if (!isFunctionType(currentType)) {
        return {
          success: false,
          error: `Too many arguments to constructor ${node.name.value}`,
        };
      }

      const unifyResult = this.coreHM.unify(
        argResult.value,
        currentType.args[0]
      );
      if (!unifyResult.success) {
        return {
          success: false,
          error: `Argument type mismatch for constructor ${node.name.value}`,
        };
      }

      currentType = currentType.args[1];
    }

    return { success: true, value: currentType };
  }
  visitConsExpr(node: ConsExpression): Result<Type> {
    const headResult = node.head.accept(this);
    if (!headResult.success) return headResult;

    const tailResult = node.tail.accept(this);
    if (!tailResult.success) return tailResult;

    // Create a list type with a fresh element type
    const elemType = this.coreHM.freshVar();
    const listT: TypeConstructor = listType(elemType);
    // Unify the tail result with the list type
    const unifyResult = this.coreHM.unify(tailResult.value, listT);
    if (unifyResult.success === false) {
      return {
        success: false,
        error: `Tail of cons must be a list: ${unifyResult.error}`,
      };
    }

    // Now we know the tail is a list, so we can get the element type
    const unifiedElemType = this.coreHM.applySubst(unifyResult.value, elemType);

    // Head must match list element type
    const headUnifyResult = this.coreHM.unify(
      headResult.value,
      unifiedElemType
    );
    if (headUnifyResult.success === false) {
      return {
        success: false,
        error: `Head type doesn't match list element type: ${headUnifyResult.error}`,
      };
    }

    // The result is the list type
    return {
      success: true,
      value: this.coreHM.applySubst(unifyResult.value, listT),
    };
  }
  visitLetInExpr(node: LetInExpression): Result<Type> {
    const signatureMap = new Map();
    node.declarations.statements.forEach((stmt) =>
      stmt.accept(
        new FunctionRegistrarVisitor(this.envs[0], signatureMap, this.coreHM)
      )
    );
    const errors = [];
    node.declarations.statements.forEach((stmt) =>
      stmt.accept(
        new FunctionCheckerVisitor(this.envs, signatureMap, this.coreHM, errors)
      )
    );
    if (errors.length > 0) {
      return { success: false, error: errors.join() };
    }
    return node.expression.accept(this);
  }
  visitOtherwise(node: Otherwise): Result<Type> {
    return { success: true, value: booleanType };
  }
  visitCompositionExpression(node: CompositionExpression): Result<Type> {
    const fResult = node.left.accept(this);
    const gResult = node.right.accept(this);

    if (!fResult.success) return fResult;
    if (!gResult.success) return gResult;

    const a = this.coreHM.freshVar();
    const b = this.coreHM.freshVar();
    const c = this.coreHM.freshVar();

    const fType: TypeConstructor = functionType(b, c);
    const gType: TypeConstructor = functionType(a, b);

    const fSub = this.coreHM.unify(fResult.value, fType);
    const gSub = this.coreHM.unify(gResult.value, gType);

    if (!fSub.success)
      return {
        success: false,
        error: "Left operand of composition must be a function",
      };

    if (!gSub.success)
      return {
        success: false,
        error: "Right operand of composition must be a function",
      };

    const composedType: TypeConstructor = functionType(a, c);

    return { success: true, value: composedType };
  }
  visitLambda(node: Lambda): Result<Type> {
    // Create fresh type variables for parameters
    const paramTypes = node.parameters.map(() => this.coreHM.freshVar());
    this.envs.unshift(new Map());

    // Add parameters to environment
    node.parameters.forEach((param, i) => {
      try {
        param.accept(
          new PatternVisitor(
            this.coreHM,
            this.signatureMap,
            paramTypes[i],
            this.envs,
            this
          )
        );
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    });

    // Infer body type
    const inferrer = new InferenceEngine(
      this.signatureMap,
      this.coreHM,
      this.envs
    );
    const bodyResult = node.body.accept(inferrer);
    if (!bodyResult.success) return bodyResult;

    // Construct function type
    const funcType = paramTypes.reduceRight(
      (acc, param) => functionType(param, acc),
      bodyResult.value
    );

    return { success: true, value: funcType };
  }
  visitApplication(node: Application): Result<Type> {
    const funcResult = node.functionExpr.accept(this);
    if (funcResult.success === false) return funcResult;

    const argResult = node.parameter.accept(this);
    if (argResult.success === false) return argResult;

    const resultType = this.coreHM.freshVar();
    const funcType: TypeConstructor = functionType(argResult.value, resultType);
    const unifyResult = this.coreHM.unify(funcResult.value, funcType);
    if (unifyResult.success === false) {
      return {
        success: false,
        error: `Cannot apply ${showType(argResult.value)} to type ${showType(
          funcResult.value
        )}`,
      };
    }
    const substResultType = this.coreHM.applySubst(
      unifyResult.value,
      resultType
    );
    return { success: true, value: substResultType };
  }
  visitYield(node: Yield): Result<Type> {
    throw new Error("Method not implemented.");
  }
  visitRaise(node: Raise): Result<Type> {
    const bodyResult = node.body.accept(this);
    if (!bodyResult.success) return bodyResult;

    const unifyResult = this.coreHM.unify(stringType, bodyResult.value);
    if (!unifyResult.success)
      return {
        success: false,
        error: "Body of Raise expression must be a YuString",
      };

    return { success: true, value: this.coreHM.freshVar() };
  }
  visitIf(node: If): Result<Type> {
    const condResult = node.condition.accept(this);
    if (!condResult.success) return condResult;

    const condSub = this.coreHM.unify(condResult.value, booleanType);
    if (!condSub.success)
      return { success: false, error: "Condition must be a boolean" };

    const thenResult = node.then.accept(this);
    if (!thenResult.success) return thenResult;

    const elseResult = node.elseExpr.accept(this);
    if (!elseResult.success) return elseResult;

    const unifyResult = this.coreHM.unify(thenResult.value, elseResult.value);
    if (!unifyResult.success)
      return {
        success: false,
        error: `Branch types don't match: ${showType(
          thenResult.value
        )} vs ${showType(elseResult.value)}`,
      };

    return thenResult;
  }
  // visitGuardedBody(node: GuardedBody): Result<Type> {
  //   return node.body.accept(this);
  // }

  visitReturn(node: Return): Result<Type> {
    return node.body.accept(this);
  }
  visitTypeCast(node: TypeCast): Result<Type> {
    return {
      success: true,
      value: new TypeBuilder(this.coreHM).build(node.body).type,
    };
  }
  visitPrint(node: Print): Result<Type> {
    const exprResult = node.expression.accept(this);
    if (exprResult.success === false) return exprResult;

    const t1 = this.coreHM.freshVar(["Show"]);

    const unifyResult = this.coreHM.unify(t1, exprResult.value);
    if (unifyResult.success === false) return unifyResult;

    return { success: true, value: stringType };
  }
  visitListComprehension(node: ListComprehension): Result<Type> {
    // Generator(s) must unify with 'YuBoolean'
    for (const generator of node.generators) {
      const inferGenResult = generator.accept(this);
      if (inferGenResult.success === false) return inferGenResult;
      const unifyGenResult = this.coreHM.unify(
        inferGenResult.value,
        booleanType
      );
      if (unifyGenResult.success === false) return unifyGenResult;
    }

    // The projection must unify to 'a'
    const exprResult = node.projection.accept(this);
    if (exprResult.success === false) return exprResult;

    const list = listType(exprResult.value);
    return { success: true, value: list };
  }
  visitGenerator(node: Generator): Result<Type> {
    // A generator must unify to a 'YuList a'
    const inferResult = node.expression.accept(this);
    if (inferResult.success === false) return inferResult;

    const elemType = this.coreHM.freshVar();
    const genericList = listType(elemType);

    const unifyResult = this.coreHM.unify(inferResult.value, genericList);
    if (unifyResult.success === false) return unifyResult;

    const subsElemType = this.coreHM.applySubst(unifyResult.value, elemType);
    const schemeElemType = this.coreHM.generalize(this.envs[0], subsElemType);

    const bindingName = node.variable.value;
    if (this.envs[0].has(bindingName))
      return {
        success: false,
        error: `Multiple declarations of '${bindingName}'`,
      };
    this.envs[0].set(bindingName, schemeElemType);
    return { success: true, value: booleanType }; // Shady af but helps unify only with booleanType in visitListComprehension
  }
  visitFor(node: For): Result<Type> {
    throw new Error("Method not implemented.");
  }
  visitSwitch(node: Switch): Result<Type> {
    const firstBranch = node.cases[0];

    // Infer type of case key
    const caseResult = node.value.accept(this);
    if (caseResult.success === false) return caseResult;
    // Unify first branch condition with case key
    try {
      firstBranch.condition.accept(
        new PatternVisitor(
          this.coreHM,
          this.signatureMap,
          caseResult.value,
          this.envs,
          this
        )
      );
    } catch (error) {
      return { success: false, error: error.message };
    }

    // Infer first branch result
    const firstBranchType = firstBranch.body.accept(this);
    if (firstBranchType.success === false) return firstBranchType;

    // Every branch should return same type as the first branch
    for (const branch of node.cases.slice(1)) {
      // Unify condition with case key
      try {
        branch.condition.accept(
          new PatternVisitor(
            this.coreHM,
            this.signatureMap,
            caseResult.value,
            this.envs,
            this
          )
        );
      } catch (error) {
        return { success: false, error: error.message };
      }
      // Unify branch result with first branch
      const branchType = branch.body.accept(this);
      if (branchType.success === false) return branchType;

      const unifyBranchResult = this.coreHM.unify(
        firstBranchType.value,
        branchType.value
      );
      if (unifyBranchResult.success === false) return unifyBranchResult;
    }
    return firstBranchType;
  }
  visitRangeExpression(node: RangeExpression): Result<Type> {
    const startResult = node.start.accept(this);
    if (!startResult.success) return startResult;

    const endResult = node.end.accept(this);
    if (!endResult.success) return endResult;
    const rangeElemType = this.coreHM.freshVar(["Ord", "Enum"]);

    // Unify both start and end with this constrained type
    const unifyStart = this.coreHM.unify(startResult.value, rangeElemType);
    if (!unifyStart.success) {
      return {
        success: false,
        error: `Range start must be of an enumerable and orderable type, got ${showType(
          startResult.value
        )}`,
      };
    }

    // Apply substitution from start unification to end type before unifying
    const substitutedEnd = this.coreHM.applySubst(
      unifyStart.value,
      endResult.value
    );
    const unifyEnd = this.coreHM.unify(
      substitutedEnd,
      this.coreHM.applySubst(unifyStart.value, rangeElemType)
    );
    if (!unifyEnd.success) {
      return {
        success: false,
        error: `Range end must match start type; expected ${showType(
          startResult.value
        )}, got ${showType(endResult.value)}`,
      };
    }

    // Combine substitutions
    const combinedSubst = this.coreHM.composeSubst(
      unifyEnd.value,
      unifyStart.value
    );
    const finalElemType = this.coreHM.applySubst(combinedSubst, rangeElemType);

    // Result is a list of the element type
    return {
      success: true,
      value: listType(finalElemType),
    };
  }
  visit(node: ASTNode): Result<Type> {
    return node.accept(this);
  }
}

const searchInEnvironments = (
  envs: Environment[],
  key: string
): Result<TypeScheme> => {
  let result;
  for (const env of envs) {
    if (env.has(key)) {
      result = env.get(key);
      break;
    }
  }
  if (!result) return { success: false, error: `Unbound variable '${key}'` };
  return { success: true, value: result };
};
