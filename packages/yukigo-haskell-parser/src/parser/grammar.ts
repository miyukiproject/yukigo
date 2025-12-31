// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var lbracket: any;
declare var rbracket: any;
declare var assign: any;
declare var anonymousVariable: any;
declare var typeArrow: any;
declare var constructor: any;
declare var variable: any;
declare var number: any;
declare var char: any;
declare var string: any;
declare var bool: any;

import { HaskellLayoutLexer } from "./lexer.js"
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
  Case,
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
const HSLexer = new HaskellLayoutLexer();


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
    {"name": "program$ebnf$1", "symbols": []},
    {"name": "program$ebnf$1$subexpression$1", "symbols": [{"literal":";"}, "declaration"]},
    {"name": "program$ebnf$1", "symbols": ["program$ebnf$1", "program$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "program$ebnf$2", "symbols": [{"literal":";"}], "postprocess": id},
    {"name": "program$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "program", "symbols": ["declaration", "program$ebnf$1", "program$ebnf$2"], "postprocess": (d) => [d[0], ...d[1].map(x => x[1])].flat(Infinity)},
    {"name": "declaration$subexpression$1", "symbols": ["function_declaration"]},
    {"name": "declaration$subexpression$1", "symbols": ["function_signature"]},
    {"name": "declaration$subexpression$1", "symbols": ["type_declaration"]},
    {"name": "declaration$subexpression$1", "symbols": ["data_declaration"]},
    {"name": "declaration$subexpression$1", "symbols": ["apply_operator"]},
    {"name": "declaration", "symbols": ["declaration$subexpression$1"], "postprocess": (d) => d[0][0]},
    {"name": "expression$subexpression$1", "symbols": ["type_cast"]},
    {"name": "expression$subexpression$1", "symbols": ["letin_expression"]},
    {"name": "expression$subexpression$1", "symbols": ["if_expression"]},
    {"name": "expression$subexpression$1", "symbols": ["case_expression"]},
    {"name": "expression", "symbols": ["expression$subexpression$1"], "postprocess": (d) => d[0][0]},
    {"name": "type_cast", "symbols": ["apply_operator", {"literal":"::"}, "type"], "postprocess": (d) => new TypeCast(d[0], d[2])},
    {"name": "type_cast", "symbols": ["apply_operator"], "postprocess": id},
    {"name": "apply_operator", "symbols": ["bind_expression", {"literal":"$"}, "apply_operator"], "postprocess": (d) => new Application(d[0], d[2])},
    {"name": "apply_operator", "symbols": ["bind_expression"], "postprocess": id},
    {"name": "bind_expression", "symbols": ["logical_expression", {"literal":">>="}, "bind_expression"], "postprocess": (d) => new Application(new Application(new SymbolPrimitive("(>>=)"), d[0]), d[2])},
    {"name": "bind_expression", "symbols": ["logical_expression", {"literal":">>"}, "bind_expression"], "postprocess": (d) => new Application(new Application(new SymbolPrimitive("(>>)"), d[0]), d[2])},
    {"name": "bind_expression", "symbols": ["logical_expression"], "postprocess": id},
    {"name": "logical_expression", "symbols": ["comparison", {"literal":"&&"}, "logical_expression"], "postprocess": (d) => new LogicalBinaryOperation("And", d[0], d[2])},
    {"name": "logical_expression", "symbols": ["comparison", {"literal":"||"}, "logical_expression"], "postprocess": (d) => new LogicalBinaryOperation("Or", d[0], d[2])},
    {"name": "logical_expression", "symbols": ["comparison"], "postprocess": id},
    {"name": "comparison", "symbols": ["cons_expression", "comparison_operator", "cons_expression"], "postprocess": (d) => new ComparisonOperation(d[1], d[0], d[2])},
    {"name": "comparison", "symbols": ["cons_expression"], "postprocess": id},
    {"name": "cons_expression", "symbols": ["concatenation", {"literal":":"}, "cons_expression"], "postprocess": (d) => new ConsExpression(d[0], d[2])},
    {"name": "cons_expression", "symbols": ["concatenation"], "postprocess": id},
    {"name": "concatenation", "symbols": ["addition", {"literal":"++"}, "concatenation"], "postprocess": (d) => d[0] instanceof StringPrimitive || d[2] instanceof StringPrimitive ? new StringOperation("Concat", d[0], d[2]) : new ListBinaryOperation("Concat", d[0], d[2])},
    {"name": "concatenation", "symbols": ["addition"], "postprocess": id},
    {"name": "addition", "symbols": ["addition", {"literal":"+"}, "multiplication"], "postprocess": (d) => new ArithmeticBinaryOperation("Plus", d[0], d[2])},
    {"name": "addition", "symbols": ["addition", {"literal":"-"}, "multiplication"], "postprocess": (d) => new ArithmeticBinaryOperation("Minus", d[0], d[2])},
    {"name": "addition", "symbols": ["multiplication"], "postprocess": id},
    {"name": "multiplication", "symbols": ["multiplication", {"literal":"*"}, "power"], "postprocess": (d) => new ArithmeticBinaryOperation("Multiply", d[0], d[2])},
    {"name": "multiplication", "symbols": ["multiplication", {"literal":"/"}, "power"], "postprocess": (d) => new ArithmeticBinaryOperation("Divide", d[0], d[2])},
    {"name": "multiplication", "symbols": ["power"], "postprocess": id},
    {"name": "power", "symbols": ["unary_negation", {"literal":"**"}, "power"], "postprocess": (d) => new ArithmeticBinaryOperation("Power", d[0], d[2])},
    {"name": "power", "symbols": ["unary_negation", {"literal":"^"}, "power"], "postprocess": (d) => new ArithmeticBinaryOperation("Power", d[0], d[2])},
    {"name": "power", "symbols": ["unary_negation", {"literal":"^^"}, "power"], "postprocess": (d) => new ArithmeticBinaryOperation("Power", d[0], d[2])},
    {"name": "power", "symbols": ["unary_negation"], "postprocess": id},
    {"name": "unary_negation", "symbols": [{"literal":"-"}, "unary_negation"], "postprocess": (d) => new ArithmeticUnaryOperation("Negation", d[1])},
    {"name": "unary_negation", "symbols": ["index_access"], "postprocess": id},
    {"name": "index_access", "symbols": ["index_access", {"literal":"!!"}, "composition_expression"], "postprocess": (d) => new ListBinaryOperation("GetAt", d[0], d[2])},
    {"name": "index_access", "symbols": ["composition_expression"], "postprocess": id},
    {"name": "composition_expression", "symbols": ["composition_expression", {"literal":"."}, "infix_operator_expression"], "postprocess": (d) => new CompositionExpression(d[0], d[2])},
    {"name": "composition_expression", "symbols": ["infix_operator_expression"], "postprocess": id},
    {"name": "infix_operator_expression", "symbols": ["infix_operator_expression", {"literal":"`"}, "variable", {"literal":"`"}, "application"], "postprocess": (d) => new Application(new Application(d[2], d[0]), d[4])},
    {"name": "infix_operator_expression", "symbols": ["application"], "postprocess": id},
    {"name": "application", "symbols": [{"literal":"error"}, "primary"], "postprocess": d => new Raise(d[1])},
    {"name": "application$ebnf$1", "symbols": []},
    {"name": "application$ebnf$1", "symbols": ["application$ebnf$1", "primary"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "application", "symbols": ["primary", "application$ebnf$1"], "postprocess":  (d) => {
            if (d[1].length === 0) return d[0];
            return d[1].reduce((left, right) => new Application(left, right), d[0]);
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
    {"name": "operator$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":","}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"^^"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"^"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"**"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"*"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"!!"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"/"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"$"}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":"."}]},
    {"name": "operator$subexpression$1", "symbols": [{"literal":":"}]},
    {"name": "operator", "symbols": ["operator$subexpression$1"], "postprocess": (d) => d[0][0].value},
    {"name": "left_section", "symbols": [{"literal":"("}, "expression", "operator", {"literal":")"}], "postprocess": (d) => new Application(new SymbolPrimitive(d[2]), d[1])},
    {"name": "right_section", "symbols": [{"literal":"("}, "operator", "expression", {"literal":")"}], "postprocess":  (d) => {
          const flipBody = new SymbolPrimitive("flip");
          const op = new SymbolPrimitive(d[1]);
          const expr = d[2];
          const flipAppliedToOp = new Application(flipBody, op);
          return new Application(flipAppliedToOp, expr);
        }
        },
    {"name": "operator_section", "symbols": [{"literal":"("}, "operator", {"literal":")"}], "postprocess": (d) => new SymbolPrimitive(d[1])},
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
    {"name": "primary", "symbols": [{"literal":"("}, "expression", {"literal":")"}], "postprocess": (d) => d[1]},
    {"name": "primary", "symbols": [{"literal":"["}, "range_expression", {"literal":"]"}], "postprocess": (d) => d[1]},
    {"name": "list_comprehension", "symbols": [{"literal":"["}, "expression", {"literal":"|"}, "comprehension_clause_list", {"literal":"]"}], "postprocess":  (d) => {
            return new ListComprehension(d[1], d[3]);
        } },
    {"name": "comprehension_clause_list$ebnf$1", "symbols": []},
    {"name": "comprehension_clause_list$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "comprehension_clause"]},
    {"name": "comprehension_clause_list$ebnf$1", "symbols": ["comprehension_clause_list$ebnf$1", "comprehension_clause_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "comprehension_clause_list", "symbols": ["comprehension_clause", "comprehension_clause_list$ebnf$1"], "postprocess":  (d) => {
            return [d[0], ...d[1].map((x) => x[1])];
        } },
    {"name": "comprehension_clause", "symbols": ["variable", {"literal":"<-"}, "expression"], "postprocess": (d) => new Generator(d[0], d[2])},
    {"name": "comprehension_clause", "symbols": ["expression"], "postprocess": id},
    {"name": "lambda_expression", "symbols": [{"literal":"("}, {"literal":"\\"}, "parameter_list", {"literal":"->"}, "expression", {"literal":")"}], "postprocess": (d) => new Lambda(d[2], d[4])},
    {"name": "tuple_expression$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "expression"]},
    {"name": "tuple_expression$ebnf$1", "symbols": ["tuple_expression$ebnf$1$subexpression$1"]},
    {"name": "tuple_expression$ebnf$1$subexpression$2", "symbols": [{"literal":","}, "expression"]},
    {"name": "tuple_expression$ebnf$1", "symbols": ["tuple_expression$ebnf$1", "tuple_expression$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "tuple_expression", "symbols": [{"literal":"("}, "expression", "tuple_expression$ebnf$1", {"literal":")"}], "postprocess": (d) => new TupleExpression([d[1], ...d[2].map(x => x[1])])},
    {"name": "data_expression", "symbols": ["constr", (HSLexer.has("lbracket") ? {type: "lbracket"} : lbracket), "fields_expressions", (HSLexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (d) => new DataExpression(d[0], d[2])},
    {"name": "fields_expressions$ebnf$1", "symbols": []},
    {"name": "fields_expressions$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "field_exp"]},
    {"name": "fields_expressions$ebnf$1", "symbols": ["fields_expressions$ebnf$1", "fields_expressions$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "fields_expressions", "symbols": ["field_exp", "fields_expressions$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[1])]},
    {"name": "field_exp", "symbols": ["variable", {"literal":"="}, "expression"], "postprocess": (d) => new FieldExpression(d[0], d[2])},
    {"name": "if_expression", "symbols": [{"literal":"if"}, "expression", {"literal":"then"}, "expression", {"literal":"else"}, "expression"], "postprocess": (d) => new If(d[1], d[3], d[5])},
    {"name": "letin_expression$ebnf$1", "symbols": ["bindings_list"], "postprocess": id},
    {"name": "letin_expression$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "letin_expression", "symbols": [{"literal":"let"}, {"literal":"{"}, "letin_expression$ebnf$1", {"literal":"}"}, {"literal":"in"}, "expression"], "postprocess": (d) => new LetInExpression(new Sequence(d[2] ?? []), d[5])},
    {"name": "case_expression", "symbols": [{"literal":"case"}, "expression", {"literal":"of"}, {"literal":"{"}, "case_arms", {"literal":"}"}], "postprocess": (d) => new Switch(d[1], d[4])},
    {"name": "case_arms$ebnf$1", "symbols": []},
    {"name": "case_arms$ebnf$1$subexpression$1", "symbols": [{"literal":";"}, "case_arm"]},
    {"name": "case_arms$ebnf$1", "symbols": ["case_arms$ebnf$1", "case_arms$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "case_arms", "symbols": ["case_arm", "case_arms$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[1])]},
    {"name": "case_arm", "symbols": ["pattern", {"literal":"->"}, "expression"], "postprocess": (d) => new Case(d[0], d[2])},
    {"name": "data_declaration$ebnf$1", "symbols": []},
    {"name": "data_declaration$ebnf$1", "symbols": ["data_declaration$ebnf$1", "type_variable"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "data_declaration$ebnf$2", "symbols": []},
    {"name": "data_declaration$ebnf$2$subexpression$1", "symbols": [{"literal":"|"}, "constructor_def"]},
    {"name": "data_declaration$ebnf$2", "symbols": ["data_declaration$ebnf$2", "data_declaration$ebnf$2$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "data_declaration$ebnf$3", "symbols": ["deriving_clause"], "postprocess": id},
    {"name": "data_declaration$ebnf$3", "symbols": [], "postprocess": () => null},
    {"name": "data_declaration", "symbols": [{"literal":"data"}, "constr", "data_declaration$ebnf$1", {"literal":"="}, "constructor_def", "data_declaration$ebnf$2", "data_declaration$ebnf$3"], "postprocess":  
        (d) => new Record(d[1], [d[4], ...d[5].map(x => x[1])], d[6])
        },
    {"name": "deriving_clause", "symbols": [{"literal":"deriving"}, "deriving_spec"], "postprocess": (d) => d[1]},
    {"name": "deriving_spec", "symbols": [{"literal":"("}, "deriving_classes", {"literal":")"}], "postprocess": (d) => d[1]},
    {"name": "deriving_spec", "symbols": ["constr"], "postprocess": (d) => [d[0]]},
    {"name": "deriving_classes$ebnf$1", "symbols": []},
    {"name": "deriving_classes$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "constr"]},
    {"name": "deriving_classes$ebnf$1", "symbols": ["deriving_classes$ebnf$1", "deriving_classes$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "deriving_classes", "symbols": ["constr", "deriving_classes$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[1])]},
    {"name": "constructor_def", "symbols": ["constr", (HSLexer.has("lbracket") ? {type: "lbracket"} : lbracket), "field_list", (HSLexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (d) => new Constructor(d[0], d[2])},
    {"name": "constructor_def$ebnf$1", "symbols": []},
    {"name": "constructor_def$ebnf$1", "symbols": ["constructor_def$ebnf$1", "simple_type"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "constructor_def", "symbols": ["constr", "constructor_def$ebnf$1"], "postprocess": (d) => new Constructor(d[0], d[1].map(x => new Field(undefined, x)))},
    {"name": "field_list$ebnf$1", "symbols": []},
    {"name": "field_list$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "field"]},
    {"name": "field_list$ebnf$1", "symbols": ["field_list$ebnf$1", "field_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "field_list", "symbols": ["field", "field_list$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[1])]},
    {"name": "field", "symbols": ["variable", {"literal":"::"}, "type"], "postprocess": (d) => new Field(d[0], d[2])},
    {"name": "op_name", "symbols": [{"literal":"("}, "operator", {"literal":")"}], "postprocess": d => new SymbolPrimitive(d[1])},
    {"name": "binding_name", "symbols": ["op_name"], "postprocess": id},
    {"name": "binding_name", "symbols": ["variable"], "postprocess": id},
    {"name": "function_signature", "symbols": ["binding_name", {"literal":"::"}, "type"], "postprocess": (d) => new TypeSignature(d[0], d[2])},
    {"name": "function_declaration", "symbols": ["binding_name", "equation"], "postprocess": (d) => new Function(d[0], [d[1]])},
    {"name": "return_expression", "symbols": ["expression"], "postprocess": d => new Return(d[0])},
    {"name": "where_clause", "symbols": [{"literal":"where"}, {"literal":"{"}, "bindings_list", {"literal":"}"}], "postprocess": d => d[2]},
    {"name": "bindings_list", "symbols": ["function_declaration", {"literal":";"}, "bindings_list"], "postprocess": d => [d[0], ...d[2]]},
    {"name": "bindings_list", "symbols": ["function_declaration"], "postprocess": d => [d[0]]},
    {"name": "equation$ebnf$1", "symbols": ["where_clause"], "postprocess": id},
    {"name": "equation$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "equation", "symbols": ["params", "guarded_rhs", "equation$ebnf$1"], "postprocess":  (d) => {
          const body = d[1];
          const finalBody = d[2] 
            ? body.map(guard => new GuardedBody(guard.condition, new Sequence([...d[2], new Return(guard.body)])))
            : body;
          return new Equation(d[0], finalBody);
        } },
    {"name": "equation$ebnf$2", "symbols": ["where_clause"], "postprocess": id},
    {"name": "equation$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "equation", "symbols": ["params", (HSLexer.has("assign") ? {type: "assign"} : assign), "return_expression", "equation$ebnf$2"], "postprocess": d => new Equation(d[0], new UnguardedBody(new Sequence(d[3] ? [...d[3], d[2]] : [d[2]])), d[2])},
    {"name": "params$ebnf$1", "symbols": ["parameter_list"], "postprocess": id},
    {"name": "params$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "params", "symbols": ["params$ebnf$1"], "postprocess": (d) => d[0] || []},
    {"name": "guarded_rhs$ebnf$1", "symbols": ["guarded_branch"]},
    {"name": "guarded_rhs$ebnf$1", "symbols": ["guarded_rhs$ebnf$1", "guarded_branch"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "guarded_rhs", "symbols": ["guarded_rhs$ebnf$1"], "postprocess": (d) => d[0]},
    {"name": "guarded_branch", "symbols": [{"literal":"|"}, "condition", {"literal":"="}, "expression"], "postprocess": (d) => new GuardedBody(d[1], d[3])},
    {"name": "condition", "symbols": [{"literal":"otherwise"}], "postprocess": d => new Otherwise()},
    {"name": "condition", "symbols": ["expression"], "postprocess": d => d[0]},
    {"name": "parameter_list$ebnf$1", "symbols": ["pattern"]},
    {"name": "parameter_list$ebnf$1", "symbols": ["parameter_list$ebnf$1", "pattern"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "parameter_list", "symbols": ["parameter_list$ebnf$1"], "postprocess": id},
    {"name": "pattern", "symbols": ["cons_pattern"], "postprocess": id},
    {"name": "cons_pattern$ebnf$1$subexpression$1", "symbols": [{"literal":":"}, "cons_pattern"]},
    {"name": "cons_pattern$ebnf$1", "symbols": ["cons_pattern$ebnf$1$subexpression$1"]},
    {"name": "cons_pattern$ebnf$1$subexpression$2", "symbols": [{"literal":":"}, "cons_pattern"]},
    {"name": "cons_pattern$ebnf$1", "symbols": ["cons_pattern$ebnf$1", "cons_pattern$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "cons_pattern", "symbols": [{"literal":"("}, "cons_pattern", "cons_pattern$ebnf$1", {"literal":")"}], "postprocess":  
        (d) => {
          const patterns = [d[1], ...d[2].map(item => item[1])];
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
    {"name": "paren_pattern", "symbols": [{"literal":"("}, "pattern", {"literal":")"}], "postprocess": (d) => d[1]},
    {"name": "variable_pattern", "symbols": ["variable"], "postprocess": (d) => new VariablePattern(d[0])},
    {"name": "literal_pattern", "symbols": ["primitive"], "postprocess": (d) => new LiteralPattern(d[0])},
    {"name": "as_pattern$subexpression$1", "symbols": ["variable_pattern"]},
    {"name": "as_pattern$subexpression$1", "symbols": ["wildcard_pattern"]},
    {"name": "as_pattern", "symbols": ["as_pattern$subexpression$1", {"literal":"@"}, "pattern"], "postprocess": (d) => new AsPattern(d[0][0], d[2])},
    {"name": "constructor_pattern$ebnf$1", "symbols": ["pattern"]},
    {"name": "constructor_pattern$ebnf$1", "symbols": ["constructor_pattern$ebnf$1", "pattern"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "constructor_pattern", "symbols": [{"literal":"("}, "constr", "constructor_pattern$ebnf$1", {"literal":")"}], "postprocess": (d) => new ConstructorPattern(d[1].value, d[2])},
    {"name": "constructor_pattern", "symbols": ["constr"], "postprocess": (d) => new ConstructorPattern(d[0].value, [])},
    {"name": "field_pattern_list$ebnf$1", "symbols": []},
    {"name": "field_pattern_list$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "field_pattern"]},
    {"name": "field_pattern_list$ebnf$1", "symbols": ["field_pattern_list$ebnf$1", "field_pattern_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "field_pattern_list", "symbols": ["field_pattern", "field_pattern_list$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[1])]},
    {"name": "field_pattern", "symbols": ["variable", {"literal":"="}, "pattern"], "postprocess": (d) => ({ field: d[0].value, pattern: d[2] })},
    {"name": "list_pattern$ebnf$1", "symbols": ["pattern_list"], "postprocess": id},
    {"name": "list_pattern$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "list_pattern", "symbols": [{"literal":"["}, "list_pattern$ebnf$1", {"literal":"]"}], "postprocess": (d) => new ListPattern(d[1] || [])},
    {"name": "pattern_list$ebnf$1", "symbols": []},
    {"name": "pattern_list$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "pattern"]},
    {"name": "pattern_list$ebnf$1", "symbols": ["pattern_list$ebnf$1", "pattern_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "pattern_list", "symbols": ["pattern", "pattern_list$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[1])]},
    {"name": "tuple_pattern$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "pattern"]},
    {"name": "tuple_pattern$ebnf$1", "symbols": ["tuple_pattern$ebnf$1$subexpression$1"]},
    {"name": "tuple_pattern$ebnf$1$subexpression$2", "symbols": [{"literal":","}, "pattern"]},
    {"name": "tuple_pattern$ebnf$1", "symbols": ["tuple_pattern$ebnf$1", "tuple_pattern$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "tuple_pattern", "symbols": [{"literal":"("}, "pattern", "tuple_pattern$ebnf$1", {"literal":")"}], "postprocess": (d) => new TuplePattern([d[1], ...d[2].map(x => x[1])])},
    {"name": "type_declaration$ebnf$1", "symbols": ["variable_list"], "postprocess": id},
    {"name": "type_declaration$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "type_declaration", "symbols": [{"literal":"type"}, "constr", "type_declaration$ebnf$1", {"literal":"="}, "type"], "postprocess": (d) => new TypeAlias(d[1], d[2] || [], d[4])},
    {"name": "variable_list$ebnf$1", "symbols": []},
    {"name": "variable_list$ebnf$1", "symbols": ["variable_list$ebnf$1", "variable"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "variable_list", "symbols": ["variable", "variable_list$ebnf$1"], "postprocess": (d) => [d[0].value, ...d[1]]},
    {"name": "type", "symbols": ["function_type"], "postprocess": id},
    {"name": "constrained_type", "symbols": ["constraint_list", {"literal":"=>"}, "type"], "postprocess": (d) => new ParameterizedType([], d[2], d[0])},
    {"name": "context", "symbols": ["constraint"], "postprocess": (d) => [d[0]]},
    {"name": "context", "symbols": [{"literal":"("}, "constraint_list", {"literal":")"}], "postprocess": (d) => d[1]},
    {"name": "constraint_list$ebnf$1", "symbols": []},
    {"name": "constraint_list$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "constraint"]},
    {"name": "constraint_list$ebnf$1", "symbols": ["constraint_list$ebnf$1", "constraint_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "constraint_list", "symbols": ["constraint", "constraint_list$ebnf$1"], "postprocess":  (d) => 
        [d[0], ...d[1].map(x => x[1])]
          },
    {"name": "constraint$ebnf$1", "symbols": ["application_type"]},
    {"name": "constraint$ebnf$1", "symbols": ["constraint$ebnf$1", "application_type"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "constraint", "symbols": ["constr", "constraint$ebnf$1"], "postprocess": (d) => new Constraint(d[0].value, d[1])},
    {"name": "function_type$ebnf$1$subexpression$1", "symbols": ["context", {"literal":"=>"}]},
    {"name": "function_type$ebnf$1", "symbols": ["function_type$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "function_type$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "function_type$ebnf$2", "symbols": []},
    {"name": "function_type$ebnf$2$subexpression$1", "symbols": ["application_type", (HSLexer.has("typeArrow") ? {type: "typeArrow"} : typeArrow)]},
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
    {"name": "application_type", "symbols": ["simple_type", "application_type"], "postprocess": (d) => new TypeApplication(d[0], d[1])},
    {"name": "application_type", "symbols": ["simple_type"], "postprocess": id},
    {"name": "simple_type$subexpression$1", "symbols": ["type_variable"]},
    {"name": "simple_type$subexpression$1", "symbols": ["type_constructor"]},
    {"name": "simple_type", "symbols": ["simple_type$subexpression$1"], "postprocess": (d) => new SimpleType(d[0][0].value, [])},
    {"name": "simple_type", "symbols": [{"literal":"["}, "type", {"literal":"]"}], "postprocess": (d) => new ListType(d[1], [])},
    {"name": "simple_type$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "type"]},
    {"name": "simple_type$ebnf$1", "symbols": ["simple_type$ebnf$1$subexpression$1"]},
    {"name": "simple_type$ebnf$1$subexpression$2", "symbols": [{"literal":","}, "type"]},
    {"name": "simple_type$ebnf$1", "symbols": ["simple_type$ebnf$1", "simple_type$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "simple_type", "symbols": [{"literal":"("}, "type", "simple_type$ebnf$1", {"literal":")"}], "postprocess": (d) => new TupleType([d[1], ...d[2].map(x => x[1])], [])},
    {"name": "simple_type", "symbols": [{"literal":"("}, "type", {"literal":")"}], "postprocess": (d) => d[1]},
    {"name": "type_variable", "symbols": ["variable"], "postprocess": ([v]) => ({ value: v.value })},
    {"name": "type_constructor", "symbols": ["constr"], "postprocess": ([c]) => ({ value: c.value })},
    {"name": "constr", "symbols": [(HSLexer.has("constructor") ? {type: "constructor"} : constructor)], "postprocess": ([c]) => new SymbolPrimitive(c.value, loc(c))},
    {"name": "variable", "symbols": [(HSLexer.has("variable") ? {type: "variable"} : variable)], "postprocess": ([v]) => new SymbolPrimitive(v.value, loc(v))},
    {"name": "list_literal", "symbols": [{"literal":"["}, {"literal":"]"}], "postprocess": (_) => new ListPrimitive([])},
    {"name": "list_literal", "symbols": [{"literal":"["}, "expression_list", {"literal":"]"}], "postprocess": (d) => new ListPrimitive(d[1])},
    {"name": "range_expression", "symbols": ["expression", {"literal":".."}], "postprocess": (d) => new RangeExpression(d[0])},
    {"name": "range_expression", "symbols": ["expression", {"literal":".."}, "expression"], "postprocess": (d) => new RangeExpression(d[0], d[2])},
    {"name": "range_expression", "symbols": ["expression", {"literal":","}, "expression", {"literal":".."}], "postprocess": (d) => new RangeExpression(d[0], undefined, d[2])},
    {"name": "range_expression", "symbols": ["expression", {"literal":","}, "expression", {"literal":".."}, "expression"], "postprocess": (d) => new RangeExpression(d[0], d[4], d[2])},
    {"name": "expression_list$ebnf$1", "symbols": []},
    {"name": "expression_list$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "expression"]},
    {"name": "expression_list$ebnf$1", "symbols": ["expression_list$ebnf$1", "expression_list$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "expression_list", "symbols": ["expression", "expression_list$ebnf$1"], "postprocess": (d) => [d[0], ...d[1].map(x => x[1])]},
    {"name": "comparison_operator", "symbols": [{"literal":"=="}], "postprocess": (d) => "Equal"},
    {"name": "comparison_operator", "symbols": [{"literal":"/="}], "postprocess": (d) => "NotEqual"},
    {"name": "comparison_operator", "symbols": [{"literal":"<"}], "postprocess": (d) => "LessThan"},
    {"name": "comparison_operator", "symbols": [{"literal":">"}], "postprocess": (d) => "GreaterThan"},
    {"name": "comparison_operator", "symbols": [{"literal":"<="}], "postprocess": (d) => "LessOrEqualThan"},
    {"name": "comparison_operator", "symbols": [{"literal":">="}], "postprocess": (d) => "GreaterOrEqualThan"},
    {"name": "primitive", "symbols": [(HSLexer.has("number") ? {type: "number"} : number)], "postprocess": ([n]) => new NumberPrimitive(Number(n.value), loc(n))},
    {"name": "primitive", "symbols": [(HSLexer.has("char") ? {type: "char"} : char)], "postprocess": ([c]) => new CharPrimitive(c.value, loc(c))},
    {"name": "primitive", "symbols": [(HSLexer.has("string") ? {type: "string"} : string)], "postprocess": ([s]) => new StringPrimitive(s.value.slice(1, -1), loc(s))},
    {"name": "primitive", "symbols": [(HSLexer.has("bool") ? {type: "bool"} : bool)], "postprocess": ([b]) => new BooleanPrimitive(b.value === 'True' ? true : false, loc(b))}
  ],
  ParserStart: "program",
};

export default grammar;
