#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, '_diagnosticos', 'tya-local-output-package');
fs.mkdirSync(outDir, { recursive: true });

const candidates = [
  '_diagnosticos/tya-safe-audit-bundle/safe-audit-bundle.json',
  '_diagnosticos/tya-safe-audit-bundle/safe-audit-bundle.md',
  '_diagnosticos/tya-safe-audit-normalized/safe-audit-normalized.json',
  '_diagnosticos/tya-safe-audit-normalized/safe-audit-normalized.md'
];

const files = candidates.map((relativePath) => {
  const absolutePath = path.join(root, relativePath);
  const exists = fs.existsSync(absolutePath);
  if (exists) {
    const target = path.join(outDir, path.basename(relativePath));
    fs.copyFileSync(absolutePath, target);
  }
  return {
    path: relativePath,
    exists,
    packagedAs: exists ? path.join('_diagnosticos', 'tya-local-output-package', path.basename(relativePath)) : null
  };
});

const manifest = {
  generatedAt: new Date().toISOString(),
  status: files.some((file) => file.exists) ? 'package_created' : 'no_inputs_found',
  files,
  notes: [
    'Local packaging only.',
    'Does not execute diagnostics, deploy, merge, import real data, or call providers.'
  ]
};

fs.writeFileSync(path.join(outDir, 'package-manifest.json'), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(outDir, 'package-summary.md'), [
  '# Local output package summary',
  '',
  `Generated: ${manifest.generatedAt}`,
  `Status: ${manifest.status}`,
  '',
  '## Files',
  '',
  ...files.map((file) => `- ${file.path}: ${file.exists ? 'included' : 'missing'}`),
  '',
  'This package is local-only and does not authorize source lock, production, import, deploy, merge, or providers.'
].join('\n'));

console.log(JSON.stringify({ status: manifest.status, outDir: path.relative(root, outDir), files: files.filter((file) => file.exists).length }, null, 2));
if (manifest.status === 'no_inputs_found') process.exitCode = 2;
