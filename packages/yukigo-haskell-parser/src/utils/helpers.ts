import { inspect } from "util";
import { AST } from "yukigo-ast";
import { Function } from "yukigo-ast";

export function groupFunctionDeclarations(ast: AST): AST {
  const groups: Record<string, Function[]> = {};
  const others: AST = [];

  for (const node of ast) {
    if (node instanceof Function) {
      const name = node.identifier.value;
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(node);
    } else {
      others.push(node);
    }
  }

  // Merge equations for each function name
  const functionGroups: Function[] = Object.values(groups).map((functions) => {
    const identifier = functions[0].identifier;
    const allEquations = functions.flatMap((f) => f.equations);
    return new Function(identifier, allEquations, identifier.loc);
  });

  return [...others, ...functionGroups];
}
