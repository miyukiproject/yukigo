# Interface: RuntimeFunction

Runtime Function used in the Interpreter

## Properties

| Property | Type |
| ------ | ------ |
| <a id="arity"></a> `arity` | `number` |
| <a id="equations"></a> `equations` | [`EquationRuntime`](EquationRuntime.md)[] |
| <a id="identifier"></a> `identifier?` | `string` |
| <a id="pendingargs"></a> `pendingArgs?` | ([`PrimitiveValue`](PrimitiveValue.md) \| [`PrimitiveThunk`](PrimitiveThunk.md))[] |
