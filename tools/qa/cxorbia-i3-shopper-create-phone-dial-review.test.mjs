import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source=readFileSync(new URL('../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs',import.meta.url),'utf8');
const start=source.indexOf('const normalizeHumanName=');
const end=source.indexOf('function technicalIdentityLabel(',start);
assert.ok(start>=0&&end>start,'Se requiere el guard existente, no un matcher alternativo');
const context={str:v=>String(v==null?'':v).trim(),arr:v=>Array.isArray(v)?v:[],sha:()=> 'synthetic-sha-identity-fixture'};
vm.runInNewContext(source.slice(start,end)+'\nthis.check=assertNoUnlinkedManualDuplicate;',context);
const check=context.check;

function readFixture({existingPhone,enteredPhone,existingCountry,enteredCountry,name='María Pérez',sameId=false}={}){
  const existing={id:'original',tenantId:'tenant-a',sourceType:'hr_external',nombre:name,
    whatsapp:existingPhone,pais:existingCountry};
  let reads=0;
  const db={collection:collection=>{
    assert.equal(collection,'tenants');return {doc:tenant=>{
      assert.equal(tenant,'tenant-a');return {collection:col=>{
        assert.equal(col,'shoppers');return {get:async()=>{
          reads++;return {docs:[{id:'original',data:()=>existing}]};
        }};
      }};
    }};
  }};
  const options={db,command:{tenantId:'tenant-a'},shopperId:sameId?'original':'new-profile',profile:{
    nombre:name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''),
    whatsapp:enteredPhone,pais:enteredCountry,
  }};
  return {run:()=>check(options),reads:()=>reads};
}

test('GT normaliza número nacional de 8 dígitos y +502 sin fusionar',async()=>{
  const f=readFixture({existingPhone:'+502 5555-9999',enteredPhone:'5555 9999',existingCountry:'Guatemala',enteredCountry:'GT'});
  await assert.rejects(f.run,/SHOPPER_CREATE_EXISTING_IDENTITY_REVIEW_REQUIRED/);
  assert.equal(f.reads(),1);
});

test('HN, NI y SV normalizan 8 dígitos locales frente a prefijos E.164',async()=>{
  for(const [country,prefix,local] of [
    ['HN','504','99991234'],['NI','505','88881234'],['SV','503','77771234']
  ]){
    await assert.rejects(readFixture({existingPhone:prefix+local,enteredPhone:local,
      existingCountry:country,enteredCountry:country}).run,/SHOPPER_CREATE_EXISTING_IDENTITY_REVIEW_REQUIRED/);
  }
});

test('también reconoce lado inverso y prefijo de salida internacional 00',async()=>{
  await assert.rejects(readFixture({existingPhone:'55559999',enteredPhone:'0050255559999',
    existingCountry:'GT',enteredCountry:'GT'}).run,/SHOPPER_CREATE_EXISTING_IDENTITY_REVIEW_REQUIRED/);
});

test('prefijos internacionales diferentes no generan coincidencia exacta y abren revisión por nombre',async()=>{
  await assert.rejects(readFixture({existingPhone:'50255559999',enteredPhone:'50455559999',
    name:'Ana Pérez'}).run,/SHOPPER_CREATE_POSSIBLE_IDENTITY_REVIEW_REQUIRED/);
  await assert.doesNotReject(readFixture({existingPhone:'50255559999',enteredPhone:'55559999',
    existingCountry:'GT',enteredCountry:'HN',name:'Ana Pérez'}).run);
});

test('teléfono discordante con mismo nombre pide revisión sin fusionar; retry propio no abre revisión',async()=>{
  await assert.rejects(readFixture({existingPhone:'50255559999',enteredPhone:'55558888',
    existingCountry:'GT',enteredCountry:'GT'}).run,/SHOPPER_CREATE_POSSIBLE_IDENTITY_REVIEW_REQUIRED/);
  await assert.doesNotReject(readFixture({existingPhone:'50255559999',enteredPhone:'55559999',
    existingCountry:'GT',enteredCountry:'GT',sameId:true}).run);
});
