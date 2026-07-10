import type { SnapshotTokenSegment } from "@vscode-tmlanguage-snapshot/core";
import type { Registry, StateStack } from "vscode-textmate";

const newlineRe = /\r?\n/;

export async function getTokenSegments(
  registry: Registry,
  scope: string,
  source: string,
) {
  const grammar = await registry.loadGrammar(scope);

  if (!grammar) {
    throw new Error(`Could not load scope ${scope}`);
  }

  let previousRuleStack: StateStack | null = null;
  const segments: SnapshotTokenSegment[] = [];

  for (const line of source.split(newlineRe)) {
    const { tokens, ruleStack } = grammar.tokenizeLine(line, previousRuleStack);
    previousRuleStack = ruleStack;

    for (const [tokenIndex, token] of tokens.entries()) {
      const hasVirtualEndOfLine =
        tokenIndex === tokens.length - 1 && token.endIndex === line.length + 1;
      const endIndex = hasVirtualEndOfLine ? line.length : token.endIndex;

      if (token.startIndex < endIndex || hasVirtualEndOfLine) {
        segments.push({
          content: line.slice(token.startIndex, endIndex),
          includesVirtualEndOfLine: hasVirtualEndOfLine,
          scopes: token.scopes,
        });
      }
    }
  }

  return segments;
}
