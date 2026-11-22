import React from "react";

// A small Markdown renderer for the editor preview. Headings, lists, inline code and fenced code,
// set in the app's own type scale and ramp.
export function parseMarkdown(text: string): React.ReactNode {
  if (!text) return <p className="text-sm text-muted">Nothing to preview yet</p>;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const paragraph = "my-2 text-sm leading-[22px] text-subtle";

  const processInlineCode = (line: string, index: number) => {
    if (!line.includes("`")) return <p key={index} className={paragraph}>{line}</p>;

    const parts = line.split("`");
    const cleanLine = parts.map((part, i) =>
      i % 2 === 1 ? (
        <code key={i} className="rounded bg-raised px-1.5 py-0.5 font-mono text-xs text-foreground">
          {part}
        </code>
      ) : (
        part
      )
    );
    return <p key={index} className={paragraph}>{cleanLine}</p>;
  };

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${index}`}
            className="my-4 overflow-x-auto rounded-lg border border-line bg-background p-4 font-mono text-xs leading-5 text-foreground"
          >
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
      }
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={index} className="mb-3 mt-6 border-b border-line pb-2 font-heading text-xl font-medium text-foreground first:mt-0">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={index} className="mb-2 mt-5 font-heading text-lg font-medium text-foreground first:mt-0">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={index} className="mb-2 mt-4 font-heading text-[15px] font-medium text-foreground first:mt-0">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={index} className="my-1 ml-5 list-disc text-sm leading-[22px] text-subtle marker:text-muted">
          {line.slice(2)}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={index} className="h-2" />);
    } else {
      elements.push(processInlineCode(line, index));
    }
  }

  return <div>{elements}</div>;
}
