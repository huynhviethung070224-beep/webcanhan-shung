#!/usr/bin/env node
/**
 * Private UI fixture build. Never touches the real site content.
 *
 *   npm run fixture:ui -- full     # every optional field populated, plus draft/future/template posts
 *   npm run fixture:ui -- sparse   # every optional module empty (no email, resume, experience, certificates)
 *   node scripts/ui-fixture/serve.mjs "$TMPDIR/ian-ui-fixture-full/dist" 4500
 *
 * Builds a temp copy of the repo with the scenario applied, then fails if any
 * draft, scheduled, or template content reaches the public output.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { auditPrivacy, buildFixture, prepareFixture } from './lib.mjs';
import { scenarios } from './overrides.mjs';

const mode = process.argv.slice(2).find((arg) => arg in scenarios) ?? 'full';
const out = prepareFixture(mode, scenarios[mode]);
console.log(`[fixture] mode=${mode} → ${out}`);

const { ok, dist } = buildFixture(out);
if (!ok) {
  console.error('[fixture] build failed');
  process.exit(1);
}

const problems = auditPrivacy(dist);
if (mode === 'full') {
  for (const needed of ['blog/fixture-long-article.html', 'blog/fixture-short-note.html', 'rss.xml', 'projects/fixture-full-case-study.html']) {
    if (!existsSync(join(dist, needed))) problems.push(`expected public output missing: ${needed}`);
  }
}
if (problems.length) {
  console.error(`[fixture] privacy audit FAILED:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`[fixture] privacy audit passed. Output: ${dist}`);
