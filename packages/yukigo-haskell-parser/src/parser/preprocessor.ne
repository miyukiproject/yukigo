@{% import { PreprocessorLexer } from "./lexer.js"

const filter = d => {
    return d.filter((token) => token !== null);
};

%} @preprocessor typescript @lexer PreprocessorLexer

program -> 
  declaration:* {% (d) => d[0].filter(x => x !== null).join("\n") %}
  | apply_operator {% id %}

declaration -> (function_declaration
                | function_signature 
                | type_declaration 
                | data_declaration  
                | comment
                | empty_line) {% (d) => d[0][0] %}

comment -> %comment {% d => null %}

empty_line -> _ %NL {% d => null %}

expression -> 
  (type_cast
  | letin_expression
  | if_expression
  | case_expression) {% (d) => `${d[0][0]}` %}

type_cast -> apply_operator _ "::" _ type {% (d) => `${d[0]} ${d[2].value} ${d[4]}` %}
| apply_operator {% (d) => d[0] %}

# Operation rules

apply_operator ->
    logical_expression _ "$" _ apply_operator {% (d) => `${d[0]} $ ${d[4]}` %}
    | logical_expression {% (d) => d[0] %}

logical_expression ->
    comparison _ "&&" _ logical_expression {% (d) => `${d[0]} ${d[2].value} ${d[4]}` %}
    | comparison _ "||" _ logical_expression {% (d) => `${d[0]} ${d[2].value} ${d[4]}` %}
    | comparison {% (d) => d[0] %}

comparison ->
    cons_expression _ comparison_operator _ cons_expression {% (d) => `${d[0]} ${d[2]} ${d[4]}` %}
    | cons_expression {% (d) => d[0] %}

cons_expression ->
    concatenation _ ":" _ cons_expression {% (d) => `${d[0]} ${d[2].value} ${d[4]}` %}
    | concatenation {% (d) => d[0] %}

concatenation ->
    addition _ "++" _ concatenation {% (d) => `${d[0]} ${d[2].value} ${d[4]}` %}
    | addition {% (d) => d[0] %}

addition -> 
    addition _ "+" _ multiplication {% (d) => `${d[0]} ${d[2].value} ${d[4]}` %}
    | addition _ "-" _ multiplication {% (d) => `${d[0]} ${d[2].value} ${d[4]}` %}
    | multiplication {% (d) => d[0] %}

multiplication ->
    multiplication _ "*" _ power {% (d) => `${d[0]} ${d[2].value} ${d[4]}` %}
    | multiplication _ "/" _ power {% (d) => `${d[0]} ${d[2].value} ${d[4]}` %}
    | power {% (d) => d[0] %}

power -> 
    unary_negation _ "**" _ power {% (d) => `${d[0]} ${d[2].value} ${d[4]}` %}
    | unary_negation _ "^" _ power {% (d) => `${d[0]} ${d[2].value} ${d[4]}` %}
    | unary_negation _ "^^" _ power {% (d) => `${d[0]} ${d[2].value} ${d[4]}` %}
    | unary_negation {% (d) => d[0] %}

unary_negation ->
    "-" _ unary_negation {% (d) => `-${d[2]}` %}
    | index_access {% (d) => d[0] %}

index_access ->
    index_access _ "!!" _ composition_expression {% (d) => `${d[0]} !! ${d[4]}` %}
    | composition_expression {% d => d[0] %}

composition_expression ->
    composition_expression _ "." _ infix_operator_expression {% (d) => `${d[0]} . ${d[4]}` %}
    | infix_operator_expression {% d => d[0] %}

infix_operator_expression ->
    infix_operator_expression _ "`" _ variable _ "`" _ application {% (d) => `${d[0]} \`${d[4]}\` ${d[8]}` %}
    | application {% d => d[0] %}

application -> 
  "error" __ primary {% d => `error ${d[2]}` %}
  | primary ((__ | _ %NL __) primary):* {% (d) => {
      if (d[1].length === 0) return d[0];
      return [d[0], ...d[1].map(x => x[1])].join(" ");
  } %}

operator -> 
    ("==" 
    | "/="
    | "<"
    | ">"
    | "<="
    | ">="
    | "++"
    | "+"
    | ","
    | "*"
    | "/"
    | ":"
    | "$"
    | ".") {% (d) => d[0][0].value %}

left_section -> "(" _ expression _ operator _ ")" {% (d) => `(${d[2]} ${d[4]})`%}

