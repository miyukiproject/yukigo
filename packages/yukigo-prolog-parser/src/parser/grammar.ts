// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var period: any;
declare var colonDash: any;
declare var queryOp: any;
declare var comma: any;
declare var semicolon: any;
declare var forallRule: any;
declare var findallRule: any;
declare var notOperator: any;
declare var lparen: any;
declare var rparen: any;
declare var consOp: any;
declare var wildcard: any;
declare var number: any;
declare var string: any;
declare var variable: any;
declare var atom: any;
declare var op: any;
declare var WS: any;

import { 
    NumberPrimitive, 
    StringPrimitive, 
    Rule, 
    Fact, 
    Query,
    ConsExpression,
    ArithmeticBinaryOperation,
    ArithmeticUnaryOperation,
    ComparisonOperation,
    Exist, 
    Not, 
    Findall, 
    Sequence,
    If,
    Call,
    Forall, 
    SymbolPrimitive, 
    AssignOperation,
    UnifyOperation,
    VariablePattern, 
    FunctorPattern, 
    ConsPattern, 
    ListPattern, 
    LiteralPattern,
    WildcardPattern,
    TuplePattern
 } from "@yukigo/ast"

import { PrologLexer } from "./lexer.js"

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: PrologLexer,
  ParserRules: [
    {"name": "program$ebnf$1", "symbols": []},
    {"name": "program$ebnf$1$subexpression$1", "symbols": ["clause", "_"]},
    {"name": "program$ebnf$1", "symbols": ["program$ebnf$1", "program$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "program", "symbols": ["program$ebnf$1"], "postprocess": (d) => d[0].map(x => x[0]).filter(x => x !== null).flat(Infinity)},
    {"name": "clause$subexpression$1", "symbols": ["fact"]},
    {"name": "clause$subexpression$1", "symbols": ["rule"]},
    {"name": "clause$subexpression$1", "symbols": ["query"]},
    {"name": "clause", "symbols": ["clause$subexpression$1"], "postprocess": (d) => d[0][0]},
    {"name": "fact$ebnf$1", "symbols": ["arguments"], "postprocess": id},
    {"name": "fact$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "fact", "symbols": ["atom", "fact$ebnf$1", "_", (PrologLexer.has("period") ? {type: "period"} : period)], "postprocess": (d) => new Fact(d[0], d[1] ?? [])},
    {"name": "rule$ebnf$1", "symbols": ["arguments"], "postprocess": id},
    {"name": "rule$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "rule", "symbols": ["atom", "rule$ebnf$1", "_", (PrologLexer.has("colonDash") ? {type: "colonDash"} : colonDash), "_", "body", "_", (PrologLexer.has("period") ? {type: "period"} : period)], "postprocess": (d) => new Rule(d[0], d[1] ?? [], d[5])},
    {"name": "query", "symbols": [(PrologLexer.has("queryOp") ? {type: "queryOp"} : queryOp), "_", "body", "_", (PrologLexer.has("period") ? {type: "period"} : period)], "postprocess": (d) => new Query(d[2])},
    {"name": "body$ebnf$1", "symbols": []},
    {"name": "body$ebnf$1$subexpression$1$subexpression$1", "symbols": [(PrologLexer.has("comma") ? {type: "comma"} : comma)]},
    {"name": "body$ebnf$1$subexpression$1$subexpression$1", "symbols": [(PrologLexer.has("semicolon") ? {type: "semicolon"} : semicolon)]},
    {"name": "body$ebnf$1$subexpression$1", "symbols": ["_", "body$ebnf$1$subexpression$1$subexpression$1", "_", "expression"]},
    {"name": "body$ebnf$1", "symbols": ["body$ebnf$1", "body$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "body", "symbols": ["expression", "body$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[3])]},
    {"name": "expression$subexpression$1", "symbols": ["exist"]},
    {"name": "expression$subexpression$1", "symbols": ["assignment"]},
    {"name": "expression$subexpression$1", "symbols": ["comparison"]},
    {"name": "expression$subexpression$1", "symbols": ["not"]},
    {"name": "expression$subexpression$1", "symbols": ["forall"]},
    {"name": "expression$subexpression$1", "symbols": ["findall"]},
    {"name": "expression$subexpression$1", "symbols": ["unification"]},
    {"name": "expression$subexpression$1", "symbols": ["conditional"]},
    {"name": "expression", "symbols": ["expression$subexpression$1"], "postprocess": (d) => d[0][0]},
    {"name": "expression", "symbols": [{"literal":"("}, "_", "expression", "_", {"literal":")"}], "postprocess": (d) => d[2]},
    {"name": "conditional", "symbols": [{"literal":"("}, "_", "expression", "_", {"literal":"->"}, "_", "expression", "_", (PrologLexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_", "expression", "_", {"literal":")"}], "postprocess": (d) => new If(d[2], d[6], d[10])},
    {"name": "forall", "symbols": [(PrologLexer.has("forallRule") ? {type: "forallRule"} : forallRule), {"literal":"("}, "_", "expression", "_", (PrologLexer.has("comma") ? {type: "comma"} : comma), "_", "expression", "_", {"literal":")"}], "postprocess": (d) => new Forall(d[3], d[7])},
    {"name": "findall", "symbols": [(PrologLexer.has("findallRule") ? {type: "findallRule"} : findallRule), {"literal":"("}, "_", "expression", "_", (PrologLexer.has("comma") ? {type: "comma"} : comma), "_", "expression", "_", (PrologLexer.has("comma") ? {type: "comma"} : comma), "_", "expression", "_", {"literal":")"}], "postprocess": (d) => new Findall(d[3], d[7], d[11])},
    {"name": "not", "symbols": [(PrologLexer.has("notOperator") ? {type: "notOperator"} : notOperator), "_", "expression"], "postprocess": (d) => new Not([d[2]])},
    {"name": "not", "symbols": [(PrologLexer.has("notOperator") ? {type: "notOperator"} : notOperator), "_", {"literal":"("}, "_", "body", "_", {"literal":")"}], "postprocess": (d) => new Not(d[4])},
    {"name": "exist", "symbols": [{"literal":"call"}, (PrologLexer.has("lparen") ? {type: "lparen"} : lparen), "_", "pattern_list", "_", (PrologLexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess":  (d) => {
            const [callee, ...rest] = d[3]
            return new Call(callee.name, rest)
        } },
    {"name": "exist$ebnf$1", "symbols": ["arguments"], "postprocess": id},
    {"name": "exist$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "exist", "symbols": ["atom", "exist$ebnf$1"], "postprocess": (d) => new Exist(d[0], d[1] ?? [])},
    {"name": "exist", "symbols": ["variable"], "postprocess": (d) => new Exist(d[0], [])},
    {"name": "assignment", "symbols": ["addition", "_", {"literal":"is"}, "_", "addition"], "postprocess": (d) => new AssignOperation("Assign", d[0], d[4])},
    {"name": "unification", "symbols": ["addition", "_", {"literal":"="}, "_", "addition"], "postprocess": (d) => new UnifyOperation("Unify", d[0], d[4])},
    {"name": "comparison", "symbols": ["addition", "_", "comparison_op", "_", "addition"], "postprocess": (d) => new ComparisonOperation(d[2], d[0], d[4])},
    {"name": "addition", "symbols": ["multiplication", "_", {"literal":"+"}, "_", "addition"], "postprocess": (d) => new ArithmeticBinaryOperation("Plus", d[0], d[4])},
    {"name": "addition", "symbols": ["multiplication", "_", {"literal":"-"}, "_", "addition"], "postprocess": (d) => new ArithmeticBinaryOperation("Minus", d[0], d[4])},
    {"name": "addition", "symbols": ["multiplication"], "postprocess": id},
    {"name": "multiplication", "symbols": ["primary", "_", {"literal":"*"}, "_", "multiplication"], "postprocess": (d) => new ArithmeticBinaryOperation("Multiply", d[0], d[4])},
    {"name": "multiplication", "symbols": ["primary", "_", {"literal":"/"}, "_", "multiplication"], "postprocess": (d) => new ArithmeticBinaryOperation("Divide", d[0], d[4])},
    {"name": "multiplication", "symbols": ["primary"], "postprocess": id},
    {"name": "primary", "symbols": ["literal"], "postprocess": id},
    {"name": "primary", "symbols": ["variable"], "postprocess": id},
    {"name": "primary", "symbols": ["atom", "arguments"], "postprocess": d => new Exist(d[0], d[1] ?? [])},
    {"name": "primary", "symbols": ["primitiveOperation"], "postprocess": id},
    {"name": "primary", "symbols": ["cons_expr"], "postprocess": id},
    {"name": "primary", "symbols": [{"literal":"("}, "_", "addition", "_", {"literal":")"}], "postprocess": d => d[2]},
    {"name": "cons_expr", "symbols": [{"literal":"["}, "_", "primary_list", "_", (PrologLexer.has("consOp") ? {type: "consOp"} : consOp), "_", "expression", "_", {"literal":"]"}], "postprocess": (d) => new ConsExpression(d[2], d[6])},
    {"name": "primitiveOperation", "symbols": [{"literal":"round"}, "__", "addition"], "postprocess": d => new ArithmeticUnaryOperation("Round", d[2])},
    {"name": "primitiveOperation", "symbols": [{"literal":"abs"}, "__", "addition"], "postprocess": d => new ArithmeticUnaryOperation("Absolute", d[2])},
    {"name": "primitiveOperation", "symbols": [{"literal":"sqrt"}, "__", "addition"], "postprocess": d => new ArithmeticUnaryOperation("Sqrt", d[2])},
    {"name": "primitiveArguments", "symbols": [(PrologLexer.has("lparen") ? {type: "lparen"} : lparen), "_", "primary_list", "_", (PrologLexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": (d) => d[2]},
    {"name": "primary_list$ebnf$1", "symbols": []},
    {"name": "primary_list$ebnf$1$subexpression$1", "symbols": ["_", (PrologLexer.has("comma") ? {type: "comma"} : comma), "_", "addition"]},
    {"name": "primary_list$ebnf$1", "symbols": ["primary_list$ebnf$1", "primary_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "primary_list", "symbols": ["addition", "primary_list$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[3])]},
    {"name": "arguments", "symbols": [(PrologLexer.has("lparen") ? {type: "lparen"} : lparen), "_", "pattern_list", "_", (PrologLexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": (d) => d[2]},
    {"name": "pattern_list$ebnf$1", "symbols": []},
    {"name": "pattern_list$ebnf$1$subexpression$1", "symbols": ["_", (PrologLexer.has("comma") ? {type: "comma"} : comma), "_", "pattern"]},
    {"name": "pattern_list$ebnf$1", "symbols": ["pattern_list$ebnf$1", "pattern_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "pattern_list", "symbols": ["pattern", "pattern_list$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[3])]},
    {"name": "pattern", "symbols": ["variable"], "postprocess": (d) => new VariablePattern(d[0])},
    {"name": "pattern", "symbols": ["literal"], "postprocess": (d) => new LiteralPattern(d[0])},
    {"name": "pattern", "symbols": [(PrologLexer.has("wildcard") ? {type: "wildcard"} : wildcard)], "postprocess": (d) => new WildcardPattern()},
    {"name": "pattern", "symbols": ["atom", "arguments"], "postprocess": (d) => new FunctorPattern(d[0], d[1])},
    {"name": "pattern", "symbols": [{"literal":"("}, "_", "pattern_list", "_", {"literal":")"}], "postprocess": (d) => new TuplePattern(d[2])},
    {"name": "pattern", "symbols": [{"literal":"["}, "_", "pattern_list", "_", (PrologLexer.has("consOp") ? {type: "consOp"} : consOp), "_", "pattern", "_", {"literal":"]"}], "postprocess": (d) => new ConsPattern(d[2].length > 1 ? new ListPattern(d[2]) : d[2][0], new VariablePattern(d[6]))},
    {"name": "pattern$ebnf$1", "symbols": ["pattern_list"], "postprocess": id},
    {"name": "pattern$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "pattern", "symbols": [{"literal":"["}, "_", "pattern$ebnf$1", "_", {"literal":"]"}], "postprocess": (d) => new ListPattern(d[2] ? d[2] : [])},
    {"name": "literal", "symbols": ["atom"], "postprocess": id},
    {"name": "literal", "symbols": [(PrologLexer.has("number") ? {type: "number"} : number)], "postprocess": (d) => new NumberPrimitive(Number(d[0].value))},
    {"name": "literal", "symbols": [(PrologLexer.has("string") ? {type: "string"} : string)], "postprocess": (d) => new StringPrimitive(d[0].value)},
    {"name": "variable", "symbols": [(PrologLexer.has("variable") ? {type: "variable"} : variable)], "postprocess": (d) => new SymbolPrimitive(d[0].value)},
    {"name": "atom$subexpression$1", "symbols": [(PrologLexer.has("atom") ? {type: "atom"} : atom)]},
    {"name": "atom$subexpression$1", "symbols": [(PrologLexer.has("op") ? {type: "op"} : op)]},
    {"name": "atom", "symbols": ["atom$subexpression$1"], "postprocess": (d) => new SymbolPrimitive(d[0][0].value)},
    {"name": "comparison_op", "symbols": [{"literal":"=:="}], "postprocess": d => "Equal"},
    {"name": "comparison_op", "symbols": [{"literal":"=\\="}], "postprocess": d => "NotEqual"},
    {"name": "comparison_op", "symbols": [{"literal":"=="}], "postprocess": d => "Same"},
    {"name": "comparison_op", "symbols": [{"literal":"\\=="}], "postprocess": d => "NotSame"},
    {"name": "comparison_op", "symbols": [{"literal":"\\="}], "postprocess": d => "NotSame"},
    {"name": "comparison_op", "symbols": [{"literal":"@<"}], "postprocess": d => "LessThan"},
    {"name": "comparison_op", "symbols": [{"literal":"@=<"}], "postprocess": d => "LessOrEqualThan"},
    {"name": "comparison_op", "symbols": [{"literal":"@>"}], "postprocess": d => "GreaterThan"},
    {"name": "comparison_op", "symbols": [{"literal":"@>="}], "postprocess": d => "GreaterOrEqualThan"},
    {"name": "comparison_op", "symbols": [{"literal":"<"}], "postprocess": d => "LessThan"},
    {"name": "comparison_op", "symbols": [{"literal":"=<"}], "postprocess": d => "LessOrEqualThan"},
    {"name": "comparison_op", "symbols": [{"literal":">"}], "postprocess": d => "GreaterThan"},
    {"name": "comparison_op", "symbols": [{"literal":">="}], "postprocess": d => "GreaterOrEqualThan"},
    {"name": "comparison_op", "symbols": [{"literal":"=@="}], "postprocess": d => "Same"},
    {"name": "comparison_op", "symbols": [{"literal":"\\=@="}], "postprocess": d => "NotSame"},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", (PrologLexer.has("WS") ? {type: "WS"} : WS)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "__$ebnf$1", "symbols": [(PrologLexer.has("WS") ? {type: "WS"} : WS)], "postprocess": id},
    {"name": "__$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "__", "symbols": ["__$ebnf$1"]}
  ],
  ParserStart: "program",
};

export default grammar;
