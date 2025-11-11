import { assert } from "chai";
import { preprocessor } from "../src/parser/layoutPreprocessor.js";
import { PreprocessorLexer } from "../src/parser/lexer.js";

describe("Preprocessor Tests", () => {
  it("processes where clauses correctly", () => {
    const expectedCode =
      "f x = x * pi where { pi = 3.14; anotherBinding = 200 }";
    assert.equal(
      preprocessor(`f x = x * pi 
  where 
      pi = 3.14
      anotherBinding = 200`),
      expectedCode
    );
    assert.equal(
      preprocessor(`f x = x * pi where 
      pi = 3.14
      anotherBinding = 200`),
      expectedCode
    );
    assert.equal(
      preprocessor(`f x = x * pi where pi = 3.14; anotherBinding = 200`),
      expectedCode
    );
    assert.equal(
      preprocessor(`f x = x where x = 1`),
      `f x = x where { x = 1 }`
    );
    assert.equal(
      preprocessor(`f x = x where { x = 1 }`),
      `f x = x where { x = 1 }`
    );
    assert.equal(
      preprocessor(`g y = y * z
  where
    z = 10
h w = w where w = 2`),
      `g y = y * z where { z = 10 }
h w = w where { w = 2 }`
    );
  });
  it("processes let...in expressions correctly", () => {
    const expectedCode = "f = let { x = 1; y = 2 } in x + y";
    assert.equal(preprocessor(`f = let x = 1; y = 2 in x + y`), expectedCode);
    assert.equal(preprocessor(`f = let {x=1;y=2} in x + y`), expectedCode);
    assert.equal(
      preprocessor(`f = let
  x = 1
  y = 2
  in x + y`),
      expectedCode
    );
    assert.equal(
      preprocessor(`
f =
  let x = 1
      y = 2
   in x + y`),
      expectedCode
    );
    assert.equal(
      preprocessor(
        `hypotenuse a b =\n let\n a_sq = a * a\n b_sq = b * b\n sum_sq = a_sq + b_sq\n in\n sqrt sum_sq`
      ),
      `hypotenuse a b = let { a_sq = a * a; b_sq = b * b; sum_sq = a_sq + b_sq } in sqrt sum_sq`
    );
  });
});
