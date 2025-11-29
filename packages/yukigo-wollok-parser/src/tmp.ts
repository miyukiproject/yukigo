import { inspect } from "util";
import { YukigoWollokParser } from "./index.js";


const parser = new YukigoWollokParser()
const ast = parser.parse(`
class Example {
    var attr;
    method calculation(a) {
        super(a)
    }
}    
const example = new Example(attr = 10)
`)
console.log("\n")
console.log(inspect(ast, false, null, true))