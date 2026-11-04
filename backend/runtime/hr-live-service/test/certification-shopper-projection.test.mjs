import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {
  certificationRouteScope,shopperResourceProjection,readShopperResourceProjection,
  calculateCertificationPractice,maybeHandleCertificationRuntimeRequest
} from '../certification-runtime.mjs';

const scope={tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10'};
const shopper={uid:'qa-shopper',role:'shopper',namespace:'shopper',shopperId:'shopper-qa'};
const question={q:'¿Cómo se identifica la visita?',ops:['A','B','C','D'],correcta:'A',exp:'Solo al finalizar',fuente:'[Página 1]'};
const bank=(id,state='published')=>({id,tenantId:'tya',projectId:'cinepolis',periodId:scope.periodId,
  status:'active',resourceType:'certification_bank',tipo:'certification_bank',visibleRoles:['shopper'],version:3,
  bank:{estado:state,certificationId:'main',certificationName:'Cinépolis QA',gate:80,contentRevision:'qa-rev',
    documentSource:{source_sha256:'SECRET_SOURCE'},preguntas:[question]}});
const pdf={id:'doc-qa',tenantId:'tya',projectId:'cinepolis',periodId:scope.periodId,
  resourceType:'project_resource',tipo:'pdf',status:'active',visibleRoles:['shopper'],n:'Guía',url:'https://example.invalid/guia.pdf'};

function mockDb(rows){
  const all=new Map(rows.map(row=>[row.id,row]));
  return {collection:()=>({doc:()=>({collection:()=>({
    where:(field,op,value)=>({get:async()=>({docs:[...all.values()].filter(row=>row[field]===value)
      .map(row=>({id:row.id,data:()=>row}))})}),
    doc:id=>({get:async()=>({exists:all.has(id),data:()=>all.get(id)})})
  })})})};
}

test('VRM297 released projection removes every answer, explanation and source secret',()=>{
  const row=shopperResourceProjection(bank('pub'),scope);
  assert.ok(row);
  assert.deepEqual(row.bank.preguntas,[{q:question.q,ops:question.ops}]);
  assert.equal(row.bank.contentRevision,'qa-rev');
  for(const forbidden of ['correcta','exp','fuente','documentSource','SECRET_SOURCE'])
    assert.equal(JSON.stringify(row).includes(forbidden),false,forbidden);
  assert.deepEqual(shopperResourceProjection(pdf,scope),pdf);
});

test('VRM297 never projects pending, another period, another tenant, hidden, or conflicting legacy type',()=>{
  assert.equal(shopperResourceProjection(bank('draft','pending_review'),scope),null);
  assert.equal(shopperResourceProjection({...bank('other'),periodId:'cinepolis-2026-09'},scope),null);
  assert.equal(shopperResourceProjection({...bank('other'),tenantId:'other'},scope),null);
  assert.equal(shopperResourceProjection({...bank('hidden'),visibleRoles:[]},scope),null);
  assert.equal(shopperResourceProjection({...bank('legacy'),resourceType:'project_resource'},scope),null);
  assert.equal(shopperResourceProjection({...bank('legacy2'),tipo:'pdf'},scope),null);
  assert.equal(shopperResourceProjection({...pdf,tipo:'certification_bank',bank:{preguntas:[question]}},scope),null);
  assert.equal(shopperResourceProjection({...pdf,projectId:'other'},scope),null);
});

test('VRM297 server read preserves ordinary PDFs and published exam but no draft or key',async()=>{
  const db=mockDb([pdf,bank('pub'),bank('draft','pending_review'),bank('preview','approved_preview')]);
  const result=await readShopperResourceProjection(db,scope,shopper,scope.periodId);
  assert.deepEqual(result.items.map(row=>row.id),['doc-qa','pub','preview']);
  assert.equal(result.count,3);
  assert.equal(JSON.stringify(result).includes('SECRET_SOURCE'),false);
  assert.equal(JSON.stringify(result).includes('correcta'),false);
  await assert.rejects(readShopperResourceProjection(db,scope,{...shopper,role:'admin'},scope.periodId),/AUTH_FAILURE/);
  await assert.rejects(readShopperResourceProjection(db,scope,shopper,'../other'),/CERT_PERIOD_REQUIRED/);
});

test('VRM297 practice grades only on the backend and does not create attempts',async()=>{
  const db=mockDb([bank('preview','approved_preview'),bank('pub')]);
  const result=await calculateCertificationPractice(db,scope,shopper,{periodId:scope.periodId,bankResourceId:'preview',answers:['A']});
  assert.equal(result.score,100);assert.equal(result.pass,true);
  assert.equal(result.feedback[0].correcta,'A');
  await assert.rejects(calculateCertificationPractice(db,scope,shopper,{periodId:scope.periodId,bankResourceId:'pub',answers:['A']}),/CERT_PRACTICE_SCOPE_MISMATCH/);
  await assert.rejects(calculateCertificationPractice(db,scope,shopper,{periodId:scope.periodId,bankResourceId:'preview',answers:[]}),/CERT_ANSWERS_INCOMPLETE/);
});

test('VRM297 authenticated HTTP GET is scoped and practice POST is non-persistent',async()=>{
  const db=mockDb([pdf,bank('pub'),bank('preview','approved_preview')]);
  const invoke=async(method,action,payload,principal=shopper)=>{
    const req=Readable.from(payload===null?[]:[JSON.stringify(payload)]);
    req.method=method;req.headers={authorization:'Bearer qa'};
    let result;
    const handled=await maybeHandleCertificationRuntimeRequest(req,{},
      new URL('https://dev.example/api/tenants/tya/projects/cinepolis/certifications/'+action+(method==='GET'?'?periodId='+scope.periodId:'')),{
        ensureAdmin:()=>({db}),verifyPrincipal:async()=>principal,
        sendJson:(_res,status,body)=>{result={status,body};},currentSourceRevision:()=>''
      });
    assert.equal(handled,true);return result;
  };
  assert.equal(certificationRouteScope('/api/tenants/tya/projects/cinepolis/certifications/shopper-resources').action,'shopper-resources');
  const getter=await invoke('GET','shopper-resources',null);
  assert.equal(getter.status,200);assert.equal(getter.body.items.length,3);
  assert.equal(JSON.stringify(getter.body).includes('correcta'),false);
  assert.equal((await invoke('GET','shopper-resources',null,{...shopper,role:'admin'})).status,403);
  const practice=await invoke('POST','practice',{periodId:scope.periodId,bankResourceId:'preview',answers:['B']});
  assert.equal(practice.status,200);assert.equal(practice.body.preview,true);
  assert.equal(practice.body.committed,false);assert.equal(practice.body.providerWrites,0);
  assert.equal((await invoke('GET','attempt',null)).status,405);
});


test('I3 P0 / latest published project instructive remains visible for new period, without leaking old exams',async()=>{
  const november={...scope,periodId:'cinepolis-2026-11'};
  const guide={...pdf,id:'oct-guide',periodId:'cinepolis-2026-10',n:'Instructivo Shopper',
    storagePath:'tenants/tya/projects/cinepolis/periods/cinepolis-2026-10/resources/res-guide/Instructivo.pdf'};
  const older={...guide,id:'sep-guide',periodId:'cinepolis-2026-09',
    storagePath:'tenants/tya/projects/cinepolis/periods/cinepolis-2026-09/resources/res-guide/Instructivo.pdf'};
  const changedProject={...guide,id:'other-guide',projectId:'other-project'};
  const changedVisit={...guide,id:'visit-guide',visitaId:'visit-old'};
  const bankOld={...bank('oct-exam'),periodId:'cinepolis-2026-10'};
  const result=await readShopperResourceProjection(
    mockDb([older,guide,changedProject,changedVisit,bankOld]),november,shopper,november.periodId);
  assert.deepEqual(result.items.map(item=>item.id),['oct-guide']);
  assert.equal(result.items[0].inheritedProjectGuide,true);
  assert.equal(result.items[0].periodId,'cinepolis-2026-10');
  assert.equal(JSON.stringify(result).includes('correcta'),false);
});
