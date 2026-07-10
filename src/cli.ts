#!/usr/bin/env node
import { existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { runScan } from './index.js';
import { renderReport } from './report.js';
import { renderHtmlReport } from './html-report.js';

interface ParsedArgs {
  targetPath: string;
  json: boolean;
  summary: boolean;
  detailed: boolean;
  html: boolean;
  output: string | undefined;
}

export function parseArgs(argv: string[]): ParsedArgs {
  let targetPath = process.cwd();
  let json = false;
  let summary = false;
  let detailed = false;
  let html = false;
  let output: string | undefined;
  let pathGiven = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      json = true;
    } else if (arg === '--summary') {
      summary = true;
    } else if (arg === '--detailed') {
      detailed = true;
    } else if (arg === '--html') {
      html = true;
    } else if (arg === '--output') {
      output = argv[++i];
    } else if (!pathGiven) {
      targetPath = arg;
      pathGiven = true;
    }
  }

  return { targetPath, json, summary, detailed, html, output };
}

function writeOutputFile(targetPath: string, content: string, label: string): number {
  const resolved = path.resolve(targetPath);
  try {
    mkdirSync(path.dirname(resolved), { recursive: true });
    writeFileSync(resolved, content);
  } catch (err) {
    console.error(
      `Error: failed to write ${label} report to ${targetPath}: ${(err as Error).message}`,
    );
    return 1;
  }
  console.log(`Wrote ${label} report to ${resolved}`);
  return 0;
}

function openInBrowser(filePath: string): void {
  try {
    if (process.platform === 'darwin') {
      spawn('open', [filePath], { detached: true, stdio: 'ignore' }).unref();
    } else if (process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', '""', filePath], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('xdg-open', [filePath], { detached: true, stdio: 'ignore' }).unref();
    }
  } catch {
    // best effort; the file path was already printed for manual opening
  }
}

export function main(argv: string[]): number {
  if (argv[0] !== 'scan') {
    console.error(
      'Error: missing required "scan" subcommand. Usage: agenticgrade scan [path] [--json] [--summary] [--detailed] [--html] [--output <path>]',
    );
    return 1;
  }

  const { targetPath, json, summary, detailed, html, output } = parseArgs(argv.slice(1));
  const resolved = path.resolve(targetPath);

  if (!existsSync(resolved) || !statSync(resolved).isDirectory()) {
    console.error(`Error: path does not exist or is not a directory: ${targetPath}`);
    return 1;
  }

  const result = runScan(resolved);

  if (html) {
    const htmlContent = renderHtmlReport(result, { summary, detailed });
    if (output) {
      return writeOutputFile(output, htmlContent, 'HTML');
    }
    const tempPath = path.join(os.tmpdir(), `agenticgrade-report-${Date.now()}.html`);
    writeFileSync(tempPath, htmlContent);
    console.log(`Wrote HTML report to ${tempPath}`);
    openInBrowser(tempPath);
    return 0;
  }

  if (json) {
    let jsonOutput: unknown = result;
    if (summary) {
      jsonOutput = {
        ...result,
        categories: result.categories.map(({ metrics: _metrics, ...rest }) => rest),
      };
    } else if (!detailed) {
      jsonOutput = {
        ...result,
        categories: result.categories.map((c) => ({
          ...c,
          metrics: c.metrics.map(({ remediation: _remediation, ...rest }) => rest),
        })),
      };
    }
    const jsonContent = JSON.stringify(jsonOutput, null, 2);
    if (output) {
      return writeOutputFile(output, jsonContent, 'JSON');
    }
    console.log(jsonContent);
    return 0;
  }

  console.log(renderReport(result, { summary, detailed }));
  return 0;
}

const isMainModule = process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href;
if (isMainModule) {
  process.exit(main(process.argv.slice(2)));
}
