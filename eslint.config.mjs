import { so1ve } from "@so1ve/eslint-config";

export default so1ve(
	{},
	{
		files: ["test/__fixtures__/vue-language-tools/syntaxes/*"],
		rules: {
			"json-schema-validator/no-invalid": "off",
		},
	},
);
