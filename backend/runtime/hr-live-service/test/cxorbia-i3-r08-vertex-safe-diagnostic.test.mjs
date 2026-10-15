import test from 'node:test';
import assert from 'node:assert/strict';
import {vertexCertificationSafeDiagnostic,normalizeGeneratedQuestions,validateVertexQuestionSet,boundedVertexQuestionRetry} from '../certification-runtime.mjs';
test('R08 safe Vertex diagnostics preserve finishReason and shape, never output PDF text',()=>{
 const secret='PDF_INSTRUCTIVO_SECRET';
 const d=vertexCertificationSafeDiagnostic({candidates:[{finishReason:'MAX_TOKENS',content:{role:'model',parts:[{text:secret},{inlineData:{mimeType:'application/pdf'}}]}}],usageMetadata:{candidatesTokenCount:5012}},200,'application/json; charset=UTF-8');
 assert.equal(d.finishReason,'MAX_TOKENS');assert.equal(d.httpStatus,200);
 assert.equal(d.textChars,secret.length);assert.equal(d.partCount,2);assert.equal(d.outputTokens,5012);
 assert.ok(!JSON.stringify(d).includes(secret));assert.equal(d.groundingTextLogged,false);
});
test('R08 exact 15 valid, 14 incomplete and malformed JSON blocked',()=>{
 const questions=Array.from({length:15},(_,i)=>({q:'Fixture '+i,ops:['A','B','C','D'],correcta:'A',exp:'Fixture'}));
 assert.equal(normalizeGeneratedQuestions(JSON.stringify({preguntas:questions}),15).length,15);
 assert.throws(()=>normalizeGeneratedQuestions(JSON.stringify({preguntas:questions.slice(0,14)}),15),/AI_QUESTION_COUNT_INCOMPLETE/);
 assert.throws(()=>normalizeGeneratedQuestions('{"preguntas":[',15),/AI_PROVIDER_RESPONSE_NOT_JSON/);
});

test('R08 exact 15-question bank validates four unique options, explanation, no duplicate questions',()=>{
 const good=Array.from({length:15},(_,i)=>({q:'Pregunta '+i,ops:['A','B','C','D'],correcta:'A',exp:'Sustentada en instructivo'}));
 assert.equal(validateVertexQuestionSet(good,15).length,15);
 assert.throws(()=>validateVertexQuestionSet([...good.slice(0,14),{...good[14],q:good[0].q}],15),/AI_QUESTION_DUPLICATE/);
 assert.throws(()=>validateVertexQuestionSet([...good.slice(0,14),{...good[14],ops:['A','B','C']}],15),/AI_QUESTION_INVALID_SHAPE/);
 assert.throws(()=>validateVertexQuestionSet(good.slice(0,14),15),/AI_QUESTION_COUNT_INCOMPLETE/);
});
test('R08 bounded response retry succeeds on second valid provider response only',async()=>{
 const valid=Array.from({length:15},(_,i)=>({q:'Texto '+i,ops:['A','B','C','D'],correcta:'A',exp:'Instructivo'}));
 let calls=0;
 const observed=[];
 const result=await boundedVertexQuestionRetry(async attempt=>{calls++;return {raw:attempt===1?'{"preguntas":[':JSON.stringify({preguntas:valid}),diagnostic:{finishReason:'MAX_TOKENS'}};},15,{onInvalid:e=>observed.push(e)});
 assert.equal(calls,2);assert.equal(result.attempts,2);assert.equal(result.preguntas.length,15);assert.equal(observed.length,1);
 assert.equal(observed[0].code,'AI_PROVIDER_RESPONSE_NOT_JSON');
 assert.ok(!JSON.stringify(observed).includes('Texto 0'));
});
test('R08 two invalid responses fail closed; provider errors never trigger a blind retry',async()=>{
 let calls=0;
 await assert.rejects(()=>boundedVertexQuestionRetry(async()=>{calls++;return {raw:'NOT JSON',diagnostic:{finishReason:'MAX_TOKENS'}};},15),/AI_PROVIDER_RESPONSE_NOT_JSON/);
 assert.equal(calls,2);
 let httpCalls=0;
 await assert.rejects(()=>boundedVertexQuestionRetry(async()=>{httpCalls++;throw new Error('AI_PROVIDER_HTTP_503');},15),/AI_PROVIDER_HTTP_503/);
 assert.equal(httpCalls,1);
});
