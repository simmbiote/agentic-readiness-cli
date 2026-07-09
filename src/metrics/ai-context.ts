import type { Metric } from './types.js';
import {
  agentIgnoreExists,
  aiContextContent,
  claudeShimOrImportExists,
  mentionsAny,
  specsDir,
} from './helpers.js';

export const aiContextMetrics: Metric[] = [
  {
    id: 'ai-context.agents-md-exists',
    category: 'ai-context',
    description: 'AGENTS.md exists',
    instruction: 'Add an AGENTS.md file',
    remediation:
      'AGENTS.md is the canonical entry point AI agents look for. Add an AGENTS.md describing how to work in this repo.',
    points: 20,
    check: (ctx) => ctx.hasFile('AGENTS.md'),
  },
  {
    id: 'ai-context.claude-shim-import-exists',
    category: 'ai-context',
    description: 'CLAUDE.md shim/import exists',
    instruction: 'Add a CLAUDE.md shim that imports AGENTS.md',
    remediation:
      "Claude-specific tooling looks for CLAUDE.md; without a shim it won't find your AGENTS.md content. Add a CLAUDE.md that imports or references AGENTS.md.",
    points: 15,
    check: (ctx) => claudeShimOrImportExists(ctx),
  },
  {
    id: 'ai-context.covers-testing',
    category: 'ai-context',
    description: 'agent file covers testing',
    instruction: 'Document testing conventions in your agent file',
    remediation:
      'Agents need to know how you expect tests to be written and run. Add a Testing section to your agent file describing conventions.',
    points: 10,
    check: (ctx) => mentionsAny(aiContextContent(ctx), ['test', 'testing']),
  },
  {
    id: 'ai-context.covers-code-style',
    category: 'ai-context',
    description: 'agent file covers code style',
    instruction: 'Document code style conventions in your agent file',
    remediation:
      'Agents default to generic style without explicit guidance. Document your code style and conventions in your agent file.',
    points: 10,
    check: (ctx) =>
      mentionsAny(aiContextContent(ctx), ['code style', 'conventions', 'style guide']),
  },
  {
    id: 'ai-context.covers-architecture-rules',
    category: 'ai-context',
    description: 'agent file covers architecture rules',
    instruction: 'Document architecture rules in your agent file',
    remediation:
      'Agents can violate architectural boundaries without knowing they exist. Document architecture rules and module boundaries in your agent file.',
    points: 10,
    check: (ctx) =>
      mentionsAny(aiContextContent(ctx), ['architecture', 'module boundary', 'module boundaries']),
  },
  {
    id: 'ai-context.covers-adr-spec-rules',
    category: 'ai-context',
    description: 'agent file covers ADR/spec rules',
    instruction: 'Document ADR/spec conventions in your agent file',
    remediation:
      "Agents won't know to consult or write ADRs/specs unless told. Document your ADR/spec conventions in your agent file.",
    points: 10,
    check: (ctx) => mentionsAny(aiContextContent(ctx), ['adr', 'docs/adr', 'docs/specs', 'spec']),
  },
  {
    id: 'ai-context.docs-specs-exists',
    category: 'ai-context',
    description: 'docs/specs exists',
    instruction: 'Create a docs/specs/ directory',
    remediation:
      'A docs/specs/ directory gives agents a place to find current feature and requirement specifications. Create the directory and start adding specs as you build features.',
    points: 10,
    check: (ctx) => specsDir(ctx) !== null,
  },
  {
    id: 'ai-context.docs-plans-exists',
    category: 'ai-context',
    description: 'docs/plans exists',
    instruction: 'Create a docs/plans/ directory',
    remediation:
      "A docs/plans/ directory records planned or in-progress work so agents don't duplicate effort. Create the directory and add planning docs for active initiatives.",
    points: 5,
    check: (ctx) => ctx.hasPath('docs/plans'),
  },
  {
    id: 'ai-context.docs-research-exists',
    category: 'ai-context',
    description: 'docs/research exists',
    instruction: 'Create a docs/research/ directory',
    remediation:
      'A docs/research/ directory preserves investigation notes and decisions that informed the current design. Create the directory and capture research findings there.',
    points: 5,
    check: (ctx) => ctx.hasPath('docs/research'),
  },
  {
    id: 'ai-context.agentignore-exists',
    category: 'ai-context',
    description: '.agentignore or equivalent exists',
    instruction: 'Add a .agentignore file (or equivalent)',
    remediation:
      'Without an ignore file, agents may read or modify files you never intended them to touch. Add a .agentignore (or equivalent) listing paths agents should avoid.',
    points: 5,
    check: (ctx) => agentIgnoreExists(ctx),
  },
];
