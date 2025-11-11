@{%
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
%}
@preprocessor typescript
@lexer PrologLexer

program -> (clause _):* {% (d) => d[0].map(x => x[0]).filter(x => x !== null).flat(Infinity) %}

# A clause is either a fact or a rule.
clause -> (fact | rule | query) {% (d) => d[0][0] %}

# A fact is a head followed by a period.
fact -> atom arguments:? _ %period {% (d) => new Fact(d[0], d[1] ?? []) %}

# A rule has a head, the ':-' operator, a body, and a period.
rule -> atom arguments:? _ %colonDash _ body _ %period {% (d) => new Rule(d[0], d[1] ?? [], d[5]) %}

query -> %queryOp _ body _ %period {% (d) => new Query(d[2]) %}

# The body of a clause is a comma-separated list of goals.
body -> expression (_ (%comma | %semicolon) _ expression):* {% (d) => [d[0], ...d[1].map(x => x[3])] %}

expression -> 
    (exist | assignment | comparison | not | forall | findall | unification | conditional) {% (d) => d[0][0] %}
    | "(" _ expression _ ")" {% (d) => d[2] %}

conditional -> "(" _ expression _ "->" _ expression _ %semicolon _ expression _ ")"  {% (d) => new If(d[2], d[6], d[10]) %}

forall -> %forallRule "(" _ expression _ %comma _ expression _ ")" {% (d) => new Forall(d[3], d[7]) %}

findall -> %findallRule "(" _ expression _ %comma _ expression _ %comma _ expression _ ")" {% (d) => new Findall(d[3], d[7], d[11]) %}

not -> 
    %notOperator _ expression {% (d) => new Not([d[2]]) %}
    | %notOperator _ "(" _ body _  ")" {% (d) => new Not(d[4]) %}

exist -> 
    "call" %lparen _ pattern_list _ %rparen {% (d) => {
        const [callee, ...rest] = d[3]
        return new Call(callee.name, rest)
    } %}
    | atom arguments:? {% (d) => new Exist(d[0], d[1] ?? []) %}
    | variable {% (d) => new Exist(d[0], []) %}
    

assignment -> addition _ "is" _ addition {% (d) => new AssignOperation("Assign", d[0], d[4]) %}

unification -> addition _ "=" _ addition {% (d) => new UnifyOperation("Unify", d[0], d[4]) %}

comparison -> 
    addition _ comparison_op _ addition {% (d) => new ComparisonOperation(d[2], d[0], d[4]) %}

addition ->
    multiplication _ "+" _ addition {% (d) => new ArithmeticBinaryOperation("Plus", d[0], d[4]) %}
    | multiplication _ "-" _ addition {% (d) => new ArithmeticBinaryOperation("Minus", d[0], d[4]) %}
    | multiplication {% id %}

multiplication ->
    primary _ "*" _ multiplication {% (d) => new ArithmeticBinaryOperation("Multiply", d[0], d[4]) %}
    | primary _ "/" _ multiplication {% (d) => new ArithmeticBinaryOperation("Divide", d[0], d[4]) %}
    | primary {% id %}

primary -> 
    literal {% id %}
    | variable {% id %}
    | atom arguments  {% d => new Exist(d[0], d[1] ?? []) %}
    | primitiveOperation  {% id %}
    | cons_expr  {% id %}
    | "(" _ addition _ ")"  {% d => d[2] %}

cons_expr -> "[" _ primary_list _ %consOp _ expression _ "]" {% (d) => new ConsExpression(d[2], d[6]) %}

primitiveOperation -> 
    "round" __ addition {% d => new ArithmeticUnaryOperation("Round", d[2]) %}
    | "abs" __ addition {% d => new ArithmeticUnaryOperation("Absolute", d[2]) %}
    | "sqrt" __ addition {% d => new ArithmeticUnaryOperation("Sqrt", d[2]) %}

primitiveArguments -> %lparen _ primary_list _ %rparen {% (d) => d[2] %}
primary_list -> addition (_ %comma _ addition):* {% (d) => [d[0], ...d[1].map(x => x[3])] %}

# The arguments are a list of terms inside parentheses.
arguments -> %lparen _ pattern_list _ %rparen {% (d) => d[2] %}

# A list of comma-separated terms.
pattern_list -> pattern (_ %comma _ pattern):* {% (d) => [d[0], ...d[1].map(x => x[3])] %}

pattern -> 
    variable {% (d) => new VariablePattern(d[0]) %}
    | literal {% (d) => new LiteralPattern(d[0]) %}
    | %wildcard {% (d) => new WildcardPattern() %}
    | atom arguments {% (d) => new FunctorPattern(d[0], d[1]) %}
    | "(" _ pattern_list _ ")" {% (d) => new TuplePattern(d[2]) %}
    | "[" _ pattern_list _ %consOp _ pattern _ "]" {% (d) => new ConsPattern(d[2].length > 1 ? new ListPattern(d[2]) : d[2][0], new VariablePattern(d[6])) %}
    | "[" _ pattern_list:? _ "]"  {% (d) => new ListPattern(d[2] ? d[2] : []) %}

literal -> 
    atom {% id %}
    | %number {% (d) => new NumberPrimitive(Number(d[0].value)) %}
    | %string {% (d) => new StringPrimitive(d[0].value) %}

variable -> %variable {% (d) => new SymbolPrimitive(d[0].value) %}

atom -> (%atom | %op) {% (d) => new SymbolPrimitive(d[0][0].value) %}

comparison_op ->
    "=:=" {% d => "Equal" %}
    | "=\\=" {% d => "NotEqual" %}
    | "==" {% d => "Same" %}
    | "\\==" {% d => "NotSame" %}
    | "\\=" {% d => "NotSame" %}
    | "@<" {% d => "LessThan" %}
    | "@=<" {% d => "LessOrEqualThan" %}
    | "@>" {% d => "GreaterThan" %}
    | "@>=" {% d => "GreaterOrEqualThan" %}
    | "<" {% d => "LessThan" %}
    | "=<" {% d => "LessOrEqualThan" %}
    | ">" {% d => "GreaterThan" %}
    | ">=" {% d => "GreaterOrEqualThan" %}
    | "=@=" {% d => "Same" %}
    | "\\=@=" {% d => "NotSame" %}

_ -> %WS:*
__ -> %WS:?