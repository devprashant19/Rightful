import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default [
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Reported, not enforced: the remaining `any` sites are error-narrowing
      // catch clauses and the four prompt validators, which take raw unparsed
      // model output by design. Type safety for that output is enforced at
      // runtime by the validators themselves and by lib/verify.ts.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
