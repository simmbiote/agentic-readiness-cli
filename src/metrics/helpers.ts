import type { ScanContext } from '../context.js';

export const SOURCE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.py',
  '.go',
  '.rb',
  '.java',
  '.kt',
  '.rs',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.cs',
  '.php',
];

export const SOURCE_ROOT_CANDIDATES = [
  'src',
  'app',
  'services',
  'packages',
  'cmd',
  'internal',
  'pkg',
];

export const LARGE_FILE_LINE_THRESHOLD = 800;
export const TODO_DENSITY_THRESHOLD = 0.005;
export const CONVENTIONAL_COMMIT_RATIO_THRESHOLD = 0.7;
export const CONVENTIONAL_COMMIT_SAMPLE_SIZE = 20;
export const DOCS_FRESHNESS_DAYS = 90;

export function isSourceFile(relPath: string): boolean {
  return SOURCE_EXTENSIONS.some((ext) => relPath.endsWith(ext));
}

export function sourceFiles(ctx: ScanContext, prefix?: string): string[] {
  return ctx.files.filter((f) => {
    if (!isSourceFile(f)) return false;
    if (!prefix) return true;
    return f === prefix || f.startsWith(`${prefix}/`);
  });
}

export function findSourceRoot(ctx: ScanContext): string | null {
  return SOURCE_ROOT_CANDIDATES.find((candidate) => ctx.hasPath(candidate)) ?? null;
}

export function countLines(content: string): number {
  if (content.length === 0) return 0;
  return content.split('\n').length;
}

