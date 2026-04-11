import { expect } from "chai";
import { ASTNode, NumberPrimitive, StringPrimitive } from "../dist";
import { it } from "mocha";

describe("AST", () => {

  it("funcion is da true si concide el constructor", () => {
    const nodoPrueba = new NumberPrimitive(1);
    expect(nodoPrueba.is(NumberPrimitive)).to.be.true;
  });

  it("funcion is da false si no conincide el constructor", () => {
    const nodoPrueba = new NumberPrimitive(1);
    expect(nodoPrueba.is(StringPrimitive)).to.be.false;
  });

});