import test from 'node:test';
import assert from 'node:assert/strict';
import {vertexCertificationSafeDiagnostic,normalizeGeneratedQuestions} from '../certification-runtime.mjs';
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
