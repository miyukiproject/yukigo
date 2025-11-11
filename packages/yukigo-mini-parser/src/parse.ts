import { YukigoMiniParser } from "./index.js";

const parser = new YukigoMiniParser()

const code = `int n
int result

n := 5
result := 1

while n > 0 do
    result := result * n
    n := n - 1
endwhile

print result # This should print 120`

console.log(parser.parse(code))