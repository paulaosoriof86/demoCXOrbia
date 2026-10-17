import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeGeneratedQuestions,validateVertexQuestionSet,validateQuestionSourceReferences} from '../../backend/runtime/hr-live-service/certification-runtime.mjs';

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

test('D03 backend persists only pending_review with receipt and readback',()=>{
 assert.match(runtime,/estado:'pending_review'/);
 assert.match(runtime,/commandReceipts/);
 assert.match(runtime,/AI_PERSISTENCE_IDEMPOTENCY_REQUIRED/);
 assert.match(runtime,/AI_PERSISTENCE_READBACK_MISMATCH/);
 assert.match(runtime,/readbackVerified:true/);
 assert.match(runtime,/idempotentReplay:true/);
 assert.doesNotMatch(runtime,/estado:'published'.*ai-generate/s);
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
