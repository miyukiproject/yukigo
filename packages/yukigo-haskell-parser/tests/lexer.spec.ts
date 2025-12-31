import { assert, expect } from "chai";
import { HaskellLayoutLexer } from "../src/parser/lexer.js";

describe("HaskellLayoutLexer", () => {
  let lexer: HaskellLayoutLexer;

  beforeEach(() => {
    lexer = new HaskellLayoutLexer();
  });

  // Helper: Returns array of objects { type, value } for better debugging
  const getTokens = (input: string) => {
    lexer.reset(input);
    const tokens = [];
    for (const token of lexer) {
      tokens.push({ type: token.type, value: token.value });
    }
    return tokens;
  };

  const getTypes = (input: string) => getTokens(input).map((t) => t.type);

  it("should ignore basic whitespace", () => {
    const input = "x = 5";
    const types = getTypes(input);
    expect(types).to.not.include("WS");
    expect(types).to.not.include("NL");
    expect(types).to.include("assign");
  });

  describe("Layout Rule: 'do' blocks", () => {
    it("should inject braces for indented 'do' block", () => {
      const input = `
do
  x
  y
`;
      const tokens = getTokens(input);
      // We check values for keywords since type is now generic 'keyword' or 'variable'
      expect(tokens[0].value).to.equal("do");
      expect(tokens[1].type).to.equal("lbracket"); // { Injected
      expect(tokens[2].value).to.equal("x");
      expect(tokens[3].type).to.equal("semicolon"); // ; Injected
      expect(tokens[4].value).to.equal("y");
      expect(tokens[5].type).to.equal("rbracket"); // } Injected
    });

    it("should handle explicit braces (no layout injection)", () => {
      const input = "do { x; y }";
      const types = getTypes(input);
      expect(types).to.include("lbracket");
      expect(types).to.include("semicolon");
      expect(types).to.include("rbracket");
      // Ensure we didn't double up
      expect(types.filter((t) => t === "lbracket").length).to.equal(1);
    });
  });

  describe("Layout Rule: 'let' blocks", () => {
    it("should inject braces and handle 'in' dedent", () => {
      const input = `
let
  x = 1
in x
`;
      const tokens = getTokens(input);

      const letIndex = tokens.findIndex((t) => t.value === "let");
      expect(tokens[letIndex + 1].type).to.equal("lbracket");

      const inIndex = tokens.findIndex((t) => t.value === "in");
      expect(tokens[inIndex - 1].type).to.equal("rbracket");
    });
  });

  describe("Layout Rule: 'where' clauses", () => {
    it("should handle nested blocks correctly", () => {
      const input = `
f = do
  let x = 1
  return x
`;
      const types = getTypes(input);

      const lbrackets = types.filter((t) => t === "lbracket").length;
      const rbrackets = types.filter((t) => t === "rbracket").length;
      const semicolons = types.filter((t) => t === "semicolon").length;

      expect(lbrackets).to.equal(2);
      expect(rbrackets).to.equal(2);
      expect(semicolons).to.equal(1);
    });
  });

  describe("Layout Rule: Separators", () => {
    it("should inject semicolons for aligned declarations", () => {
      // NOTE: We removed the leading newline here.
      // If we keep the newline, the lexer will insert a semicolon before 'x' too
      // (because x is at col 1, which matches stack 1).
      const input = "x = 1\ny = 2";

      const tokens = getTokens(input);

      // Expected: x, =, 1, SEMICOLON, y, =, 2
      const semiToken = tokens.find((t) => t.type === "semicolon");
      expect(semiToken).to.not.be.undefined;

      const semiIndex = tokens.findIndex((t) => t.type === "semicolon");
      // Should be after '1' (index 2) and before 'y' (index 4)
      expect(semiIndex).to.equal(3);
    });
  });

  describe("Nearley Integration Requirements", () => {
    it("should save and restore state correctly (Backtracking)", () => {
      const input = `
      do
      x
      y
      `;
      lexer.reset(input);

      lexer.next();
      lexer.next();

      const state = lexer.save();

      const t1 = lexer.next();
      const t2 = lexer.next();

      lexer.reset(input, state);

      const t1_restored = lexer.next();
      const t2_restored = lexer.next();

      expect(t1_restored?.value).to.equal(t1?.value);
      expect(t2_restored?.type).to.equal(t2?.type);
    });
  });
  describe("Layout Rule: Separators", () => {
    it("should not inject semicolons or blocks for if-then-else", () => {
      const input = "f x = if x < 4 then 10 else 20";
      const input2 = "f x = \n if x < 4\nthen 10\nelse 20";
      const inlinetokes = getTokens(input);
      const multiTokens = getTokens(input2);
      expect(multiTokens.length).to.eq(inlinetokes.length);
      multiTokens.forEach((tok, i) => {
        const inlineTok = inlinetokes[i];
        expect(tok.type).to.eq(inlineTok.type);
        expect(tok.value).to.eq(inlineTok.value);
      });
    });
  });
  describe("Layout Rule: 'where' clauses (Multi-line)", () => {
    it("should handle multi-line where clause with alignment", () => {
      const input = `
areaOfCircle radius = pi * radius_squared
  where pi = 3.14159
        radius_squared = radius * radius`;
      const tokens = getTokens(input);

      const whereIndex = tokens.findIndex((t) => t.value === "where");
      expect(whereIndex).to.not.equal(-1);
      expect(tokens[whereIndex + 1].type).to.equal("lbracket");

      const semiIndex = tokens.findIndex(
        (t, i) => i > whereIndex && t.type === "semicolon"
      );
      expect(semiIndex).to.not.equal(-1);

      const lastToken = tokens[tokens.length - 1];
      expect(lastToken.type).to.equal("rbracket");
    });
  });
});
