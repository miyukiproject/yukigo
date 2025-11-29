import { inspect } from "util";
import { YukigoWollokParser } from "./index.js";


const parser = new YukigoWollokParser()
const ast = parser.parse(`
object example {
    method calculation(a) = a + 2
}    
`)
console.log("\n")
console.log(inspect(ast, false, null, true))