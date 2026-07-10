import { so1ve } from "@so1ve/eslint-config";

export default so1ve({
  ignores: [
    "packages/vscode/playground/fixtures/**",
    "packages/standalone/test/__fixtures__/vue-language-tools/**",
  ],
});
