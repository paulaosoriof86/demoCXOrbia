import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeGeneratedQuestions,validateVertexQuestionSet,validateQuestionSourceReferences,persistGeneratedDraft} from '../../backend/runtime/hr-live-service/certification-runtime.mjs';

const runtime=fs.readFileSync('backend/runtime/hr-live-service/certification-runtime.mjs','utf8');
const ai=fs.readFileSync('app/core/backend-ai.js','utf8');
const client=fs.readFileSync('app/core/backend-certifications.js','utf8');
const cert=fs.readFileSync('app/modules/cert.js','utf8');

test('D03 requires exactly grounded source-referenced questions',()=>{
 const preguntas=Array.from({length:15},(_,i)=>({q:'Pregunta '+(i+1),ops:['A','B','C','D'],correcta:'A',exp:'Exp '+(i+1),fuente:'[Página '+((i%3)+1)+']'}));
 const raw=JSON.stringify({preguntas});
 const normalized=normalizeGeneratedQuestions(raw,15);
 assert.equal(validateVertexQuestionSet(normalized,15).length,15);
 assert.equal(validateQuestionSourceReferences(normalized,'[Página 1] uno\n[Página 2] dos\n[Página 3] tres').length,15);
 assert.throws(()=>validateQuestionSourceReferences([{...preguntas[0],fuente:'[Página 9]'}],'[Página 1] uno'),/AI_QUESTION_SOURCE_REFERENCE_INVALID/);
});

async function proveGeneratedDraftPending(persist=persistGeneratedDraft){
 const clone=value=>JSON.parse(JSON.stringify(value)),documents=new Map(),writes=[];
 class Ref{
  constructor(path){this.path=path;this.id=path.split('/').at(-1);}
  collection(name){return {doc:id=>new Ref(this.path+'/'+name+'/'+id)};}
  async get(){const value=documents.get(this.path);return {id:this.id,exists:value!==undefined,data:()=>value===undefined?undefined:clone(value)};}
 }
 const db={collection:name=>({doc:id=>new Ref(name+'/'+id)}),runTransaction:async work=>{
  const pending=[];await work({get:ref=>ref.get(),set:(ref,value)=>pending.push([ref.path,clone(value)])});
  for(const [path,value] of pending){documents.set(path,value);writes.push(path);}
 }};
 const scope={tenantId:'qa-d03',projectId:'qa-project'},principal={uid:'qa-author'},body={periodId:'qa-project-2026-10',questionCount:15,gate:80};
 const input={sourceSha256:'a'.repeat(64),sourceTitle:'QA source',documentSource:{mode:'manual_text'}};
 const generated={preguntas:Array.from({length:15},(_,i)=>({q:'QA '+i,ops:['A','B','C','D'],correcta:'A',exp:'QA',fuente:'[Página 1]'})),
  requestedQuestionCount:15,gate:80,provider:'synthetic-no-network',model:'fixture',contentRevision:'qa-d03-revision',generationAttempts:1};
 const result=await persist(db,scope,principal,body,input,generated,'qa-d03-exact-operation');
 const banks=[...documents.values()].filter(row=>row.resourceType==='certification_bank');
 assert.equal(banks.length,1);assert.equal(writes.length,2);assert.equal(result.providerWrites,2);
 assert.equal(banks[0].bank.estado,'pending_review','D03_GENERATION_DURABLE_PENDING_REVIEW_REQUIRED');
 assert.deepEqual(result.item.bank,banks[0].bank);
 assert.equal(banks[0].bank.generadoPorUid,principal.uid);assert.equal(banks[0].bank.preguntas.length,15);
 for(const key of ['publicationAuthority','publishedAt','revisadoPorUid','revisadoPor'])assert.equal(Object.hasOwn(banks[0].bank,key),false);
 assert.equal(result.receipt.commandType,'certification.ai-generate');assert.equal(result.receipt.providerAck,true);
 assert.equal(result.receipt.entityId,result.item.id);assert.equal(result.receipt.entityVersion,result.item.version);
 const before=clone([...documents]);
 const replay=await persist(db,scope,principal,body,input,generated,'qa-d03-exact-operation');
 assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);assert.equal(writes.length,2);
 assert.deepEqual([...documents],before);assert.equal(replay.item.bank.estado,'pending_review');
}

test('D03 backend persists only pending_review with receipt and readback',async()=>{
 assert.match(runtime,/estado:'pending_review'/);
 assert.match(runtime,/commandReceipts/);
 assert.match(runtime,/AI_PERSISTENCE_IDEMPOTENCY_REQUIRED/);
 assert.match(runtime,/AI_PERSISTENCE_READBACK_MISMATCH/);
 assert.match(runtime,/readbackVerified:true/);
 assert.match(runtime,/idempotentReplay:true/);
 await proveGeneratedDraftPending();
});

test('D03 persistence proof rejects automatic publication even if its readback accepts published state',async()=>{
 // Mutate the actual generation writer and its readback guard in memory only.
 // The explicit D05 publication route elsewhere in the module remains valid.
 const writer="generadoPorUid:str(principal.uid),estado:'pending_review'";
 const readback="if(str(bank.estado)!=='pending_review'||str(bank.contentRevision)!==str(generated.contentRevision)";
 assert.equal(runtime.split(writer).length,2);assert.equal(runtime.split(readback).length,2);
 const mutated=runtime.replace(writer,writer.replace("'pending_review'","'published'"))
  .replace(readback,readback.replace("'pending_review'","'published'"));
 const module=await import('data:text/javascript;base64,'+Buffer.from(mutated).toString('base64'));
 await assert.rejects(()=>proveGeneratedDraftPending(module.persistGeneratedDraft),/D03_GENERATION_DURABLE_PENDING_REVIEW_REQUIRED/);
});

test('D03 provider prompt and validation require source reference',()=>{
 assert.match(runtime,/fuente":"\[Página N\]"/);
 assert.match(runtime,/referencia fuente a una página real/);
 assert.match(runtime,/!str\(q\.fuente\)/);
 assert.match(runtime,/validateQuestionSourceReferences\(preguntas,sourceText\)/);
});

test('D03 browser uses existing secure route and does not perform a second certStore save',()=>{
 assert.match(client,/cert\.generate/);
 assert.match(ai,/periodId:str\(opts\.periodId\)/);
 assert.match(ai,/sourceSha256:str\(opts\.sourceSha256\)/);
 const start=cert.indexOf("const generated=await CX.ai.ask");
 const end=cert.indexOf("close();ui.toast('Banco generado",start);
 const body=cert.slice(start,end);
 assert.match(body,/readbackVerified===true/);
 assert.match(body,/estado==='pending_review'/);
 assert.doesNotMatch(body,/CX\.certStore\.save/);
});

test('D03 input, provider and persistence failures remain distinguishable',()=>{
 assert.match(runtime,/AI_INPUT_SOURCE_SHA256_REQUIRED/);
 assert.match(runtime,/AI_INPUT_PARSER_QUALITY_INSUFFICIENT/);
 assert.match(runtime,/AI_PROVIDER_HTTP_/);
 assert.match(runtime,/AI_PERSISTENCE_READBACK_MISSING/);
});
