// The Convex modules that convex-test loads. The Convex CLI skips files with more than one
// dot in the name (this one and *.test.ts), so none of this is ever deployed.

declare global {
  // Provided by Vite while Vitest runs
  interface ImportMeta {
    glob(patterns: string | string[]): Record<string, () => Promise<unknown>>;
  }
}

// Every module, minus multi-dot files (.d.ts, tests, this file): the same set the CLI deploys
export const modules = import.meta.glob(["./**/*.*s", "!./**/*.*.*s"]);
