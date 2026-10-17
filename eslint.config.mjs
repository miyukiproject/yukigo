// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

// The strict rule set is applied to first-party source code only.
//
// Excluded on purpose:
//  - tests: test suites exercise the code instead of shipping it,
//  - dist: build output,
//  - *.d.ts: hand-written/global declarations,
//  - generated parsers: grammar.js / grammar.cjs emitted by nearley,
//  - scripts, e2e tooling and the project template: standalone tooling that is
//    not part of any published package's source.
const sourceFiles = ["packages/*/src/**/*.ts", "apps/**/*.ts"];

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.nx/**",
      "**/*.d.ts",
      "**/*.js",
      "**/*.cjs",
      "**/*.mjs",
      "**/tests/**",
      "scripts/**",
      "packages/yukigo-e2e/bin/**",
      "packages/yukigo-e2e/scripts/**",
      "packages/create-yukigo-parser/template/**",
    ],
  },
  {
    files: sourceFiles,
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.strictTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        // Type-aware linting across every package tsconfig without having to
        // enumerate them by hand.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      // ── Requested guardrails ────────────────────────────────────────────────
      "@typescript-eslint/no-explicit-any": "error",
      complexity: ["error", { max: 5, variant: "classic" }],
      "max-lines": [
        "error",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],

      // ── Size / structural limits ────────────────────────────────────────────
      "max-lines-per-function": [
        "error",
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
      "max-depth": ["error", 3],
      "max-params": ["error", 4],
      "max-nested-callbacks": ["error", 3],
      "max-statements": ["error", 25],

      // ── Type-safety ─────────────────────────────────────────────────────────
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/only-throw-error": "error",
      "@typescript-eslint/prefer-promise-reject-errors": "error",
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
          allowBoolean: true,
          allowNullish: false,
          allowAny: false,
        },
      ],

      // ── Imports & exports ───────────────────────────────────────────────────
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/consistent-type-exports": [
        "error",
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-require-imports": "error",

      // ── Modern / idiomatic TypeScript ───────────────────────────────────────
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "@typescript-eslint/consistent-generic-constructors": [
        "error",
        "constructor",
      ],
      "@typescript-eslint/method-signature-style": ["error", "property"],
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-includes": "error",
      "@typescript-eslint/prefer-string-starts-ends-with": "error",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
      "@typescript-eslint/no-unnecessary-type-arguments": "error",
      "@typescript-eslint/no-dynamic-delete": "error",
      "@typescript-eslint/no-empty-function": [
        "error",
        {
          allow: [
            "private-constructors",
            "protected-constructors",
            "decoratedFunctions",
          ],
        },
      ],
      "@typescript-eslint/unified-signatures": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // ── Core JavaScript hygiene ─────────────────────────────────────────────
      curly: ["error", "all"],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-var": "error",
      "prefer-const": ["error", { destructuring: "all" }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-console": "warn",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-return-assign": ["error", "always"],
      "no-sequences": "error",
      "no-unmodified-loop-condition": "error",
      "no-unreachable-loop": "error",
      "no-promise-executor-return": "error",
      "no-template-curly-in-string": "error",
      "no-useless-rename": "error",
      "no-useless-return": "error",
      "no-lonely-if": "error",
      "no-else-return": ["error", { allowElseIf: false }],
      "no-implicit-coercion": [
        "error",
        { boolean: false, number: true, string: true },
      ],
      "prefer-template": "error",
      "object-shorthand": ["error", "always"],
      "prefer-object-spread": "error",
      "prefer-regex-literals": ["error", { disallowRedundantWrapping: true }],
      radix: "error",
      "default-case-last": "error",
      "dot-notation": "error",
      "no-duplicate-case": "error",
      "no-self-compare": "error",
      "no-unneeded-ternary": "error",
      "no-constructor-return": "error",
      "no-fallthrough": "error",
      "require-atomic-updates": "error",
    },
  },
);
