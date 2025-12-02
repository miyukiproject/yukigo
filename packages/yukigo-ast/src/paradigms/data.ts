import { ASTNode, Expression, SourceLocation, SymbolPrimitive } from "../globals/generics.js";
import { Visitor } from "../visitor.js";

/**
 * Represents a query to retrieve data from a database table.
 * @category SQL
 * @example
 * SELECT * FROM users WHERE age > 18
 */
export class Select extends ASTNode {
  /** @hidden */
  public columns: Expression[];
  /** @hidden */
  public from: string;
  /** @hidden */
  public where?: Expression;

  constructor(
    columns: Expression[],
    from: string,
    where?: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.columns = columns;
    this.from = from;
    this.where = where;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSelect?.(this);
  }
  public toJSON() {
    return {
      type: "Select",
      columns: this.columns.map((c) => c.toJSON()),
      from: this.from,
      where: this.where.toJSON(),
    };
  }
}

/**
 * Represents a command to modify existing records in a database table.
 * @category SQL
 * @example
 * UPDATE products SET price = 10 WHERE id = 1
 */
export class Update extends ASTNode {
  /** @hidden */
  public table: string;
  /** @hidden */
  public assignments: Expression[];
  /** @hidden */
  public where?: Expression;

  constructor(
    table: string,
    assignments: Expression[],
    where?: Expression,
    loc?: SourceLocation
  ) {
    super(loc);
    this.table = table;
    this.assignments = assignments;
    this.where = where;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUpdate?.(this);
  }
  public toJSON() {
    return {
      type: "Update",
      table: this.table,
      assignments: this.assignments.map((assign) => assign.toJSON()),
      where: this.where.toJSON(),
    };
  }
}

/**
 * Represents a command to remove records from a database table.
 * @category SQL
 * @example
 * DELETE FROM sessions WHERE last_active < '2023-01-01'
 */
export class Delete extends ASTNode {
  /** @hidden */
  public table: string;
  /** @hidden */
  public where?: Expression;

  constructor(table: string, where?: Expression, loc?: SourceLocation) {
    super(loc);
    this.table = table;
    this.where = where;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitDelete?.(this);
  }
  public toJSON() {
    return {
      type: "Delete",
      table: this.table,
      where: this.where.toJSON(),
    };
  }
}

/**
 * Represents a command to insert new records into a database table.
 * @category SQL
 * @example
 * INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com')
 */
export class InsertInto extends ASTNode {
  /** @hidden */
  public table: string;
  /** @hidden */
  public columns: string[];
  /** @hidden */
  public values: Expression[][];

  constructor(
    table: string,
    columns: string[],
    values: Expression[][],
    loc?: SourceLocation
  ) {
    super(loc);
    this.table = table;
    this.columns = columns;
    this.values = values;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitInsertInto?.(this);
  }
  public toJSON() {
    return {
      type: "InsertInto",
      table: this.table,
      columns: this.columns,
      values: this.values.map((val) => val.map((v) => v.toJSON())),
    };
  }
}

/**
 * Represents a command to create a new database container.
 * @category SQL
 * @example
 * CREATE DATABASE production_db
 */
export class CreateDatabase extends ASTNode {
  /** @hidden */
  public name: string;

  constructor(name: string, loc?: SourceLocation) {
    super(loc);
    this.name = name;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCreateDatabase?.(this);
  }
  public toJSON() {
    return {
      type: "CreateDatabase",
      name: this.name,
    };
  }
}

/**
 * Represents a command to modify the properties of an existing database.
 * @category SQL
 * @example
 * ALTER DATABASE production_db SET READ_ONLY = OFF
 */
export class AlterDatabase extends ASTNode {
  /** @hidden */
  public name: string;
  /** @hidden */
  public action: string;

  constructor(name: string, action: string, loc?: SourceLocation) {
    super(loc);
    this.name = name;
    this.action = action;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAlterDatabase?.(this);
  }
  public toJSON() {
    return {
      type: "AlterDatabase",
      name: this.name,
      action: this.action,
    };
  }
}

