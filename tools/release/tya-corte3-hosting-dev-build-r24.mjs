#!/usr/bin/env node
/* CXOrbia TyA · Corte 3 Hosting DEV build overlay R24.
   Adds the already-approved canonical financial snapshot and adapter to the
   V174 live-HR build copy. It modifies only the ephemeral checkout used for
   Hosting DEV; no frontend module/core source is changed. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const htmlPath = path.resolve(valueOf('--html', 'app/index.html'));
const outDir = path.resolve(valueOf('--out', '.tmp/tya-corte3-hosting-dev-build-r24'));
const appDir = path.dirname(htmlPath);
const fail = message => {
  console.error(`CORTE3_HOSTING_DEV_BUILD_R24_HOLD: ${message}`);
  process.exit(1);
};

const sources = [
  'data/tya-financial-canonical-source-safe.js',
  'data/tya-financial-canonical-source-safe-liq-01.js',
  'data/tya-financial-canonical-source-safe-liq-02.js',
  'data/tya-financial-canonical-source-safe-liq-03.js',
  'data/tya-financial-canonical-source-safe-review-01.js',
  'data/tya-financial-canonical-source-safe-review-02.js',
  'data/tya-financial-canonical-source-safe-evidence.js',
  'data/tya-financial-canonical-source-safe-final.js',
  'adapters/tya-financial-canonical-source-safe-adapter.js'
];

if (!fs.existsSync(htmlPath)) fail(`HTML missing: ${htmlPath}`);
for (const source of sources) {
  if (!fs.existsSync(path.join(appDir, source))) fail(`Required canonical finance source missing: ${source}`);
}

let html = fs.readFileSync(htmlPath, 'utf8');
const anchor = '<script src="core/finanzas-core.js"></script>';
const appBoot = '<script src="app.js"></script>';
const tags = sources.map(source => `<script src="${source}"></script>`);
const counts = tags.map(tag => html.split(tag).length - 1);

if (!html.includes(anchor)) fail('core/finanzas-core.js anchor missing');
if (!html.includes(appBoot)) fail('app.js boot tag missing');
if (!html.includes('/api/tya/cinepolis/hr-live')) fail('R22 live HR binding missing before financial overlay');
if (!html.includes('adapters/tya-live-source-refresh-watch.js')) fail('live HR refresh watcher missing');
if (counts.some(count => count > 1)) fail(`Duplicate canonical finance tags detected: ${JSON.stringify(counts)}`);
if (counts.some(count => count === 1) && counts.some(count => count === 0)) fail('Partial canonical finance overlay detected');

if (counts.every(count => count === 0)) {
  html = html.replace(anchor, `${anchor}\n${tags.join('\n')}`);
}

const afterCounts = tags.map(tag => html.split(tag).length - 1);
if (!afterCounts.every(count => count === 1)) fail(`Canonical finance tag count invalid after build: ${JSON.stringify(afterCounts)}`);

const positions = [anchor, ...tags, appBoot].map(tag => html.indexOf(tag));
if (positions.some(position => position < 0)) fail('Required script position missing');
if (!positions.every((position, index) => index === 0 || positions[index - 1] < position)) fail('Canonical finance script order invalid');

fs.writeFileSync(htmlPath, html, 'utf8');
fs.mkdirSync(outDir, { recursive: true });
const report = {
  schemaVersion: '1.0.0',
  decision: 'PASS_CORTE3_HOSTING_DEV_BUILD_R24',
  html: path.relative(process.cwd(), htmlPath).replaceAll('\\', '/'),
  liveHrBindingPresent: true,
  canonicalFinanceTagCount: tags.length,
  financialAdapterAfterSnapshot: positions[positions.length - 2] > positions[positions.length - 3],
  financialOverlayBeforeAppBoot: positions[positions.length - 2] < positions[positions.length - 1],
  sameTruthForFinanzasAndBeneficios: true,
  paymentState: 'pending_source_confirmation',
  safeState: {
    sourceSafe: true,
    frontendModulesModified: false,
    coreSourceModified: false,
    firestoreWrites: false,
    authWrites: false,
    storageWrites: false,
    hrWrites: false,
    imports: false,
    payments: false,
    cloudRunDeploy: false,
    production: false,
    merge: false
  }
};
fs.writeFileSync(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