right_section -> "(" _ operator _ expression _ ")" {% (d) => `(${d[2]} ${d[4]})`%}

operator_section -> "(" _ operator _ ")" {% (d) => `(${d[2]})` %}

primary ->
    primitive {% (d) => d[0] %}
    #| primitive_operator {% (d) => d[0] %}
    | variable {% (d) => d[0] %}
    | constr {% (d) => d[0] %}
    | tuple_expression {% (d) => d[0] %}
    | left_section {% (d) => d[0] %}
    | right_section {% (d) => d[0] %}
    | operator_section {% (d) => d[0] %}
    | "(" _ expression _ ")" {% (d) => `(${d[2]})` %}
    | "[" _ range_expression _ "]" {% (d) => `[${d[2]}]` %}
    | list_literal {% (d) => d[0] %}
    | lambda_expression {% (d) => d[0] %}
    | data_expression {% d => d[0] %}
    | list_comprehension {% (d) => d[0] %}

# Expression rules

# List comprehension rules
list_comprehension -> 
    "[" _ expression _ "|" _ comprehension_clause_list _ "]" {% (d) => `[${d[2]} | ${d[6]}]` %}

comprehension_clause_list -> 
    comprehension_clause (_ "," _ comprehension_clause):* {% (d) => [d[0], ...d[1].map((x) => x[3])].join(`, `) %}

comprehension_clause -> 
    variable _ "<-" _ expression {% (d) => `${d[0]} <- ${d[4]}` %}
    | expression {% (d) => d[0] %}

lambda_expression -> 
    "(" _ "\\" _ parameter_list _ "->" (_ | _ %NL __) expression (_ | _ %NL __) ")" {% (d) => `(\\${d[4]} -> ${d[8]})` %}

tuple_expression -> "(" _ tuple_value (_ "," _ tuple_value):+ _ ")" {% (d) => `(` + [d[2], ...d[3].map(x => `,${x[3]}`)].join(``) + `)` %}
tuple_value -> expression {% d => d[0] %}


data_expression -> constr _ %lbracket _ fields_expressions _ %rbracket {% 
    (d) => d[0] + ` { ` + d[4] + ` }`
%}

fields_expressions -> field_exp (_ "," _ field_exp):* {% (d) => [d[0], ...d[1].map(x => x[3])].join(", ") %}

field_exp -> variable _ "=" _ expression {% (d) => d[0] + ` = ` + d[4] %}

if_expression -> 
  "if" (__ | (_ %NL _)) expression (__ | (_ %NL _)) "then" (__ | (_ %NL __)) expression (__ | (_ %NL _)) "else" (__ | (_ %NL __)) expression {% 
  (d) => `if ` + d[2] + ` then ` + d[6] + ` else ` + d[10] 
%}

letin_expression -> "let" block_start bindings_list:? block_end "in" ((_ %NL __) | _) expression {% (d) => `let { ${(d[2] ?? ``)} }` + ` in ` +  d[6] %}

case_expression -> 
    "case" ((_ %NL __) | _) expression ((_ %NL __) | _) "of" block_start case_arms block_end:? {% (d) => `case ${d[2]} of { ${d[6]} }` %}

case_arms -> 
    case_arm (((_ %NL __) | (_ ";" _)) case_arm):* {% (d) => [d[0], ...d[1].map(x => x[1])].join("; ") %}

case_arm -> 
    pattern ((_ %NL __) | _) "->" ((_ %NL __) | _) expression {% (d) => d[0] + ` -> ` + d[4] %}

# Data rules

data_declaration -> "data" __ constr (__ type_variable):* _ "=" _ constructor_def (_ "|" _ constructor_def):* deriving_clause:? {% 
      (d) => `data ` + d[2] + (d[3] ? ` ` + d[3].map(x => x[1]).join(" ") : ``) + ` = ` + [d[7], ...d[8].map(x => `| ${x[3]}`)].join(" ") + (d[9] ?? ``)
%}

deriving_clause -> 
    __ "deriving" _ deriving_spec {% (d) => ` deriving ` + d[3] %}

deriving_spec -> 
    "(" _ deriving_classes _ ")" {% (d) => `(${d[2]})` %}
    | constr {% (d) => d[0] %}

deriving_classes -> 
    %typeClass (_ "," _ %typeClass):* {% (d) => [d[0].value, ...d[1].map(x => x[3].value)].join(", ") %}

