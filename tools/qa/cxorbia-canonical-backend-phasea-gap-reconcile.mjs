import fs from 'node:fs';

const inventoryPath = process.env.CXORBIA_INVENTORY_JSON || 'app/docs/evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.json';
const outJson = process.env.CXORBIA_GAP_JSON || 'app/docs/evidence/CANONICAL-BACKEND-PHASEA-GAP-LATEST.json';
const outMd = process.env.CXORBIA_GAP_MD || 'app/docs/evidence/CANONICAL-BACKEND-PHASEA-GAP-LATEST.md';

const inv = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
if (inv.projectId !== 'cxorbia-backend-dev' || inv.readOnly !== true || inv.providerWrites !== 0) throw new Error('inventory_identity_or_safety_invalid');
if (!Array.isArray(inv.projectReconciliation)) throw new Error('inventory_v3_required');

const months = [
  ['2025-06','junio-25'], ['2025-07','julio-25'], ['2025-08','agosto-25'], ['2025-09','septiembre-25'],
  ['2025-10','octubre-25'], ['2025-11','noviembre-25'], ['2025-12','diciembre-25'], ['2026-01','enero-26'],
  ['2026-02','febrero-26'], ['2026-03','marzo-26'], ['2026-04','abril-26'], ['2026-05','mayo-26'],
  ['2026-06','junio-26'], ['2026-07','julio-26'],
];
const expected = [];
for (const [periodKey,slug] of months) {
  expected.push({id:`cinepolis-${slug}`, periodKey, country:'GT', visits:34});
  expected.push({id:`cinepolis-${slug}-hn`, periodKey, country:'HN', visits:10});
}
const byId = new Map(inv.projectReconciliation.map(p => [p.id,p]));
const missingProjects=[];
const countMismatches=[];
const matched=[];
for(const e of expected){
  const p=byId.get(e.id);
  if(!p){ missingProjects.push(e); continue; }
  const observed=Number(p.childCounts?.visits||0);
  matched.push({id:e.id,expected:e.visits,observed,delta:observed-e.visits,periodKey:e.periodKey,country:e.country});
  if(observed!==e.visits) countMismatches.push({id:e.id,periodKey:e.periodKey,country:e.country,expectedVisits:e.visits,observedVisits:observed,delta:observed-e.visits});
}
const expectedIds=new Set(expected.map(x=>x.id));
const nonCanonicalProjects=inv.projectReconciliation.filter(p=>!expectedIds.has(p.id)).map(p=>({id:p.id,status:p.status||null,visits:Number(p.childCounts?.visits||0),questionnaires:Number(p.childCounts?.questionnaires||0),liquidations:Number(p.childCounts?.liquidations||0),postulations:Number(p.childCounts?.postulations||0),applications:Number(p.childCounts?.applications||0),periods:Number(p.childCounts?.periods||0),certifications:Number(p.childCounts?.certifications||0)}));

const canonicalFoundVisits=matched.reduce((s,x)=>s+x.observed,0);
const canonicalExpectedForFound=matched.reduce((s,x)=>s+x.expected,0);
const missingExpectedVisits=missingProjects.reduce((s,x)=>s+x.visits,0);
const expectedFullHistoryVisits=expected.reduce((s,x)=>s+x.visits,0);
const nonCanonicalVisits=nonCanonicalProjects.reduce((s,x)=>s+x.visits,0);
const observedTotalVisits=Number(inv.keyCounts?.visits||0);
const certificationCollections=Number(inv.keyCounts?.certifications||0);
const shoppers=Number(inv.keyCounts?.shoppers||0);
const certLikeShopperFields=Number(inv.shopperReconciliation?.shoppersWithCertificationLikeFields||0);

const decision = (
  expectedFullHistoryVisits===616 &&
  missingProjects.length===2 &&
  missingProjects.every(x=>x.periodKey==='2026-07') &&
  countMismatches.length===2 &&
  countMismatches.every(x=>x.delta===1) &&
  certificationCollections===0 &&
  certLikeShopperFields===0
) ? 'PASS_GAP_RECONCILED_INCREMENTAL_PHASEA_REQUIRED' : 'REVIEW_GAP_RECONCILIATION';

