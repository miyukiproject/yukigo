@{%
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
  Case,
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

%}
@preprocessor typescript
@lexer HSLexer

program -> declaration:+ {% (d) => d[0].filter(x => x !== null) %}

declaration -> (function_declaration
                | function_signature
                | type_declaration
                | data_declaration 
                | comment
                | empty_line
                | apply_operator) {% (d) => d[0][0] %}

comment -> %comment {% d => null %}

empty_line -> _ %NL {% d => null %}

expression -> 
  (type_cast
  | letin_expression
  | if_expression
  | case_expression) {% (d) => d[0][0] %}

type_cast -> apply_operator _ "::" _ type {% (d) => new TypeCast(d[0], d[4]) %}
| apply_operator {% id %}

# Operation rules

# priority 0
apply_operator ->
    bind_expression _ "$" _ apply_operator {% (d) => new Application(d[0], d[4]) %}
    | bind_expression {% id %}

# priority 1  
bind_expression ->
    logical_expression _ ">>=" _ bind_expression {% (d) => new Application(new Application(new SymbolPrimitive("(>>=)"), d[0]), d[4]) %}
    | logical_expression _ ">>" _ bind_expression {% (d) => new Application(new Application(new SymbolPrimitive("(>>)"), d[0]), d[4])  %}
    | logical_expression {% id %}

# priority 3
logical_expression ->
    comparison _ "&&" _ logical_expression {%  (d) => new LogicalBinaryOperation("And", d[0], d[4]) %}
    | comparison _ "||" _ logical_expression {%  (d) => new LogicalBinaryOperation("Or", d[0], d[4]) %}
    | comparison {% id %}

# priority 4
comparison ->
    cons_expression _ comparison_operator _ cons_expression {% (d) => new ComparisonOperation(d[2], d[0], d[4]) %}
    | cons_expression {% id %}

# priority 5
cons_expression ->
    concatenation _ ":" _ cons_expression {% (d) => new ConsExpression(d[0], d[4]) %}
    | concatenation {% id %}

concatenation ->
    addition _ "++" _ concatenation {% (d) => d[0] instanceof StringPrimitive || d[4] instanceof StringPrimitive ? new StringOperation("Concat", d[0], d[4]) : new ListBinaryOperation("Concat", d[0], d[4])  %}
    | addition {% id %}

# priority 6
addition -> 
    addition _ "+" _ multiplication {% (d) => new ArithmeticBinaryOperation("Plus", d[0], d[4]) %}
    | addition _ "-" _ multiplication {% (d) => new ArithmeticBinaryOperation("Minus", d[0], d[4]) %}
    | multiplication {% id %}

# priority 7
multiplication ->
    multiplication _ "*" _ power {% (d) => new ArithmeticBinaryOperation("Multiply", d[0], d[4]) %}
    | multiplication _ "/" _ power {% (d) => new ArithmeticBinaryOperation("Divide", d[0], d[4]) %}
    | power {% id %}

# priority 8
power -> 
    unary_negation _ "**" _ power {% (d) => new ArithmeticBinaryOperation("Power", d[0], d[4]) %}
    | unary_negation _ "^" _ power {% (d) => new ArithmeticBinaryOperation("Power", d[0], d[4]) %}
    | unary_negation _ "^^" _ power {% (d) => new ArithmeticBinaryOperation("Power", d[0], d[4]) %}
    | unary_negation {% id %}

unary_negation ->
    "-" _ unary_negation {% (d) => new ArithmeticUnaryOperation("Negation", d[2]) %}
    | index_access {% id %}

# priority 9
index_access ->
    index_access _ "!!" _ composition_expression {% (d) => new ListBinaryOperation("GetAt", d[0], d[4]) %}
    | composition_expression {% id %}

composition_expression ->
    composition_expression _ "." _ infix_operator_expression {% (d) => new CompositionExpression(d[0], d[4]) %}
    | infix_operator_expression {% id %}

infix_operator_expression ->
    infix_operator_expression _ "`" _ variable _ "`" _ application {% (d) => new Application(new Application(d[4], d[0]), d[8]) %}
    | application {% id %}

