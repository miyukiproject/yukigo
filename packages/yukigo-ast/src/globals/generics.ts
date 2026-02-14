import { Visitor } from "../visitor/index.js";
import { Expression } from "./expressions.js";
import { Statement } from "./statements.js";

// Universal primitive value types

type Metadata = Map<string, any>;

/**
 * @hidden
 */
export abstract class ASTNode {
  /** @hidden */
  public loc: SourceLocation;
  /** @hidden */
  public metadata: Metadata = new Map();

  constructor(loc?: SourceLocation, metadata?: Metadata) {
    this.loc = loc;
    this.metadata = metadata ?? new Map();
  }

  public setMetadata(key: string, value: any): void {
    this.metadata.set(key, value);
  }

  public getMetadata<T>(key: string): T | undefined {
    return this.metadata.get(key);
  }

  public hasMetadata(key: string): boolean {
    return this.metadata.has(key);
  }

  /** @hidden */
  abstract accept<R>(visitor: Visitor<R>): R;
  /** @hidden */
  abstract toJSON(): object;
}

/**
 * Source location information
 */
export class SourceLocation {
  constructor(public line: number, public column: number) { }
  public toJSON() {
    return {
      type: "SourceLocation",
      line: this.line,
      column: this.column,
    };
  }
}

export type AST = Statement[];

export interface YukigoParser {
  errors?: string[];
  parse: (code: string) => AST;
  parseExpression: (code: string) => Expression;
}
