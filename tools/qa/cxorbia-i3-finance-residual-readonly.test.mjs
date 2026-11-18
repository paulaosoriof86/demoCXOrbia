import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {FINANCE_COLLECTIONS,amountOf,advanceCandidate,paymentEvidence,buildFinanceManifest,encryptManifest,validateReadonlyScope,runFinanceResidualReadonly} from './cxorbia-i3-finance-residual-readonly.mjs';
const scope={tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-09'};
const movement={docId:'advance-a',id:'advance-a',tenantId:'tya',projectId:'cinepolis',tipo:'ingreso',tipoIngreso:'anticipo',amount:7300,country:'GT',currency:'Q'};
test('current durable collections, never old paymentBatches',()=>{assert.equal(FINANCE_COLLECTIONS.movements,'financialMovements');assert.equal(FINANCE_COLLECTIONS.lots,'paymentLots');});
test('zero amount is not replaced by monto',()=>assert.deepEqual(amountOf({amount:0,monto:7300}),{amount:0,conflict:true}));
test('amount field conflict is retained, not certified',()=>assert(advanceCandidate({...movement,monto:7200},'cinepolis').conflicts.includes('AMOUNT_FIELDS_CONFLICT')));
test('secondary amount match is not lost when primary amount conflicts',()=>assert(advanceCandidate({...movement,amount:7200,monto:7300},'cinepolis').conflicts.includes('AMOUNT_FIELDS_CONFLICT')));
test('currency aliases cannot hide conflict',()=>assert(advanceCandidate({...movement,currency:'USD',moneda:'Q'},'cinepolis').conflicts.includes('CURRENCY_FIELDS_CONFLICT')));
test('country aliases cannot hide conflict',()=>assert(advanceCandidate({...movement,pais:'HN'},'cinepolis').conflicts.includes('COUNTRY_FIELDS_CONFLICT')));
test('wrong tenant cannot be scope exact',()=>assert(advanceCandidate({...movement,tenantId:'other'},'cinepolis').conflicts.includes('TENANT_SCOPE_CONFLICT')));
test('emulator is rejected before credentials or provider reads',async()=>{await assert.rejects(runFinanceResidualReadonly({env:{FIRESTORE_EMULATOR_HOST:'localhost:8080'}}),/EMULATOR_NOT_LIVE/);});
test('scope exact candidate still not selected as owner-approved bank transfer',()=>{const r=buildFinanceManifest({movements:[movement]},scope);assert.equal(r.advances.structurallyScopedIds.length,1);assert.deepEqual(r.advances.selectedExactIds,[]);});
test('global advance never assigned to project by amount',()=>assert(advanceCandidate({...movement,projectId:null,global:true},'cinepolis').conflicts.includes('PROJECT_SCOPE_UNPROVEN')));
test('wrong currency excluded',()=>assert.equal(advanceCandidate({...movement,currency:'USD'},'cinepolis'),null));
test('amount classification missing is explicit gap',()=>assert(advanceCandidate({...movement,tipoIngreso:null},'cinepolis').conflicts.includes('ADVANCE_CLASSIFICATION_UNPROVEN')));
test('durable ID is not overwritten by data alias',()=>assert(advanceCandidate({...movement,id:'different'},'cinepolis').conflicts.includes('DOCUMENT_ID_ALIAS_CONFLICT')));
test('no inferred allocation from equal amounts/dates',()=>{const r=buildFinanceManifest({movements:[movement,{docId:'paid',tipo:'egreso',amount:7300,fecha:'2026-10-31'}]},scope);assert.equal(r.advances.applications[0].allocationEvidence,'NO_EXPLICIT_DURABLE_LINK_FOUND');});
test('explicit account links preserved',()=>{const r=buildFinanceManifest({movements:[movement,{docId:'applied',accountId:'account-a'}],accounts:[{docId:'account-a',sourceMovementId:'advance-a',lastMovementId:'applied'}]},scope);assert.deepEqual(r.advances.applications[0].movementIds,['applied']);});
test('paid label does not establish external transfer',()=>assert.deepEqual(paymentEvidence({estado:'Pagado',providerAck:true}),{externalConfirmed:false,historicalConfirmed:false,platformRecorded:false,paidLabelOnly:true}));
test('external confirmation requires reference',()=>{assert.equal(paymentEvidence({externalPaymentConfirmed:true}).externalConfirmed,false);assert.equal(paymentEvidence({externalPaymentConfirmed:true,paymentRef:'verified-ref'}).externalConfirmed,true);});
test('September exact project period, aliases separate',()=>{const r=buildFinanceManifest({visits:[{docId:'a',periodId:scope.periodId},{docId:'b',periodId:'2026-09'}]},scope);assert.equal(r.september.visits.length,1);assert.equal(r.september.periodAliasRows.length,1);});
test('prior reconciliation cannot cross project/period by HR row',()=>{const r=buildFinanceManifest({visits:[{docId:'a',hrRowId:'row-a',periodId:scope.periodId}],reconciliations:[{docId:'r',hrRowId:'row-a',projectId:'other',periodId:scope.periodId}]},scope);assert.equal(r.september.visits[0].priorReconciliations.length,0);});
test('missing lot and shopper need explicit review',()=>{const r=buildFinanceManifest({visits:[{docId:'a',periodId:scope.periodId,loteId:'missing'}]},scope);assert(r.september.visits[0].review.includes('REFERENCED_LOT_MISSING'));assert(r.september.visits[0].review.includes('SHOPPER_ID_MISSING'));});
test('encrypted artifact roundtrip and tamper rejection',()=>{
 const k=crypto.generateKeyPairSync('rsa',{modulusLength:2048});const plain={privateName:'not-public',amount:123};
 const e=encryptManifest(plain,k.publicKey);assert(!JSON.stringify(e).includes('not-public'));
 const key=crypto.privateDecrypt({key:k.privateKey,oaepHash:'sha256'},Buffer.from(e.key,'base64'));
 const decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(e.iv,'base64'));decipher.setAuthTag(Buffer.from(e.tag,'base64'));
 assert.deepEqual(JSON.parse(Buffer.concat([decipher.update(Buffer.from(e.ciphertext,'base64')),decipher.final()]).toString()),plain);
 const bad=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(e.iv,'base64'));bad.setAuthTag(Buffer.alloc(16));assert.throws(()=>{bad.update(Buffer.from(e.ciphertext,'base64'));bad.final();});
});
test('scope rejects stale materialization and production',()=>{
 const key=crypto.generateKeyPairSync('rsa',{modulusLength:2048}).publicKey.export({type:'spki',format:'pem'});
 const args={descriptor:{productSourceSha:'current',currentMaterialization:{sourceSha:'current',sourceTree:'tree',production:false,sourceHostedExact:true,hrLiveVerified:true}},current:{production:'DO_NOT_TOUCH',authorizationI4:false},scope:{...scope,mode:'READONLY_SEP_ADVANCES',sourceSha:'current',sourceTree:'tree',providerWrites:0,production:false,encryptionPublicKey:key},source:'current',tree:'tree',project:'cxorbia-backend-dev',host:'https://cxorbia-backend-dev.web.app',period:scope.periodId};
 assert.equal(validateReadonlyScope(args),true);assert.throws(()=>validateReadonlyScope({...args,source:'historical'}));assert.throws(()=>validateReadonlyScope({...args,current:{...args.current,authorizationI4:true}}));
});
test('mode exits before legacy commands, wrong modes fail closed',()=>{
 const source=fs.readFileSync('tools/qa/cxorbia-prei4-final-focal-finance-live.mjs','utf8');
 const mode=source.indexOf('const financeMode=');const command=source.indexOf('\nrunC01ConciliarIfRequired();');
 assert(mode>0&&mode<command);assert(source.slice(mode,command).includes('process.exit(0)'));assert(source.slice(mode,command).includes('UNKNOWN_FINANCE_FOCAL_MODE'));
});
test('reader has no remote write or HR refresh APIs',()=>{
 const src=fs.readFileSync('tools/qa/cxorbia-i3-finance-residual-readonly.mjs','utf8');
 assert(!/\bfetch\s*\(|\.collection\([^\n]+\)\.(?:add|set|update|delete)\s*\(|\.batch\s*\(|\.runTransaction\s*\(/.test(src));
 assert(!src.includes('signInWithCustomToken'));assert(!src.includes('getAuth('));
});
test('public artifact excludes raw cloud runtime metadata',()=>{
 const src=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-dev-certification.yml','utf8');
 const finance=src.slice(src.indexOf('  i3-finance-focal-reproof:'),src.indexOf('  vrm085-postulation-sync-diagnostic:'));
 assert(finance.includes("&& '.tmp/i3-finance-focal/readonly'"));
});
test('canonical workflow stays below its existing 510000-byte guard',()=>{
 const workflow=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-dev-certification.yml');assert(workflow.byteLength<510000);
 const step=fs.readFileSync('tools/qa/cxorbia-i3-finance-current-readback.sh','utf8');assert(step.includes('runtimeTrafficExact:true'));assert(step.includes('hostingBeforeAfterSame:true'));
});
