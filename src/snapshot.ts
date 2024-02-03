import type { IToken } from "vscode-textmate";

import type { LineWithTokens } from "./types";

export function renderSnapshotFromLineAndTokens(
	lineWithTokens: LineWithTokens[],
) {
	const lines: string[] = [];
	for (const { line, tokens } of lineWithTokens) {
		lines.push(`>${line}`, ...renderTokens(tokens));
	}

	return lines.join("\n");
}

function renderTokens(tokens: IToken[]) {
	const lines: string[] = [];

	for (const token of tokens) {
		let line = "#";
		line += " ".repeat(token.startIndex);
		line += "^".repeat(token.endIndex - token.startIndex);
		line += ` ${token.scopes.join(" ")}`;

		lines.push(line);
	}

	return lines;
}
