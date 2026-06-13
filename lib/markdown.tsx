import React from "react";

export function parseMarkdown(text: string): React.ReactNode {
  if (!text) return <p className="text-base-content/30 italic text-sm">No instructions written yet.</p>;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const processInlineCode = (line: string, index: number) => {
    if (!line.includes("`")) return <p key={index} className="text-sm sm:text-base text-base-content/80 leading-relaxed my-2">{line}</p>;
    
    const parts = line.split("`");
    const cleanLine = parts.map((part, i) => 
      i % 2 === 1 
        ? <code key={i} className="bg-base-300 px-1.5 py-0.5 rounded font-mono text-xs text-primary">{part}</code> 
        : part
    );
    return <p key={index} className="text-sm sm:text-base text-base-content/80 leading-relaxed my-2">{cleanLine}</p>;
  };

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${index}`} className="bg-base-350 bg-opacity-40 p-4 rounded-xl border border-base-200/50 my-4 overflow-x-auto font-mono text-xs text-base-content/90 leading-relaxed">
            <pre><code>{codeLines.join("\n")}</code></pre>
          </div>
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
      elements.push(<h1 key={index} className="text-2xl sm:text-3xl font-black text-base-content/95 mt-6 mb-3 border-b border-base-200/40 pb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={index} className="text-xl sm:text-2xl font-bold text-base-content/90 mt-5 mb-2.5">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={index} className="text-lg sm:text-xl font-bold text-base-content/85 mt-4 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(<li key={index} className="ml-4 list-disc text-sm sm:text-base text-base-content/85 my-1">{line.slice(2)}</li>);
    } else if (line.trim() === "") {
      elements.push(<div key={index} className="h-2.5" />);
    } else {
      elements.push(processInlineCode(line, index));
    }
  }

  return <div className="space-y-1">{elements}</div>;
}