constructor_def ->
  constr _ (%NL __):? %lbracket _ (%NL _):? field_list _ (%NL _):? %rbracket {% (d) => d[0] + ` { ` + d[6] + ` }` %}
  | constr (__ simple_type):* {% (d) => [d[0], ...d[1].map(x => x[1])].join(" ")  %}

field_list -> field (_ "," _ (%NL _):? field):* {% (d) => [d[0], ...d[1].map(x => x[4])].join(", ") %}

field -> variable _ %typeEquals _ type {% (d) => d[0] + ` :: ` + d[4] %}

# Function rules

binding_name ->
  "(" _ %op _ ")" {% d => `(${d[2].value})` %}
  | variable {% d => d[0] %}

function_signature -> 
  binding_name (_ "," _ binding_name):* _ %typeEquals (_ | (_ %NL __)) type {% (d) => [`${d[0]} :: ${d[5]}`, ...d[1].map(x => `${x[3]} :: ${d[5]}`)].join("\n") %}

function_declaration -> 
  variable equation {% (d) => d[0] + d[1] %}
  | "(" _ %op _ ")" equation {% (d) => `(${d[2]})` + d[5] %}

return_expression -> expression {% d => d[0] %}

where_clause -> "where" block_start bindings_list block_end {% d => `where { ${d[2]} }` %}

bindings_list -> function_declaration (((_ ";" _) | (_ %NL indent:? __)) function_declaration):* {% d => [d[0], ...d[1].map(x => x[1])].join('; ') %}

equation -> 
  params guarded_rhs equation_where:? {% (d) => {
      const body = d[1];
      const whereClause = d[3] ? ` ` + d[3] : ``;
      return d[0] + ` ` + body + whereClause;
    } %}
  | params (_ %NL indent __) guarded_rhs (_ %NL _):? (equation_where:? | dedent) {% (d) => {
      const body = d[2];
      const whereClause = d[3] ? ` ` + d[3] : ``;
      return d[0] + ` ` + body + whereClause;
    } %}
  | params %assign _ return_expression equation_where:? {% d => d[0] + ` = ` + d[3] + (d[4] ? ` ` + d[4] : ``) %}
  | params %assign (_ %NL indent __) return_expression (equation_where:? | dedent) {% d => d[0] + ` = ` + d[3] + (d[4] ? ` ` + d[4] : ``) %}

equation_where -> 
    (_ %NL) indent __ where_clause dedent {% d => d[3] %}
  | where_clause {% d => d[1] %}

params ->
  __ parameter_list _ {% d => ` ${d[1]}` %}
  | _ {% d => `` %}

guarded_rhs -> 
  guarded_branch (_ %NL indent __) guarded_rhs (_ %NL _):? dedent {% (d) => `${d[0]} ${d[2]}` %}
  | guarded_branch ((_ %NL __) | _) guarded_rhs {% (d) => `${d[0]} ${d[2]}` %}
  | guarded_branch {% (d) => d[0] %}

guarded_branch -> 
  "|" ((_ %NL __) | _) condition ((_ %NL __) | _) "=" ((_ %NL __) | _) expression {% (d) => `| ${d[2]} = ${d[6]}` %}

condition -> 
  "otherwise" {% d => `otherwise` %}
  | expression {% d => d[0] %}

parameter_list -> pattern (__ pattern):* {% (d) => [d[0], ...d[1].map(x => x[1])].join(" ") %}

# Patterns

pattern -> ("~" _):? cons_pattern {% (d) => d[1] %}

cons_pattern ->
  "(" _ cons_pattern (_ ":" _ cons_pattern):+ _ ")"  {% (d) => `(${[d[2], ...d[3].map(x => x[3])].join(":")})` %}
  | simple_pattern {% (d) => d[0] %}

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

wildcard_pattern -> %anonymousVariable {% (d) => `_` %}

paren_pattern -> "(" _ pattern _ ")" {% (d) => `(${d[2]})` %}

variable_pattern -> variable {% (d) => d[0] %}

literal_pattern -> primitive {% (d) => d[0] %} 

as_pattern -> (variable_pattern | wildcard_pattern) "@" pattern {% (d) => d[0][0] + `@` + d[2] %}

constructor_pattern -> 
  "(" _ constr (__ pattern):+ _ ")" {% (d) => `(${[d[2], ...d[3].map(x => x[1])].join(" ")})` %}
  | constr {% (d) => `${d[0]}` %}

