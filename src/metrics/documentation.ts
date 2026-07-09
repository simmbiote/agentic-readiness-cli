import type { Metric } from './types.js';
import { adrDir, adrIndexExists, hasHeadingMatching, hasPrTemplate, specsDir } from './helpers.js';

export const documentationMetrics: Metric[] = [
  {
    id: 'documentation.readme-exists',
    category: 'documentation',
    description: 'README exists',
    instruction: 'Add a README.md file',
    remediation:
      'A README is the first thing contributors and AI agents read. Add a README.md at the repo root describing what the project does and how to get started.',
    points: 10,
    check: (ctx) => ctx.hasFile('README.md', 'README'),
  },
  {
    id: 'documentation.readme-sections',
    category: 'documentation',
    description: 'README has setup/run/test sections',
    instruction: 'Add Setup, Usage, and Testing sections to the README',
    remediation:
      "Agents need to know how to set up, run, and test the project without guessing. Add headings covering Setup/Install, Run/Usage, and Testing to your README.",
    points: 15,
    check: (ctx) => {
      const content = ctx.readAny(['README.md', 'README']);
      if (!content) return false;
      return (
        hasHeadingMatching(content, ['setup', 'install']) &&
        hasHeadingMatching(content, ['run', 'usage']) &&
        hasHeadingMatching(content, ['test'])
      );
    },
  },
  {
    id: 'documentation.contributing-exists',
    category: 'documentation',
    description: 'CONTRIBUTING.md exists',
    instruction: 'Add a CONTRIBUTING.md file',
    remediation:
      'Contribution guidelines set expectations for PRs, coding standards, and review process. Add a CONTRIBUTING.md describing how to propose changes.',
    points: 10,
    check: (ctx) => ctx.hasFile('CONTRIBUTING.md'),
  },
  {
    id: 'documentation.docs-specs-exists',
    category: 'documentation',
    description: 'docs/specs/ exists',
    instruction: 'Create a docs/specs/ directory',
    remediation:
      'A docs/specs/ directory gives agents a place to find current feature and requirement specifications. Create the directory and start adding specs as you build features.',
    points: 10,
    check: (ctx) => specsDir(ctx) !== null,
  },
  {
    id: 'documentation.docs-plans-exists',
    category: 'documentation',
    description: 'docs/plans/ exists',
    instruction: 'Create a docs/plans/ directory',
    remediation:
      "A docs/plans/ directory records planned or in-progress work so agents don't duplicate effort. Create the directory and add planning docs for active initiatives.",
    points: 10,
    check: (ctx) => ctx.hasPath('docs/plans'),
  },
  {
    id: 'documentation.docs-research-exists',
    category: 'documentation',
    description: 'docs/research/ exists',
    instruction: 'Create a docs/research/ directory',
    remediation:
      'A docs/research/ directory preserves investigation notes and decisions that informed the current design. Create the directory and capture research findings there.',
    points: 10,
    check: (ctx) => ctx.hasPath('docs/research'),
  },
  {
    id: 'documentation.docs-adr-exists',
    category: 'documentation',
    description: 'docs/adr/ exists',
    instruction: 'Create a docs/adr/ directory for architecture decision records',
    remediation:
      'Architecture Decision Records explain why past choices were made, preventing agents from re-litigating settled decisions. Create a docs/adr/ directory to hold them.',
    points: 10,
    check: (ctx) => adrDir(ctx) !== null,
  },
  {
    id: 'documentation.adr-index-exists',
    category: 'documentation',
    description: 'ADR index exists',
    instruction: 'Add an ADR index',
    remediation:
      'An index makes ADRs discoverable instead of requiring a directory listing. Add an index file (e.g. docs/adr/README.md) listing all ADRs with short summaries.',
    points: 10,
    check: (ctx) => adrIndexExists(ctx),
  },
  {
    id: 'documentation.pr-template-exists',
    category: 'documentation',
    description: 'PR template exists',
    instruction: 'Add a pull request template',
    remediation:
      'A PR template ensures every change includes the context reviewers (human or agent) need. Add a pull request template under .github/.',
    points: 10,
    check: (ctx) => hasPrTemplate(ctx),
  },
  {
    id: 'documentation.spec-adr-templates-exist',
    category: 'documentation',
    description: 'Spec/ADR templates exist',
    instruction: 'Add spec/ADR template files',
    remediation:
      'Templates keep new specs and ADRs consistent in structure. Add template files under docs/specs/ and docs/adr/ (e.g. TEMPLATE.md).',
    points: 5,
    check: (ctx) =>
      ctx.files.some((f) => /^docs\/(adr|specs)\/(_?template|TEMPLATE)\.md$/i.test(f)),
  },
];
