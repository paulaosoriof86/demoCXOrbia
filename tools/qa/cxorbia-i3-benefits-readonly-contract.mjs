import crypto from 'node:crypto';

export const BENEFITS_DOMAIN='benefits';
export const BENEFITS_OWNERS=['app/modules/beneficios.js'];
export const BENEFITS_DEPENDENCIES=['app/core/data.js','app/core/backend-finance-benefits.js','app/core/liquidacion.js','app/core/finanzas-core.js','app/modules/finanzas.js','app/modules/cliente-extra.js','app/adapters/tya-canonical-finance-read-model-v2.js'];
export const BENEFITS_B5_RECEIPT='docs/checkpoints/CXORBIA_I3_B4_B5_B6_FUNCTIONAL_BLOCK_ACCEPTANCE_20261110.json';
export const BENEFITS_B5_OWNERS={'app/modules/beneficios.js':'c7060562558f307b9b037e929a6fa7e179db1826','app/adapters/tya-canonical-finance-read-model-v2.js':'4997010949dd8a126b058f720041fe5eeb04f1bd','app/core/backend-finance-benefits.js':'66856002901be88aefb38acc0aaab635a8872c2b'};
export const BENEFITS_FINDINGS=['VRM-262','VRM-276','VRM-277'];
export const BENEFITS_OBLIGATIONS=['shopper-csv-bytes-and-content','admin-xlsx-bytes-and-content','admin-print-pdf-bytes-and-content','row-currency-period-parity','independent-session-and-reload','own-scope-and-negative-acl','filters-and-detail','payment-source-truth','empty-period-honest','no-financial-mutations'];
export const BENEFITS_CONTRACT_SHA=crypto.createHash('sha256').update(JSON.stringify({domain:BENEFITS_DOMAIN,owners:BENEFITS_OWNERS,dependencies:BENEFITS_DEPENDENCIES,obligations:BENEFITS_OBLIGATIONS,formats:{shopper:'CSV_FULL_SELECTED_PERIOD',adminTable:'XLSX_ELIGIBLE_ONLY',adminPdf:'NATIVE_PRINT_OUTPUT'},authority:'FROZEN_C09_C10_AND_ACCEPTED_B5'})).digest('hex');
const sha=v=>/^[a-f0-9]{64}$/.test(String(v||''));
export function validateBenefitsReadonlyReceipt(r,mod){
  const failures=[],need=(ok,k)=>{if(!ok)failures.push(k);};
  need(r?.moduleDomain===BENEFITS_DOMAIN&&mod?.domain===BENEFITS_DOMAIN&&r.operationKind==='READ_ONLY','BENEFITS_READONLY_DOMAIN');
  need(r?.contractAuthority?.contractSha256===BENEFITS_CONTRACT_SHA,'BENEFITS_CONTRACT');
  need(r?.mutationEvidence?.applicable===false&&r.mutationEvidence.providerAckClaimed===false&&r.providerAck!==true&&r.mutationEvidence.financialMutationRequestsObserved===0,'BENEFITS_NO_FAKE_ACK_OR_FINANCIAL_MUTATION');
  need(r?.hrIndependent!==true&&sha(r?.hrRevision),'BENEFITS_EXACT_EXTERNAL_HR');
  const e=r?.ownerEvidence||[];
  need([...BENEFITS_OWNERS,...BENEFITS_DEPENDENCIES].every(p=>e.some(x=>x.path===p&&x.byteParity===true&&sha(x.sourceSha256)&&x.sourceSha256===x.servedSha256)),'BENEFITS_OWNER_DEPENDENCY_PARITY');
  need(BENEFITS_OWNERS.every(p=>(r?.ownerPaths||[]).includes(p)&&e.some(x=>x.path===p&&x.gitBlob===mod?.currentOwnerBlobs?.[p])),'BENEFITS_OWNER_BLOB');
  need(mod?.functionalBlockAcceptance20261110?.block==='B5'&&mod.functionalBlockAcceptance20261110.accepted===true&&r?.humanAcceptance?.mode==='PRESERVED_B5_OWNER_UNCHANGED_NO_NEW_DESIGN'&&r.humanAcceptance.newApproval===false&&r.humanAcceptance.receipt===BENEFITS_B5_RECEIPT&&mod.functionalBlockAcceptance20261110.receipt===BENEFITS_B5_RECEIPT&&Object.entries(BENEFITS_B5_OWNERS).every(([path,blob])=>e.some(x=>x.path===path&&x.gitBlob===blob)),'BENEFITS_PRIOR_B5');
  const coverage=r?.contractCoverage,obs=coverage?.obligations||[];
  need(coverage?.fullDomain===true&&obs.length===BENEFITS_OBLIGATIONS.length&&BENEFITS_OBLIGATIONS.every(id=>obs.filter(x=>x.id===id&&x.observed===true&&x.evidenceRef&&sha(x.evidenceSha256)).length===1),'BENEFITS_FULL_OBLIGATIONS');
  const p=r?.readOnlyProof||{},exports=p.exports||[];
  need(exports.length>0&&exports.every(x=>x.bytes>0&&sha(x.sha256)&&x.parsed===true&&x.contentMatches===true&&x.rows>0&&x.evidenceRef),'BENEFITS_EXPORT_INTEGRITY');
  for(const format of ['SHOPPER_CSV','ADMIN_XLSX','ADMIN_PRINT_PDF'])need(exports.some(x=>x.format===format&&x.bytes>0&&sha(x.sha256)&&x.parsed===true&&x.contentMatches===true&&x.rows>0&&x.evidenceRef),'BENEFITS_EXPORT_'+format);
  need(exports.filter(x=>x.format==='SHOPPER_CSV').length>=2&&new Set(exports.filter(x=>x.format==='SHOPPER_CSV').map(x=>x.principalFingerprint)).size>=2,'BENEFITS_DISTINCT_SHOPPERS');
  need(p.currencyScopes?.includes('GT')&&p.currencyScopes?.includes('HN')&&p.currenciesSeparated===true,'BENEFITS_CURRENCY_SCOPES');
  need(p.perRowParity===true&&p.periodIsolation===true&&p.adminReviewRowsExcluded===true&&p.roleSpecificUniversesPreserved===true,'BENEFITS_ROW_SCOPE');
  need(p.independentSessions>=3&&p.reloadProof===true&&p.samePrincipalAfterReload===true&&p.newSessionParity===true,'BENEFITS_SESSIONS');
  need(p.acl?.ownRowsOnly===true&&p.acl?.adminControlsDenied===true&&p.acl?.foreignBenefitRead==='permission-denied','BENEFITS_ACL');
  need(p.filtersAndDetail===true&&p.paymentSourceTruth===true&&p.emptyPeriodHonest===true,'BENEFITS_UI_CONTRACT');
  return {pass:failures.length===0,failures};
}

export function parseBenefitsCsv(bytes){
  const text=Buffer.from(bytes).toString('utf8').replace(/^\uFEFF/,''),rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}else if(c==='"'){if(cell)throw new Error('CSV_UNEXPECTED_QUOTE');quoted=true;}else if(c===','){row.push(cell);cell='';}else if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=c;}
  if(quoted)throw new Error('CSV_UNTERMINATED_QUOTE');if(cell||row.length){row.push(cell);rows.push(row);}if(!rows.length)throw new Error('CSV_EMPTY');
  const [headers,...values]=rows;if(new Set(headers).size!==headers.length)throw new Error('CSV_DUPLICATE_HEADER');
  return {headers,rows:values.filter(x=>x.some(Boolean)).map(x=>{if(x.length!==headers.length)throw new Error('CSV_COLUMN_COUNT');return Object.fromEntries(headers.map((k,i)=>[k,x[i]]));})};
}
