# Yukigo parser template

This template scaffolds a Yukigo parser package using **Nearley** by default.

## Available parser generator templates

The CLI package now ships template directories for:

- **Nearley** (default scaffold in `template/`)
- **Chevrotain** (`templates/chevrotain/`)
- **Ohm.js** (`templates/ohm/`)

## Included in the default Nearley template

- `src/index.ts`: parser entry point implementing `YukigoParser`
- `src/grammar.ne`: Nearley grammar source
- `src/grammar.ts`: generated grammar output
- `tests/parser.spec.ts`: starter parser test

## Parser generator notes

If you prefer another parser generator, use the included Chevrotain or Ohm.js templates as a starting point.
Each template keeps the public parser API compatible with `YukigoParser`:

- `errors: string[]`
- `parse(code: string): AST`

## Development

```bash
npm install
npm run build
npm test
```
