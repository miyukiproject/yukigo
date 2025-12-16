// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var comment: any;
declare var NL: any;
declare var lbracket: any;
declare var rbracket: any;
declare var typeClass: any;
declare var typeEquals: any;
declare var op: any;
declare var assign: any;
declare var anonymousVariable: any;
declare var arrow: any;
declare var typeArrow: any;
declare var constructor: any;
declare var variable: any;
declare var number: any;
declare var char: any;
declare var string: any;
declare var bool: any;
declare var WS: any;

import { HSLexer } from "./lexer.js"
import {
  TypeCast,
  Application,
  ConsExpression,
  StringOperation,
  LogicalBinaryOperation,
  ComparisonOperation,
  ArithmeticBinaryOperation,
  Print,
  ListBinaryOperation,
  ListUnaryOperation,
  ArithmeticUnaryOperation,
  LogicalUnaryOperation,
  SymbolPrimitive,
  ListPrimitive,
  Switch,
  CompositionExpression,
  Lambda,
  TupleExpression,
  DataExpression,
  Function,
  FieldExpression,
  If,
  Record,
  Constructor,
  Field,
  ListComprehension, 
  Generator,
  RangeExpression,
  TypeSignature,
  Return,
  GuardedBody,
  Equation,
  Raise,
  UnguardedBody,
  Sequence,
  Otherwise,
  WildcardPattern,
  ConsPattern,
  VariablePattern,
  LiteralPattern,
  AsPattern,
  ConstructorPattern,
  ListPattern,
  TuplePattern,
  TypeAlias,
  ParameterizedType,
  Constraint,
  TypeApplication,
  LetInExpression,
  SimpleType,
  ListType,
  TupleType,
  NumberPrimitive,
  CharPrimitive,
  StringPrimitive,
  BooleanPrimitive,
  SourceLocation
} from "yukigo-ast";

const filter = d => {
    return d.filter((token) => token !== null);
};

