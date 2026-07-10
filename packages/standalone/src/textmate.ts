import type { IOnigLib, IRawGrammar } from "vscode-textmate";
import * as _textmate from "vscode-textmate";

export interface GrammarContribution {
  path: string;
  language?: string;
  scopeName: string;
  injectTo?: string[];
}

const textmate: typeof _textmate = (_textmate as any).default
  ? (_textmate as any).default
  : _textmate;

export function createTextmateRegistry(
  grammars: { grammar: GrammarContribution; content: string }[],
  onigLib: Promise<IOnigLib>,
) {
  const grammarMap = new Map<string, IRawGrammar>();
  const injectionMap = new Map<string, string[]>();

  for (const { grammar, content } of grammars) {
    const rawGrammar = textmate.parseRawGrammar(content, grammar.path);

    grammarMap.set(grammar.scopeName || rawGrammar.scopeName, rawGrammar);

    for (const injectScope of grammar.injectTo ?? []) {
      const injections = injectionMap.get(injectScope) ?? [];
      injections.push(grammar.scopeName);
      injectionMap.set(injectScope, injections);
    }
  }

  return new textmate.Registry({
    onigLib,
    async loadGrammar(scope) {
      return grammarMap.get(scope) ?? null;
    },
    getInjections(scope) {
      const scopeParts = scope.split(".");
      const injections: string[] = [];

      for (let index = 1; index <= scopeParts.length; index++) {
        const parentScope = scopeParts.slice(0, index).join(".");
        injections.push(...(injectionMap.get(parentScope) ?? []));
      }

      return injections;
    },
  });
}
