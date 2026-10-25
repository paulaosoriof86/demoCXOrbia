import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {maybeHandleCertificationRuntimeRequest} from '../certification-runtime.mjs';

test('D03 valid attached document metadata reaches receipt preflight without ReferenceError and without writes',async()=>{
  const body={
    sourceText:'[Página 1] '+('Instructivo de visita misteriosa vigente, plazos, evidencias y asignación. '.repeat(12)),
    sourceSha256:'a'.repeat(64),sourceTitle:'Instructivo Shopper.pdf',periodId:'cinepolis-2026-09',
    questionCount:15,gate:80,
    documentSource:{mode:'attachment',name:'Instructivo Shopper.pdf',format:'pdf',source_sha256:'a'.repeat(64),extraction_quality:{sufficient:true,pageCount:7},ocrExecuted:false}
  };
  const req=Readable.from([JSON.stringify(body)]);
  req.method='POST';req.headers={'idempotency-key':'d03-focal-no-write'};
  const fakeDb={collection(){return this;},doc(){return this;},async get(){throw new Error('D03_STOP_AFTER_SANITIZE_BEFORE_PROVIDER');}};
  let reply;
  const handled=await maybeHandleCertificationRuntimeRequest(req,{},new URL('https://dev.example/api/tenants/tya/projects/cinepolis/certifications/ai-generate'),{
    ensureAdmin:()=>({db:fakeDb}),
    verifyPrincipal:async()=>({uid:'test-admin',role:'super'}),
    sendJson:(_r,status,data)=>{reply={status,data};},
    currentSourceRevision:()=>null
  });
  assert.equal(handled,true);
  assert.equal(reply?.data?.code,'D03_STOP_AFTER_SANITIZE_BEFORE_PROVIDER');
  assert.equal(reply?.data?.committed,false);
  assert.equal(reply?.data?.providerAck,false);
  assert.equal(reply?.data?.production,false);
});
