import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { main } from '../src/cli.js';
import { createFixture, type Fixture } from './helpers/fixture.js';

vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => ({ unref: vi.fn() })),
}));

describe('CLI', () => {
  let fixture: Fixture | undefined;
  let outDir: string | undefined;

  afterEach(() => {
    fixture?.cleanup();
    fixture = undefined;
    if (outDir) {
      rmSync(outDir, { recursive: true, force: true });
      outDir = undefined;
    }
    vi.restoreAllMocks();
  });

  it('rejects an invalid path with a non-zero exit code and an error message', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitCode = main(['scan', '/definitely/does/not/exist']);

    expect(exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('does not exist'));
  });

  it('rejects an invocation missing the scan subcommand', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    fixture = createFixture({});

    expect(main([fixture.root])).toBe(1);
    expect(main([])).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('scan'));
  });

  it('names the current binary in the missing-subcommand usage error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(main([])).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('agenticgrade scan'));
  });

  it('defaults to the current working directory when no path is given', () => {
    fixture = createFixture({ 'README.md': '# hi' });
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(fixture.root);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const exitCode = main(['scan']);

    expect(exitCode).toBe(0);
    expect(logSpy).toHaveBeenCalledOnce();
    cwdSpy.mockRestore();
  });

  it('prints a human-readable report with providers, categories, and grade', () => {
    fixture = createFixture({ 'README.md': '# hi' });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const exitCode = main(['scan', fixture.root]);
    const output = logSpy.mock.calls[0][0] as string;

    expect(exitCode).toBe(0);
    expect(output).toContain('Detected providers: none');
    expect(output).toContain('No agentic provider detected');
    expect(output).toContain('Documentation:');
    expect(output).toContain('Overall:');
    expect(output).toContain('Grade:');
  });

  it('omits per-metric lines with --summary but keeps category headings', () => {
    fixture = createFixture({ 'README.md': '# hi' });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const exitCode = main(['scan', fixture.root, '--summary']);
    const output = logSpy.mock.calls[0][0] as string;

    expect(exitCode).toBe(0);
    expect(output).toContain('Documentation:');
    expect(output).not.toContain('README exists');
  });

  it('emits a single JSON document with --json and no other output', () => {
    fixture = createFixture({ 'AGENTS.md': '## Setup\nx\n## Conventions\nx\n## Testing\nx' });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const exitCode = main(['scan', fixture.root, '--json']);

    expect(exitCode).toBe(0);
    expect(logSpy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(parsed.providers).toEqual(['universal']);
    expect(parsed.overall.grade).toBeDefined();
    expect(Array.isArray(parsed.categories)).toBe(true);
    expect(Array.isArray(parsed.categories[0].metrics)).toBe(true);
  });

  it('trims per-category metrics from JSON output with --json --summary', () => {
    fixture = createFixture({ 'AGENTS.md': '## Setup\nx\n## Conventions\nx\n## Testing\nx' });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    main(['scan', fixture.root, '--json', '--summary']);
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);

    expect(parsed.categories[0].metrics).toBeUndefined();
    expect(parsed.categories[0].earned).toBeDefined();
    expect(parsed.categories[0].percentage).toBeDefined();
    expect(parsed.topImprovements).toBeDefined();
    expect(parsed.overall.grade).toBeDefined();
  });

  it('omits remediation from JSON metric results by default', () => {
    fixture = createFixture({ 'AGENTS.md': '## Setup\nx\n## Conventions\nx\n## Testing\nx' });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    main(['scan', fixture.root, '--json']);
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);

    expect(parsed.categories[0].metrics[0].remediation).toBeUndefined();
  });

  it('includes remediation in JSON metric results with --json --detailed', () => {
    fixture = createFixture({ 'AGENTS.md': '## Setup\nx\n## Conventions\nx\n## Testing\nx' });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    main(['scan', fixture.root, '--json', '--detailed']);
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);

    expect(typeof parsed.categories[0].metrics[0].remediation).toBe('string');
    expect(parsed.categories[0].metrics[0].remediation.length).toBeGreaterThan(0);
  });

  it('exits 0 even when the resulting grade is F', () => {
    fixture = createFixture({});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const exitCode = main(['scan', fixture.root]);

    expect(exitCode).toBe(0);
  });

  it('writes an HTML report to a temp file and attempts to open it when --html is used without --output', async () => {
    fixture = createFixture({ 'README.md': '# hi' });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { spawn } = await import('node:child_process');

    const exitCode = main(['scan', fixture.root, '--html']);

    expect(exitCode).toBe(0);
    expect(spawn).toHaveBeenCalled();
    const logged = logSpy.mock.calls.map((call) => call[0]).join('\n');
    expect(logged).toContain('Wrote HTML report to');
    const tempPathMatch = logged.match(/Wrote HTML report to (\S+)/);
    expect(tempPathMatch).not.toBeNull();
    const tempPath = tempPathMatch![1];
    expect(readFileSync(tempPath, 'utf8')).toContain('<!doctype html>');
  });

  it('writes an HTML report to the given --output path with a confirmation, without opening a browser', async () => {
    fixture = createFixture({ 'README.md': '# hi' });
    outDir = mkdtempSync(path.join(tmpdir(), 'agenticgrade-out-'));
    const outPath = path.join(outDir, 'report.html');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { spawn } = await import('node:child_process');

    const exitCode = main(['scan', fixture.root, '--html', '--output', outPath]);

    expect(exitCode).toBe(0);
    expect(spawn).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(outPath));
    expect(readFileSync(outPath, 'utf8')).toContain('<!doctype html>');
  });

  it('creates missing parent directories for --html --output', () => {
    fixture = createFixture({ 'README.md': '# hi' });
    outDir = mkdtempSync(path.join(tmpdir(), 'agenticgrade-out-'));
    const outPath = path.join(outDir, 'nested', 'deep', 'report.html');
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const exitCode = main(['scan', fixture.root, '--html', '--output', outPath]);

    expect(exitCode).toBe(0);
    expect(readFileSync(outPath, 'utf8')).toContain('<!doctype html>');
  });

  it('prefers --html over --json when both are passed, and --output writes the HTML', () => {
    fixture = createFixture({ 'README.md': '# hi' });
    outDir = mkdtempSync(path.join(tmpdir(), 'agenticgrade-out-'));
    const outPath = path.join(outDir, 'report.html');
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const exitCode = main(['scan', fixture.root, '--html', '--json', '--output', outPath]);

    expect(exitCode).toBe(0);
    expect(readFileSync(outPath, 'utf8')).toContain('<!doctype html>');
  });

  it('writes JSON to the given --output path with a confirmation, printing nothing else', () => {
    fixture = createFixture({ 'README.md': '# hi' });
    outDir = mkdtempSync(path.join(tmpdir(), 'agenticgrade-out-'));
    const outPath = path.join(outDir, 'report.json');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const exitCode = main(['scan', fixture.root, '--json', '--output', outPath]);

    expect(exitCode).toBe(0);
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(outPath));
    const parsed = JSON.parse(readFileSync(outPath, 'utf8'));
    expect(parsed.overall.grade).toBeDefined();
    expect(Array.isArray(parsed.categories)).toBe(true);
  });

  it('creates missing parent directories for --json --output', () => {
    fixture = createFixture({ 'README.md': '# hi' });
    outDir = mkdtempSync(path.join(tmpdir(), 'agenticgrade-out-'));
    const outPath = path.join(outDir, 'nested', 'deep', 'report.json');
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const exitCode = main(['scan', fixture.root, '--json', '--output', outPath]);

    expect(exitCode).toBe(0);
    expect(() => JSON.parse(readFileSync(outPath, 'utf8'))).not.toThrow();
  });

  it('ignores --output when neither --html nor --json is passed', () => {
    fixture = createFixture({ 'README.md': '# hi' });
    outDir = mkdtempSync(path.join(tmpdir(), 'agenticgrade-out-'));
    const outPath = path.join(outDir, 'report.txt');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const exitCodeWithOutput = main(['scan', fixture.root, '--output', outPath]);
    const outputWithFlag = logSpy.mock.calls[0][0] as string;
    logSpy.mockClear();
    const exitCodeWithoutOutput = main(['scan', fixture.root]);
    const outputWithoutFlag = logSpy.mock.calls[0][0] as string;

    expect(exitCodeWithOutput).toBe(0);
    expect(exitCodeWithoutOutput).toBe(0);
    expect(outputWithFlag).toBe(outputWithoutFlag);
  });

  it('exits non-zero when --html --output cannot be written', () => {
    fixture = createFixture({ 'README.md': '# hi' });
    outDir = mkdtempSync(path.join(tmpdir(), 'agenticgrade-out-'));
    const blockingFile = path.join(outDir, 'not-a-directory');
    writeFileSync(blockingFile, 'x');
    const outPath = path.join(blockingFile, 'report.html');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const exitCode = main(['scan', fixture.root, '--html', '--output', outPath]);

    expect(exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('failed to write'));
  });

  it('exits non-zero when --json --output cannot be written', () => {
    fixture = createFixture({ 'README.md': '# hi' });
    outDir = mkdtempSync(path.join(tmpdir(), 'agenticgrade-out-'));
    const blockingFile = path.join(outDir, 'not-a-directory');
    writeFileSync(blockingFile, 'x');
    const outPath = path.join(blockingFile, 'report.json');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const exitCode = main(['scan', fixture.root, '--json', '--output', outPath]);

    expect(exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('failed to write'));
  });

  it('excludes node_modules content from scoring signals', () => {
    fixture = createFixture({
      'node_modules/some-pkg/AGENTS.md': '## Setup\nx\n## Conventions\nx\n## Testing\nx',
    });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    main(['scan', fixture.root, '--json']);
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);

    expect(parsed.providers).toEqual(['none']);
  });
});
