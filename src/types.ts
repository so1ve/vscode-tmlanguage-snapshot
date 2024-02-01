export interface GrammarSnapshotOptions {
	path: string;
	language?: string;
	scopeName: string;
	embeddedLanguages?: Record<string, string>;
	tokenTypes?: Record<string, string>;
	injectTo?: string[];
}

export interface Grammar {
	path: string;
}