export function hasHeadingMatching(content: string, terms: string[]): boolean {
  const headingLines = content.split('\n').filter((line) => /^#{1,6}\s+/.test(line));
  const lowerTerms = terms.map((t) => t.toLowerCase());
  return headingLines.some((line) => {
    const lower = line.toLowerCase();
    return lowerTerms.some((term) => lower.includes(term));
  });
}

export function mentionsAny(content: string, terms: string[]): boolean {
  const lower = content.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

export function anySourceFileExceedsLines(
  ctx: ScanContext,
  thresholdLines: number,
  prefix?: string,
): boolean {
  return sourceFiles(ctx, prefix).some((f) => {
    const content = ctx.read(f);
    return content !== null && countLines(content) > thresholdLines;
  });
}

export function moduleBoundariesDetectable(ctx: ScanContext, sourceRoot: string): boolean {
  const subdirs = new Set<string>();
  for (const f of ctx.files) {
    const prefix = `${sourceRoot}/`;
    if (!f.startsWith(prefix)) continue;
    const rest = f.slice(prefix.length);
    const firstSegment = rest.split('/')[0];
    if (firstSegment && rest.includes('/')) subdirs.add(firstSegment);
  }
  return subdirs.size >= 2;
}

export function todoFixmeDensity(ctx: ScanContext): number {
  let totalLines = 0;
  let totalMarkers = 0;
  const markerPattern = /\b(TODO|FIXME)\b/g;

  for (const f of sourceFiles(ctx)) {
    const content = ctx.read(f);
    if (content === null) continue;
    totalLines += countLines(content);
    totalMarkers += (content.match(markerPattern) ?? []).length;
  }

  if (totalLines === 0) return 0;
  return totalMarkers / totalLines;
}

const CONVENTIONAL_COMMIT_PATTERN = /^[a-z]+(\([\w.\-/ ]+\))?!?:\s.+/i;

export function conventionalCommitRatio(subjects: string[]): number {
  if (subjects.length === 0) return 0;
  const matches = subjects.filter((s) => CONVENTIONAL_COMMIT_PATTERN.test(s)).length;
  return matches / subjects.length;
}

export function isDocPath(relPath: string): boolean {
  return relPath === 'README.md' || relPath === 'README' || relPath.startsWith('docs/');
}

export function docsUpdatedWithinDays(ctx: ScanContext, days: number): boolean {
  const docPaths = ctx.files.filter(isDocPath);
  const cutoffSeconds = Date.now() / 1000 - days * 24 * 60 * 60;
  return docPaths.some((p) => {
    const ts = ctx.lastCommitTimestamp(p);
    return ts !== null && ts >= cutoffSeconds;
  });
}

const CI_WORKFLOW_PATTERN = /^\.github\/workflows\/.*\.ya?ml$/;

export function ciWorkflowFiles(ctx: ScanContext): string[] {
  const gha = ctx.findFiles(CI_WORKFLOW_PATTERN);
  const gitlab = ctx.hasFile('.gitlab-ci.yml') ? ['.gitlab-ci.yml'] : [];
  return [...gha, ...gitlab];
}

export function hasCiWorkflow(ctx: ScanContext): boolean {
  return ciWorkflowFiles(ctx).length > 0;
}

export function ciWorkflowContent(ctx: ScanContext): string {
  return ciWorkflowFiles(ctx)
    .map((f) => ctx.read(f) ?? '')
    .join('\n');
}

export function ciMentionsAny(ctx: ScanContext, terms: string[]): boolean {
  return mentionsAny(ciWorkflowContent(ctx), terms);
}

export function hasGeneratedFilesMixedWithSource(ctx: ScanContext, sourceRoot: string): boolean {
  const generatedMarkers = ['dist', 'build', 'generated', '.next', 'out'];
  return ctx.files.some((f) => {
    if (!f.startsWith(`${sourceRoot}/`)) return false;
    const segments = f.split('/');
    return segments.some((seg) => generatedMarkers.includes(seg));
  });
}

export function readJsonSafe(ctx: ScanContext, relPath: string): Record<string, unknown> | null {
  const content = ctx.read(relPath);
  if (content === null) return null;
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function packageJsonScripts(ctx: ScanContext): Record<string, string> {
  const pkg = readJsonSafe(ctx, 'package.json');
  const scripts = pkg?.scripts;
  return scripts && typeof scripts === 'object' ? (scripts as Record<string, string>) : {};
}

export interface DetectedCommand {
  command: string;
  source: string;
}

export function detectTestCommand(ctx: ScanContext): DetectedCommand | null {
  const scripts = packageJsonScripts(ctx);
  if (scripts.test) return { command: scripts.test, source: 'package.json' };

  const makefile = ctx.readAny(['Makefile', 'makefile']);
  if (makefile && /^test:/m.test(makefile)) return { command: 'make test', source: 'Makefile' };

  if (ctx.hasFile('go.mod')) return { command: 'go test ./...', source: 'go.mod' };
  if (ctx.hasFile('pom.xml')) return { command: 'mvn test', source: 'pom.xml' };
  if (ctx.hasFile('build.gradle', 'build.gradle.kts')) {
    return { command: 'gradle test', source: 'build.gradle' };
  }
  if (ctx.hasFile('pytest.ini', 'setup.cfg', 'pyproject.toml') || ctx.hasPath('tests')) {
    return { command: 'pytest', source: 'pytest config' };
  }
  return null;
}

export function testCommandDocumented(ctx: ScanContext, command: string | undefined): boolean {
  if (!command) return false;
  const content = ctx.readAny(['README.md', 'README', 'CONTRIBUTING.md']);
  if (!content) return false;
  const codeBlocks = content.match(/```[\s\S]*?```|`[^`]+`/g) ?? [];
  return codeBlocks.some((block) => block.includes(command));
}

export function hasTestFiles(ctx: ScanContext): boolean {
  if (['test', 'tests', 'spec', '__tests__'].some((d) => ctx.hasPath(d))) return true;
  return ctx.files.some(
    (f) => /\.(test|spec)\.[jt]sx?$/.test(f) || /_test\.go$/.test(f) || /_spec\.rb$/.test(f),
  );
}

export function hasCoverageConfig(ctx: ScanContext): boolean {
  if (
    ctx.hasFile(
      '.nycrc',
      '.nycrc.json',
      '.coveragerc',
      'coverage.xml',
      'codecov.yml',
      '.codecov.yml',
    )
  ) {
    return true;
  }
  const pkg = readJsonSafe(ctx, 'package.json');
  if (pkg?.jest && typeof pkg.jest === 'object' && 'coverageThreshold' in pkg.jest) return true;
  const jestConfig = ctx.readAny(['jest.config.js', 'jest.config.ts', 'jest.config.mjs']);
  return jestConfig !== null && jestConfig.includes('coverageThreshold');
}

export function hasUnitIntegrationStructure(ctx: ScanContext): boolean {
  const hasSeparateDirs = ctx.hasPath('tests/unit') || ctx.hasPath('test/unit');
  const hasSeparateIntegrationDirs =
    ctx.hasPath('tests/integration') || ctx.hasPath('test/integration');
  if (hasSeparateDirs && hasSeparateIntegrationDirs) return true;
  const hasUnitNaming = ctx.files.some((f) => /\.unit\.(test|spec)\./.test(f));
  const hasIntegrationNaming = ctx.files.some((f) => /\.integration\.(test|spec)\./.test(f));
  return hasUnitNaming && hasIntegrationNaming;
}

function repoSettingsContent(ctx: ScanContext): string {
  const settings = ctx.readAny(['.github/settings.yml']) ?? '';
  const contributing = ctx.readAny(['CONTRIBUTING.md']) ?? '';
  return `${settings}\n${contributing}`;
}

export function testsAreRequiredCheck(ctx: ScanContext): boolean {
  return (
    mentionsAny(repoSettingsContent(ctx), ['required status check', 'required check']) &&
    mentionsAny(repoSettingsContent(ctx), ['test'])
  );
}

export function requiredChecksHintDetected(ctx: ScanContext): boolean {
  return mentionsAny(repoSettingsContent(ctx), [
    'required status check',
    'required check',
    'branch protection',
  ]);
}

const LINT_CONFIG_FILES = [
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.json',
  '.eslintrc.cjs',
  'eslint.config.js',
  'eslint.config.mjs',
  '.rubocop.yml',
  '.flake8',
  'ruff.toml',
  '.golangci.yml',
  '.golangci.yaml',
];

export function hasLintCommand(ctx: ScanContext): boolean {
  if (LINT_CONFIG_FILES.some((f) => ctx.hasFile(f))) return true;
  return Boolean(packageJsonScripts(ctx).lint);
}

export function hasFormatCommand(ctx: ScanContext): boolean {
  if (ctx.hasFile('.prettierrc', '.prettierrc.json', '.prettierrc.js', '.prettierrc.yaml'))
    return true;
  if (Boolean(packageJsonScripts(ctx).format)) return true;
  const pyproject = ctx.read('pyproject.toml');
  if (pyproject && mentionsAny(pyproject, ['[tool.black]', '[tool.ruff.format]'])) return true;
  return ctx.hasFile('.rustfmt.toml', 'rustfmt.toml');
}

export function hasTypecheckOrStaticAnalysis(ctx: ScanContext): boolean {
  if (Boolean(packageJsonScripts(ctx).typecheck)) return true;
  const tsconfig = readJsonSafe(ctx, 'tsconfig.json');
  if (tsconfig?.compilerOptions && typeof tsconfig.compilerOptions === 'object') {
    if ('strict' in (tsconfig.compilerOptions as Record<string, unknown>)) return true;
  }
  return ctx.hasFile('mypy.ini', 'sorbet/config', '.flowconfig');
}

export function hasSecurityScan(ctx: ScanContext): boolean {
  if (ctx.hasFile('.github/dependabot.yml', 'renovate.json', '.renovaterc.json')) return true;
  return ciMentionsAny(ctx, ['npm audit', 'pip-audit', 'snyk', 'trivy', 'codeql']);
}

export function hasConventionalCommitConfig(ctx: ScanContext): boolean {
  return ctx.hasFile(
    '.commitlintrc',
    '.commitlintrc.json',
    '.commitlintrc.js',
    'commitlint.config.js',
    'commitlint.config.cjs',
  );
}

export function aiContextContent(ctx: ScanContext): string {
  return `${ctx.read('AGENTS.md') ?? ''}\n${ctx.read('CLAUDE.md') ?? ''}`;
}

export function claudeShimOrImportExists(ctx: ScanContext): boolean {
  if (ctx.hasFile('CLAUDE.md')) return true;
  const agents = ctx.read('AGENTS.md');
  return agents !== null && agents.includes('CLAUDE.md');
}

export function agentIgnoreExists(ctx: ScanContext): boolean {
  if (ctx.hasFile('.agentignore')) return true;
  return mentionsAny(aiContextContent(ctx), [
    'must not modify',
    'do not modify',
    'agents must not',
  ]);
}

export function claudeHooksConfigured(ctx: ScanContext): boolean {
  for (const path of ['.claude/settings.json', '.claude/settings.local.json']) {
    const settings = readJsonSafe(ctx, path);
    if (
      settings?.hooks &&
      typeof settings.hooks === 'object' &&
      Object.keys(settings.hooks).length > 0
    ) {
      return true;
    }
  }
  return false;
}

const PR_TEMPLATE_PATTERN =
  /^\.github\/(pull_request_template\.md|PULL_REQUEST_TEMPLATE\.md|PULL_REQUEST_TEMPLATE\/.+\.md)$/i;

export function prTemplateFile(ctx: ScanContext): string | null {
  return ctx.files.find((f) => PR_TEMPLATE_PATTERN.test(f)) ?? null;
}

export function hasPrTemplate(ctx: ScanContext): boolean {
  return prTemplateFile(ctx) !== null;
}

export function prTemplateContent(ctx: ScanContext): string | null {
  const f = prTemplateFile(ctx);
  return f ? ctx.read(f) : null;
}

export function adrDir(ctx: ScanContext): string | null {
  return ctx.hasPath('docs/adr') ? 'docs/adr' : null;
}

export function specsDir(ctx: ScanContext): string | null {
  if (ctx.hasPath('docs/specs')) return 'docs/specs';
  if (ctx.providers.has('openspec') && ctx.hasPath('openspec/specs')) return 'openspec/specs';
  return null;
}

export function adrIndexExists(ctx: ScanContext): boolean {
  const dir = adrDir(ctx);
  if (!dir) return false;
  return ctx.files.some(
    (f) =>
      f.startsWith(`${dir}/`) &&
      /^(README\.md|index\.md|0000[-_].*\.md)$/i.test(f.slice(dir.length + 1)),
  );
}

export function adrFilesExist(ctx: ScanContext): boolean {
  const dir = adrDir(ctx);
  if (!dir) return false;
  return ctx.files.some(
    (f) => f.startsWith(`${dir}/`) && /^(\d{4}[-_]|adr[-_]?\d+)/i.test(f.slice(dir.length + 1)),
  );
}
