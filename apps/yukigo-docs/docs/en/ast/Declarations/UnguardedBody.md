# Class: UnguardedBody

Represents the body of an Equation that does not have guards.
Most languages match the body of its equations to it.

## Examples

```ts
f x = x + 2
// The body is the `x + 2` part
```

```ts
function f(x) {
   return x + 2;
}
```

## Constructors

### Constructor

> **new UnguardedBody**(`sequence`, `loc?`): `UnguardedBody`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `sequence` | [`Sequence`](../Statements/Sequence.md) |
| `loc?` | [`SourceLocation`](../Other/SourceLocation.md) |

#### Returns

`UnguardedBody`

#### Overrides

`ASTNode.constructor`
