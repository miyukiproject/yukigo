import {
  YukigoPrimitive,
  ASTNode,
  BooleanPrimitive,
  NumberPrimitive,
  ListPrimitive,
  CharPrimitive,
  StringPrimitive,
  NilPrimitive,
  SymbolPrimitive,
  Primitive,
} from "./generics.js";

/* type Visitor = {
  [key: string]: (node: ASTNode, parent?: ASTNode) => boolean | void;
}; */

/* export function traverse(ast: AST | ASTNode, visitor: Visitor) {
  function runVisitor(node: ASTNode, parent?: ASTNode) {
    if (!node || typeof node !== "object" || !("type" in node)) {
      return false;
    }

    let stop = false;

    // Check for specific node type visitor
    if (visitor[node.type]) {
      stop = visitor[node.type](node, parent) === true;
    }

    // Check for wildcard visitor
    if (!stop && visitor["*"]) {
      stop = visitor["*"](node, parent) === true;
    }

    if (stop) return true;

    // Recursively visit children based on their type
    for (const key in node) {
      if (!node.hasOwnProperty(key)) continue;

      const value = node[key];

      if (!value) return false;

      const items = Array.isArray(value) ? value : [value];

      for (const item of items) {
        if (typeof item === "object" && item.type && runVisitor(item, node)) {
          return true;
        }
      }
    }
    return false;
  }

  // Handle the initial AST array or a single node
  if (Array.isArray(ast)) {
    for (const node of ast) {
      if (runVisitor(node)) break;
    }
  } else {
    runVisitor(ast);
  }
} */

// disgusting...
export function isYukigoPrimitive(node: ASTNode): node is Primitive {
  return (
    node instanceof NumberPrimitive ||
    node instanceof BooleanPrimitive ||
    node instanceof ListPrimitive ||
    node instanceof CharPrimitive ||
    node instanceof StringPrimitive ||
    node instanceof NilPrimitive ||
    node instanceof SymbolPrimitive
  );
}
