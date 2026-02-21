@{%
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
  TypeClass,
  Instance,
  NumberPrimitive,
  CharPrimitive,
  StringPrimitive,
  BooleanPrimitive,
  SourceLocation,
  TestGroup,
  Test,
  Assert,
  Equality,
  Truth,
  Failure
} from "yukigo-ast";

const filter = d => {
    return d.filter((token) => token !== null);
};

const loc = (token) => new SourceLocation(token.line, token.col);
const HSLexer = new HaskellLayoutLexer();

%}
@preprocessor typescript
@lexer HSLexer

program -> declaration (";" declaration):* ";":? {% (d) => [d[0], ...d[1].map(x => x[1])].flat(Infinity) %}

declaration -> (function_declaration
                | function_signature
                | type_declaration
                | data_declaration 
                | typeclass_declaration
                | instance_declaration
                | apply_operator
                | test_declaration
                | "let" function_declaration) {% (d) => d[0][0] === "let" ? d[0][1] : d[0][0] %}

expression -> 
  (type_cast
  | letin_expression
  | if_expression
  | case_expression
  | test_declaration) {% (d) => d[0][0] %}

# Test rules

test_declaration -> 
    "describe" expression "do" %lbracket test_body %rbracket {% (d) => new TestGroup(d[1], new Sequence(d[4])) %}
    | "describe" expression "$" "do" %lbracket test_body %rbracket {% (d) => new TestGroup(d[1], new Sequence(d[5])) %}
    | "it" expression "do" %lbracket test_body %rbracket {% (d) => new Test(d[1], new Sequence(d[4])) %}
    | "it" expression "$" "do" %lbracket test_body %rbracket {% (d) => new Test(d[1], new Sequence(d[5])) %}
    | "let" function_declaration {% (d) => d[1] %}
    | assertion {% id %}

test_body -> 
    test_declaration (";" test_declaration):* {% (d) => [d[0], ...d[1].map(x => x[1])] %}

assertion ->
    expression "shouldBe" expression {% (d) => new Assert(new BooleanPrimitive(false), new Equality(d[2], d[0])) %}
    | expression "`" "shouldBe" "`" expression {% (d) => new Assert(new BooleanPrimitive(false), new Equality(d[4], d[0])) %}
    | expression "shouldNotBe" expression {% (d) => new Assert(new BooleanPrimitive(true), new Equality(d[2], d[0])) %}
    | expression "`" "shouldNotBe" "`" expression {% (d) => new Assert(new BooleanPrimitive(true), new Equality(d[4], d[0])) %}
    | expression "shouldSatisfy" expression {% (d) => new Assert(new BooleanPrimitive(false), new Truth(new Application(d[2], d[0]))) %}
    | expression "`" "shouldSatisfy" "`" expression {% (d) => new Assert(new BooleanPrimitive(false), new Truth(new Application(d[4], d[0]))) %}
    | expression "shouldThrow" expression {% (d) => new Assert(new BooleanPrimitive(false), new Failure(d[0], d[2])) %}
    | expression "`" "shouldThrow" "`" expression {% (d) => new Assert(new BooleanPrimitive(false), new Failure(d[0], d[4])) %}


type_cast -> apply_operator "::" type {% (d) => new TypeCast(d[0], d[2]) %}
| apply_operator {% id %}

# Operation rules

# priority 0
apply_operator ->
    bind_expression ("$" | "$!") apply_operator {% (d) => new Application(d[0], d[2]) %}
    | bind_expression {% id %}

# priority 1  
bind_expression ->
    logical_expression ">>=" bind_expression {% (d) => new Application(new Application(new SymbolPrimitive("(>>=)"), d[0]), d[2]) %}
    | logical_expression ">>" bind_expression {% (d) => new Application(new Application(new SymbolPrimitive("(>>)"), d[0]), d[2])  %}
    | logical_expression {% id %}

