import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {FINANCE_COLLECTIONS,IDENTITY_LINK_COLLECTION,identityLinkAssessment,identityAuthorityEligible,summarizeIdentityPreflight,amountOf,advanceCandidate,paymentEvidence,buildFinanceManifest,encryptManifest,validateReadonlyScope,runFinanceResidualReadonly} from './cxorbia-i3-finance-residual-readonly.mjs';
const scope={tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-09'};
const movement={docId:'advance-a',id:'advance-a',tenantId:'tya',projectId:'cinepolis',tipo:'ingreso',tipoIngreso:'anticipo',amount:7300,country:'GT',currency:'Q'};
test('public identity summary has counts only and no private IDs',()=>{
 const raw=[{visitId:'secret-a',candidateLinks:[{docId:'private-link'}]},{visitId:'secret-b',candidateLinks:[]},{visitId:'secret-c',candidateLinks:[{docId:'x'},{docId:'y'}]}];
 const result=summarizeIdentityPreflight(raw,25);
 assert.deepEqual(result,{identityLinkRecordsRead:25,identityConflictVisits:3,zeroLinkCandidates:1,oneLinkCandidate:1,multipleLinkCandidates:1,zeroStructurallyAuthorized:3,oneStructurallyAuthorized:0,multipleStructurallyAuthorized:0,autoAdjudicated:0,privateIdsExposed:false});
 assert(!JSON.stringify(result).includes('secret-')&&!JSON.stringify(result).includes('private-link'));
});
test('current durable collections, never old paymentBatches',()=>{assert.equal(FINANCE_COLLECTIONS.movements,'financialMovements');assert.equal(FINANCE_COLLECTIONS.lots,'paymentLots');});
test('provider identity link path is the durable tenant collection',()=>assert.equal(IDENTITY_LINK_COLLECTION,'shopperIdentityLinks'));
test('identity conflicts are read only and require exact alias evidence',()=>{
 const visit={docId:'visit-a',shopperId:'new-a',priorReconciliations:[{shopperId:'old-a'}]};
 const good={docId:'link-a',canonicalShopperId:'new-a',sourceIdentityAliases:['old-a'],authorityType:'provider_exact',status:'active'};
 const wrong={...good,docId:'link-other',sourceIdentityAliases:['other']};
 assert.deepEqual(identityLinkAssessment([visit],[wrong])[0].candidateLinks,[]);
 const rows=identityLinkAssessment([visit],[good,wrong]);assert.deepEqual(rows[0].candidateLinks.map(x=>x.docId),['link-a']);
 assert.equal(rows[0].automaticAdjudication,false);
});
test('ambiguous identity links remain unresolved, never auto-selected',()=>{
 const row={docId:'v',shopperId:'new',priorReconciliations:[{shopperId:'old'}]};
 const link={canonicalShopperId:'new',sourceAliases:['old'],status:'active',authorityType:'provider_exact'};
 const found=identityLinkAssessment([row],[{...link,docId:'a'},{...link,docId:'b'}]);
 assert.equal(found[0].candidateLinks.length,2);
 assert.equal(found[0].automaticAdjudication,false);
});
test('exact provider structural identity policy mirrors all mandatory supersession guards',()=>{
 const link={docId:'irl_123456789',tenantId:'tya',projectScope:'cinepolis',canonicalShopperId:'new',sourceIdentityAliases:['old'],
   sourceSystem:'hr-provider',status:'active',authorityType:'provider_exact',authorityRef:'provider-ack',periodIndependent:true,sourceSafe:true};
 assert.equal(identityAuthorityEligible(link,'old','new','tya','cinepolis'),true);
 for(const change of [{periodIndependent:false},{authorityRef:null},{sourceSystem:'internal'},{status:'draft'},
   {tenantId:'other'},{projectScope:'other'},{sourceSafe:false},{periodId:'cinepolis-2026-09'},{docId:'fake'}]){
   assert.equal(identityAuthorityEligible({...link,...change},'old','new','tya','cinepolis'),false);
 }
 assert.equal(identityAuthorityEligible(link,'other','new','tya','cinepolis'),false);
 const row={docId:'v',shopperId:'new',priorReconciliations:[{shopperId:'old'}]};
 const resolved=identityLinkAssessment([row],[link]);
 assert.equal(resolved[0].candidateLinks[0].structurallyAuthorized,true);
 const aggregated=summarizeIdentityPreflight(resolved,1);
 assert.equal(aggregated.oneStructurallyAuthorized,1);
});
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
test('read-only branch resolves no browser and dependency failures are observable',()=>{
 const src=fs.readFileSync('tools/qa/cxorbia-prei4-final-focal-finance-live.mjs','utf8');
 assert(!src.includes("import {chromium} from 'playwright'"));assert(src.indexOf("await import('playwright')")>src.indexOf('process.exit(0)'));
 const deps=fs.readFileSync('tools/qa/cxorbia-i3-finance-dependencies.sh','utf8'),branch=deps.split(/\n(?:elif\b|else\b)/)[0];
 assert(!branch.includes('playwright'));assert(branch.includes('tee'));assert(branch.includes('set -Eeuo pipefail'));assert(!branch.includes('>/dev/null'));
});
test('dependency helper belongs only to the finance job',()=>{
 const src=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-dev-certification.yml','utf8');const target='bash tools/qa/cxorbia-i3-finance-dependencies.sh';
 assert.equal(src.split(target).length-1,1);assert(src.slice(src.indexOf('  i3-finance-focal-reproof:'),src.indexOf('  vrm085-postulation-sync-diagnostic:')).includes(target));
});

import {pdfContentDiagnostic} from './cxorbia-i3-finance-ui-export-readonly.mjs';
const sample={pages:1,title:'Movimientos & Tesorería',periodLabel:'Octubre 2026',rows:[['2026-10-31','Remesa de anticipo Noviembre',7300]]};
const exact='Movimientos & Tesorería Octubre 2026 2026-10-31 Remesa de anticipo Noviembre 7300';
test('exact PDF text passes all predicates',()=>{const r=pdfContentDiagnostic({...sample,text:exact});assert.equal(r.matches,true);assert.equal(r.missingCellCount,0);});
test('wrapped date remains failed and is identified without exposing its value',()=>{const r=pdfContentDiagnostic({...sample,text:exact.replace('2026-10-31','2026-10- 31')});assert.equal(r.matches,false);assert.deepEqual(r.missingCells.map(x=>[x.row,x.column,x.matchesIgnoringWhitespace]),[[0,0,true]]);assert.equal(JSON.stringify(r).includes('2026-10-31'),false);});
test('changed amount remains failed with no whitespace-equivalence false credit',()=>{const r=pdfContentDiagnostic({...sample,text:exact.replace('7300','7301')});assert.equal(r.matches,false);assert.deepEqual(r.missingCells.map(x=>[x.row,x.column,x.matchesIgnoringWhitespace]),[[0,2,false]]);});
test('missing title or period remains failed with explicit scope',()=>{assert.equal(pdfContentDiagnostic({...sample,text:exact.replace(sample.title,'Otro')}).titleMatches,false);const r=pdfContentDiagnostic({...sample,text:exact.replace(sample.periodLabel,'Noviembre 2026')});assert.equal(r.matches,false);assert.equal(r.periodMatches,false);});
test('zero pages cannot pass even if text matches',()=>{assert.equal(pdfContentDiagnostic({...sample,pages:0,text:exact}).matches,false);});
