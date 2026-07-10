import { createRequire } from "node:module";
import { dirname, isAbsolute, resolve } from "node:path";

import { renderSnapshot } from "@vscode-tmlanguage-snapshot/core";

interface CapturedSyntaxToken {
  c: string;
  t: string;
}

interface VscodeApi {
  commands: {
    executeCommand: <T>(
      command: string,
      ...arguments_: unknown[]
    ) => PromiseLike<T | undefined>;
  };
  Uri: {
    file: (path: string) => unknown;
  };
  workspace: {
    fs: {
      readFile: (uri: unknown) => PromiseLike<Uint8Array>;
    };
  };
}

const captureSyntaxTokensCommand = "_workbench.captureSyntaxTokens";
const require = createRequire(import.meta.url);

/**
 * Create a snapshot function rooted at a VS Code extension manifest.
 *
 * VS Code itself discovers the manifest's grammar contributions when the
 * extension is loaded by the test host. The path is only used to resolve
 * relative fixture paths.
 */
export async function createGrammarSnapshot(packageJsonPath: string) {
  const rootDirectory = dirname(resolve(packageJsonPath));

  return (path: string) =>
    captureGrammarSnapshot(
      isAbsolute(path) ? path : resolve(rootDirectory, path),
    );
}

/**
 * Capture TextMate scopes from VS Code's active grammar service.
 *
 * This must run in a desktop VS Code extension test host. It intentionally uses
 * the same internal command as VS Code's own colorization tests because the
 * public extension API does not expose TextMate scope stacks.
 */
async function captureGrammarSnapshot(path: string) {
  const vscode = require("vscode") as VscodeApi;
  const resource = vscode.Uri.file(resolve(path));
  const source = new TextDecoder().decode(
    await vscode.workspace.fs.readFile(resource),
  );

  const capturedTokens = await vscode.commands.executeCommand<
    CapturedSyntaxToken[]
  >(captureSyntaxTokensCommand, resource);

  if (!Array.isArray(capturedTokens)) {
    throw new TypeError(
      `VS Code command "${captureSyntaxTokensCommand}" did not return syntax tokens. Ensure the file extension has a registered TextMate grammar.`,
    );
  }

  return renderSnapshot(
    source.replace(/\r(?!\n)/g, "\n"),
    capturedTokens.map(({ c: content, t: scopes }) => ({
      content,
      scopes: scopes.split(/\s+/).filter((scope) => scope.length > 0),
    })),
  );
}
