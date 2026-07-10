import { so1ve } from "@so1ve/eslint-config";

export default so1ve({
  ignores: [
    "packages/vscode/playground/fixtures/**",
    "test/__fixtures__/vue-language-tools/**",
  ],
});