application -> 
  "error" __ primary {% d => new Raise(d[2]) %}
  | primary ((_ | (_ %NL __)) primary):* {% (d) => {
      if (d[1].length === 0) return d[0];
      return d[1].reduce((left, right) => new Application(left, right[1]), d[0]);
  } %}

operator -> 
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
    | "*"
    | "/"
    | ":"
    | "$"
    | ".") {% (d) => d[0][0].value %}

left_section -> "(" _ expression _ operator _ ")" {% (d) => new Application(new SymbolPrimitive(d[4]), d[2]) %}

right_section -> "(" _ operator _ expression _ ")" {% (d) => {
    const flipBody = new SymbolPrimitive("flip");
    const op = new SymbolPrimitive(d[2]);
    const expr = d[4];
    const flipAppliedToOp = new Application(flipBody, op);
    return new Application(flipAppliedToOp, expr);
  }
%}

operator_section -> "(" _ operator _ ")" {% (d) => new SymbolPrimitive(d[2]) %}

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
    | "(" _ expression _ ")" {% (d) => d[2] %}
    | "[" _ range_expression _ "]" {% (d) => d[2] %}
# Expression rules

# List comprehension rules
list_comprehension -> 
    "[" _ expression _ "|" _ comprehension_clause_list _ "]" {% (d) => {
        return new ListComprehension(d[2], d[6]);
    } %}

comprehension_clause_list -> 
    comprehension_clause (_ "," _ comprehension_clause):* {% (d) => {
        return [d[0], ...d[1].map((x) => x[3])];
    } %}

comprehension_clause -> 
    variable _ "<-" _ expression {% (d) => new Generator(d[0], d[4]) %}
    | expression {% id %}

lambda_expression -> 
    "(" _ "\\" _ parameter_list _ "->" _ expression _ ")" {% (d) => new Lambda(d[4], d[8]) %}

tuple_expression -> "(" _ tuple_value (_ "," _ tuple_value):+ _ ")" {% (d) => new TupleExpression([d[2], ...d[3].map(x => x[3])]) %}
tuple_value -> expression {% id %}


data_expression -> constr _ %lbracket _ fields_expressions _ %rbracket {% (d) => new DataExpression(d[0], d[4]) %}

fields_expressions -> field_exp (_ "," _ field_exp):* {% (d) => [d[0], ...d[1].map(x => x[3])] %}

field_exp -> variable _ "=" _ expression {% (d) => new FieldExpression(d[0], d[4]) %}

if_expression -> "if" __ expression __ "then" __ expression __ "else" __ expression {% (d) => new If(d[2], d[6], d[10]) %}

letin_expression -> "let" (_ "{" _) bindings_list:? (_ "}" _) "in" _ expression {% (d) => new LetInExpression(new Sequence(d[2] ?? []), d[6]) %}

case_expression -> "case" _ expression _ "of" (_ "{" _) case_arms (_ "}" _) {% (d) => new Switch(d[2], d[6]) %}

case_arms -> case_arm ((_ ";" _) case_arm):* {% (d) => [d[0], ...d[1].map(x => x[1])] %}

case_arm -> pattern _ "->" _ expression {% (d) => new Case(d[0], d[4]) %}

# Data rules

data_declaration -> "data" __ constr (__ type_variable):* _ "=" _ constructor_def (_ "|" _ constructor_def):* deriving_clause:? {% 
      (d) => new Record(d[2], [d[7], ...d[8].map(x => x[3])], d[9])
%}

deriving_clause -> 
    _ "deriving" _ deriving_spec {% (d) => d[3] %}

deriving_spec -> 
    "(" _ deriving_classes _ ")" {% (d) => d[2] %}
    | constr {% (d) => [d[0]] %}

deriving_classes -> 
    %typeClass (_ "," _ %typeClass):* {% (d) => [new SymbolPrimitive(d[0].value), ...d[1].map(x => new SymbolPrimitive(x[3].value))] %}

constructor_def ->
  constr _ (%NL __):? %lbracket _ (%NL _):? field_list _ (%NL _):? %rbracket {% (d) => new Constructor(d[0], d[6]) %}
  | constr (__ simple_type):* {% (d) => new Constructor(d[0], d[1].map(x => new Field(undefined, x[1])))  %}

