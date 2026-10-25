import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-frontend-handoff');

fs.mkdirSync(outDir, { recursive: true });

const lines = [
  '# TyA frontend handoff',
  '',
  `Generated at: ${new Date().toISOString()}`,
  '',
  '## Safety',
  '',
  '- No deploy.',
  '- No data load.',
  '- No database write.',
  '- Keep backend files unchanged.',
  '',
  '## Frontend focus',
  '',
  '- HR Source screen.',
  '- Clear states.',
  '- Gates by phase.',
  '- Informational contract view.',
  '- Candidate financial records only.'
];

fs.writeFileSync(path.join(outDir, 'TYA_FRONTEND_HANDOFF.md'), lines.join('\n'), 'utf8');
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString() }, null, 2), 'utf8');
console.log('TyA frontend handoff generated');