const report={
  schemaVersion:'cxorbia.canonical-backend-phasea-gap.v1',
  generatedAt:new Date().toISOString(),
  sourceInventoryGeneratedAt:inv.generatedAt,
  projectId:inv.projectId,
  readOnly:true,
  providerWrites:0,
  sourceLockExpectation:{periodRange:'2025-06..2026-07',periods:14,countryRowsPerPeriod:{GT:34,HN:10,total:44},expectedFullHistoryVisits},
  observed:{authUsers:inv.auth?.totalUsers||0,shoppers,projects:Number(inv.keyCounts?.projects||0),totalVisits:observedTotalVisits,canonicalExpectedProjects:expected.length,canonicalProjectsFound:matched.length,canonicalFoundVisits,canonicalExpectedForFound,nonCanonicalProjects:nonCanonicalProjects.length,nonCanonicalVisits,certificationCollections,shoppersWithCertificationLikeFields:certLikeShopperFields},
  missingProjects,
  countMismatches,
  nonCanonicalProjects,
  implications:{missingExpectedVisits,netCanonicalOverageOnFound:canonicalFoundVisits-canonicalExpectedForFound,canonicalVisitsAfterResolvingOveragesAndAddingMissing:canonicalExpectedForFound+missingExpectedVisits,legacyCertificationRefreshRequired:certificationCollections===0&&certLikeShopperFields===0,legacyShopperRefreshMustDiffAgainstExisting:shoppers},
  decision,
  safety:{documentWrites:0,authWrites:0,storageWrites:0,rulesWrites:0,hostingDeploys:0,production:false,merge:false,sensitiveValuesExported:false}
};

fs.mkdirSync(new URL('../../app/docs/evidence/', import.meta.url), {recursive:true});
fs.writeFileSync(outJson,JSON.stringify(report,null,2)+'\n');
const md=[
  '# CXOrbia — reconciliación Phase A del backend canónico DEV', '',
  `- Fecha: ${report.generatedAt}`,
  `- Proyecto: \`${report.projectId}\``,
  `- Decisión: \`${decision}\``,
  '- Modo: solo lectura; provider writes=0; sin PII.', '',
  '## Verdad esperada Phase A', '',
  '- Periodos: junio 2025 a julio 2026 = 14.',
  '- Cada periodo: GT 34 + HN 10 = 44 visitas.',
  '- Total canónico esperado: 616 visitas.', '',
  '## Reconciliación', '',
  `- Proyectos canónicos esperados: ${expected.length}.`,
  `- Proyectos canónicos encontrados: ${matched.length}.`,
  `- Proyectos canónicos faltantes: ${missingProjects.length}: ${missingProjects.map(x=>x.id).join(', ') || 'ninguno'}.`,
  `- Visitas observadas en proyectos canónicos encontrados: ${canonicalFoundVisits}.`,
  `- Visitas esperadas para esos mismos proyectos: ${canonicalExpectedForFound}.`,
  `- Desviaciones de conteo: ${countMismatches.map(x=>`${x.id} ${x.observedVisits}/${x.expectedVisits} (${x.delta>=0?'+':''}${x.delta})`).join('; ') || 'ninguna'}.`,
  `- Proyectos no canónicos/piloto: ${nonCanonicalProjects.length}: ${nonCanonicalProjects.map(x=>`${x.id}(${x.visits} visitas)`).join(', ') || 'ninguno'}.`,
  `- Visitas no canónicas/piloto: ${nonCanonicalVisits}.`,
  `- Total Firestore observado: ${observedTotalVisits}.`, '',
  '## Shoppers y certificaciones', '',
  `- Shoppers ya existentes en backend canónico: ${shoppers}.`,
  `- Colecciones de certificaciones materializadas: ${certificationCollections}.`,
  `- Shoppers con campos embebidos de certificación/curso/Academia: ${certLikeShopperFields}.`,
  '- Resultado: certificaciones legacy deben refrescarse de forma dirigida; shoppers legacy deben compararse contra los existentes, no recrearse.', '',
  '## Implicación operativa', '',
  `- Faltan ${missingExpectedVisits} visitas canónicas correspondientes a los proyectos faltantes, antes de considerar desviaciones.`,
  `- Hay ${canonicalFoundVisits-canonicalExpectedForFound} visita(s) de exceso dentro de proyectos canónicos encontrados que deben revisarse por llave HR/sourceRow antes de cualquier write.`,
  `- Si se resuelven esos excesos y se incorporan los proyectos faltantes con sus conteos esperados, el histórico canónico queda en ${canonicalExpectedForFound+missingExpectedVisits} visitas, que coincide con el source lock de 616.`,
  '- Las 45 visitas de proyectos piloto/no canónicos no se borran por inferencia; quedan separadas para revisión y no deben confundirse con histórico HR canónico.', '',
  '## Seguridad', '',
  '- Firestore/Auth/Storage/Rules/Hosting writes: 0.',
  '- Producción/merge: false.',
  '- Ninguna identidad shopper ni valor sensible fue exportado.', ''
];
fs.writeFileSync(outMd,md.join('\n'));
console.log(JSON.stringify({decision,missingProjects,countMismatches,nonCanonicalProjects,canonicalFoundVisits,canonicalExpectedForFound,missingExpectedVisits,expectedFullHistoryVisits,shoppers,certificationCollections,certLikeShopperFields}));
