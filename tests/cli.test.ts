import { describe, it, expect, afterEach, vi } from 'vitest';
import { main } from '../src/cli.js';
import { createFixture, type Fixture } from './helpers/fixture.js';

describe('CLI', () => {
  let fixture: Fixture | undefined;

  afterEach(() => {
    fixture?.cleanup();
    fixture = undefined;
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

  it('exits 0 even when the resulting grade is F', () => {
    fixture = createFixture({});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const exitCode = main(['scan', fixture.root]);

    expect(exitCode).toBe(0);
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
