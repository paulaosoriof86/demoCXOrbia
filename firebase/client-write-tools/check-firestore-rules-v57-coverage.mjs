import fs from 'node:fs';

const file = 'firestore.rules';
const text = fs.readFileSync(file, 'utf8');

const required = [
  'match /bulletins/{bulletinId}',
  'match /bulletinReads/{readId}',
  'match /automations/{automationId}',
  'match /automationLogs/{logId}',
  'match /integrationSettings/{integrationId}',
  'match /aiSettings/{providerId}',
  'match /aiLogs/{logId}',
  'match /resources/{resourceId}'
];

const present = required.filter(token => text.includes(token));
const missing = required.filter(token => !text.includes(token));

const result = {
  ok: missing.length === 0,
  file,
  present,
  missing,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
