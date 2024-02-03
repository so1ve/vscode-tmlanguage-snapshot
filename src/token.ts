import type { Registry, StateStack } from "vscode-textmate";

import type { LineWithTokens } from "./types";

const newlineRe = /\r?\n/g;

export async function getLineWithTokens(
	registry: Registry,
	scope: string,
	source: string,
) {
	const grammar = await registry.loadGrammar(scope);

	if (!grammar) {
		throw new Error(`Could not load scope ${scope}`);
	}

	let prevRuleStack: StateStack | null = null;

	return source.split(newlineRe).map<LineWithTokens>((line: string) => {
		const { tokens, ruleStack } = grammar.tokenizeLine(line, prevRuleStack);
		prevRuleStack = ruleStack;

		return {
			line,
			tokens,
		};
	});
}