/**
 * Represents a command to define a new table and its schema.
 * @category SQL
 * @example
 * CREATE TABLE employees (id INT, name VARCHAR(100))
 */
export class CreateTable extends ASTNode {
  /** @hidden */
  public name: string;
  /** @hidden */
  public columns: Expression[];

  constructor(name: string, columns: Expression[], loc?: SourceLocation) {
    super(loc);
    this.name = name;
    this.columns = columns;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCreateTable?.(this);
  }
  public toJSON() {
    return {
      type: "CreateTable",
      name: this.name,
      columns: this.columns.map((c) => c.toJSON()),
    };
  }
}

/**
 * Represents a command to modify an existing table structure (e.g., adding columns).
 * @category SQL
 * @example
 * ALTER TABLE employees ADD COLUMN email VARCHAR(255)
 */
export class AlterTable extends ASTNode {
  /** @hidden */
  public name: string;
  /** @hidden */
  public action: Expression;

  constructor(name: string, action: Expression, loc?: SourceLocation) {
    super(loc);
    this.name = name;
    this.action = action;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAlterTable?.(this);
  }
  public toJSON() {
    return {
      type: "AlterTable",
      name: this.name,
      action: this.action.toJSON(),
    };
  }
}

/**
 * Represents a command to delete a table and all its data permanently.
 * @category SQL
 * @example
 * DROP TABLE old_logs
 */
export class DropTable extends ASTNode {
  /** @hidden */
  public name: string;

  constructor(name: string, loc?: SourceLocation) {
    super(loc);
    this.name = name;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitDropTable?.(this);
  }
  public toJSON() {
    return {
      type: "DropTable",
      name: this.name,
    };
  }
}

/**
 * Represents a command to create a search index on table columns to improve query performance.
 * @category SQL
 * @example
 * CREATE INDEX idx_lastname ON employees (lastname)
 */
export class CreateIndex extends ASTNode {
  /** @hidden */
  public name: string;
  /** @hidden */
  public table: string;
  /** @hidden */
  public columns: string[];

  constructor(
    name: string,
    table: string,
    columns: string[],
    loc?: SourceLocation
  ) {
    super(loc);
    this.name = name;
    this.table = table;
    this.columns = columns;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCreateIndex?.(this);
  }
  public toJSON() {
    return {
      type: "CreateIndex",
      name: this.name,
      table: this.table,
      columns: this.columns,
    };
  }
}

/**
 * Represents a command to remove an existing search index.
 * @category SQL
 * @example
 * DROP INDEX idx_lastname
 */
export class DropIndex extends ASTNode {
  /** @hidden */
  public name: string;

  constructor(name: string, loc?: SourceLocation) {
    super(loc);
    this.name = name;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitDropIndex?.(this);
  }
  public toJSON() {
    return {
      type: "DropIndex",
      name: this.name,
    };
  }
}
/**
 * Represents a command to save changes made in a transaction.
 * @category SQL
 * @example
 * COMMIT TRAN transaction_name
 */
export class Commit extends ASTNode {
  /** @hidden */
  public name: SymbolPrimitive;

  constructor(name: SymbolPrimitive, loc?: SourceLocation) {
    super(loc);
    this.name = name;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCommit?.(this);
  }
  public toJSON() {
    return {
      type: "Commit",
      name: this.name,
    };
  }
}
/**
 * Represents a command to undo changes made in a transaction.
 * @category SQL
 * @example
 * ROLLBACK TRAN transaction_name
 */
export class Rollback extends ASTNode {
  /** @hidden */
  public name: SymbolPrimitive;

  constructor(name: SymbolPrimitive, loc?: SourceLocation) {
    super(loc);
    this.name = name;
  }
  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitRollback?.(this);
  }
  public toJSON() {
    return {
      type: "Rollback",
      name: this.name,
    };
  }
}
