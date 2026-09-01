import fs from 'node:fs';
import admin from 'firebase-admin';

const expectedProject = 'cxorbia-backend-dev';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const outJson = process.env.CXORBIA_ANOMALY_JSON || 'app/docs/evidence/CANONICAL-BACKEND-ANOMALY-PROBE-LATEST.json';
const outMd = process.env.CXORBIA_ANOMALY_MD || 'app/docs/evidence/CANONICAL-BACKEND-ANOMALY-PROBE-LATEST.md';
if(!credentialPath||!fs.existsSync(credentialPath)) throw new Error('credential_missing');
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject) throw new Error('wrong_project');
admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const db=admin.firestore();
const tenant=db.collection('tenants').doc('tya');

const targets=[
  {projectId:'cinepolis-abril-26',expected:34},
  {projectId:'cinepolis-junio-26-hn',expected:10},
];

function groupDup(rows,key){
  const m=new Map();
  for(const r of rows){const v=r[key]; if(v===null||v===undefined||v==='')continue; const s=String(v); if(!m.has(s))m.set(s,[]);m.get(s).push(r.id);}
  return [...m.entries()].filter(([,ids])=>ids.length>1).map(([value,ids])=>({value,ids,count:ids.length}));
}

const projects=[];
for(const t of targets){
  const snap=await tenant.collection('projects').doc(t.projectId).collection('visits').get();
  const rows=snap.docs.map(d=>{const x=d.data()||{};return {id:d.id,sourceRow:x.sourceRow??null,sourceKey:x.sourceKey??null,sourceSheet:x.sourceSheet??null,country:x.country||x.pais||null,status:x.status||x.estado||null,hasShopperId:!!x.shopperId};});
  const sourceRows=rows.filter(x=>Number.isFinite(Number(x.sourceRow))).map(x=>Number(x.sourceRow)).sort((a,b)=>a-b);
  const uniqueRows=[...new Set(sourceRows)];
  const minRow=uniqueRows.length?uniqueRows[0]:null;
  const maxRow=uniqueRows.length?uniqueRows[uniqueRows.length-1]:null;
  const rowGaps=[];
  if(minRow!==null&&maxRow!==null) for(let n=minRow;n<=maxRow;n++) if(!uniqueRows.includes(n)) rowGaps.push(n);
  const safeRecords=rows.map(x=>({id:x.id,sourceRow:x.sourceRow,sourceKeyPresent:!!x.sourceKey,sourceSheet:x.sourceSheet||null})).sort((a,b)=>Number(a.sourceRow??9999)-Number(b.sourceRow??9999)||a.id.localeCompare(b.id));
  projects.push({
    projectId:t.projectId,
    expectedVisits:t.expected,
    observedVisits:rows.length,
    delta:rows.length-t.expected,
    sourceRow:{present:sourceRows.length,unique:uniqueRows.length,min:minRow,max:maxRow,duplicateGroups:groupDup(rows,'sourceRow'),gaps:rowGaps},
    sourceKey:{present:rows.filter(x=>x.sourceKey).length,duplicateGroups:groupDup(rows,'sourceKey')},
    sourceSheet:{distinct:[...new Set(rows.map(x=>x.sourceSheet).filter(Boolean))].sort()},
    records:safeRecords,
    recordsWithShopperId:rows.filter(x=>x.hasShopperId).length,
  });
}

const report={
  schemaVersion:'cxorbia.canonical-backend-anomaly-probe.v2',
  generatedAt:new Date().toISOString(),
  projectId:expectedProject,
  readOnly:true,
  providerWrites:0,
  projects,
  conclusion:projects.every(p=>p.delta===1)?'TWO_OVERAGES_LOCATED__REVIEW_STABLE_KEYS_BEFORE_ANY_WRITE':'REVIEW_REQUIRED',
  safety:{documentWrites:0,authWrites:0,storageWrites:0,rulesWrites:0,hostingDeploys:0,production:false,merge:false,piiExported:false}
};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});
fs.writeFileSync(outJson,JSON.stringify(report,null,2)+'\n');
const md=['# CXOrbia — probe read-only de 2 excesos HR/Firestore','',`- Fecha: ${report.generatedAt}`,`- Proyecto Firebase: \`${expectedProject}\``,'- Modo: read-only; provider writes=0; sin nombres/emails/teléfonos/documentos.','',...projects.flatMap(p=>[
`## ${p.projectId}`,'',`- Esperado: ${p.expectedVisits}; observado: ${p.observedVisits}; delta: ${p.delta>=0?'+':''}${p.delta}.`,`- sourceRow presentes/únicos: ${p.sourceRow.present}/${p.sourceRow.unique}; rango ${p.sourceRow.min}..${p.sourceRow.max}.`,`- Duplicados sourceRow: ${p.sourceRow.duplicateGroups.length?JSON.stringify(p.sourceRow.duplicateGroups):'ninguno'}.`,`- Gaps sourceRow: ${p.sourceRow.gaps.length?p.sourceRow.gaps.join(', '):'ninguno'}.`,`- Duplicados sourceKey: ${p.sourceKey.duplicateGroups.length?JSON.stringify(p.sourceKey.duplicateGroups):'ninguno'}.`,`- Source sheets: ${p.sourceSheet.distinct.join(', ')||'no informado'}.`,`- Mapa sourceRow→documentId: ${p.records.map(r=>`${r.sourceRow}:${r.id}`).join(', ')}.`,`- Registros con shopperId: ${p.recordsWithShopperId}.`,'']), '## Conclusión','',`\`${report.conclusion}\``,'','No se borra ni modifica nada con este probe. Cualquier corrección requiere contraste con HR/source lock y autorización de write.',''];
fs.writeFileSync(outMd,md.join('\n'));
console.log(JSON.stringify({conclusion:report.conclusion,projects}));