# priority 3
logical_expression ->
    comparison "&&" logical_expression {%  (d) => new LogicalBinaryOperation("And", d[0], d[2]) %}
    | comparison "||" logical_expression {%  (d) => new LogicalBinaryOperation("Or", d[0], d[2]) %}
    | comparison {% id %}

# priority 4
comparison ->
    cons_expression comparison_operator cons_expression {% (d) => new ComparisonOperation(d[1], d[0], d[2]) %}
    | cons_expression {% id %}

# priority 5
cons_expression ->
    concatenation ":" cons_expression {% (d) => new ConsExpression(d[0], d[2]) %}
    | concatenation {% id %}

concatenation ->
    addition "++" concatenation {% (d) => new ListBinaryOperation("Concat", d[0], d[2])  %}
    | addition {% id %}

# priority 6
addition -> 
    addition "+" multiplication {% (d) => new ArithmeticBinaryOperation("Plus", d[0], d[2]) %}
    | addition "-" multiplication {% (d) => new ArithmeticBinaryOperation("Minus", d[0], d[2]) %}
    | multiplication {% id %}

# priority 7
multiplication ->
    multiplication "*" power {% (d) => new ArithmeticBinaryOperation("Multiply", d[0], d[2]) %}
    | multiplication "/" power {% (d) => new ArithmeticBinaryOperation("Divide", d[0], d[2]) %}
    | power {% id %}

# priority 8
power -> 
    unary_negation "**" power {% (d) => new ArithmeticBinaryOperation("Power", d[0], d[2]) %}
    | unary_negation "^" power {% (d) => new ArithmeticBinaryOperation("Power", d[0], d[2]) %}
    | unary_negation "^^" power {% (d) => new ArithmeticBinaryOperation("Power", d[0], d[2]) %}
    | unary_negation {% id %}

unary_negation ->
    "-" unary_negation {% (d) => new ArithmeticUnaryOperation("Negation", d[1]) %}
    | index_access {% id %}

# priority 9
index_access ->
    index_access "!!" composition_expression {% (d) => new ListBinaryOperation("GetAt", d[0], d[2]) %}
    | composition_expression {% id %}

composition_expression ->
    composition_expression "." infix_operator_expression {% (d) => new CompositionExpression(d[0], d[2]) %}
    | infix_operator_expression {% id %}

infix_operator_expression ->
    infix_operator_expression "`" variable "`" application {% (d) => new Application(new Application(d[2], d[0]), d[4]) %}
    | application {% id %}

application -> 
  "error" primary {% d => new Raise(d[1]) %}
  | primary primary:* {% (d) => {
      if (d[1].length === 0) return d[0];
      return d[1].reduce((left, right) => new Application(left, right), d[0]);
  } %}

operator -> 
    operator_no_minus {% id %}
    | "-" {% (d) => d[0].value %}

operator_no_minus ->
    ("==" 
    | "/="
    | "<"
    | ">"
    | "<="
    | "&&"
    | "||"
    | ">="
    | "++"
    | "+"
    | ","
    | "^^"
    | "^"
    | "**"
    | "*"
    | "!!"
    | "/"
    | "$"
    | "$!"
    | "."
    | ":") {% (d) => d[0][0].value %}

left_section -> "(" expression operator ")" {% (d) => new Application(new SymbolPrimitive(d[2]), d[1]) %}

right_section -> "(" operator_no_minus expression ")" {% (d) => {
    const flipBody = new SymbolPrimitive("flip");
    const op = new SymbolPrimitive(d[1]);
    const expr = d[2];
    const flipAppliedToOp = new Application(flipBody, op);
    return new Application(flipAppliedToOp, expr);
  }
%}

operator_section -> "(" operator ")" {% (d) => new SymbolPrimitive(d[1]) %}

