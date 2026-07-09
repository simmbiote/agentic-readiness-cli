import type { ScoringResult } from './scoring.js';
import type { Category } from './metrics/types.js';

const CATEGORY_LABELS: Record<Category, string> = {
  documentation: 'Documentation',
  architecture: 'Architecture',
  testing: 'Testing',
  'automation-guardrails': 'Automation Guard Rails',
  'ai-context': 'AI Context',
  maintainability: 'Maintainability',
};

export interface RenderHtmlReportOptions {
  summary?: boolean;
  detailed?: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function percentageClass(percentage: number): string {
  if (percentage >= 80) return 'pct-high';
  if (percentage >= 50) return 'pct-mid';
  return 'pct-low';
}

function gradeClass(grade: string): string {
  if (grade.startsWith('A')) return 'pct-high';
  if (grade.startsWith('B') || grade.startsWith('C')) return 'pct-mid';
  return 'pct-low';
}

const STYLE = `
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; }
  h1 { font-size: 1.5rem; }
  .pct-high { color: #1a7f37; }
  .pct-mid { color: #9a6700; }
  .pct-low { color: #cf222e; }
  .pass { color: #1a7f37; }
  .fail { color: #cf222e; }
  .top-improvements { background: #fff8f0; border: 1px solid #f0d9b5; border-radius: 6px; padding: 0.75rem 1rem; margin: 1rem 0; }
  .top-improvements ul { margin: 0.5rem 0 0; padding-left: 1.25rem; }
  .top-improvements li { color: #cf222e; margin-bottom: 0.25rem; }
  .providers { color: #57606a; margin-bottom: 1.5rem; }
  .category { margin-bottom: 1.5rem; }
  .category h2 { font-size: 1.1rem; margin-bottom: 0.25rem; }
  ul.metrics { list-style: none; padding-left: 0; margin: 0; }
  ul.metrics li { padding: 0.15rem 0; }
  .remediation { display: block; margin-left: 1.5rem; color: #57606a; font-size: 0.9rem; }
  .provider-tag { color: #57606a; font-size: 0.85rem; }
  @media print { body { margin: 0; } }
`;

export function renderHtmlReport(
  result: ScoringResult,
  options: RenderHtmlReportOptions = {},
): string {
  const { earned, max, percentage, grade } = result.overall;

  const topImprovementsHtml =
    result.topImprovements.length > 0
      ? `<div class="top-improvements">
  <strong>Top Improvements</strong>
  <ul>
${result.topImprovements
  .map(
    (improvement) =>
      `    <li>${escapeHtml(improvement.instruction)} [${escapeHtml(CATEGORY_LABELS[improvement.category])}] (+${improvement.points} pts)</li>`,
  )
  .join('\n')}
  </ul>
</div>`
      : '';

  const providersHtml =
    result.providers.length === 1 && result.providers[0] === 'none'
      ? `<p class="providers">Detected providers: none — no agentic provider detected (no openspec/, CLAUDE.md/.claude/, or AGENTS.md found); AI Context scoring reflects base metrics only.</p>`
      : `<p class="providers">Detected providers: ${escapeHtml(result.providers.join(', '))}</p>`;

  const categoriesHtml = result.categories
    .map((category) => {
      const metricsHtml = options.summary
        ? ''
        : `<ul class="metrics">
${category.metrics
  .map((metric) => {
    const mark = metric.passed ? 'x' : ' ';
    const statusClass = metric.passed ? 'pass' : 'fail';
    const providerTag = metric.provider ? ` <span class="provider-tag">[${escapeHtml(metric.provider)}]</span>` : '';
    const remediationHtml =
      options.detailed && !metric.passed
        ? `<span class="remediation">${escapeHtml(metric.remediation)}</span>`
        : '';
    return `      <li class="${statusClass}">[${mark}] ${escapeHtml(metric.description)} (${metric.earned}/${metric.points})${providerTag}${remediationHtml}</li>`;
  })
  .join('\n')}
    </ul>`;

      return `<div class="category">
    <h2>${escapeHtml(CATEGORY_LABELS[category.category])}: <span class="${percentageClass(category.percentage)}">${category.earned}/${category.max} (${category.percentage.toFixed(1)}%)</span></h2>
    ${metricsHtml}
  </div>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>agentlint report</title>
<style>${STYLE}</style>
</head>
<body>
<h1>Overall: ${earned}/${max} (<span class="${percentageClass(percentage)}">${percentage.toFixed(1)}%</span>) — Grade: <span class="${gradeClass(grade)}">${escapeHtml(grade)}</span></h1>
${topImprovementsHtml}
${providersHtml}
${categoriesHtml}
</body>
</html>
`;
}
