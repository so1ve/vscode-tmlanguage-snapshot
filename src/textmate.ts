import type { IOnigLib, IRawGrammar } from "vscode-textmate";
import { Registry, parseRawGrammar } from "vscode-textmate";

import type { Grammar } from "./types";

export function createTextmateRegistry(
	grammars: { grammar: Grammar; content: string }[],
	onigLib: Promise<IOnigLib>,
) {
	const grammarMap = new Map<string, IRawGrammar>();
	const injectionMap = new Map<string, string[]>();

	for (const { grammar, content } of grammars) {
		const rawGrammar = parseRawGrammar(content, grammar.path);

		grammarMap.set(grammar.scopeName || rawGrammar.scopeName, rawGrammar);

		if (grammar.injectTo) {
			for (const injectScope of grammar.injectTo) {
				let injections = injectionMap.get(injectScope);
				if (!injections) {
					injectionMap.set(injectScope, (injections = []));
				}
				injections.push(grammar.scopeName);
			}
		}
	}

	return new Registry({
		onigLib,
		async loadGrammar(scope) {
			if (grammarMap.has(scope)) {
				return grammarMap.get(scope);
			}

			// console.warn(`grammar not found for "${scopeName}"`);
			return null;
		},
		getInjections(scope) {
			const splittedScope = scope.split(".");
			const injections: string[] = [];

			for (let i = 1; i <= splittedScope.length; i++) {
				const subScopeName = splittedScope.slice(0, i).join(".");
				injections.push(...(injectionMap.get(subScopeName) ?? []));
			}

			return injections;
		},
	});
}
