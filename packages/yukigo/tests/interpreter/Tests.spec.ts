import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";
import {
  Assert,
  BooleanPrimitive,
  Equality,
  NumberPrimitive,
  Sequence,
  Test,
  TestGroup,
  Failure,
  Raise,
  StringPrimitive,
  Truth,
  Rule,
  SymbolPrimitive,
  Equation,
  VariablePattern,
  UnguardedBody,
  Exist,
  LogicConstraint,
  ComparisonOperation,
  ArithmeticBinaryOperation,
  Fact,
  LiteralPattern,
  ListPattern,
  FunctorPattern,
  UnifyOperation,
  AssignOperation,
  WildcardPattern,
  Findall,
  ConsPattern,
  If,
  ConsExpression,
  Call,
} from "yukigo-ast";
import { Interpreter, Tester } from "../../src/index.js";
import { FailedAssert } from "../../src/interpreter/components/TestRunner.js";

describe("Testing Nodes", () => {
  let interpreter: Interpreter;

  beforeEach(() => {
    interpreter = new Interpreter([]);
  });

  describe("Assertions", () => {
    it("should pass a valid Equality assertion", () => {
      const assertion = new Assert(
        new BooleanPrimitive(false), // negated = false
        new Equality(new NumberPrimitive(1), new NumberPrimitive(1)),
      );
      // Should not throw
      interpreter.evaluate(new Sequence([assertion]));
    });

    it("should fail an invalid Equality assertion", () => {
      const assertion = new Assert(
        new BooleanPrimitive(false),
        new Equality(new NumberPrimitive(1), new NumberPrimitive(2)),
      );
      expect(() => interpreter.evaluate(new Sequence([assertion]))).to.throw(
        FailedAssert,
      );
    });

    it("should pass a negated invalid Equality assertion", () => {
      const assertion = new Assert(
        new BooleanPrimitive(true), // negated = true
        new Equality(new NumberPrimitive(1), new NumberPrimitive(2)),
      );
      interpreter.evaluate(new Sequence([assertion]));
    });

    it("should pass a Truth assertion", () => {
      const assertion = new Assert(
        new BooleanPrimitive(false),
        new Truth(new BooleanPrimitive(true)),
      );
      interpreter.evaluate(new Sequence([assertion]));
    });

    it("should fail a Truth assertion with false", () => {
      const assertion = new Assert(
        new BooleanPrimitive(false),
        new Truth(new BooleanPrimitive(false)),
      );
      expect(() => interpreter.evaluate(new Sequence([assertion]))).to.throw(
        FailedAssert,
      );
    });

    it("should pass a Failure assertion when code raises error", () => {
      const funcThatRaises = new Raise(new StringPrimitive("Boom"));
      const assertion = new Assert(
        new BooleanPrimitive(false),
        new Failure(funcThatRaises, new StringPrimitive("[Raise] Boom")),
      );
      interpreter.evaluate(new Sequence([assertion]));
    });

    it("should fail a Failure assertion when code does NOT raise error", () => {
      const funcThatReturns = new NumberPrimitive(1);
      const assertion = new Assert(
        new BooleanPrimitive(false),
        new Failure(funcThatReturns, new StringPrimitive("[Raise] Boom")),
      );
      expect(() => interpreter.evaluate(new Sequence([assertion]))).to.throw(
        FailedAssert,
      );
    });
  });

  describe("Tests and Groups", () => {
    it("should execute a Test node containing assertions", () => {
      const assertion = new Assert(
        new BooleanPrimitive(false),
        new Equality(new NumberPrimitive(5), new NumberPrimitive(5)),
      );
      const testNode = new Test(
        new StringPrimitive("My Test"),
        new Sequence([assertion]),
      );
      interpreter.evaluate(testNode);
    });

    it("should execute a TestGroup node", () => {
      const assertion = new Assert(
        new BooleanPrimitive(false),
        new Equality(new NumberPrimitive(10), new NumberPrimitive(10)),
      );
      const testNode = new Test(
        new StringPrimitive("Sub Test"),
        new Sequence([assertion]),
      );
      const groupNode = new TestGroup(
        new StringPrimitive("My Group"),
        new Sequence([testNode]),
      );
      interpreter.evaluate(groupNode);
    });
  });

  describe("Respetable Test", () => {
    it("should execute Respetable logic rules and tests", () => {
      const sym = (str: string) => new SymbolPrimitive(str);
      const num = (n: number) => new NumberPrimitive(n);
      const lp = (val: string | number) =>
        new LiteralPattern(typeof val === "string" ? sym(val) : num(val));
      const vp = (name: string) => new VariablePattern(sym(name));

      const program = [
        // Helper facts
        new Fact(sym("union"), [new ListPattern([]), vp("L"), vp("L")]),
        new Fact(sym("intersection"), [
          new ListPattern([]),
          new WildcardPattern(),
          new ListPattern([]),
        ]),
        new Fact(sym("sumlist"), [new ListPattern([]), lp(0)]),
        new Fact(sym("length"), [new ListPattern([]), lp(0)]),
        new Fact(sym("flatten"), [new ListPattern([]), new ListPattern([])]),
        new Fact(sym("flatten"), [vp("X"), new ListPattern([vp("X")])]),
        new Fact(sym("reverse_acc"), [
          new ListPattern([]),
          vp("Acc"),
          vp("Acc"),
        ]),
        new Fact(sym("list_to_set"), [
          new ListPattern([]),
          new ListPattern([]),
        ]),
        new Fact(sym("nth0"), [
          lp(0),
          new ConsPattern(vp("H"), new WildcardPattern()),
          vp("H"),
        ]),
        new Fact(sym("nth1"), [
          lp(1),
          new ConsPattern(vp("H"), new WildcardPattern()),
          vp("H"),
        ]),
        new Fact(sym("append"), [new ListPattern([]), vp("L"), vp("L")]),
        new Fact(sym("member"), [
          vp("H"),
          new ConsPattern(vp("H"), new WildcardPattern()),
        ]),
        new Fact(sym("exclude"), [
          new WildcardPattern(),
          new ListPattern([]),
          new ListPattern([]),
        ]),

        // Personaje facts
        new Fact(sym("personaje"), [
          lp("pumkin"),
          new FunctorPattern(sym("ladron"), [
            new ListPattern([lp("licorerias"), lp("estacionesDeServicio")]),
          ]),
        ]),
        new Fact(sym("personaje"), [
          lp("honeyBunny"),
          new FunctorPattern(sym("ladron"), [
            new ListPattern([lp("licorerias"), lp("estacionesDeServicio")]),
          ]),
        ]),
        new Fact(sym("personaje"), [
          lp("vincent"),
          new FunctorPattern(sym("mafioso"), [lp("maton")]),
        ]),
        new Fact(sym("personaje"), [
          lp("jules"),
          new FunctorPattern(sym("mafioso"), [lp("maton")]),
        ]),
        new Fact(sym("personaje"), [
          lp("marsellus"),
          new FunctorPattern(sym("mafioso"), [lp("capo")]),
        ]),
        new Fact(sym("personaje"), [
          lp("winston"),
          new FunctorPattern(sym("mafioso"), [lp("resuelveProblemas")]),
        ]),
        new Fact(sym("personaje"), [
          lp("mia"),
          new FunctorPattern(sym("actriz"), [
            new ListPattern([lp("foxForceFive")]),
          ]),
        ]),
        new Fact(sym("personaje"), [lp("butch"), lp("boxeador")]),

        new Fact(sym("peliculasRecursivas"), [lp(0), vp("Lista"), vp("Lista")]),

        // Rules
        new Rule(sym("between"), [
          new Equation(
            [vp("Low"), vp("High"), vp("Low")],
            new UnguardedBody(
              new Sequence([
                new LogicConstraint(
                  new ComparisonOperation(
                    "LessOrEqualThan",
                    sym("Low"),
                    sym("High"),
                  ),
                ),
              ]),
            ),
          ),
          new Equation(
            [vp("Low"), vp("High"), vp("Value")],
            new UnguardedBody(
              new Sequence([
                new LogicConstraint(
                  new ComparisonOperation("LessThan", sym("Low"), sym("High")),
                ),
                new LogicConstraint(
                  new AssignOperation(
                    "Assign",
                    sym("NextLow"),
                    new ArithmeticBinaryOperation("Plus", sym("Low"), num(1)),
                  ),
                ),
                new Exist(sym("between"), [
                  vp("NextLow"),
                  vp("High"),
                  vp("Value"),
                ]),
              ]),
            ),
          ),
        ]),
        new Rule(sym("union"), [
          new Equation(
            [new ConsPattern(vp("H"), vp("T")), vp("L2"), vp("Union")],
            new UnguardedBody(
              new Sequence([
                new If(
                  new Exist(sym("member"), [vp("H"), vp("L2")]),
                  new Exist(sym("union"), [vp("T"), vp("L2"), vp("Union")]),
                  new Sequence([
                    new LogicConstraint(
                      new UnifyOperation(
                        "Unify",
                        sym("Union"),
                        new ConsExpression(sym("H"), sym("Rest")),
                      ),
                    ),
                    new Exist(sym("union"), [vp("T"), vp("L2"), vp("Rest")]),
                  ]),
                ),
              ]),
            ),
          ),
        ]),
        new Rule(sym("intersection"), [
          new Equation(
            [
              new ConsPattern(vp("H"), vp("T")),
              vp("L2"),
              new ConsPattern(vp("H"), vp("Rest")),
            ],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("member"), [vp("H"), vp("L2")]),
                new Exist(sym("!"), []),
                new Exist(sym("intersection"), [vp("T"), vp("L2"), vp("Rest")]),
              ]),
            ),
          ),
          new Equation(
            [
              new ConsPattern(new WildcardPattern(), vp("T")),
              vp("L2"),
              vp("Rest"),
            ],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("intersection"), [vp("T"), vp("L2"), vp("Rest")]),
              ]),
            ),
          ),
        ]),
        new Rule(sym("max_member"), [
          new Equation(
            [vp("Max"), new ListPattern([vp("Max")])],
            new UnguardedBody(new Sequence([new Exist(sym("!"), [])])),
          ),
          new Equation(
            [vp("Max"), new ConsPattern(vp("H"), vp("T"))],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("max_member"), [vp("M"), vp("T")]),
                new If(
                  new LogicConstraint(
                    new ComparisonOperation("GreaterThan", sym("M"), sym("H")),
                  ),
                  new LogicConstraint(
                    new UnifyOperation("Unify", sym("Max"), sym("M")),
                  ),
                  new LogicConstraint(
                    new UnifyOperation("Unify", sym("Max"), sym("H")),
                  ),
                ),
              ]),
            ),
          ),
        ]),
        new Rule(sym("min_member"), [
          new Equation(
            [vp("Min"), new ListPattern([vp("Min")])],
            new UnguardedBody(new Sequence([new Exist(sym("!"), [])])),
          ),
          new Equation(
            [vp("Min"), new ConsPattern(vp("H"), vp("T"))],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("min_member"), [vp("M"), vp("T")]),
                new If(
                  new LogicConstraint(
                    new ComparisonOperation("LessThan", sym("M"), sym("H")),
                  ),
                  new LogicConstraint(
                    new UnifyOperation("Unify", sym("Min"), sym("M")),
                  ),
                  new LogicConstraint(
                    new UnifyOperation("Unify", sym("Min"), sym("H")),
                  ),
                ),
              ]),
            ),
          ),
        ]),
        new Rule(sym("sumlist"), [
          new Equation(
            [new ConsPattern(vp("H"), vp("T")), vp("Sum")],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("sumlist"), [vp("T"), vp("RestSum")]),
                new LogicConstraint(
                  new AssignOperation(
                    "Assign",
                    sym("Sum"),
                    new ArithmeticBinaryOperation(
                      "Plus",
                      sym("H"),
                      sym("RestSum"),
                    ),
                  ),
                ),
              ]),
            ),
          ),
        ]),
        new Rule(sym("length"), [
          new Equation(
            [new ConsPattern(new WildcardPattern(), vp("Tail")), vp("N")],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("length"), [vp("Tail"), vp("M")]),
                new LogicConstraint(
                  new AssignOperation(
                    "Assign",
                    sym("N"),
                    new ArithmeticBinaryOperation("Plus", num(1), sym("M")),
                  ),
                ),
              ]),
            ),
          ),
        ]),
        new Rule(sym("flatten"), [
          new Equation(
            [new ConsPattern(vp("H"), vp("T")), vp("Flat")],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("!"), []),
                new Exist(sym("flatten"), [vp("H"), vp("FlatH")]),
                new Exist(sym("flatten"), [vp("T"), vp("FlatT")]),
                new Exist(sym("append"), [
                  vp("FlatH"),
                  vp("FlatT"),
                  vp("Flat"),
                ]),
              ]),
            ),
          ),
        ]),
        new Rule(sym("reverse"), [
          new Equation(
            [vp("List"), vp("Reversed")],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("reverse_acc"), [
                  vp("List"),
                  new ListPattern([]),
                  vp("Reversed"),
                ]),
              ]),
            ),
          ),
        ]),
        new Rule(sym("reverse_acc"), [
          new Equation(
            [new ConsPattern(vp("H"), vp("T")), vp("Acc"), vp("Reversed")],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("reverse_acc"), [
                  vp("T"),
                  new ConsPattern(vp("H"), vp("Acc")),
                  vp("Reversed"),
                ]),
              ]),
            ),
          ),
        ]),
        new Rule(sym("list_to_set"), [
          new Equation(
            [
              new ConsPattern(vp("H"), vp("T")),
              new ConsPattern(vp("H"), vp("Rest")),
            ],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("exclude"), [
                  new FunctorPattern(sym("=="), [vp("H")]),
                  vp("T"),
                  vp("T1"),
                ]),
                new Exist(sym("list_to_set"), [vp("T1"), vp("Rest")]),
              ]),
            ),
          ),
        ]),
        new Rule(sym("=="), [
          new Equation(
            [vp("H"), vp("T")],
            new UnguardedBody(
              new Sequence([
                new LogicConstraint(
                  new ComparisonOperation("Same", sym("H"), sym("T")),
                ),
              ]),
            ),
          ),
        ]),
        new Rule(sym("nth0"), [
          new Equation(
            [
              vp("N"),
              new ConsPattern(new WildcardPattern(), vp("T")),
              vp("Elem"),
            ],
            new UnguardedBody(
              new Sequence([
                new LogicConstraint(
                  new ComparisonOperation("GreaterThan", sym("N"), num(0)),
                ),
                new LogicConstraint(
                  new AssignOperation(
                    "Assign",
                    sym("N1"),
                    new ArithmeticBinaryOperation("Minus", sym("N"), num(1)),
                  ),
                ),
                new Exist(sym("nth0"), [vp("N1"), vp("T"), vp("Elem")]),
              ]),
            ),
          ),
        ]),
        new Rule(sym("nth1"), [
          new Equation(
            [
              vp("N"),
              new ConsPattern(new WildcardPattern(), vp("T")),
              vp("Elem"),
            ],
            new UnguardedBody(
              new Sequence([
                new LogicConstraint(
                  new ComparisonOperation("GreaterThan", sym("N"), num(1)),
                ),
                new LogicConstraint(
                  new AssignOperation(
                    "Assign",
                    sym("N1"),
                    new ArithmeticBinaryOperation("Minus", sym("N"), num(1)),
                  ),
                ),
                new Exist(sym("nth1"), [vp("N1"), vp("T"), vp("Elem")]),
              ]),
            ),
          ),
        ]),
        new Rule(sym("append"), [
          new Equation(
            [
              new ConsPattern(vp("H"), vp("T")),
              vp("L"),
              new ConsPattern(vp("H"), vp("R")),
            ],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("append"), [vp("T"), vp("L"), vp("R")]),
              ]),
            ),
          ),
        ]),
        new Rule(sym("member"), [
          new Equation(
            [vp("H"), new ConsPattern(new WildcardPattern(), vp("T"))],
            new UnguardedBody(
              new Sequence([new Exist(sym("member"), [vp("H"), vp("T")])]),
            ),
          ),
        ]),
        new Rule(sym("exclude"), [
          new Equation(
            [vp("Pred"), new ConsPattern(vp("H"), vp("T")), vp("Rest")],
            new UnguardedBody(
              new Sequence([
                new If(
                  new Call(sym("Pred"), [vp("H")]),
                  new Exist(sym("exclude"), [vp("Pred"), vp("T"), vp("Rest")]),
                  new Sequence([
                    new LogicConstraint(
                      new UnifyOperation(
                        "Unify",
                        sym("Rest"),
                        new ConsExpression(sym("H"), sym("Rest2")),
                      ),
                    ),
                    new Exist(sym("exclude"), [
                      vp("Pred"),
                      vp("T"),
                      vp("Rest2"),
                    ]),
                  ]),
                ),
              ]),
            ),
          ),
        ]),

        new Rule(sym("personaje"), [
          new Equation(
            [
              lp("angelina"),
              new FunctorPattern(sym("actriz"), [vp("ListaPeliculas")]),
            ],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("peliculasRecursivas"), [
                  lp(10),
                  new ListPattern([]),
                  vp("ListaPeliculas"),
                ]),
              ]),
            ),
          ),
        ]),
        new Rule(sym("peliculasRecursivas"), [
          new Equation(
            [vp("Numero"), vp("ListaAnt"), vp("Lista")],
            new UnguardedBody(
              new Sequence([
                new LogicConstraint(
                  new ComparisonOperation("GreaterThan", sym("Numero"), num(0)),
                ),
                new LogicConstraint(
                  new AssignOperation(
                    "Assign",
                    sym("NumeroSig"),
                    new ArithmeticBinaryOperation(
                      "Minus",
                      sym("Numero"),
                      num(1),
                    ),
                  ),
                ),
                new Exist(sym("append"), [
                  new ListPattern([vp("Numero")]),
                  vp("ListaAnt"),
                  vp("ListaInt"),
                ]),
                new Exist(sym("peliculasRecursivas"), [
                  vp("NumeroSig"),
                  vp("ListaInt"),
                  vp("Lista"),
                ]),
              ]),
            ),
          ),
        ]),

        new Rule(sym("respeto"), [
          new Equation(
            [vp("P"), vp("R")],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("personaje"), [
                  vp("P"),
                  new FunctorPattern(sym("actriz"), [vp("Pel")]),
                ]),
                new Exist(sym("length"), [vp("Pel"), vp("Cant")]),
                new LogicConstraint(
                  new AssignOperation(
                    "Assign",
                    sym("R"),
                    new ArithmeticBinaryOperation(
                      "Divide",
                      sym("Cant"),
                      num(10),
                    ),
                  ),
                ),
              ]),
            ),
          ),
          new Equation(
            [vp("P"), lp(10)],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("personaje"), [
                  vp("P"),
                  new FunctorPattern(sym("mafioso"), [lp("resuelveProblemas")]),
                ]),
              ]),
            ),
          ),
          new Equation(
            [vp("P"), lp(1)],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("personaje"), [
                  vp("P"),
                  new FunctorPattern(sym("mafioso"), [lp("maton")]),
                ]),
              ]),
            ),
          ),
          new Equation(
            [vp("P"), lp(20)],
            new UnguardedBody(
              new Sequence([
                new Exist(sym("personaje"), [
                  vp("P"),
                  new FunctorPattern(sym("mafioso"), [lp("capo")]),
                ]),
              ]),
            ),
          ),
        ]),

        new Rule(sym("personajesRespetables"), [
          new Equation(
            [vp("PLista")],
            new UnguardedBody(
              new Sequence([
                new Findall(
                  vp("P"),
                  new Sequence([
                    new Exist(sym("personaje"), [
                      vp("P"),
                      new WildcardPattern(),
                    ]),
                    new Exist(sym("respeto"), [vp("P"), vp("R")]),
                    new LogicConstraint(
                      new ComparisonOperation("GreaterThan", sym("R"), num(9)),
                    ),
                  ]),
                  vp("PLista"),
                ),
              ]),
            ),
          ),
        ]),
      ];

      const testRespetable = new Test(
        sym("personajeRespetable_es_inversible"),
        new Sequence([
          new Exist(sym("personajesRespetables"), [vp("Respetable")]),
          new Exist(sym("member"), [lp("winston"), vp("Respetable")]),
          new Exist(sym("member"), [lp("marsellus"), vp("Respetable")]),
          new Exist(sym("member"), [lp("angelina"), vp("Respetable")]),
          new Exist(sym("length"), [vp("Respetable"), lp(3)]),
        ]),
        [lp("nondet")],
      );

      const interpreter = new Interpreter([...program, testRespetable]);
      interpreter.evaluate(testRespetable);
    });
  });
});