# record_pattern -> 
#   constr:? _ %lbracket _ field_pattern_list _ %rbracket {% (d) => ({
#     type: "RecordPattern",
#     constructor: d[0] ? d[0].value : null,
#     fields: d[4]
#   }) %}

field_pattern_list -> field_pattern (_ "," _ field_pattern):* {% (d) => [d[0], ...d[1].map(x => x[3])].join(`, `) %}

field_pattern -> variable _ "=" _ pattern {% (d) => d[0] + ` = ` + d[4] %}

list_pattern -> "[" _ pattern_list:? _ "]" {% (d) => `[${d[2] ?? ``}]` %}

pattern_list -> pattern (_ "," _ pattern):* {% (d) => [d[0], ...d[1].map(x => x[3])].join(`, `) %}

tuple_pattern -> "(" _ pattern (_ "," _ pattern):+ _ ")" {% (d) => `(${[d[2], ...d[3].map(x => x[3])].join(`, `)})` %}

# Type rules

type_declaration -> "type" __ constr (__ variable_list):? _ "=" _ type {% (d) => {
    const varList = d[3] ? ` ` + d[3][1] : ``
 
    return `type ${d[2]}` + varList + ` = ${d[7]}` 
} %}

variable_list -> variable (__ variable):* {% (d) => [d[0], ...d[1].map(x => x[1])].join(" ") %}

type -> function_type {% d => d[0] %}

constrained_type -> constraint_list _ %arrow _ type {% (d) => d[0] + ` -> ` + d[4] %}

context -> 
  constraint {% (d) => d[0] %}
  | "(" _ constraint_list _ ")" {% (d) => `(${d[2]})` %}

constraint_list -> 
  constraint (_ "," _ constraint):* {% (d) => 
    [d[0], ...d[1].map(x => x[3])].join(", ")
  %}

constraint -> %typeClass (_ application_type):+ {% (d) => [d[0].value, ...d[1].map(x => x[1])].join(" ") %}

function_type ->
    (context _ %arrow _):? (application_type (_ | (_ %NL __)) %typeArrow (_ | (_ %NL __))):* application_type {% (d) => {
        const constraints = d[0] ? `${d[0][0]} => ` : ``;
        const inputs = [...d[1].map(x => x[0]), d[2]].join(" -> ")
        return constraints + inputs
    } 
%}

application_type ->
  simple_type (_ simple_type):+ {% (d) => [d[0], ...d[1].map(x => x[1])].join(" ") %}
  | simple_type {% (d) => d[0] %}

simple_type ->
  (type_variable | type_constructor) {% (d) => d[0][0] %}
  | "[" _ type _ "]" {% (d) => `[${d[2]}]` %}
  | "(" _ type (_ "," _ type):+ _ ")" {% (d) => `(${[d[2], ...d[3].map(x => x[3])].join(`, `)})` %}
  | "(" _ type _ ")" {% (d) => `(${d[2]})` %}

type_variable -> variable {% (d) => d[0] %}
type_constructor -> constr {% (d) => d[0] %}

# Misc rules

constr -> %constructor {% (d) => `${d[0].value}` %}
variable -> %variable {% (d) => `${d[0].value}` %}

list_literal -> 
  "[" _ "]" {% (d) => `[]` %}
  | "[" _ expression_list _ "]" {% (d) => `[${d[2]}]` %}

range_expression ->
  expression _ ".." {% (d) => d[0] + ".." %}  # [start ..]
  | expression _ ".." _ expression {% (d) => d[0] + ".." + d[4] %}  # [start .. end]
  | expression _ "," _ expression _ ".." {% (d) => d[0] + ", " + d[4] + ".." %}  # [start, second ..]
  | expression _ "," _ expression _ ".." _ expression {% (d) => d[0] + ", " + d[4] + ".." + d[6] %}  # [start, second .. end]

expression_list -> expression (_ "," _ expression):* {% (d) => [d[0], ...d[1].map(x => x[3])].join(`, `) %}

comparison_operator -> 
    ("=="
    | "/="
    | "<"
    | ">"
    | "<="
    | ">=") {% (d) => d[0][0].value %}

primitive -> 
    (%number
    | %char
    | %string
    | %bool) {% (d) => `${d[0][0].value}` %}

_ -> %WS:*

__ -> %WS:+

indent -> %indent {% d => "" %}
dedent -> %dedent {% d => "" %}

block_start -> _ "{" _ | _ indent _ | _ %NL __ | _
block_end -> _ "}" _ | _ dedent _ | _ %NL _ dedent _ | _ %NL __ | _
