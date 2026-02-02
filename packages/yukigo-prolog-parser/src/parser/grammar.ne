@{% import { 
    NumberPrimitive, 
    StringPrimitive, 
    Rule, 
    Fact, 
    Query,
    ListPrimitive,
    ConsExpression,
    ArithmeticBinaryOperation,
    ArithmeticUnaryOperation,
    ComparisonOperation,
    Exist, 
    Not, 
    Findall, 
    Sequence,
    UnguardedBody,
    Equation,
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
    TuplePattern,
    Test
 } from "yukigo-ast"

import { PrologLexer } from "./lexer.js"

const asSequence = (d) => d.length === 1 ? d[0] : new Sequence(d);

%}
@preprocessor typescript
@lexer PrologLexer

program -> (clause _):* {% (d) => d[0].map(x => x[0]).filter(x => x !== null).flat(Infinity) %}

clause -> (fact | rule | query | test_rule) {% (d) => d[0][0] %}

fact -> any_atom arguments:? _ %period {% (d) => new Fact(d[0], d[1] ?? []) %}

rule -> any_atom equation _ %period {% (d) => new Rule(d[0], [d[1]]) %}

test_rule -> %testKeyword %lparen _ structural_literal _ %rparen equation _ %period {% (d) => new Test(d[3], d[6].body.sequence) %}

equation -> arguments:? _ %colonDash _ body {% (d) => new Equation(d[0] || [], new UnguardedBody(new Sequence(d[4])))%}

query -> %queryOp _ body _ %period {% (d) => new Query(d[2]) %}

body -> expression (_ (%comma | %semicolon) _ expression):* {% (d) => [d[0], ...d[1].map(x => x[3])] %}

expression -> 
    (conditional | forall | findall | unification | assignment | comparison | not | exist) {% (d) => d[0][0] %}
    | "(" _ body _ ")" {% (d) => asSequence(d[2]) %}

conditional -> "(" _ body _ "->" _ body _ %semicolon _ body _ ")"  {% (d) => 
    new If(
        asSequence(d[2]),  
        asSequence(d[6]),   
        asSequence(d[10])
    ) 
%}

forall -> %forallRule "(" _ expression _ %comma _ expression _ ")" {% (d) => new Forall(d[3], d[7]) %}

findall -> %findallRule "(" _ expression _ %comma _ expression _ %comma _ expression _ ")" {% (d) => new Findall(d[3], d[7], d[11]) %}

not -> 
    %notOperator _ expression {% (d) => new Not([d[2]]) %}

exist -> 
    "call" %lparen _ pattern_list _ %rparen {% (d) => {
        const [callee, ...rest] = d[3]
        return new Call(callee.name, rest)
    } %}
    | any_atom arguments:? {% (d, l, reject) => {
        const val = d[0].value; 
        if (val === "not" || val === "\\+" || val === "call") return reject;
        return new Exist(d[0], d[1] ?? []) 
    } %}
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
    arithmetic_literal {% id %}
    | variable {% id %}
    | "-" _ primary {% (d) => new ArithmeticUnaryOperation("Negation", d[2]) %}
    | strict_atom arguments  {% (d, l, reject) => {
        const val = d[0].value;
        if (["abs", "round", "sqrt"].includes(val)) return reject;
        return new Exist(d[0], d[1] ?? [])
    } %}
    | primitiveOperation  {% id %}
    | cons_expr  {% id %}
    | list_expr {% id %}
    | "(" _ addition _ ")"  {% d => d[2] %}

list_expr -> "[" _ primary_list:? _ "]" {% (d) => new ListPrimitive(d[2] || []) %}

cons_expr -> "[" _ primary_list _ %consOp _ addition _ "]" {% (d) => {
    const heads = d[2];
    const tail = d[6];
    let current = tail;
    for (let i = heads.length - 1; i >= 0; i--) {
        current = new ConsExpression(heads[i], current);
    }
    return current;
} %}

primitiveOperation -> 
    "round" __ addition {% d => new ArithmeticUnaryOperation("Round", d[2]) %}
    | "abs" __ addition {% d => new ArithmeticUnaryOperation("Absolute", d[2]) %}
    | "sqrt" __ addition {% d => new ArithmeticUnaryOperation("Sqrt", d[2]) %}

primitiveArguments -> %lparen _ primary_list _ %rparen {% (d) => d[2] %}
primary_list -> addition (_ %comma _ addition):* {% (d) => [d[0], ...d[1].map(x => x[3])] %}

arguments -> %lparen _ pattern_list _ %rparen {% (d) => d[2] %}

pattern_list -> pattern (_ %comma _ pattern):* {% (d) => [d[0], ...d[1].map(x => x[3])] %}

pattern -> 
    variable {% (d) => new VariablePattern(d[0]) %}
    | structural_literal {% (d) => new LiteralPattern(d[0]) %}
    | %wildcard {% (d) => new WildcardPattern() %}
    | any_atom arguments {% (d) => new FunctorPattern(d[0], d[1]) %}
    | "(" _ pattern_list _ ")" {% (d) => new TuplePattern(d[2]) %}
    | "[" _ pattern_list _ %consOp _ pattern _ "]" {% (d) => {
        const heads = d[2];
        const tail = d[6];
        let current = tail;
        for (let i = heads.length - 1; i >= 0; i--) {
            current = new ConsPattern(heads[i], current);
        }
        return current;
    } %}
    | "[" _ pattern_list:? _ "]"  {% (d) => new ListPattern(d[2] ? d[2] : []) %}

variable -> %variable {% (d) => new SymbolPrimitive(d[0].value) %}

strict_atom -> %atom {% (d) => new SymbolPrimitive(d[0].value) %}
             | %primitiveOperator {% (d) => new SymbolPrimitive(d[0].value) %}

any_atom -> strict_atom {% id %}
          | (%op | %comparisonOp) {% (d) => new SymbolPrimitive(d[0][0].value) %}

arithmetic_literal -> 
    strict_atom {% id %}
    | %number {% (d) => new NumberPrimitive(Number(d[0].value)) %}
    | %string {% (d) => new StringPrimitive(d[0].value) %}

structural_literal -> 
    any_atom {% id %}
    | %number {% (d) => new NumberPrimitive(Number(d[0].value)) %}
    | %string {% (d) => new StringPrimitive(d[0].value) %}

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
