export interface SnapshotTokenSegment {
  /**
   * Source text covered by this token, excluding LF and CRLF line endings.
   */
  content: string;
  /**
   * Preserve the extra end-of-line column emitted by `vscode-textmate`.
   */
  includesVirtualEndOfLine?: boolean;
  /**
   * TextMate scope stack from outermost to innermost.
   */
  scopes: readonly string[];
}

const newlineRe = /\r?\n/;

const renderToken = (
  startIndex: number,
  endIndex: number,
  scopes: readonly string[],
) =>
  `#${" ".repeat(startIndex)}${"^".repeat(endIndex - startIndex)} ${scopes.join(" ")}`;

const invalidTokenStream = (line: number, character: number) =>
  new TypeError(
    `Snapshot token stream does not match the source at ${line}:${character + 1}.`,
  );

/**
 * Render a snapshot from source text and its sequential TextMate tokens.
 *
 * Segments must cover every UTF-16 code unit except LF and CRLF line endings,
 * in source order. A lone carriage return remains source content for legacy
 * compatibility. A final segment may preserve TextMate's virtual end-of-line
 * column through `includesVirtualEndOfLine`.
 *
 * @throws {TypeError} When the token stream does not exactly match the source.
 */
export function renderSnapshot(
  source: string,
  segments: readonly SnapshotTokenSegment[],
) {
  const sourceLines = source.split(newlineRe);
  const snapshotLines: string[] = [];
  let segmentIndex = 0;

  for (const [lineIndex, sourceLine] of sourceLines.entries()) {
    snapshotLines.push(`>${sourceLine}`);

    let startIndex = 0;
    while (startIndex < sourceLine.length) {
      const segment = segments[segmentIndex++];
      if (!segment || segment.content.length === 0) {
        throw invalidTokenStream(lineIndex + 1, startIndex);
      }

      const sourceEndIndex = startIndex + segment.content.length;
      if (
        sourceLine.slice(startIndex, sourceEndIndex) !== segment.content ||
        (segment.includesVirtualEndOfLine &&
          sourceEndIndex !== sourceLine.length)
      ) {
        throw invalidTokenStream(lineIndex + 1, startIndex);
      }

      const markerEndIndex =
        sourceEndIndex + (segment.includesVirtualEndOfLine ? 1 : 0);
      snapshotLines.push(
        renderToken(startIndex, markerEndIndex, segment.scopes),
      );
      startIndex = sourceEndIndex;
    }

    if (sourceLine.length === 0) {
      const segment = segments[segmentIndex];
      if (segment?.content === "" && segment.includesVirtualEndOfLine) {
        segmentIndex++;
        snapshotLines.push(renderToken(0, 1, segment.scopes));
      }
    }
  }

  if (segmentIndex !== segments.length) {
    throw invalidTokenStream(
      sourceLines.length,
      sourceLines[sourceLines.length - 1].length,
    );
  }

  return snapshotLines.join("\n");
}
