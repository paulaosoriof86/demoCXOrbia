#!/usr/bin/env node
/*
  CXOrbia Phase A R15F - build-time source-safe binding.

  It modifies only the checked-out build copy of app/index.html. The V110 source
  stays unchanged in Git. It inserts the generated TyA payload before core boot
  and the existing source-safe CX.data bridge immediately after core/data.js.
*/

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const root = process.cwd();
const htmlPath = path.join(root, valueOf('--html', 'app/index.html'));
const payloadSrc = valueOf('--payload-src', 'data/tya-hr-source-safe-periods.js');
const bridgeSrc = valueOf('--bridge-src', 'core/tya-phase-a-source-safe-preview.js');
const reportDir = path.join(root, valueOf('--out', '.tmp/source-safe-binding-r15f'));
const mode = valueOf('--mode', 'apply');

function fail(message, code = 2) {
  console.error(message);
  process.exit(code);
}

if (!fs.existsSync(htmlPath)) fail(`Missing HTML: ${htmlPath}`);
const payloadFile = path.join(path.dirname(htmlPath), payloadSrc);
const bridgeFile = path.join(path.dirname(htmlPath), bridgeSrc);
if (!fs.existsSync(payloadFile)) fail(`Missing generated source-safe payload: ${payloadFile}`);
if (!fs.existsSync(bridgeFile)) fail(`Missing source-safe bridge: ${bridgeFile}`);

let html = fs.readFileSync(htmlPath, 'utf8');
const payloadTag = `<script src="${payloadSrc}"></script>`;
const bridgeTag = `<script src="${bridgeSrc}"></script>`;
const count = (needle) => html.split(needle).length - 1;
const before = { payloadTags: count(payloadTag), bridgeTags: count(bridgeTag) };

if (before.payloadTags > 1 || before.bridgeTags > 1) fail('Duplicate source-safe binding tags detected before build.', 3);

if (mode === 'apply') {
  if (before.payloadTags === 0) {
    const anchor = '<script src="core/build-lock.js"></script>';
    const fallbackAnchor = '<script src="core/config.js"></script>';
    if (html.includes(anchor)) html = html.replace(anchor, `${payloadTag}\n${anchor}`);
    else if (html.includes(fallbackAnchor)) html = html.replace(fallbackAnchor, `${payloadTag}\n${fallbackAnchor}`);
    else fail('Unable to locate core boot anchor for source-safe payload.', 3);
  }
  if (before.bridgeTags === 0) {
    const anchor = '<script src="core/data.js"></script>';
    if (!html.includes(anchor)) fail('Unable to locate core/data.js connection anchor.', 3);
    html = html.replace(anchor, `${anchor}\n${bridgeTag}`);
  }
  fs.writeFileSync(htmlPath, html, 'utf8');
}

const afterHtml = fs.readFileSync(htmlPath, 'utf8');
const after = {
  payloadTags: afterHtml.split(payloadTag).length - 1,
  bridgeTags: afterHtml.split(bridgeTag).length - 1,
  payloadPosition: afterHtml.indexOf(payloadTag),
  dataPosition: afterHtml.indexOf('<script src="core/data.js"></script>'),
  bridgePosition: afterHtml.indexOf(bridgeTag),
  appBootPosition: afterHtml.indexOf('<script src="app.js"></script>')
};
const valid = after.payloadTags === 1 &&
  after.bridgeTags === 1 &&
  after.payloadPosition >= 0 &&
  after.dataPosition > after.payloadPosition &&
  after.bridgePosition > after.dataPosition &&
  after.appBootPosition > after.bridgePosition;

const report = {
  schemaVersion: '1.0.0',
  reportId: 'phase-a-source-safe-binding-build-r15f',
  generatedAt: new Date().toISOString(),
  mode,
  decision: valid ? 'PASS_SOURCE_SAFE_BINDING_BUILD_R15F' : 'FAIL_SOURCE_SAFE_BINDING_BUILD_R15F',
  html: path.relative(root, htmlPath).replace(/\\/g, '/'),
  sourceLockRepoFileModifiedByCommit: false,
  buildCopyModified: mode === 'apply',
  before,
  after,
  validation: {
    exactlyOnePayloadTag: after.payloadTags === 1,
    exactlyOneBridgeTag: after.bridgeTags === 1,
    payloadBeforeData: after.payloadPosition < after.dataPosition,
    bridgeAfterData: after.bridgePosition > after.dataPosition,
    bridgeBeforeAppBoot: after.bridgePosition < after.appBootPosition,
    pass: valid
  },
  gates: {
    frontendModulesModified: false,
    providerCalls: false,
    firestoreWrites: false,
    authWrites: false,
    imports: false,
    deploy: false,
    production: false
  }
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'source-safe-binding-r15f-report.json'), JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(path.join(reportDir, 'source-safe-binding-r15f-report.md'), [
  '# Source-safe binding build R15F',
  '',
  `Decision: ${report.decision}`,
  `HTML build copy: ${report.html}`,
  `Payload tags: ${after.payloadTags}`,
  `Bridge tags: ${after.bridgeTags}`,
  `Payload before data: ${report.validation.payloadBeforeData}`,
  `Bridge after data: ${report.validation.bridgeAfterData}`,
  `Bridge before app boot: ${report.validation.bridgeBeforeAppBoot}`,
  '',
  'No modules, provider calls, writes, imports, deploy or production.'
].join('\n'), 'utf8');

console.log(JSON.stringify(report, null, 2));
process.exitCode = valid ? 0 : 4;