primary ->
    primitive {% id %}
    | variable {% id %}
    | constr {% id %}
    | tuple_expression {% id %}
    | left_section {% id %}
    | right_section {% id %}
    | operator_section {% id %}    
    | list_literal {% id %}
    | lambda_expression {% id %}
    | data_expression {% id %}
    | list_comprehension {% id %}
    | "(" expression ")" {% (d) => d[1] %}
    | "[" range_expression "]" {% (d) => d[1] %}
# Expression rules

# List comprehension rules
list_comprehension -> 
    "[" expression "|" comprehension_clause_list "]" {% (d) => {
        return new ListComprehension(d[1], d[3]);
    } %}

comprehension_clause_list -> 
    comprehension_clause ("," comprehension_clause):* {% (d) => {
        return [d[0], ...d[1].map((x) => x[1])];
    } %}

comprehension_clause -> 
    variable "<-" expression {% (d) => new Generator(d[0], d[2]) %}
    | expression {% id %}

lambda_expression -> 
    "(" "\\" parameter_list "->" expression ")" {% (d) => new Lambda(d[2], d[4]) %}

tuple_expression -> "(" expression ("," expression):+ ")" {% (d) => new TupleExpression([d[1], ...d[2].map(x => x[1])]) %}

data_expression -> constr %lbracket fields_expressions %rbracket {% (d) => new DataExpression(d[0], d[2]) %}

fields_expressions -> field_exp ("," field_exp):* {% (d) => [d[0], ...d[1].map(x => x[1])] %}

field_exp -> variable "=" expression {% (d) => new FieldExpression(d[0], d[2]) %}

if_expression -> "if" expression "then" expression "else" expression {% (d) => new If(d[1], d[3], d[5]) %}

letin_expression -> "let" "{" bindings_list:? "}" "in" expression {% (d) => new LetInExpression(new Sequence(d[2] ?? []), d[5]) %}

case_expression -> "case" expression "of" "{" case_arms "}" {% (d) => new Switch(d[1], d[4]) %}

case_arms -> case_arm (";" case_arm):* {% (d) => [d[0], ...d[1].map(x => x[1])] %}

case_arm -> pattern "->" expression {% (d) => new Case(d[0], d[2]) %}

# Type class rules

typeclass_declaration -> "class" constr variable "where" %lbracket typeclass_body %rbracket {% (d) => new TypeClass(d[1], d[2], d[5]) %}

typeclass_body -> function_signature (";" function_signature):* {% (d) => [d[0], ...d[1].map(x => x[1])] %}

instance_declaration -> "instance" constr type "where" %lbracket instance_body %rbracket {% (d) => new Instance(d[1], d[2], d[5]) %}

instance_body -> (function_declaration | function_signature) (";" (function_declaration | function_signature)):* ";":? {% (d) => [d[0][0], ...d[1].map(x => x[1][0])] %}

# Data rules

data_declaration -> "data" constr type_variable:* "=" constructor_def ("|" constructor_def):* deriving_clause:? {% 
      (d) => new Record(d[1], [d[4], ...d[5].map(x => x[1])], d[6])
%}

deriving_clause -> 
    "deriving" deriving_spec {% (d) => d[1] %}

deriving_spec -> 
    "(" deriving_classes ")" {% (d) => d[1] %}
    | constr {% (d) => [d[0]] %}

deriving_classes -> 
    constr ("," constr):* {% (d) => [d[0], ...d[1].map(x => x[1])] %}

constructor_def ->
  constr %lbracket field_list %rbracket {% (d) => new Constructor(d[0], d[2]) %}
  | constr simple_type:* {% (d) => new Constructor(d[0], d[1].map(x => new Field(undefined, x)))  %}

field_list -> field ("," field):* {% (d) => [d[0], ...d[1].map(x => x[1])]%}

field -> variable "::" type {% (d) => new Field(d[0], d[2]) %}

# Function rules

op_name -> "(" operator ")" {% d => new SymbolPrimitive(d[1]) %}