field_list -> field (_ "," _ (%NL _):? field):* {% (d) => [d[0], ...d[1].map(x => x[4])]%}

field -> variable _ %typeEquals _ type {% (d) => new Field(d[0], d[4]) %}

# Function rules

binding_name ->
  "(" _ %op _ ")" {% d => new SymbolPrimitive(`${d[2].value}`) %}
  | variable {% id %}

function_signature -> binding_name (_ "," _ binding_name):* _ %typeEquals _ type {% (d) => new TypeSignature(d[0], d[5]) %}

function_declaration -> 
  variable equation {% (d) => new Function(d[0], [d[1]]) %}
  | "(" _ %op _ ")" equation {% (d) => new Function(new SymbolPrimitive(`${d[2].value}`), [d[5]]) %}

return_expression -> expression {% d => new Return(d[0]) %}

where_clause -> "where" _ "{" _ bindings_list _ "}" {% d => d[4] %}

bindings_list -> function_declaration ((_ ";" _) function_declaration):* {% d => [d[0], ...d[1].map(x => x[1])] %}

equation -> 
  params (%NL __):? guarded_rhs (_ where_clause):? {% (d) => {
      const body = d[2];
      const finalBody = d[3] 
        ? body.map(guard => new GuardedBody(guard.condition, new Sequence([...d[3][1], new Return(guard.body)])))
        : body;
      return new Equation(d[0], finalBody);
    } %}
  | params %assign ((_ %NL __) | _) return_expression (_ where_clause):? {% d => new Equation(d[0], new UnguardedBody(new Sequence(d[4] ? [...d[4][1], d[3]] : [d[3]])), d[3]) %}

params ->
  __ parameter_list _ {% d => d[1] %}
  | _ {% d => [] %}

guarded_rhs -> 
  guarded_branch ((_ %NL __) | _) guarded_rhs {% (d) => [d[0], ...d[2]] %}
  | guarded_branch {% (d) => [d[0]] %}

guarded_branch -> 
  "|" ((_ %NL __) | _) condition ((_ %NL __) | _) "=" ((_ %NL __) | _) expression {% (d) => new GuardedBody(d[2], d[6]) %}

condition -> 
  "otherwise" {% d => new Otherwise() %}
  | expression {% d => d[0] %}

parameter_list -> pattern (__ pattern):* {% (d) => [d[0], ...d[1].map(x => x[1])] %}

# Patterns

pattern -> cons_pattern {% id %}

