import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { resolveCountryHrPeriodBinding } from '../../backend/runtime/cxorbia-country-hr-binding-v1.mjs';
import { verifyMakeGraphReadOutput } from '../../backend/runtime/cxorbia-make-graph-provider-v1.mjs';

async function readScopedOriginals(client, tool, config, contract, existing, result) {
  if (config.tenantId !== 'tya' || config.projectId !== 'cinepolis' || config.writePolicy !== 'external_read_only' ||
      config.readPolicy !== 'external_live' || config.countries?.map(c=>c.countryCode).sort().join(',') !== 'GT,HN' || tool.annotations?.readOnlyHint !== true)
    throw Error('MAPPING_FAILURE:B14_PRIVATE_BINDINGS');
  const parserFile='tools/hr-source/tya-build-live-hr-source-safe-r20.mjs';
  const parserSource=fs.readFileSync(parserFile,'utf8');
  const entry="\nif(process.argv.includes('--provider-auth-self-test'))";
  if (parserSource.indexOf(entry)<0 || parserSource.indexOf(entry)!==parserSource.lastIndexOf(entry)) throw Error('SOURCE_FAILURE:PARSER_ENTRY');
  const temp=fs.mkdtempSync('tools/hr-source/.original-qa-');
  try {
    for (const name of ['tya-canonical-visit-state-r20.mjs','tya-resolve-live-month-tabs.mjs']) fs.copyFileSync('tools/hr-source/'+name,temp+'/'+name);
    fs.writeFileSync(temp+'/reader.mjs',parserSource.slice(0,parserSource.indexOf(entry))+'\nexport {parseTab};\n');
    const {parseTab}=await import(pathToFileURL(path.resolve(temp,'reader.mjs')));
    const registry=JSON.parse(fs.readFileSync('backend/contracts/tya-cinepolis-cinema-identity-r20-v1.json','utf8'));
    for (const row of config.countries) {
      const {countryCode,periodId,worksheetId,itemId,driveId,rangeAddress}=row;
      if(![worksheetId,itemId,driveId].every(v=>typeof v==='string' && v.length>5) || !/^cinepolis-20\d\d-(?:0[1-9]|1[0-2])$/.test(periodId) || rangeAddress!=='A1:AI140') throw Error('MAPPING_FAILURE:B14_PRIVATE_SCOPE');
      const scope={tenantId:config.tenantId,projectId:config.projectId,countryCode,periodId};
      const bindingFingerprint=createHash('sha256').update(JSON.stringify({...scope,driveId,itemId,worksheetId,rangeAddress})).digest('hex');
      const inputs={...scope,driveId,itemId,worksheetId,rangeAddress,bindingFingerprint};
      const summary={country:countryCode,scopeConfirmed:false};
      result.countries.push(summary);
      result.stage='read_original_'+countryCode;
      const rpc=await client.callTool({name:tool.name,arguments:inputs},undefined,{timeout:90000});
      summary.blocks=(rpc.content||[]).map(v=>v.type);
      summary.isError=Boolean(rpc.isError);summary.structured=Boolean(rpc.structuredContent);
      if(rpc.isError)throw Error('PROVIDER_FAILURE:B14_SCENARIO_EXECUTION');
      let out=rpc.structuredContent;
      if(!out && rpc.content?.length===1 && rpc.content[0].type==='text'){const txt=rpc.content[0].text;summary.resultLength=txt.length;try{out=JSON.parse(txt)}catch{summary.outputFormat=txt.trim().startsWith('{')?'object_text':'other_text';throw Error('PROVIDER_FAILURE:B14_NON_JSON')}}
      if(Array.isArray(out)&&out.length===1)out=out[0];
      summary.topKeys=Object.keys(out||{}).filter(k=>/^[a-zA-Z][a-zA-Z0-9_]{0,25}$/.test(k));
      out=out?.outputs??out?.output??out;
      const checked=verifyMakeGraphReadOutput(out,inputs,{worksheetId},rangeAddress,contract);
      const p=checked.proof; Object.assign(summary,{scopeConfirmed:true,rows:p.rowsReturned,externalRevision:p.sourceContentSha256,twoEqualReads:p.independentReadback,http:[out.status1,out.status2]});
      const key=periodId.slice(-7),[year,month]=key.split('-').map(Number);
      const parsed=parseTab({country:countryCode,key,year,month,tabTitle:'B14 '+key},checked.privateRows,contract,registry);
      if(parsed.issues.some(i=>i.severity==='critical'))throw Error('MAPPING_FAILURE:B14_ORIGINAL_PARSER');
      const expected=existing.filter(v=>(v.country||v.pais)===countryCode && (v.periodKey===key||v.periodId===periodId) && !v._archived);
      const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
      const schemas=[['cinemaId','quincena','escenario'],['sucursal','quincena','escenario'],['sucursal','quincena','escenario','tipoCombo']];
      const matches=new Set(),diff=[];
      for(const sourceVisit of parsed.visits){
        const groups=schemas.map(fields=>expected.filter(v=>fields.every(k=>norm(v[k]) && norm(v[k])===norm(sourceVisit[k]))));
        if(!groups.every(group=>group.length===1 && group[0]===groups[0][0]))throw Error('MAPPING_FAILURE:B14_AMBIGUOUS_VISIT');
        const served=groups[0][0],id=served.id||served.visitId;
        if(!id||matches.has(id))throw Error('MAPPING_FAILURE:B14_DUPLICATE_VISIT');
        matches.add(id);
        const src=sourceVisit.canonicalFacets.realized===true && !sourceVisit.canonicalFacets.cancelled;
        const dev=served.canonicalFacets?.realized===true && !served.canonicalFacets?.cancelled;
        if(src!==dev)diff.push({originalRow:sourceVisit.sourceRow,original:src,served:dev});
      }
      if(!matches.size||matches.size!==expected.length||matches.size!==parsed.visits.length)throw Error('MAPPING_FAILURE:B14_INCOMPLETE_VISITS');
      Object.assign(summary,{originalVisits:parsed.visits.length,existingIds:matches.size,matchedByAllThreeKeys:true,originalRealized:parsed.visits.filter(v=>v.canonicalFacets.realized&&!v.canonicalFacets.cancelled).length,servedRealized:expected.filter(v=>v.canonicalFacets?.realized&&!v.canonicalFacets?.cancelled).length,realizationDifferences:diff});
    }
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
}


async function registerOriginalReadbackBindings(db, config, receipt) {
  const authority=JSON.parse(fs.readFileSync('docs/checkpoints/CXORBIA_I3_B14_MAKE_GT_HN_LIVE_HEADERS_READONLY_ACCEPTANCE_20261119.json','utf8'));
  const projectRef=db.doc('tenants/'+config.tenantId+'/projects/'+config.projectId);
  if(receipt.countries.length!==2 || !receipt.countries.every(c=>c.twoEqualReads&&c.matchedByAllThreeKeys&&c.existingIds===c.originalVisits)) throw Error('MAPPING_FAILURE:B14_REGISTRY_PREFLIGHT');
  const plan=await db.runTransaction(async tx=>{
    const p=await tx.get(projectRef); const projectData=p.data();
    const active=projectData?.operationalSource||projectData?.routeSource||{};
    const activeId=active.providerBindingId||active.integrationSettingId||active.providerRef;
    if(projectData?.tenantId!==config.tenantId || (projectData.projectId&&projectData.projectId!==config.projectId) ||
       active.providerType!=='google_sheets' || active.mode!=='external' || active.readPolicy!==config.readPolicy || active.writePolicy!==config.writePolicy ||
       !/^[\w.:-]+$/.test(activeId||'')) throw Error('MAPPING_FAILURE:B14_SELECTED_PROJECT');
    const collection=db.collection('tenants/'+config.tenantId+'/integrationSettings');
    const mirrorRef=collection.doc(activeId),mirror=(await tx.get(mirrorRef)).data();
    if(!mirror||mirror.projectId!==config.projectId||mirror.tenantId!==config.tenantId||mirror.enabled!==true||
       mirror.hrWritesEnabled!==false||mirror.mappingRef!==active.mappingRef||mirror.readPolicy!==active.readPolicy||
       mirror.writePolicy!==active.writePolicy||mirror.providerType!=='google_sheets')throw Error('MAPPING_FAILURE:B14_EXISTING_MIRROR');
    const proposals=config.countries.map(c=>{
      const providerBindingId=config.projectId+'-original-readback-'+c.countryCode.toLowerCase();
      const row=authority.countries[c.countryCode],worksheetName=row?.currentOperationalTab;
      if (!worksheetName || !projectData.countries?.includes(c.countryCode))throw Error('MAPPING_FAILURE:B14_ORIGINAL_TAB');
      return {ref:collection.doc(providerBindingId),entry:{countryCode:c.countryCode,providerBindingId,mappingRef:active.mappingRef},setting:{
        tenantId:config.tenantId,projectId:config.projectId,countryCode:c.countryCode,providerType:'excel_online',enabled:true,purpose:'original_readback',
        mappingRef:active.mappingRef,providerBindingId,readPolicy:config.readPolicy,writePolicy:config.writePolicy,hrWritesEnabled:false,
        driveId:c.driveId,itemId:c.itemId,periodSheets:[{periodId:c.periodId,worksheetId:c.worksheetId,worksheetName}]}};
    }).sort((a,b)=>a.entry.countryCode.localeCompare(b.entry.countryCode));
    const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
    const equal=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
    const existing=await tx.getAll(...proposals.map(x=>x.ref));const bindings=proposals.map(x=>x.entry);
    if (mirror.originalReadbackBindings!==undefined && !equal(mirror.originalReadbackBindings,bindings))throw Error('MAPPING_FAILURE:B14_MIRROR_HAS_DIFFERENT_READBACK');
    for(let i=0;i<proposals.length;i++)if(existing[i].exists&&!equal(existing[i].data(),proposals[i].setting))throw Error('MAPPING_FAILURE:B14_BINDING_CONFLICT');
    let writes=0;
    for(let i=0;i<proposals.length;i++)if(!existing[i].exists){tx.create(proposals[i].ref,proposals[i].setting);writes++;}
    if(mirror.originalReadbackBindings===undefined){tx.update(mirrorRef,{originalReadbackBindings:bindings});writes++;}
    return {writes,mirrorRef,proposals};
  });
  const mirror=(await plan.mirrorRef.get()).data();
  const project=(await projectRef.get()).data();
  if((project.operationalSource||project.routeSource)?.providerType!=='google_sheets' || mirror.originalReadbackBindings?.length!==2)throw Error('MAPPING_FAILURE:B14_METADATA_READBACK');
  for(const item of plan.proposals){const observed=(await item.ref.get()).data();
    if(!observed || observed.driveId!==item.setting.driveId || observed.itemId!==item.setting.itemId ||
       observed.periodSheets?.[0]?.worksheetId!==item.setting.periodSheets[0].worksheetId || observed.hrWritesEnabled!==false)throw Error('MAPPING_FAILURE:B14_CONFIGURATION_READBACK');
  }
  return {projectSelector:'google_sheets',registeredCountries:plan.proposals.map(v=>v.entry.countryCode),configurationDocumentWrites:plan.writes,checkedAfterCommit:true,operationalRowsChanged:0};
}

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
    const visitRecords = records.filter(r=>!r.confirmedReconciliationFooter);
    const dimensions = Object.fromEntries(Object.entries(originals.alternateBusinessKeys || {}).map(([id,fields])=>{
      const originalKeys=visitRecords.map(r=>r.candidateKeys[id]).filter(Boolean);
      const devKeys=rows.filter(v=>fields.every(k=>normalize(v[k]))).map(v=>hash([country,...fields.map(k=>normalize(v[k]))]));
      const a=new Set(originalKeys),b=new Set(devKeys);
      return [id,{original:originalKeys.length,dev:devKeys.length,uniqueOriginal:a.size,uniqueDev:b.size,intersection:[...a].filter(k=>b.has(k)).length}];
    }));
    const match = new Map(rows.map((v,i)=>[keys[i],v]));
    const verifiedPairs = [];
    const names = ['idHalfScenario','branchHalfScenario','branchCombo'];
    const destinations = new Set();
    for (const src of visitRecords) {
      const matches = names.map(name=>rows.filter(v=>{
        const fields=originals.alternateBusinessKeys[name];
        return fields.every(k=>normalize(v[k])) && src.candidateKeys[name]===hash([country,...fields.map(k=>normalize(v[k]))]);
      }));
      if(!matches.every(set=>set.length===1 && set[0]===matches[0][0])) throw Error('Ambiguous crosswalk');
      const dev=matches[0][0], devIdHash=hash(dev.id || dev.visitId);
      if(destinations.has(devIdHash)) throw Error('Duplicate crosswalk');
      destinations.add(devIdHash);
      verifiedPairs.push({sourceRow:src.row, sourceKey:src.rowIdHash, existingKey:devIdHash, originalRealized:src.realized, devRealized:dev.canonicalFacets?.realized===true && !dev.canonicalFacets.cancelled});
    }
    if(destinations.size!==rows.length || verifiedPairs.length!==visitRecords.length) throw Error('Incomplete crosswalk');
    const originalSet = new Set(records.map(r=>r.businessKey));
    const inBoth = records.filter(r=>match.has(r.businessKey));
    const originalOnly = records.filter(r=>!match.has(r.businessKey));
    return {country, executionId, originalRows:records.length, devRows:rows.length, dimensions,
      crosswalk:{keys:names,matched:verifiedPairs.length,oneToOne:true,verifiedPairs}, originalVisitRows:visitRecords.length, reconciliationFooterRows:records.filter(r=>r.confirmedReconciliationFooter).map(r=>r.row),
      originalVisitRealized:visitRecords.filter(r=>r.realized).length,
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
  const compareOnly=process.env.B14_COMPARE_ONLY==='true';
  if (compareOnly && result.originalVsDev.some(country=>!country.crosswalk.oneToOne || !country.crosswalk.matched)) throw Error('Crosswalk incomplete');
  const freshOriginal=process.env.B14_FRESH_ORIGINAL==='true';
  if (freshOriginal) await readScopedOriginals(client, tool, JSON.parse(process.env.B14_PRIVATE_BINDINGS), contract, active, result);
  if (freshOriginal && process.env.B14_REGISTER_ORIGINAL==='true') {
    result.stage='register_original_readback';
    result.registration=await registerOriginalReadbackBindings(db,JSON.parse(process.env.B14_PRIVATE_BINDINGS),result);
  }
  if (!compareOnly && !freshOriginal) for (const countryCode of ['GT','HN']) {
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
  result.stage='complete'; result.decision=freshOriginal ? 'PASS_B14_SERVICE_INITIATED_ORIGINAL_GTHN_WITH_EXISTING_IDS' : compareOnly ? 'PASS_B14_ORIGINAL_EXISTING_NOVEMBER_IDENTITIES_READONLY' : 'PASS_B14_TOOLBOX_SCOPED_GT_HN';
} catch (err) {
  const safe = String(err?.message || '').match(/^(?:MAPPING_FAILURE|PROVIDER_FAILURE|AUTH_FAILURE):(?:B14_|EXCEL_HR_)[A-Z0-9_]+$/);
  result.error = safe ? safe[0] : (err?.name||'Error');
  if (typeof err?.code === 'number') result.providerStatus = err.code;
  process.exitCode=1;
} finally {
  await client.close().catch(()=>{});
  fs.mkdirSync('.tmp/i3-b14-toolbox',{recursive:true});
  fs.writeFileSync('.tmp/i3-b14-toolbox/result.json',JSON.stringify(result,null,2)+'\n');
  const summary={...result,originalVsDev:result.originalVsDev?.map(country=>({...country,crosswalk:{keys:country.crosswalk.keys,matched:country.crosswalk.matched,oneToOne:country.crosswalk.oneToOne,realizationDifferences:country.crosswalk.verifiedPairs.filter(p=>p.originalRealized!==p.devRealized).map(p=>({row:p.sourceRow,original:p.originalRealized,dev:p.devRealized}))}}))};
  console.log(JSON.stringify(summary));
}
