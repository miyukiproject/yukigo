import { inspect } from "util";
import { YukigoHaskellParser } from "../src/index.js";
import { assert } from "chai";

describe("TypeChecker Tests", () => {
  let parser: YukigoHaskellParser;
  beforeEach(() => {
    parser = new YukigoHaskellParser();
  });
  it("accepts function with correct type signature", () => {
    const code = `length' :: [a] -> Int\r\nlength' [] = 0\r\nlength' (_:xs) = 1 + length' xs`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("validates correct usage of logical operation", () => {
    const code = `f :: Bool -> Bool -> Bool\r\nf x y = x && y`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("detects incorrect usage of logical operation", () => {
    const code = `f :: String -> Bool -> Bool\r\nf x y = x && y`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'f': Left side of And must be a boolean"
    );
  });
  it("validates logical operation without signature", () => {
    const code = `f x y = x && y`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("detects return type mismatch", () => {
    const code = `toInt :: String -> Int\r\ntoInt s = s`;
    assert.throw(() => parser.parse(code));

    assert.include(
      parser.errors,
      "Type error in 'toInt': Cannot unify YuString with YuNumber"
    );
  });

  it("detects parameter type mismatch", () => {
    const code = `head' :: [Int] -> Int\r\nhead' (x:_) = x\r\nhead' [] = 0\r\nfirst :: [Char] -> Char\r\nfirst list = head' list`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'first': Cannot apply [YuChar] to type [YuNumber] -> YuNumber"
    );
  });
  it("detects bad application of parameters in tuple", () => {
    const code = `f :: (Int, Int, Int) -> Int\r\nf (x,y,z)= maximum (x y z) - maximum (x y z)`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'f': Cannot apply YuNumber to type YuNumber"
    );
  });
  it("validates correct concat operation of lists", () => {
    const code = `f = [2] ++ [4]`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("detects incorrect concat operation of lists", () => {
    const code = `f = [2] ++ ["4"]`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'f': Concat operation requires both operands to be lists of the same type."
    );
  });

  it("validates polymorphic function signatures", () => {
    const code = `id :: a -> a\nid x = x`;
    parser.parse(code);
    assert.isEmpty(
      parser.errors,
      "Polymorphic identity function should be valid"
    );
  });
  it("validates cons pattern correct usage", () => {
    const code = `f (x:xs) = x + f xs`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("validates empty list pattern", () => {
    const code = `f [] = []`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("validates empty list pattern and cons pattern in function with multiple equations", () => {
    const code = `f [] = []\r\nf (x:xs)= x : f xs`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("validates list pattern with elements", () => {
    const code = `f [y] = y`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("detects duplicate variable with list pattern", () => {
    const code = `f [y] y = y`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'f': Duplicate variable name 'y'"
    );
  });
  it("validates tuple pattern", () => {
    const code = `f (x, y) = y > 21`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("detects incorrect polymorphic usage", () => {
    const code = `id :: a -> a\nid x = x + "not polymorphic"`;
    assert.throw(() => parser.parse(code));

    assert.include(
      parser.errors,
      "Type error in 'id': Right operand of Plus must be a number"
    );
  });

  it("validates typeclass constraints", () => {
    const code = `f :: Num a => a -> a\r\nf x = x + 2`;
    parser.parse(code);
    assert.isEmpty(parser.errors, "Should accept valid Show constraint");
  });
  it("detects incorrect typeclass constraints", () => {
    const code = `f :: Num a => a -> a\r\nf x = x ++ "2"`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'f': Type 'YuString' is not an instance of 'Num'"
    );
  });
  it("detects arithmetic type errors", () => {
    const code = `invalidAdd = "text" + 42`;
    assert.throw(() => parser.parse(code));

    assert.include(
      parser.errors,
      "Type error in 'invalidAdd': Left operand of Plus must be a number"
    );
  });

  it("validates higher-order function types", () => {
    const code = `apply :: (a -> b) -> a -> b\napply f x = f x`;
    parser.parse(code);
    assert.isEmpty(parser.errors, "Should accept valid higher-order function");
  });

  it("detects higher-order function misuse", () => {
    const code = `apply :: (Int -> String) -> Int -> String\napply f x = f (x + "error")`;
    assert.throw(() => parser.parse(code));

    assert.include(
      parser.errors,
      "Type error in 'apply': Right operand of Plus must be a number"
    );
  });

  it("validates recursive function types", () => {
    const code = `factorial :: Int -> Int\nfactorial 0 = 1\nfactorial n = n * factorial (n - 1)`;
    parser.parse(code);
    assert.isEmpty(parser.errors, "Should accept valid recursive function");
  });

  it("detects recursive type errors", () => {
    const code = `badFactorial :: Int -> String\nbadFactorial 0 = "1"\nbadFactorial n = n * badFactorial (n - 1)`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'badFactorial': Right operand of Multiply must be a number"
    );
  });

  it("validates data constructor types", () => {
    const code = `fromMaybe :: a -> Maybe a -> a\nfromMaybe d Nothing = d\nfromMaybe _ (Just x) = x`;
    parser.parse(code);
    assert.isEmpty(parser.errors, "Should accept valid Maybe implementation");
  });

  it("detects data constructor type errors", () => {
    const code = `data Foo = Bar String | Baz\r\nf :: Int -> Foo\r\nf x = Bar x`;
    assert.throw(() => parser.parse(code));
    const targetError = parser.errors.find((e) =>
      e.includes("Cannot apply YuNumber")
    );
    assert.exists(targetError);
    assert.match(
      targetError,
      /Cannot apply YuNumber to type YuString -> Foo t\d+/
    );
  });
  it("validates correct usage of map", () => {
    const code = `f :: [Int] -> [Int]\nf xs = map (\\x -> x * 2) xs`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("detects incorrect usage of map", () => {
    const code = `f :: [Int] -> [Int]\nf xs = map (\\x -> x ++ "2") xs`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'f': Cannot unify YuString with YuNumber"
    );
  });
  it("detects incorrect arity in map", () => {
    const code = `f :: [Int] -> [Int]\nf xs = map (\\x y -> x + 2) xs`;
    assert.throw(() => parser.parse(code));
    const targetError = parser.errors.find((e) =>
      e.includes("Type error in 'f': Cannot unify")
    );
    assert.exists(targetError);
    assert.match(
      targetError,
      /Type error in 'f': Cannot unify t\d+ -> YuNumber with YuNumber/
    );
  });
  it("validates correct usage of filter", () => {
    const code = `f :: [Int] -> [Int]\nf xs = filter (\\x -> x == 2) xs`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("detects incorrect usage of filter", () => {
    const code = `f :: [Int] -> [Int]\nf xs = filter (\\x -> x ++ "2") xs`;
    assert.throw(() => parser.parse(code));
    const targetError = parser.errors.find((e) =>
      e.includes("Type error in 'f': Cannot apply")
    );
    assert.exists(targetError);
    assert.match(
      targetError,
      /Type error in 'f': Cannot apply t\d+ -> YuString to type \(t\d+ -> YuBoolean\) -> \[t\d+\] -> \[t\d+\]/
    );
  });
  it("handles multiple type errors", () => {
    const code = `f :: Int -> String\nf x = x + "error"\ng = 42`;
    assert.throw(() => parser.parse(code));
    assert.equal(parser.errors.length, 1);
    assert.include(
      parser.errors,
      "Type error in 'f': Right operand of Plus must be a number"
    );
  });
  it("detects incorrect use of maximum with not ordenable type", () => {
    const code = `f :: [Boolean] -> Boolean\nf xs = maximum xs`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'f': Type 'YuBoolean' is not an instance of 'Ord'"
    );
  });
  it("validates correct use of arithmetic operator round", () => {
    const code = `f :: Int -> Int\nf x = round x`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("detects incorrect use of arithmetic operator round", () => {
    const code = `f :: String -> Int\nf x = round x`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'f': Type 'YuString' is not an instance of 'Num'"
    );
  });
  it("validates correct usage of function without signature defined after application", () => {
    const code = `f :: String -> String\nf x = g x\n\ng y = y + 2`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("validates correct usage of where clause", () => {
    const code = `areaOfCircle radius = pi * radius_squared\n  where\n  pi = 3.14159\n  radius_squared = radius * radius`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("detects invalid type with where clause", () => {
    const code = `areaOfCircle :: Int -> Int\r\nareaOfCircle radius = pi * radius_squared\n where\n      pi = "3.14159"\n      radius_squared = radius * radius`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'areaOfCircle': Left operand of Multiply must be a number"
    );
  });
  it("validates correct usage of let...in expression", () => {
    const code = `hypotenuse a b = let a_sq = a * a; b_sq = b * b; sum_sq = a_sq + b_sq in sqrt sum_sq`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("detects incorrect usage of let...in expression", () => {
    const code = `hypotenuse a b = let a_sq = a * a; b_sq = b * b; sum_sq = a_sq + b_sq in sum_sq ++ "a string"`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'hypotenuse': String operation requires string operands"
    );
  });
  it("detects incorrect usage of let...in expression", () => {
    const code = `hypotenuse a b = let a_sq = a * a; b_sq = b * b; sum_sq = a_sq ++ b_sq in sqrt sum_sq`;
    assert.throw(() => parser.parse(code));
    assert.include(
      parser.errors,
      "Type error in 'hypotenuse': Type error in 'sum_sq': Left operand of concat must be a list, got YuNumber"
    );
  });
  it("validates infix partial application", () => {
    const code = `doble numero = (*) numero 2`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("validates infix partial application", () => {
    const code = `doble numero = (* 2) numero`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
  it("validates infix partial application", () => {
    const code = `doble numero = (2 *) numero`;
    parser.parse(code);
    assert.isEmpty(parser.errors);
  });
});
