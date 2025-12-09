@{%
import { Lexer } from "./lexer.js"
import {
    SourceLocation,
    ArithmeticBinaryOperation,
    Return,
    NumberPrimitive,
    StringPrimitive,
    SymbolPrimitive,
    CharPrimitive,
    BooleanPrimitive
} from "yukigo-ast"

const loc = (token) => new SourceLocation(token.line, token.col);

%}
@preprocessor typescript
@lexer Lexer

program -> addition {% (d) => [new Return(d[0])] %}

addition -> 
    addition _ "+" _ multiplication {% (d) => new ArithmeticBinaryOperation("Plus", d[0], d[4]) %}
    | addition _ "-" _ multiplication {% (d) => new ArithmeticBinaryOperation("Minus", d[0], d[4]) %}
    | multiplication {% id %}

# priority 7
multiplication ->
    multiplication _ "*" _ primitive {% (d) => new ArithmeticBinaryOperation("Multiply", d[0], d[4]) %}
    | multiplication _ "/" _ primitive {% (d) => new ArithmeticBinaryOperation("Divide", d[0], d[4]) %}
    | primitive {% id %}

primitive -> 
    %number {% ([n]) => new NumberPrimitive(Number(n.value), loc(n)) %}
    | %char {% ([c]) => new CharPrimitive(c.value, loc(c)) %}
    | %variable {% ([c]) => new SymbolPrimitive(c.value, loc(c)) %}
    | %string {% ([s]) => new StringPrimitive(s.value.slice(1, -1), loc(s)) %}
    | %bool {% ([b]) => new BooleanPrimitive(b.value === 'True' ? true : false, loc(b)) %}


_ -> %WS:*

__ -> %WS:+