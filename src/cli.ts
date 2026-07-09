#!/usr/bin/env node
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { runScan } from './index.js';
import { renderReport } from './report.js';

interface ParsedArgs {
  targetPath: string;
  json: boolean;
  summary: boolean;
}

export function parseArgs(argv: string[]): ParsedArgs {
  let targetPath = process.cwd();
  let json = false;
  let summary = false;
  let pathGiven = false;

  for (const arg of argv) {
    if (arg === '--json') {
      json = true;
    } else if (arg === '--summary') {
      summary = true;
    } else if (!pathGiven) {
      targetPath = arg;
      pathGiven = true;
    }
  }

  return { targetPath, json, summary };
}

export function main(argv: string[]): number {
  if (argv[0] !== 'scan') {
    console.error(
      'Error: missing required "scan" subcommand. Usage: agentlint scan [path] [--json] [--summary]',
    );
    return 1;
  }

  const { targetPath, json, summary } = parseArgs(argv.slice(1));
  const resolved = path.resolve(targetPath);

  if (!existsSync(resolved) || !statSync(resolved).isDirectory()) {
    console.error(`Error: path does not exist or is not a directory: ${targetPath}`);
    return 1;
  }

  const result = runScan(resolved);
  if (json) {
    const output = summary
      ? { ...result, categories: result.categories.map(({ metrics: _metrics, ...rest }) => rest) }
      : result;
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log(renderReport(result, { summary }));
  }
  return 0;
}

const isMainModule = process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href;
if (isMainModule) {
  process.exit(main(process.argv.slice(2)));
}
