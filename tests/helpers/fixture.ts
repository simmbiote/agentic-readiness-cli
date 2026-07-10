import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export interface Fixture {
  root: string;
  cleanup(): void;
}

/** Materializes a `{ relPath: content }` map into a real temp directory tree. */
export function createFixture(files: Record<string, string>): Fixture {
  const root = mkdtempSync(path.join(tmpdir(), 'agenticgrade-'));

  for (const [relPath, content] of Object.entries(files)) {
    const abs = path.join(root, relPath);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }

  return {
    root,
    cleanup() {
      rmSync(root, { recursive: true, force: true });
    },
  };
}