const loc = (token) => new SourceLocation(token.line, token.col);


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
  Lexer: HSLexer,
  ParserRules: [
    {"name": "program$ebnf$1", "symbols": ["declaration"]},
    {"name": "program$ebnf$1", "symbols": ["program$ebnf$1", "declaration"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "program", "symbols": ["program$ebnf$1"], "postprocess": (d) => d[0].filter(x => x !== null)},
    {"name": "declaration$subexpression$1", "symbols": ["function_declaration"]},
    {"name": "declaration$subexpression$1", "symbols": ["function_signature"]},
    {"name": "declaration$subexpression$1", "symbols": ["type_declaration"]},
    {"name": "declaration$subexpression$1", "symbols": ["data_declaration"]},
    {"name": "declaration$subexpression$1", "symbols": ["comment"]},
    {"name": "declaration$subexpression$1", "symbols": ["empty_line"]},
    {"name": "declaration$subexpression$1", "symbols": ["apply_operator"]},
    {"name": "declaration", "symbols": ["declaration$subexpression$1"], "postprocess": (d) => d[0][0]},
    {"name": "comment", "symbols": [(HSLexer.has("comment") ? {type: "comment"} : comment)], "postprocess": d => null},
    {"name": "empty_line", "symbols": ["_", (HSLexer.has("NL") ? {type: "NL"} : NL)], "postprocess": d => null},
    {"name": "expression$subexpression$1", "symbols": ["type_cast"]},
    {"name": "expression$subexpression$1", "symbols": ["letin_expression"]},
    {"name": "expression$subexpression$1", "symbols": ["if_expression"]},
    {"name": "expression$subexpression$1", "symbols": ["case_expression"]},
    {"name": "expression", "symbols": ["expression$subexpression$1"], "postprocess": (d) => d[0][0]},
    {"name": "type_cast", "symbols": ["apply_operator", "_", {"literal":"::"}, "_", "type"], "postprocess": (d) => new TypeCast(d[0], d[4])},
    {"name": "type_cast", "symbols": ["apply_operator"], "postprocess": id},
    {"name": "apply_operator", "symbols": ["bind_expression", "_", {"literal":"$"}, "_", "apply_operator"], "postprocess": (d) => new Application(d[0], d[4])},
    {"name": "apply_operator", "symbols": ["bind_expression"], "postprocess": id},
    {"name": "bind_expression", "symbols": ["logical_expression", "_", {"literal":">>="}, "_", "bind_expression"], "postprocess": (d) => new Application(new Application(new SymbolPrimitive("(>>=)"), d[0]), d[4])},
    {"name": "bind_expression", "symbols": ["logical_expression", "_", {"literal":">>"}, "_", "bind_expression"], "postprocess": (d) => new Application(new Application(new SymbolPrimitive("(>>)"), d[0]), d[4])},
    {"name": "bind_expression", "symbols": ["logical_expression"], "postprocess": id},
    {"name": "logical_expression", "symbols": ["comparison", "_", {"literal":"&&"}, "_", "logical_expression"], "postprocess": (d) => new LogicalBinaryOperation("And", d[0], d[4])},
    {"name": "logical_expression", "symbols": ["comparison", "_", {"literal":"||"}, "_", "logical_expression"], "postprocess": (d) => new LogicalBinaryOperation("Or", d[0], d[4])},
    {"name": "logical_expression", "symbols": ["comparison"], "postprocess": id},
    {"name": "comparison", "symbols": ["cons_expression", "_", "comparison_operator", "_", "cons_expression"], "postprocess": (d) => new ComparisonOperation(d[2], d[0], d[4])},
    {"name": "comparison", "symbols": ["cons_expression"], "postprocess": id},
    {"name": "cons_expression", "symbols": ["concatenation", "_", {"literal":":"}, "_", "cons_expression"], "postprocess": (d) => new ConsExpression(d[0], d[4])},
    {"name": "cons_expression", "symbols": ["concatenation"], "postprocess": id},
    {"name": "concatenation", "symbols": ["addition", "_", {"literal":"++"}, "_", "concatenation"], "postprocess": (d) => d[0] instanceof StringPrimitive || d[4] instanceof StringPrimitive ? new StringOperation("Concat", d[0], d[4]) : new ListBinaryOperation("Concat", d[0], d[4])},
    {"name": "concatenation", "symbols": ["addition"], "postprocess": id},
    {"name": "addition", "symbols": ["addition", "_", {"literal":"+"}, "_", "multiplication"], "postprocess": (d) => new ArithmeticBinaryOperation("Plus", d[0], d[4])},
    {"name": "addition", "symbols": ["addition", "_", {"literal":"-"}, "_", "multiplication"], "postprocess": (d) => new ArithmeticBinaryOperation("Minus", d[0], d[4])},
    {"name": "addition", "symbols": ["multiplication"], "postprocess": id},
    {"name": "multiplication", "symbols": ["multiplication", "_", {"literal":"*"}, "_", "power"], "postprocess": (d) => new ArithmeticBinaryOperation("Multiply", d[0], d[4])},
    {"name": "multiplication", "symbols": ["multiplication", "_", {"literal":"/"}, "_", "power"], "postprocess": (d) => new ArithmeticBinaryOperation("Divide", d[0], d[4])},
    {"name": "multiplication", "symbols": ["power"], "postprocess": id},
    {"name": "power", "symbols": ["unary_negation", "_", {"literal":"**"}, "_", "power"], "postprocess": (d) => new ArithmeticBinaryOperation("Power", d[0], d[4])},
    {"name": "power", "symbols": ["unary_negation", "_", {"literal":"^"}, "_", "power"], "postprocess": (d) => new ArithmeticBinaryOperation("Power", d[0], d[4])},
    {"name": "power", "symbols": ["unary_negation", "_", {"literal":"^^"}, "_", "power"], "postprocess": (d) => new ArithmeticBinaryOperation("Power", d[0], d[4])},
    {"name": "power", "symbols": ["unary_negation"], "postprocess": id},
    {"name": "unary_negation", "symbols": [{"literal":"-"}, "_", "unary_negation"], "postprocess": (d) => new ArithmeticUnaryOperation("Negation", d[2])},
    {"name": "unary_negation", "symbols": ["index_access"], "postprocess": id},
    {"name": "index_access", "symbols": ["index_access", "_", {"literal":"!!"}, "_", "composition_expression"], "postprocess": (d) => new ListBinaryOperation("GetAt", d[0], d[4])},
    {"name": "index_access", "symbols": ["composition_expression"], "postprocess": id},
    {"name": "composition_expression", "symbols": ["composition_expression", "_", {"literal":"."}, "_", "infix_operator_expression"], "postprocess": (d) => new CompositionExpression(d[0], d[4])},
    {"name": "composition_expression", "symbols": ["infix_operator_expression"], "postprocess": id},
    {"name": "infix_operator_expression", "symbols": ["infix_operator_expression", "_", {"literal":"`"}, "_", "variable", "_", {"literal":"`"}, "_", "application"], "postprocess": (d) => new Application(new Application(d[4], d[0]), d[8])},
    {"name": "infix_operator_expression", "symbols": ["application"], "postprocess": id},
    {"name": "application", "symbols": [{"literal":"error"}, "__", "primary"], "postprocess": d => new Raise(d[2])},
    {"name": "application$ebnf$1", "symbols": []},
    {"name": "application$ebnf$1$subexpression$1$subexpression$1", "symbols": ["_"]},
    {"name": "application$ebnf$1$subexpression$1$subexpression$1$subexpression$1", "symbols": ["_", (HSLexer.has("NL") ? {type: "NL"} : NL), "__"]},
    {"name": "application$ebnf$1$subexpression$1$subexpression$1", "symbols": ["application$ebnf$1$subexpression$1$subexpression$1$subexpression$1"]},
    {"name": "application$ebnf$1$subexpression$1", "symbols": ["application$ebnf$1$subexpression$1$subexpression$1", "primary"]},
    {"name": "application$ebnf$1", "symbols": ["application$ebnf$1", "application$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "application", "symbols": ["primary", "application$ebnf$1"], "postprocess":  (d) => {
            if (d[1].length === 0) return d[0];
            return d[1].reduce((left, right) => new Application(left, right[1]), d[0]);
        } },
    {"name": "operator$subexpression$1", "symbols": [{"literal":"=="}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"/="}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"<"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":">"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"<="}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"&&"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"||"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":">="}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"++"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":","}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"*"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"/"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":":"}]},
    {"name": "operator", "symbols": ["operator$subexpression$1"], "postprocess": (d) => d[0][0].value},
    {"name": "left_section", "symbols": [{"literal":"("}, "_", "expression", "_", "operator", "_", {"literal":")"}], "postprocess": (d) => new Application(new SymbolPrimitive(d[4]), d[2])},
    {"name": "right_section", "symbols": [{"literal":"("}, "_", "operator", "_", "expression", "_", {"literal":")"}], "postprocess":  (d) => {
          const flipBody = new SymbolPrimitive("flip");
          const op = new SymbolPrimitive(d[2]);
          const expr = d[4];
          const flipAppliedToOp = new Application(flipBody, op);
          return new Application(flipAppliedToOp, expr);
        }
        },
    {"name": "operator_section", "symbols": [{"literal":"("}, "_", "operator", "_", {"literal":")"}], "postprocess": (d) => new SymbolPrimitive(d[2])},
    {"name": "primary", "symbols": ["primitive"], "postprocess": id},
    {"name": "primary", "symbols": ["variable"], "postprocess": id},
    {"name": "primary", "symbols": ["constr"], "postprocess": id},
    {"name": "primary", "symbols": ["tuple_expression"], "postprocess": id},
    {"name": "primary", "symbols": ["left_section"], "postprocess": id},
    {"name": "primary", "symbols": ["right_section"], "postprocess": id},
    {"name": "primary", "symbols": ["operator_section"], "postprocess": id},
    {"name": "primary", "symbols": ["list_literal"], "postprocess": id},
    {"name": "primary", "symbols": ["lambda_expression"], "postprocess": id},
    {"name": "primary", "symbols": ["data_expression"], "postprocess": id},
    {"name": "primary", "symbols": ["list_comprehension"], "postprocess": id},
    {"name": "primary", "symbols": [{"literal":"("}, "_", "expression", "_", {"literal":")"}], "postprocess": (d) => d[2]},
    {"name": "primary", "symbols": [{"literal":"["}, "_", "range_expression", "_", {"literal":"]"}], "postprocess": (d) => d[2]},
    {"name": "list_comprehension", "symbols": [{"literal":"["}, "_", "expression", "_", {"literal":"|"}, "_", "comprehension_clause_list", "_", {"literal":"]"}], "postprocess":  (d) => {
            return new ListComprehension(d[2], d[6]);
        } },
    {"name": "comprehension_clause_list$ebnf$1", "symbols": []},
    {"name": "comprehension_clause_list$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "comprehension_clause"]},
    {"name": "comprehension_clause_list$ebnf$1", "symbols": ["comprehension_clause_list$ebnf$1", "comprehension_clause_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "comprehension_clause_list", "symbols": ["comprehension_clause", "comprehension_clause_list$ebnf$1"], "postprocess":  (d) => {
            return [d[0], ...d[1].map((x) => x[3])];
        } },
    {"name": "comprehension_clause", "symbols": ["variable", "_", {"literal":"<-"}, "_", "expression"], "postprocess": (d) => new Generator(d[0], d[4])},
    {"name": "comprehension_clause", "symbols": ["expression"], "postprocess": id},
    {"name": "lambda_expression", "symbols": [{"literal":"("}, "_", {"literal":"\\"}, "_", "parameter_list", "_", {"literal":"->"}, "_", "expression", "_", {"literal":")"}], "postprocess": (d) => new Lambda(d[4], d[8])},
    {"name": "tuple_expression$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "tuple_value"]},
    {"name": "tuple_expression$ebnf$1", "symbols": ["tuple_expression$ebnf$1$subexpression$1"]},
    {"name": "tuple_expression$ebnf$1$subexpression$2", "symbols": ["_", {"literal":","}, "_", "tuple_value"]},
    {"name": "tuple_expression$ebnf$1", "symbols": ["tuple_expression$ebnf$1", "tuple_expression$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "tuple_expression", "symbols": [{"literal":"("}, "_", "tuple_value", "tuple_expression$ebnf$1", "_", {"literal":")"}], "postprocess": (d) => new TupleExpression([d[2], ...d[3].map(x => x[3])])},
    {"name": "tuple_value", "symbols": ["expression"], "postprocess": id},
    {"name": "data_expression", "symbols": ["constr", "_", (HSLexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "fields_expressions", "_", (HSLexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (d) => new DataExpression(d[0], d[4])},
    {"name": "fields_expressions$ebnf$1", "symbols": []},
    {"name": "fields_expressions$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "field_exp"]},
    {"name": "fields_expressions$ebnf$1", "symbols": ["fields_expressions$ebnf$1", "fields_expressions$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "fields_expressions", "symbols": ["field_exp", "fields_expressions$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[3])]},
    {"name": "field_exp", "symbols": ["variable", "_", {"literal":"="}, "_", "expression"], "postprocess": (d) => new FieldExpression(d[0], d[4])},
    {"name": "if_expression", "symbols": [{"literal":"if"}, "__", "expression", "__", {"literal":"then"}, "__", "expression", "__", {"literal":"else"}, "__", "expression"], "postprocess": (d) => new If(d[2], d[6], d[10])},
    {"name": "letin_expression$subexpression$1", "symbols": ["_", {"literal":"{"}, "_"]},
    {"name": "letin_expression$ebnf$1", "symbols": ["bindings_list"], "postprocess": id},
    {"name": "letin_expression$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "letin_expression$subexpression$2", "symbols": ["_", {"literal":"}"}, "_"]},
    {"name": "letin_expression", "symbols": [{"literal":"let"}, "letin_expression$subexpression$1", "letin_expression$ebnf$1", "letin_expression$subexpression$2", {"literal":"in"}, "_", "expression"], "postprocess": (d) => new LetInExpression(new Sequence(d[2] ?? []), d[6])},
    {"name": "case_expression$subexpression$1", "symbols": ["_", {"literal":"{"}, "_"]},
    {"name": "case_expression$subexpression$2", "symbols": ["_", {"literal":"}"}, "_"]},
    {"name": "case_expression", "symbols": [{"literal":"case"}, "_", "expression", "_", {"literal":"of"}, "case_expression$subexpression$1", "case_arms", "case_expression$subexpression$2"], "postprocess": (d) => new Switch(d[2], d[6])},
    {"name": "case_arms$ebnf$1", "symbols": []},
    {"name": "case_arms$ebnf$1$subexpression$1$subexpression$1", "symbols": ["_", {"literal":";"}, "_"]},
    {"name": "case_arms$ebnf$1$subexpression$1", "symbols": ["case_arms$ebnf$1$subexpression$1$subexpression$1", "case_arm"]},
    {"name": "case_arms$ebnf$1", "symbols": ["case_arms$ebnf$1", "case_arms$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "case_arms", "symbols": ["case_arm", "case_arms$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[1])]},
    {"name": "case_arm", "symbols": ["pattern", "_", {"literal":"->"}, "_", "expression"], "postprocess": (d) => ({condition: d[0], body: d[4] })},
    {"name": "data_declaration$ebnf$1", "symbols": []},
    {"name": "data_declaration$ebnf$1$subexpression$1", "symbols": ["__", "type_variable"]},
    {"name": "data_declaration$ebnf$1", "symbols": ["data_declaration$ebnf$1", "data_declaration$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "data_declaration$ebnf$2", "symbols": []},
    {"name": "data_declaration$ebnf$2$subexpression$1", "symbols": ["_", {"literal":"|"}, "_", "constructor_def"]},
    {"name": "data_declaration$ebnf$2", "symbols": ["data_declaration$ebnf$2", "data_declaration$ebnf$2$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "data_declaration$ebnf$3", "symbols": ["deriving_clause"], "postprocess": id},
    {"name": "data_declaration$ebnf$3", "symbols": [], "postprocess": () => null},
    {"name": "data_declaration", "symbols": [{"literal":"data"}, "__", "constr", "data_declaration$ebnf$1", "_", {"literal":"="}, "_", "constructor_def", "data_declaration$ebnf$2", "data_declaration$ebnf$3"], "postprocess":  
        (d) => new Record(d[2], [d[7], ...d[8].map(x => x[3])], d[9])
        },
    {"name": "deriving_clause", "symbols": ["_", {"literal":"deriving"}, "_", "deriving_spec"], "postprocess": (d) => d[3]},
    {"name": "deriving_spec", "symbols": [{"literal":"("}, "_", "deriving_classes", "_", {"literal":")"}], "postprocess": (d) => d[2]},
    {"name": "deriving_spec", "symbols": ["constr"], "postprocess": (d) => [d[0]]},
    {"name": "deriving_classes$ebnf$1", "symbols": []},
    {"name": "deriving_classes$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", (HSLexer.has("typeClass") ? {type: "typeClass"} : typeClass)]},
    {"name": "deriving_classes$ebnf$1", "symbols": ["deriving_classes$ebnf$1", "deriving_classes$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "deriving_classes", "symbols": [(HSLexer.has("typeClass") ? {type: "typeClass"} : typeClass), "deriving_classes$ebnf$1"], "postprocess": (d) => [new SymbolPrimitive(d[0].value), ...d[1].map(x => new SymbolPrimitive(x[3].value))]},
    {"name": "constructor_def$ebnf$1$subexpression$1", "symbols": [(HSLexer.has("NL") ? {type: "NL"} : NL), "__"]},
    {"name": "constructor_def$ebnf$1", "symbols": ["constructor_def$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "constructor_def$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "constructor_def$ebnf$2$subexpression$1", "symbols": [(HSLexer.has("NL") ? {type: "NL"} : NL), "_"]},
    {"name": "constructor_def$ebnf$2", "symbols": ["constructor_def$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "constructor_def$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "constructor_def$ebnf$3$subexpression$1", "symbols": [(HSLexer.has("NL") ? {type: "NL"} : NL), "_"]},
    {"name": "constructor_def$ebnf$3", "symbols": ["constructor_def$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "constructor_def$ebnf$3", "symbols": [], "postprocess": () => null},
    {"name": "constructor_def", "symbols": ["constr", "_", "constructor_def$ebnf$1", (HSLexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "constructor_def$ebnf$2", "field_list", "_", "constructor_def$ebnf$3", (HSLexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (d) => new Constructor(d[0], d[6])},
    {"name": "constructor_def$ebnf$4", "symbols": []},
    {"name": "constructor_def$ebnf$4$subexpression$1", "symbols": ["__", "simple_type"]},
    {"name": "constructor_def$ebnf$4", "symbols": ["constructor_def$ebnf$4", "constructor_def$ebnf$4$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "constructor_def", "symbols": ["constr", "constructor_def$ebnf$4"], "postprocess": (d) => new Constructor(d[0], d[1].map(x => new Field(undefined, x[1])))},
    {"name": "field_list$ebnf$1", "symbols": []},
    {"name": "field_list$ebnf$1$subexpression$1$ebnf$1$subexpression$1", "symbols": [(HSLexer.has("NL") ? {type: "NL"} : NL), "_"]},
    {"name": "field_list$ebnf$1$subexpression$1$ebnf$1", "symbols": ["field_list$ebnf$1$subexpression$1$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "field_list$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "field_list$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "field_list$ebnf$1$subexpression$1$ebnf$1", "field"]},
    {"name": "field_list$ebnf$1", "symbols": ["field_list$ebnf$1", "field_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "field_list", "symbols": ["field", "field_list$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[4])]},
    {"name": "field", "symbols": ["variable", "_", (HSLexer.has("typeEquals") ? {type: "typeEquals"} : typeEquals), "_", "type"], "postprocess": (d) => new Field(d[0], d[4])},
    {"name": "binding_name", "symbols": [{"literal":"("}, "_", (HSLexer.has("op") ? {type: "op"} : op), "_", {"literal":")"}], "postprocess": d => new SymbolPrimitive(`${d[2].value}`)},
    {"name": "binding_name", "symbols": ["variable"], "postprocess": id},
    {"name": "function_signature$ebnf$1", "symbols": []},
    {"name": "function_signature$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "binding_name"]},
    {"name": "function_signature$ebnf$1", "symbols": ["function_signature$ebnf$1", "function_signature$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "function_signature", "symbols": ["binding_name", "function_signature$ebnf$1", "_", (HSLexer.has("typeEquals") ? {type: "typeEquals"} : typeEquals), "_", "type"], "postprocess": (d) => new TypeSignature(d[0], d[5])},
    {"name": "function_declaration", "symbols": ["variable", "equation"], "postprocess": (d) => new Function(d[0], [d[1]])},
    {"name": "function_declaration", "symbols": [{"literal":"("}, "_", (HSLexer.has("op") ? {type: "op"} : op), "_", {"literal":")"}, "equation"], "postprocess": (d) => new Function(new SymbolPrimitive(`${d[2].value}`), [d[5]])},
    {"name": "return_expression", "symbols": ["expression"], "postprocess": d => new Return(d[0])},
    {"name": "where_clause", "symbols": [{"literal":"where"}, "_", {"literal":"{"}, "_", "bindings_list", "_", {"literal":"}"}], "postprocess": d => d[4]},
    {"name": "bindings_list$ebnf$1", "symbols": []},
    {"name": "bindings_list$ebnf$1$subexpression$1$subexpression$1", "symbols": ["_", {"literal":";"}, "_"]},
    {"name": "bindings_list$ebnf$1$subexpression$1", "symbols": ["bindings_list$ebnf$1$subexpression$1$subexpression$1", "function_declaration"]},
    {"name": "bindings_list$ebnf$1", "symbols": ["bindings_list$ebnf$1", "bindings_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "bindings_list", "symbols": ["function_declaration", "bindings_list$ebnf$1"], "postprocess": d => [d[0], ...d[1].map(x => x[1])]},
    {"name": "equation$ebnf$1$subexpression$1", "symbols": [(HSLexer.has("NL") ? {type: "NL"} : NL), "__"]},
    {"name": "equation$ebnf$1", "symbols": ["equation$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "equation$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "equation$ebnf$2$subexpression$1", "symbols": ["_", "where_clause"]},
    {"name": "equation$ebnf$2", "symbols": ["equation$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "equation$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "equation", "symbols": ["params", "equation$ebnf$1", "guarded_rhs", "equation$ebnf$2"], "postprocess":  (d) => {
          const body = d[2];
          const finalBody = d[3] 
            ? body.map(guard => new GuardedBody(guard.condition, new Sequence([...d[3][1], new Return(guard.body)])))
            : body;
          return new Equation(d[0], finalBody);
        } },
    {"name": "equation$subexpression$1$subexpression$1", "symbols": ["_", (HSLexer.has("NL") ? {type: "NL"} : NL), "__"]},
    {"name": "equation$subexpression$1", "symbols": ["equation$subexpression$1$subexpression$1"]},
    {"name": "equation$subexpression$1", "symbols": ["_"]},
    {"name": "equation$ebnf$3$subexpression$1", "symbols": ["_", "where_clause"]},
    {"name": "equation$ebnf$3", "symbols": ["equation$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "equation$ebnf$3", "symbols": [], "postprocess": () => null},
    {"name": "equation", "symbols": ["params", (HSLexer.has("assign") ? {type: "assign"} : assign), "equation$subexpression$1", "return_expression", "equation$ebnf$3"], "postprocess": d => new Equation(d[0], new UnguardedBody(new Sequence(d[4] ? [...d[4][1], d[3]] : [d[3]])), d[3])},
    {"name": "params", "symbols": ["__", "parameter_list", "_"], "postprocess": d => d[1]},
    {"name": "params", "symbols": ["_"], "postprocess": d => []},
    {"name": "guarded_rhs$subexpression$1$subexpression$1", "symbols": ["_", (HSLexer.has("NL") ? {type: "NL"} : NL), "__"]},
    {"name": "guarded_rhs$subexpression$1", "symbols": ["guarded_rhs$subexpression$1$subexpression$1"]},
    {"name": "guarded_rhs$subexpression$1", "symbols": ["_"]},
    {"name": "guarded_rhs", "symbols": ["guarded_branch", "guarded_rhs$subexpression$1", "guarded_rhs"], "postprocess": (d) => [d[0], ...d[2]]},
    {"name": "guarded_rhs", "symbols": ["guarded_branch"], "postprocess": (d) => [d[0]]},
    {"name": "guarded_branch$subexpression$1$subexpression$1", "symbols": ["_", (HSLexer.has("NL") ? {type: "NL"} : NL), "__"]},
    {"name": "guarded_branch$subexpression$1", "symbols": ["guarded_branch$subexpression$1$subexpression$1"]},
    {"name": "guarded_branch$subexpression$1", "symbols": ["_"]},
    {"name": "guarded_branch$subexpression$2$subexpression$1", "symbols": ["_", (HSLexer.has("NL") ? {type: "NL"} : NL), "__"]},
    {"name": "guarded_branch$subexpression$2", "symbols": ["guarded_branch$subexpression$2$subexpression$1"]},
    {"name": "guarded_branch$subexpression$2", "symbols": ["_"]},
    {"name": "guarded_branch$subexpression$3$subexpression$1", "symbols": ["_", (HSLexer.has("NL") ? {type: "NL"} : NL), "__"]},
    {"name": "guarded_branch$subexpression$3", "symbols": ["guarded_branch$subexpression$3$subexpression$1"]},
    {"name": "guarded_branch$subexpression$3", "symbols": ["_"]},
    {"name": "guarded_branch", "symbols": [{"literal":"|"}, "guarded_branch$subexpression$1", "condition", "guarded_branch$subexpression$2", {"literal":"="}, "guarded_branch$subexpression$3", "expression"], "postprocess": (d) => new GuardedBody(d[2], d[6])},
    {"name": "condition", "symbols": [{"literal":"otherwise"}], "postprocess": d => new Otherwise()},
    {"name": "condition", "symbols": ["expression"], "postprocess": d => d[0]},
    {"name": "parameter_list$ebnf$1", "symbols": []},
    {"name": "parameter_list$ebnf$1$subexpression$1", "symbols": ["__", "pattern"]},
    {"name": "parameter_list$ebnf$1", "symbols": ["parameter_list$ebnf$1", "parameter_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "parameter_list", "symbols": ["pattern", "parameter_list$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[1])]},
    {"name": "pattern", "symbols": ["cons_pattern"], "postprocess": id},
    {"name": "cons_pattern$ebnf$1$subexpression$1", "symbols": ["_", {"literal":":"}, "_", "cons_pattern"]},
    {"name": "cons_pattern$ebnf$1", "symbols": ["cons_pattern$ebnf$1$subexpression$1"]},
    {"name": "cons_pattern$ebnf$1$subexpression$2", "symbols": ["_", {"literal":":"}, "_", "cons_pattern"]},
    {"name": "cons_pattern$ebnf$1", "symbols": ["cons_pattern$ebnf$1", "cons_pattern$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "cons_pattern", "symbols": [{"literal":"("}, "_", "cons_pattern", "cons_pattern$ebnf$1", "_", {"literal":")"}], "postprocess":  
        (d) => {
          const patterns = [d[2], ...d[3].map(item => item[3])];
          return patterns.reduceRight((tail, head, index, arr) => {
            if (index === arr.length - 1) return tail;
            return new ConsPattern(head, tail);
          });
        }
          },
    {"name": "cons_pattern", "symbols": ["simple_pattern"], "postprocess": id},
    {"name": "simple_pattern$subexpression$1", "symbols": ["as_pattern"]},
    {"name": "simple_pattern$subexpression$1", "symbols": ["constructor_pattern"]},
    {"name": "simple_pattern$subexpression$1", "symbols": ["list_pattern"]},
    {"name": "simple_pattern$subexpression$1", "symbols": ["tuple_pattern"]},
    {"name": "simple_pattern$subexpression$1", "symbols": ["literal_pattern"]},
    {"name": "simple_pattern$subexpression$1", "symbols": ["variable_pattern"]},
    {"name": "simple_pattern$subexpression$1", "symbols": ["wildcard_pattern"]},
    {"name": "simple_pattern$subexpression$1", "symbols": ["paren_pattern"]},
    {"name": "simple_pattern", "symbols": ["simple_pattern$subexpression$1"], "postprocess": (d) => d[0][0]},
    {"name": "wildcard_pattern", "symbols": [(HSLexer.has("anonymousVariable") ? {type: "anonymousVariable"} : anonymousVariable)], "postprocess": (d) => new WildcardPattern()},
    {"name": "paren_pattern", "symbols": [{"literal":"("}, "_", "pattern", "_", {"literal":")"}], "postprocess": (d) => d[2]},
    {"name": "variable_pattern", "symbols": ["variable"], "postprocess": (d) => new VariablePattern(d[0])},
    {"name": "literal_pattern", "symbols": ["primitive"], "postprocess": (d) => new LiteralPattern(d[0])},
    {"name": "as_pattern$subexpression$1", "symbols": ["variable_pattern"]},
    {"name": "as_pattern$subexpression$1", "symbols": ["wildcard_pattern"]},
    {"name": "as_pattern", "symbols": ["as_pattern$subexpression$1", {"literal":"@"}, "pattern"], "postprocess": (d) => new AsPattern(d[0][0], d[2])},
    {"name": "constructor_pattern$ebnf$1$subexpression$1", "symbols": ["__", "pattern"]},
    {"name": "constructor_pattern$ebnf$1", "symbols": ["constructor_pattern$ebnf$1$subexpression$1"]},
    {"name": "constructor_pattern$ebnf$1$subexpression$2", "symbols": ["__", "pattern"]},
    {"name": "constructor_pattern$ebnf$1", "symbols": ["constructor_pattern$ebnf$1", "constructor_pattern$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "constructor_pattern", "symbols": [{"literal":"("}, "_", "constr", "constructor_pattern$ebnf$1", "_", {"literal":")"}], "postprocess": (d) => new ConstructorPattern(d[2].value, d[3].map(x => x[1]))},
    {"name": "constructor_pattern", "symbols": ["constr"], "postprocess": (d) => new ConstructorPattern(d[0].value, [])},
    {"name": "field_pattern_list$ebnf$1", "symbols": []},
    {"name": "field_pattern_list$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "field_pattern"]},
    {"name": "field_pattern_list$ebnf$1", "symbols": ["field_pattern_list$ebnf$1", "field_pattern_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "field_pattern_list", "symbols": ["field_pattern", "field_pattern_list$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[3])]},
    {"name": "field_pattern", "symbols": ["variable", "_", {"literal":"="}, "_", "pattern"], "postprocess": (d) => ({ field: d[0].value, pattern: d[4] })},
    {"name": "list_pattern$ebnf$1", "symbols": ["pattern_list"], "postprocess": id},
    {"name": "list_pattern$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "list_pattern", "symbols": [{"literal":"["}, "_", "list_pattern$ebnf$1", "_", {"literal":"]"}], "postprocess": (d) => new ListPattern(d[2] || [])},
    {"name": "pattern_list$ebnf$1", "symbols": []},
    {"name": "pattern_list$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "pattern"]},
    {"name": "pattern_list$ebnf$1", "symbols": ["pattern_list$ebnf$1", "pattern_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "pattern_list", "symbols": ["pattern", "pattern_list$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[3])]},
    {"name": "tuple_pattern$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "pattern"]},
    {"name": "tuple_pattern$ebnf$1", "symbols": ["tuple_pattern$ebnf$1$subexpression$1"]},
    {"name": "tuple_pattern$ebnf$1$subexpression$2", "symbols": ["_", {"literal":","}, "_", "pattern"]},
    {"name": "tuple_pattern$ebnf$1", "symbols": ["tuple_pattern$ebnf$1", "tuple_pattern$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "tuple_pattern", "symbols": [{"literal":"("}, "_", "pattern", "tuple_pattern$ebnf$1", "_", {"literal":")"}], "postprocess": (d) => new TuplePattern([d[2], ...d[3].map(x => x[3])])},
    {"name": "type_declaration$ebnf$1$subexpression$1", "symbols": ["__", "variable_list"]},
    {"name": "type_declaration$ebnf$1", "symbols": ["type_declaration$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "type_declaration$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "type_declaration", "symbols": [{"literal":"type"}, "__", "constr", "type_declaration$ebnf$1", "_", {"literal":"="}, "_", "type"], "postprocess": (d) => new TypeAlias(d[2], d[3] ? d[3][1] : [], d[7])},
    {"name": "variable_list$ebnf$1", "symbols": []},
    {"name": "variable_list$ebnf$1$subexpression$1", "symbols": ["__", "variable"]},
    {"name": "variable_list$ebnf$1", "symbols": ["variable_list$ebnf$1", "variable_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "variable_list", "symbols": ["variable", "variable_list$ebnf$1"], "postprocess": (d) => [d[0].value, ...d[1].map(x => x[1].value)]},
    {"name": "type", "symbols": ["function_type"], "postprocess": id},
    {"name": "constrained_type", "symbols": ["constraint_list", "_", (HSLexer.has("arrow") ? {type: "arrow"} : arrow), "_", "type"], "postprocess": (d) => new ParameterizedType([], d[4], d[0])},
    {"name": "context", "symbols": ["constraint"], "postprocess": (d) => [d[0]]},
    {"name": "context", "symbols": [{"literal":"("}, "_", "constraint_list", "_", {"literal":")"}], "postprocess": (d) => d[2]},
    {"name": "constraint_list$ebnf$1", "symbols": []},
    {"name": "constraint_list$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "constraint"]},
    {"name": "constraint_list$ebnf$1", "symbols": ["constraint_list$ebnf$1", "constraint_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "constraint_list", "symbols": ["constraint", "constraint_list$ebnf$1"], "postprocess":  (d) => 
        [d[0], ...d[1].map(x => x[3])]
          },
    {"name": "constraint$ebnf$1$subexpression$1", "symbols": ["_", "application_type"]},
    {"name": "constraint$ebnf$1", "symbols": ["constraint$ebnf$1$subexpression$1"]},
    {"name": "constraint$ebnf$1$subexpression$2", "symbols": ["_", "application_type"]},
    {"name": "constraint$ebnf$1", "symbols": ["constraint$ebnf$1", "constraint$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "constraint", "symbols": [(HSLexer.has("typeClass") ? {type: "typeClass"} : typeClass), "constraint$ebnf$1"], "postprocess": (d) => new Constraint(d[0].value, d[1].map(x => x[1]))},
    {"name": "function_type$ebnf$1$subexpression$1", "symbols": ["context", "_", (HSLexer.has("arrow") ? {type: "arrow"} : arrow), "_"]},
    {"name": "function_type$ebnf$1", "symbols": ["function_type$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "function_type$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "function_type$ebnf$2", "symbols": []},
    {"name": "function_type$ebnf$2$subexpression$1$subexpression$1", "symbols": ["_"]},
    {"name": "function_type$ebnf$2$subexpression$1$subexpression$1$subexpression$1", "symbols": ["_", (HSLexer.has("NL") ? {type: "NL"} : NL), "__"]},
    {"name": "function_type$ebnf$2$subexpression$1$subexpression$1", "symbols": ["function_type$ebnf$2$subexpression$1$subexpression$1$subexpression$1"]},
    {"name": "function_type$ebnf$2$subexpression$1$subexpression$2", "symbols": ["_"]},
    {"name": "function_type$ebnf$2$subexpression$1$subexpression$2$subexpression$1", "symbols": ["_", (HSLexer.has("NL") ? {type: "NL"} : NL), "__"]},
    {"name": "function_type$ebnf$2$subexpression$1$subexpression$2", "symbols": ["function_type$ebnf$2$subexpression$1$subexpression$2$subexpression$1"]},
    {"name": "function_type$ebnf$2$subexpression$1", "symbols": ["application_type", "function_type$ebnf$2$subexpression$1$subexpression$1", (HSLexer.has("typeArrow") ? {type: "typeArrow"} : typeArrow), "function_type$ebnf$2$subexpression$1$subexpression$2"]},
    {"name": "function_type$ebnf$2", "symbols": ["function_type$ebnf$2", "function_type$ebnf$2$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "function_type", "symbols": ["function_type$ebnf$1", "function_type$ebnf$2", "application_type"], "postprocess":  (d) => {
            const constraints = d[0] ? d[0][0] : [];
            
            if (d[1].length > 0) 
                return new ParameterizedType(d[1].map(x => x[0]), d[2], constraints);
            
            if (constraints.length === 0) 
                return d[2];
        
            return new ParameterizedType([], d[2], constraints);
        } 
        },
    {"name": "application_type$ebnf$1$subexpression$1", "symbols": ["_", "simple_type"]},
    {"name": "application_type$ebnf$1", "symbols": ["application_type$ebnf$1$subexpression$1"]},
    {"name": "application_type$ebnf$1$subexpression$2", "symbols": ["_", "simple_type"]},
    {"name": "application_type$ebnf$1", "symbols": ["application_type$ebnf$1", "application_type$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "application_type", "symbols": ["simple_type", "application_type$ebnf$1"], "postprocess": (d) => d[1].reduce((acc, arg) => new TypeApplication(acc, arg[1]), d[0])},
    {"name": "application_type", "symbols": ["simple_type"], "postprocess": id},
    {"name": "simple_type$subexpression$1", "symbols": ["type_variable"]},
    {"name": "simple_type$subexpression$1", "symbols": ["type_constructor"]},
    {"name": "simple_type", "symbols": ["simple_type$subexpression$1"], "postprocess": (d) => new SimpleType(d[0][0].value, [])},
    {"name": "simple_type", "symbols": [{"literal":"["}, "_", "type", "_", {"literal":"]"}], "postprocess": (d) => new ListType(d[2], [])},
    {"name": "simple_type$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "type"]},
    {"name": "simple_type$ebnf$1", "symbols": ["simple_type$ebnf$1$subexpression$1"]},
    {"name": "simple_type$ebnf$1$subexpression$2", "symbols": ["_", {"literal":","}, "_", "type"]},
    {"name": "simple_type$ebnf$1", "symbols": ["simple_type$ebnf$1", "simple_type$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "simple_type", "symbols": [{"literal":"("}, "_", "type", "simple_type$ebnf$1", "_", {"literal":")"}], "postprocess": (d) => new TupleType([d[2], ...d[3].map(x => x[3])], [])},
    {"name": "simple_type", "symbols": [{"literal":"("}, "_", "type", "_", {"literal":")"}], "postprocess": (d) => d[2]},
    {"name": "type_variable", "symbols": ["variable"], "postprocess": ([v]) => ({ value: v.value })},
    {"name": "type_constructor", "symbols": ["constr"], "postprocess": ([c]) => ({ value: c.value })},
    {"name": "constr", "symbols": [(HSLexer.has("constructor") ? {type: "constructor"} : constructor)], "postprocess": ([c]) => new SymbolPrimitive(c.value, loc(c))},
    {"name": "variable", "symbols": [(HSLexer.has("variable") ? {type: "variable"} : variable)], "postprocess": ([v]) => new SymbolPrimitive(v.value, loc(v))},
    {"name": "list_literal", "symbols": [{"literal":"["}, "_", {"literal":"]"}], "postprocess": (_) => new ListPrimitive([])},
    {"name": "list_literal", "symbols": [{"literal":"["}, "_", "expression_list", "_", {"literal":"]"}], "postprocess": ([_, __, list]) => new ListPrimitive(list)},
    {"name": "range_expression", "symbols": ["expression", "_", {"literal":".."}], "postprocess": (d) => new RangeExpression(d[0])},
    {"name": "range_expression", "symbols": ["expression", "_", {"literal":".."}, "_", "expression"], "postprocess": (d) => new RangeExpression(d[0], d[4])},
    {"name": "range_expression", "symbols": ["expression", "_", {"literal":","}, "_", "expression", "_", {"literal":".."}], "postprocess": (d) => new RangeExpression(d[0], undefined, d[4])},
    {"name": "range_expression", "symbols": ["expression", "_", {"literal":","}, "_", "expression", "_", {"literal":".."}, "_", "expression"], "postprocess": (d) => new RangeExpression(d[0], d[6], d[4])},
    {"name": "expression_list$ebnf$1", "symbols": []},
    {"name": "expression_list$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "expression"]},
    {"name": "expression_list$ebnf$1", "symbols": ["expression_list$ebnf$1", "expression_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "expression_list", "symbols": ["expression", "expression_list$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[3])]},
    {"name": "comparison_operator", "symbols": [{"literal":"=="}], "postprocess": (d) => "Equal"},
    {"name": "comparison_operator", "symbols": [{"literal":"/="}], "postprocess": (d) => "NotEqual"},
    {"name": "comparison_operator", "symbols": [{"literal":"<"}], "postprocess": (d) => "LessThan"},
    {"name": "comparison_operator", "symbols": [{"literal":">"}], "postprocess": (d) => "GreaterThan"},
    {"name": "comparison_operator", "symbols": [{"literal":"<="}], "postprocess": (d) => "LessOrEqualThan"},
    {"name": "comparison_operator", "symbols": [{"literal":">="}], "postprocess": (d) => "GreaterOrEqualThan"},
    {"name": "primitive", "symbols": [(HSLexer.has("number") ? {type: "number"} : number)], "postprocess": ([n]) => new NumberPrimitive(Number(n.value), loc(n))},
    {"name": "primitive", "symbols": [(HSLexer.has("char") ? {type: "char"} : char)], "postprocess": ([c]) => new CharPrimitive(c.value, loc(c))},
    {"name": "primitive", "symbols": [(HSLexer.has("string") ? {type: "string"} : string)], "postprocess": ([s]) => new StringPrimitive(s.value.slice(1, -1), loc(s))},
    {"name": "primitive", "symbols": [(HSLexer.has("bool") ? {type: "bool"} : bool)], "postprocess": ([b]) => new BooleanPrimitive(b.value === 'True' ? true : false, loc(b))},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", (HSLexer.has("WS") ? {type: "WS"} : WS)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "__$ebnf$1", "symbols": [(HSLexer.has("WS") ? {type: "WS"} : WS)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", (HSLexer.has("WS") ? {type: "WS"} : WS)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "__", "symbols": ["__$ebnf$1"]}
  ],
  ParserStart: "program",
};

export default grammar;
