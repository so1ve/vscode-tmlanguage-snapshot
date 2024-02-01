import * as tm from "vscode-textmate";

export function createTextmateRegistry(
	grammars: { grammar: any; content: string }[],
	onigurumaLib: Promise<tm.IOnigLib>,
) {
	const grammarMap = new Map<string, tm.IRawGrammar>();
	const injectionMap = new Map<string, string[]>();

	for (const g of grammars) {
		const { grammar, content } = g;
		const rawGrammar = tm.parseRawGrammar(content, grammar.path);

		grammarMap.set(grammar.scope || rawGrammar.scope, rawGrammar);

		if (grammar.injectTo) {
			for (const injectScope of grammar.injectTo) {
				let injections = injectionMap.get(injectScope);
				if (!injections) {
					injectionMap.set(injectScope, (injections = []));
				}
				injections.push(grammar.scope);
			}
		}
	}

	return new tm.Registry({
		onigLib: onigurumaLib,
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
	} as tm.RegistryOptions);
}