cons_pattern ->
  "(" _ cons_pattern (_ ":" _ cons_pattern):+ _ ")"  {% 
    (d) => {
      const patterns = [d[2], ...d[3].map(item => item[3])];
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

paren_pattern -> "(" _ pattern _ ")" {% (d) => d[2] %}

variable_pattern -> variable {% (d) => new VariablePattern(d[0]) %}

literal_pattern -> primitive {% (d) => new LiteralPattern(d[0]) %} 

as_pattern -> (variable_pattern | wildcard_pattern) "@" pattern {% (d) => new AsPattern(d[0][0], d[2]) %}

constructor_pattern -> 
  "(" _ constr (__ pattern):+ _ ")" {% (d) => new ConstructorPattern(d[2].value, d[3].map(x => x[1])) %}
  | constr {% (d) => new ConstructorPattern(d[0].value, []) %}

# record_pattern -> 
#   constr:? _ %lbracket _ field_pattern_list _ %rbracket {% (d) => ({
#     type: "RecordPattern",
#     constructor: d[0] ? d[0].value : null,
#     fields: d[4]
#   }) %}

field_pattern_list -> field_pattern (_ "," _ field_pattern):* {% (d) => [d[0], ...d[1].map(x => x[3])] %}

field_pattern -> variable _ "=" _ pattern {% (d) => ({ field: d[0].value, pattern: d[4] }) %}

list_pattern -> "[" _ pattern_list:? _ "]" {% (d) => new ListPattern(d[2] || []) %}

pattern_list -> pattern (_ "," _ pattern):* {% (d) => [d[0], ...d[1].map(x => x[3])] %}

tuple_pattern -> "(" _ pattern (_ "," _ pattern):+ _ ")" {% (d) => new TuplePattern([d[2], ...d[3].map(x => x[3])]) %}

# Type rules

type_declaration -> "type" __ constr (__ variable_list):? _ "=" _ type {% (d) => new TypeAlias(d[2], d[3] ? d[3][1] : [], d[7]) %}

variable_list -> variable (__ variable):* {% (d) => [d[0].value, ...d[1].map(x => x[1].value)] %}

type -> function_type {% id %}

constrained_type -> constraint_list _ %arrow _ type {% (d) => new ParameterizedType([], d[4], d[0]) %}

context -> 
  constraint {% (d) => [d[0]] %}
  | "(" _ constraint_list _ ")" {% (d) => d[2] %}

constraint_list -> 
  constraint (_ "," _ constraint):* {% (d) => 
    [d[0], ...d[1].map(x => x[3])]
  %}

constraint -> %typeClass (_ application_type):+ {% (d) => new Constraint(d[0].value, d[1].map(x => x[1])) %}

function_type ->
    (context _ %arrow _):? (application_type (_ | (_ %NL __)) %typeArrow (_ | (_ %NL __))):* application_type {% (d) => {
        const constraints = d[0] ? d[0][0] : [];
        
        if (d[1].length > 0) 
            return new ParameterizedType(d[1].map(x => x[0]), d[2], constraints);
        
        if (constraints.length === 0) 
            return d[2];

        return new ParameterizedType([], d[2], constraints);
    } 
%}

application_type ->
  simple_type (_ simple_type):+ {% (d) => d[1].reduce((acc, arg) => new TypeApplication(acc, arg[1]), d[0]) %}
  | simple_type {% id %}

simple_type ->
  (type_variable | type_constructor) {% (d) => new SimpleType(d[0][0].value, []) %}
  | "[" _ type _ "]" {% (d) => new ListType(d[2], []) %}
  | "(" _ type (_ "," _ type):+ _ ")" {% (d) => new TupleType([d[2], ...d[3].map(x => x[3])], []) %}
  | "(" _ type _ ")" {% (d) => d[2] %}

type_variable -> variable {% ([v]) => ({ value: v.value }) %}
type_constructor -> constr {% ([c]) => ({ value: c.value }) %}

# Misc rules

constr -> %constructor {% ([c]) => new SymbolPrimitive(c.value, loc(c)) %} # constr because js doesnt like rules called constructor
variable -> %variable {% ([v]) => new SymbolPrimitive(v.value, loc(v)) %}

list_literal -> 
  "[" _ "]" {% (_) => new ListPrimitive([]) %}
  | "[" _ expression_list _ "]" {% ([_, __, list]) => new ListPrimitive(list) %}

range_expression ->
  expression _ ".." {% (d) => new RangeExpression(d[0]) %}  # [start ..]
  | expression _ ".." _ expression {% (d) => new RangeExpression(d[0], d[4]) %}  # [start .. end]
  | expression _ "," _ expression _ ".." {% (d) => new RangeExpression(d[0], undefined, d[4]) %}  # [start, second ..]
  | expression _ "," _ expression _ ".." _ expression {% (d) => new RangeExpression(d[0], d[6], d[4]) %}  # [start, second .. end]

expression_list -> expression (_ "," _ expression):* {% (d) => [d[0], ...d[1].map(x => x[3])] %}

comparison_operator -> 
    "==" {% (d) => "Equal" %}
    | "/=" {% (d) => "NotEqual" %}
    | "<" {% (d) => "LessThan" %}
    | ">" {% (d) => "GreaterThan" %}
    | "<="  {% (d) => "LessOrEqualThan" %}
    | ">=" {% (d) => "GreaterOrEqualThan" %}

primitive -> 
    %number {% ([n]) => new NumberPrimitive(Number(n.value), loc(n)) %}
    | %char {% ([c]) => new CharPrimitive(c.value, loc(c)) %}
    | %string {% ([s]) => new StringPrimitive(s.value.slice(1, -1), loc(s)) %}
    | %bool {% ([b]) => new BooleanPrimitive(b.value === 'True' ? true : false, loc(b)) %}

_ -> %WS:*

__ -> %WS:+