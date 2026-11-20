import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { resolveCountryHrPeriodBinding } from '../../backend/runtime/cxorbia-country-hr-binding-v1.mjs';
import { verifyMakeGraphReadOutput } from '../../backend/runtime/cxorbia-make-graph-provider-v1.mjs';

const project = 'cxorbia-backend-dev';
const url = new URL(process.env.B14_MAKE_TOOLBOX_URL);
if (url.origin !== 'https://eu2.make.com' || !/^\/mcp\/server\/[0-9a-f-]{36}$/.test(url.pathname) || url.search || url.hash) throw Error('Unrecognized toolbox URL');
const result = { decision: 'HOLD', origin: 'DEV_SERVICE_IDENTITY_PREFLIGHT', stage: 'credential', countries: [], hrWrites: 0, production: false };
const client = new Client({ name: 'cxorbia-b14-dev', version: '1.0.0' });
try {
  const key = execFileSync('gcloud', ['secrets','versions','access','1','--secret=cxorbia-dev-b14-make-toolbox','--project',project], { encoding: 'utf8', stdio:['ignore','pipe','ignore'] }).trim();
  if (!key) throw Error('Empty credential');
  result.stage = 'connect';
  await client.connect(new StreamableHTTPClientTransport(url, { requestInit: { redirect:'error', headers: {Authorization:'Bearer ' + key} } }));
  result.stage = 'list';
  const list = await client.listTools();
  const tool = list.tools[0];
  result.toolCount = list.tools.length;
  if (list.tools.length !== 1 || list.nextCursor || !tool?.inputSchema?.properties?.bindingFingerprint) throw Error('Unexpected toolbox');
  result.toolName = tool.name;
  result.readOnlyHint = tool.annotations?.readOnlyHint ?? null;
  const db = getFirestore(initializeApp({ projectId:project, credential: applicationDefault() }));
  const contract = JSON.parse(fs.readFileSync('backend/contracts/tya-hr-column-map-r20-v1.json', 'utf8'));
  const originals = JSON.parse(fs.readFileSync('docs/checkpoints/CXORBIA_I3_B14_ORIGINAL_PROJECTED_NOVEMBER_KEY_HASHES_20261120.json','utf8'));
  const hrUrl = new URL('/api/tya/cinepolis/hr-live', 'https://cxorbia-backend-dev.web.app');
  hrUrl.searchParams.set('format','json');
  hrUrl.searchParams.set('b14compare',String(Date.now()));
  const http = await fetch(hrUrl, {cache:'no-store', redirect:'error'});
  if (!http.ok) throw Error('Cannot read DEV HR');
  const hr = await http.json();
  const snapshot = hr.snapshot || hr.data || hr;
  const revision = hr._runtime?.revision || snapshot._runtime?.revision;
  if (snapshot.sourceSafe !== true || revision !== originals.hrRevision || !Array.isArray(snapshot.visits)) throw Error('Changed DEV revision');
  const active = snapshot.visits.filter(v=>(v.periodKey===originals.period || v.periodId==='cinepolis-'+originals.period) && !v._archived);
  const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
  const normalize = v => String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
  result.originalVsDev = originals.countries.map(({country,executionId,records}) => {
    const rows = active.filter(v=>(v.country || v.pais)===country);
    const keys = rows.map(v=>hash([country,...originals.businessKeyFields.slice(1).map(k=>normalize(v[k]))]));
    const idKeys = new Set(rows.map(v=>hash(v.id || v.visitId)));
    const duplicates = keys.length-new Set(keys).size;
    const match = new Map(rows.map((v,i)=>[keys[i],v]));
    const originalSet = new Set(records.map(r=>r.businessKey));
    const inBoth = records.filter(r=>match.has(r.businessKey));
    const originalOnly = records.filter(r=>!match.has(r.businessKey));
    return {country, executionId, originalRows:records.length, devRows:rows.length,
      duplicateBusinessKeysOriginal:records.length-originalSet.size, duplicateBusinessKeysDev:duplicates,
      commonIdentityKeys:records.filter(r=>idKeys.has(r.rowIdHash)).length,
      commonBusinessKeys:inBoth.length, devOnly:keys.filter(key=>!originalSet.has(key)).length,
      originalOnly:originalOnly.length, originalOnlyRows:originalOnly.map(r=>r.row),
      realizedOriginal:records.filter(r=>r.realized).length,
      realizedDev:rows.filter(v=>v.canonicalFacets?.realized&&!v.canonicalFacets.cancelled).length,
      commonRealizationDisagreements:duplicates || records.length!==originalSet.size ? null : inBoth.filter(r=>{
        const v=match.get(r.businessKey); return r.realized !== (v.canonicalFacets?.realized===true && !v.canonicalFacets.cancelled);
      }).map(r=>r.row)};
  });
  const currentProject=(await db.doc('tenants/tya/projects/cinepolis').get()).data();
  const source = currentProject?.operationalSource || currentProject?.routeSource || {};
  const existing = await db.collection('tenants/tya/integrationSettings').where('providerType','==','excel_online').get();
  result.configuration = {selected:source.providerType, read:source.readPolicy, write:source.writePolicy,
    declaredCountries:(source.countryBindings||[]).map(b=>b.countryCode).sort(),
    existingExcelCountryConfigs:existing.docs.map(d=>d.data()).filter(b=>b.projectId==='cinepolis').map(b=>({country:b.countryCode,enabled:b.enabled,periodSheets:Array.isArray(b.periodSheets)?b.periodSheets.length:0}))};
  for (const countryCode of ['GT','HN']) {
    const scope = {tenantId:'tya',projectId:'cinepolis',countryCode,periodId:'cinepolis-2026-11'};
    result.stage = 'binding_' + countryCode;
    const binding = await resolveCountryHrPeriodBinding({ db, ...scope });
    const { driveId, itemId, worksheets } = binding.privateProvider;
    const cases = [];
    result.countries.push({country:countryCode, sheets:cases});
    for (const sheet of worksheets) {
      const rangeAddress = 'A1:AI140';
      const inputs = {...scope, bindingFingerprint:binding.proof.bindingFingerprint, driveId,itemId,worksheetId:sheet.worksheetId, rangeAddress};
      result.stage = 'tool_' + countryCode;
      const run = await client.callTool({name:tool.name, arguments:inputs}, undefined, {timeout:60000});
      const item = { isError:run.isError===true, blocks:(run.content||[]).map(b=>b.type), structured:!!run.structuredContent };
      cases.push(item);
      if (item.isError) throw Error('Tool error');
      let value = run.structuredContent;
      if (!value && item.blocks.length === 1 && run.content[0].type === 'text') value = JSON.parse(run.content[0].text);
      if (Array.isArray(value) && value.length===1) value=value[0];
      if (!value || typeof value !== 'object') throw Error('Missing output');
      const out = value.outputs || value;
      item.returnedKeys = Object.keys(out).filter(k=>/^[A-Za-z][A-Za-z0-9_]{0,35}$/.test(k)).sort();
      result.stage = 'verification_' + countryCode;
      const proof = verifyMakeGraphReadOutput(out, inputs, sheet, rangeAddress, contract).proof;
      Object.assign(item,{http:[out.status1,out.status2], rows:proof.rowsReturned, matchedFields:proof.matchedFields, independentReadback:proof.independentReadback, revision:proof.sourceContentSha256});
    }
  }
  result.stage='complete'; result.decision='PASS_B14_TOOLBOX_SCOPED_GT_HN';
} catch (err) {
  const safe = String(err?.message || '').match(/^(?:MAPPING_FAILURE|PROVIDER_FAILURE|AUTH_FAILURE):(?:B14_|EXCEL_HR_)[A-Z0-9_]+$/);
  result.error = safe ? safe[0] : (err?.name||'Error');
  if (typeof err?.code === 'number') result.providerStatus = err.code;
  process.exitCode=1;
} finally {
  await client.close().catch(()=>{});
  fs.mkdirSync('.tmp/i3-b14-toolbox',{recursive:true});
  fs.writeFileSync('.tmp/i3-b14-toolbox/result.json',JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
}