binding_name ->
   op_name {% id %}
  | variable {% id %}

function_signature -> binding_name "::" type {% (d) => new TypeSignature(d[0], d[2]) %}

function_declaration -> binding_name equation {% (d) => new Function(d[0], [d[1]]) %}

return_expression -> expression {% d => new Return(d[0]) %}

where_clause -> "where" "{" bindings_list "}" {% d => d[2] %}

bindings_list -> 
  function_declaration ";" bindings_list {% d => [d[0], ...d[2]] %}
  | function_declaration {% d => [d[0]] %}

equation -> 
  params guarded_rhs where_clause:? {% (d) => {
      const body = d[1];
      const finalBody = d[2] 
        ? body.map(guard => new GuardedBody(guard.condition, new Sequence([...d[2], new Return(guard.body)])))
        : body;
      return new Equation(d[0], finalBody);
    } %}
  | params %assign return_expression where_clause:? {% d => new Equation(d[0], new UnguardedBody(new Sequence(d[3] ? [...d[3], d[2]] : [d[2]])), d[2]) %}

params -> parameter_list:? {% (d) => d[0] || [] %}

guarded_rhs -> guarded_branch:+ {% (d) => d[0] %}

guarded_branch -> 
  "|" condition "=" expression {% (d) => new GuardedBody(d[1], d[3]) %}

condition -> 
  "otherwise" {% d => new Otherwise() %}
  | expression {% d => d[0] %}

parameter_list -> pattern:+ {% id %}

# Patterns

pattern -> cons_pattern {% id %}

cons_pattern ->
  "(" cons_pattern (":" cons_pattern):+ ")" {% 
    (d) => {
      const patterns = [d[1], ...d[2].map(item => item[1])];
      return patterns.reduceRight((tail, head, index, arr) => {
        if (index === arr.length - 1) return tail;
        return new ConsPattern(head, tail);
      });
    }
  %}
  | simple_pattern {% id %}

simple_pattern ->
  (as_pattern
  | constructor_pattern
  | list_pattern
  | tuple_pattern
  #| record_pattern
  | literal_pattern
  | variable_pattern
  | wildcard_pattern
  | paren_pattern) {% (d) => d[0][0] %}

wildcard_pattern -> %anonymousVariable {% (d) => new WildcardPattern() %}

paren_pattern -> "(" pattern ")" {% (d) => d[1] %}

variable_pattern -> variable {% (d) => new VariablePattern(d[0]) %}

literal_pattern -> primitive {% (d) => new LiteralPattern(d[0]) %} 

as_pattern -> (variable_pattern | wildcard_pattern) "@" pattern {% (d) => new AsPattern(d[0][0], d[2]) %}

constructor_pattern -> 
  "(" constr pattern:+ ")" {% (d) => new ConstructorPattern(d[1], d[2]) %}
  | constr {% (d) => new ConstructorPattern(d[0], []) %}

# record_pattern -> 
#   constr:? _ %lbracket _ field_pattern_list _ %rbracket {% (d) => ({
#     type: "RecordPattern",
#     constructor: d[0] ? d[0].value : null,
#     fields: d[4]
#   }) %}

field_pattern_list -> field_pattern ("," field_pattern):* {% (d) => [d[0], ...d[1].map(x => x[1])] %}

field_pattern -> variable "=" pattern {% (d) => ({ field: d[0].value, pattern: d[2] }) %}

list_pattern -> "[" pattern_list:? "]" {% (d) => new ListPattern(d[1] || []) %}

pattern_list -> pattern ("," pattern):* {% (d) => [d[0], ...d[1].map(x => x[1])] %}

tuple_pattern -> "(" pattern ("," pattern):+ ")" {% (d) => new TuplePattern([d[1], ...d[2].map(x => x[1])]) %}

# Type rules

type_declaration -> "type" constr variable_list:? "=" type {% (d) => new TypeAlias(d[1], d[2] || [], d[4]) %}

