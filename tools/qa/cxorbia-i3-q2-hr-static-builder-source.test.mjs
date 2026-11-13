import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const owner=path.resolve('tools/hr-source/tya-build-live-hr-source-safe-static.mjs');
const headers=['País','ID CINEMA','Shopping','Shopper Asignado','Fecha realizada','Fecha submitido','Control día s/ franja horaria','Honorarios','Precio de boleto'];
const names=['OCTUBRE 26','OCTUBRE 26 HN','NOVIEMBRE','NOVIEMBRE HN'];
const fixtureRows=names.map((tab,i)=>({range:tab,values:[headers,[i%2?'HN':'GT',`CIN-${i+1}`,`Sucursal-${i+1}`,'Nombre Protegido Original',i===0?'2026-10-12':'',i===0?'2026-10-14':'',i===2?'P X ASIGNAR':'',i%2?'L 50':'Q 45','Q 30']]}));

function offlineRun({badTabs=false}={}){
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-q2-static-builder-'));
  const out=path.join(temp,'safe.js');
  const privateKey=crypto.generateKeyPairSync('rsa',{modulusLength:2048}).privateKey.export({type:'pkcs8',format:'pem'});
  const fakeServiceAccount={type:'service_account',client_email:'fixture@not-real.invalid',project_id:'offline-test-only',private_key:privateKey};
  const source=`
    const tabs=${JSON.stringify(badTabs?['DASHBOARD']:names)};
    const ranges=${JSON.stringify(fixtureRows)};
    globalThis.fetch=async(input,options={})=>{
      const u=String(input);
      if(u.includes('oauth2.googleapis.com/token'))return{ok:true,json:async()=>({access_token:'OFFLINE_TOKEN'})};
      if(u.includes('sheets.googleapis.com')&&u.includes('values:batchGet'))return{ok:true,json:async()=>({valueRanges:ranges})};
      if(u.includes('sheets.googleapis.com'))return{ok:true,json:async()=>({properties:{title:'HR OFFLINE FIXTURE'},sheets:tabs.map((title,index)=>({properties:{title,index}}))})};
      if(u.includes('/export?format=xlsx'))return{ok:false,status:403,headers:{get:()=> 'application/json'},arrayBuffer:async()=>new ArrayBuffer(0)};
      throw Error('NETWORK_REQUEST_NOT_IN_TEST_CONTRACT:'+u);
    };`;
  const loader=`data:text/javascript,${encodeURIComponent(source)}`;
  const result=spawnSync(process.execPath,['--import',loader,owner],{
    cwd:temp,encoding:'utf8',timeout:15000,
    env:{...process.env,CXORBIA_HR_LIVE_SHEET_ID:'offline-sheet-fixture',CXORBIA_HR_SOURCE_SAFE_OUT:out,FIREBASE_SERVICE_ACCOUNT_JSON:JSON.stringify(fakeServiceAccount),CXORBIA_DEV_BUILD_LABEL:'offline-q2-proof'}
  });
  return {temp,out,result};
}

test('Q2 static builder reads offline GT/HN, Oct/Nov fixture and redacts shopper PII',()=>{
  const run=offlineRun();
  try{
    assert.equal(run.result.status,0,run.result.stderr?.slice(0,1000));
    assert.equal(fs.existsSync(run.out),true);
    const js=fs.readFileSync(run.out,'utf8');
    assert.ok(js.startsWith('/* CXOrbia TyA live HR source-safe DEV payload.'));
    assert.equal(js.includes('Nombre Protegido Original'),false);
    assert.equal(js.includes('OFFLINE_TOKEN'),false);
    const body=js.slice(js.indexOf('=')+1).trim().replace(/;$/,'');
    const snapshot=JSON.parse(body);
    assert.equal(snapshot.sourceSafe,true);
    assert.equal(snapshot.production,false);
    assert.equal(snapshot.imported,false);
    assert.equal(snapshot.firestoreWrites,0);
    assert.equal(snapshot.source.accessMode,'sheets_api_service_account');
    assert.equal(snapshot.source.serviceAccountEmailMasked,'***@not-real.invalid');
    assert.equal(snapshot.counts.periods,2);
    assert.equal(snapshot.counts.tabs,4);
    assert.equal(snapshot.counts.visits,4);
    assert.equal(snapshot.counts.byCountry.GT,2);
    assert.equal(snapshot.counts.byCountry.HN,2);
    assert.deepEqual(snapshot.periods.map(p=>p.key),['2026-10','2026-11']);
    assert.equal(snapshot.visits.every(v=>v.sourceSafe===true&&v.piiProtected===true),true);
    assert.equal(snapshot.visits.every(v=>v.shopper==='Shopper protegido'),true);
    assert.equal(snapshot.visits.every(v=>v.shopperId.startsWith('shopper_')),true);
    assert.equal(snapshot.visits.find(v=>v.country==='HN').currency,'L');
    assert.equal(snapshot.visits.find(v=>v.country==='GT').currency,'Q');
    assert.equal(snapshot.visits[0].estado,'liquidada');
    assert.equal(snapshot.visits[2].estado,'disponible');
    const raw=JSON.stringify(snapshot);
    assert.equal(raw.includes('private_key'),false);
    assert.equal(raw.includes('Nombre Protegido Original'),false);
  }finally{fs.rmSync(run.temp,{recursive:true,force:true});}
});

test('Q2 static builder rejects missing provider month tabs rather than fabricating visits',()=>{
  const run=offlineRun({badTabs:true});
  try{
    assert.notEqual(run.result.status,0);
    assert.equal(fs.existsSync(run.out),false);
    assert.match(run.result.stderr,/No valid HR month tabs|XLSX export failed/);
  }finally{fs.rmSync(run.temp,{recursive:true,force:true});}
});
