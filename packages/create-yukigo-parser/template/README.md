# Yukigo parser template

This template scaffolds a Yukigo parser package using **Nearley** by default.

## Included

- `src/index.ts`: parser entry point implementing `YukigoParser`
- `src/grammar.ne`: Nearley grammar source
- `src/grammar.ts`: generated grammar output
- `tests/parser.spec.ts`: starter parser test

## Parser generator notes

This scaffold currently ships with a **Nearley** setup.

If you prefer another parser generator, this template is a good starting point for adapting to tools such as:

- **Chevrotain**
- **Ohm.js**

Typical migration steps:

1. Replace the Nearley-specific parser bootstrap in `src/index.ts`.
2. Remove Nearley dependencies from `package.json`.
3. Add the dependencies and build scripts required by your chosen generator.
4. Keep the public parser API compatible with `YukigoParser`:
   - `errors: string[]`
   - `parse(code: string): AST`

## Development

```bash
npm install
npm run build
npm test
```