variable_list -> variable variable:* {% (d) => [d[0].value, ...d[1]] %}

type -> function_type {% id %}

constrained_type -> constraint_list "=>" type {% (d) => new ParameterizedType([], d[2], d[0]) %}

context -> 
  constraint {% (d) => [d[0]] %}
  | "(" constraint_list ")" {% (d) => d[1] %}

constraint_list -> 
  constraint ("," constraint):* {% (d) => 
    [d[0], ...d[1].map(x => x[1])]
  %}

constraint -> constr application_type:+ {% (d) => new Constraint(d[0].value, d[1]) %}

function_type ->
    (context "=>"):? (application_type %typeArrow):* application_type {% (d) => {
        const constraints = d[0] ? d[0][0] : [];
        
        if (d[1].length > 0) 
            return new ParameterizedType(d[1].map(x => x[0]), d[2], constraints);
        
        if (constraints.length === 0) 
            return d[2];

        return new ParameterizedType([], d[2], constraints);
    } 
%}

application_type ->
  simple_type application_type {% (d) => new TypeApplication(d[0], d[1]) %}
  | simple_type {% id %}

simple_type ->
  (type_variable | type_constructor) {% (d) => new SimpleType(d[0][0].value, []) %}
  | "[" type "]" {% (d) => new ListType(d[1], []) %}
  | "(" type ("," type):+ ")" {% (d) => new TupleType([d[1], ...d[2].map(x => x[1])], []) %}
  | "(" type ")" {% (d) => d[1] %}

type_variable -> variable {% ([v]) => ({ value: v.value }) %}
type_constructor -> constr {% ([c]) => ({ value: c.value }) %}

# Misc rules

constr -> %constructor {% ([c]) => new SymbolPrimitive(c.value, loc(c)) %} # constr because js doesnt like rules called constructor
variable -> %variable {% ([v]) => new SymbolPrimitive(v.value, loc(v)) %}

list_literal -> 
  "[" "]" {% (_) => new ListPrimitive([]) %}
  | "[" expression_list "]" {% (d) => new ListPrimitive(d[1]) %}

range_expression ->
  expression ".." {% (d) => new RangeExpression(d[0]) %}  # [start ..]
  | expression ".." expression {% (d) => new RangeExpression(d[0], d[2]) %}  # [start .. end]
  | expression "," expression ".." {% (d) => new RangeExpression(d[0], undefined, d[2]) %}  # [start, second ..]
  | expression "," expression ".." expression {% (d) => new RangeExpression(d[0], d[4], d[2]) %}  # [start, second .. end]

expression_list -> expression ("," expression):* {% (d) => [d[0], ...d[1].map(x => x[1])] %}

comparison_operator -> 
    "==" {% (d) => "Equal" %}
    | "/=" {% (d) => "NotEqual" %}
    | "<" {% (d) => "LessThan" %}
    | ">" {% (d) => "GreaterThan" %}
    | "<="  {% (d) => "LessOrEqualThan" %}
    | ">=" {% (d) => "GreaterOrEqualThan" %}

primitive -> 
    %number {% ([n]) => new NumberPrimitive(Number(n.value), loc(n)) %}
    | %char {% ([c]) => new CharPrimitive(c.value.slice(1, -1), loc(c)) %}
    | %string {% ([s]) => {
        let val = s.value.slice(1, -1);
        // Haskell multiline string continuation: \ whitespace \
        val = val.replace(/\\\s+\\/g, "");
        // Standard escapes
        val = val.replace(/\\n/g, "\n")
                 .replace(/\\t/g, "\t")
                 .replace(/\\"/g, "\"")
                 .replace(/\\\\/g, "\\");
        return new StringPrimitive(val, loc(s));
    } %}
    | %bool {% ([b]) => new BooleanPrimitive(b.value === 'True' ? true : false, loc(b)) %}