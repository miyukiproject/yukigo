@{%
import { MiniLexer } from "./lexer.js"
import { 
    SimpleType, 
    Assignment, 
    Variable,
    ListPrimitive,
    ListType,
    ArithmeticBinaryOperation, 
    SymbolPrimitive, 
    NumberPrimitive, 
    ComparisonOperation,
    BooleanPrimitive, 
    StringPrimitive, 
    ParameterizedType,
    Sequence,
    UnguardedBody,
    If,
    While,
    VariablePattern,
    Equation,
    Procedure,
    TypeSignature,
    CharPrimitive,
    NilPrimitive,
    Return
} from "yukigo-ast"
%}

@preprocessor typescript
@lexer MiniLexer

program -> statement:+ _ %EOF {% (d) => d[0].flat(Infinity) %}

# Statements

statement -> (assignment | variable_statement | function_statement | return_statement | if_statement | while_statement) _ ";" _ {% (d) => d[0][0] %}

variable_statement -> type __ variable (_ ":=" _ expression):? {% (d) => new Variable(d[2], d[3] ? d[3][3] : new NilPrimitive(null), d[0]) %}

return_statement -> "return" _ expression {% (d) => new Return(d[2]) %}

while_statement -> "while" _ condition _ statement_list {% d => new While(d[2], d[4]) %}

if_statement -> "if" _ condition _ statement_list _ "else" _ statement_list {% d => new If(d[2], d[4], d[8]) %}

condition -> "(" _ expression _ ")" {% (d) => d[2] %}

statement_list -> "{" _ statement:* _ "}" {% d => new Sequence(d[2]) %}

assignment -> variable _ ":=" _ expression {% (d) => new Assignment(d[0], d[4]) %}

## Function rules

function_statement -> type __ variable ("(" _ param_list:? _ ")" _ "{" _ body _ "}") {% (d) => {
    const paramTypeList = []
    const patternList = []
    if(d[3][2]) {
        for(const [paramType, paramPattern] of d[3][2]) {
            paramTypeList.push(paramType);
            patternList.push(paramPattern);
        }
    }
    const signatureType = new ParameterizedType(paramTypeList, d[0], []) 

    const signature = new TypeSignature(d[2], signatureType);
    const procedure =  new Procedure(d[2], [new Equation(patternList, d[3][8])])
    return [signature, procedure]
}%}

param_list -> param (_ "," _ param):* {% d => [d[0], ...d[1].map(x => x[3])] %}

param -> type __ variable {% d => [d[0], new VariablePattern(d[2])] %}

body -> statement:* {% (d) => new UnguardedBody(new Sequence(d[0])) %}

# Expressions

expression -> comparison {% (d) => d[0] %}

comparison ->
    addition _ comparison_operator _ addition {% (d) => new ComparisonOperation(d[2], d[0], d[4]) %}
    | addition {% (d) => d[0] %}

addition -> 
    addition _ "+" _ multiplication {% (d) => new ArithmeticBinaryOperation("Plus", d[0], d[4]) %}
    | addition _ "-" _ multiplication {% (d) => new ArithmeticBinaryOperation("Minus", d[0], d[4]) %}
    | multiplication {% (d) => d[0] %}

multiplication -> 
    multiplication _ "*" _ primary {% (d) => new ArithmeticBinaryOperation("Multiply", d[0], d[4]) %}
    | multiplication _ "/" _ primary {% (d) => new ArithmeticBinaryOperation("Divide", d[0], d[4]) %}
    | primary {% (d) => d[0] %}

primary -> 
    variable {% (d) => d[0] %}
    | "(" _ expression _ ")" {% (d) => d[2] %}
    | primitive {% (d) => d[0] %}

primitive -> 
    %number {% (d) => new NumberPrimitive(Number(d[0].value)) %}
    | %char {% (d) => new CharPrimitive(d[0].value) %}
    | %string {% (d) => new StringPrimitive(d[0].value) %}
    | %bool {% (d) => new BooleanPrimitive(d[0].value) %}
    | variable {% (d) => d[0] %}
    | list_primitive {% d => d[0] %}

type -> 
    variable {% (d) => new SimpleType(d[0].value, []) %}
    | type "[" "]" {% (d) => new ListType(d[0], []) %}

list_primitive -> "[" _ expression_list _ "]" {% (d) => new ListPrimitive(d[2]) %}

expression_list -> expression _ ("," _ expression _):* {% (d) => ([d[0], ...d[2].map(x => x[2])]) %}

variable -> %variable {% (d) => new SymbolPrimitive(d[0].value) %}

comparison_operator -> 
    %equal {% d => "Equal" %}
    | %notEqual {% d => "NotEqual" %}
    | %lt {% d => "LessThan" %}
    | %lte {% d => "LessOrEqualThan" %}
    | %gt {% d => "GreaterThan" %}
    | %gte {% d => "GreaterOrEqualThan" %}

_ -> %WS:* {% d => null %}
__ -> %WS:+ {% d => null %}