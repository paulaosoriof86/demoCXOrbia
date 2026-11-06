import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const runtime={CX:{COUNTRIES:[
  {c:'GT',n:'Guatemala'},{c:'HN',n:'Honduras'},
  {c:'SV',n:'El Salvador'},{c:'NI',n:'Nicaragua'},
  {c:'CO',n:'Colombia'}
]}};
const context=vm.createContext({window:runtime,globalThis:runtime,module:{exports:{}}});
for(const file of ['app/adapters/cxorbia-exact-identity-contract-v1.js',
  'app/adapters/tya-cumulative-read-model-v2.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const compose=runtime.CX_TYA_CUMULATIVE_READ_MODEL.compose;
const keeperId='canonical-keeper',aliasId='historical-hr-alias';
const scenario=({keeperCountry,aliasCountry,hrCountry,approved=true,tenant='tya'})=>{
  const keeper={id:keeperId,shopperId:keeperId,nombre:'Ejemplo Persona',
    pais:keeperCountry,tenantId:'tya',projectIds:['program'],
    identityAuthority:approved?'tenant_adjudication':'unverified',
    identityAuthorityRef:approved?'provider-receipt':'',
    exactAliases:[keeperId,aliasId],sourceShopperIds:[aliasId],
    legacyLiveShopperIds:[aliasId],identityState:'active'};
  const alias={id:aliasId,shopperId:aliasId,nombre:'Ejemplo Persona',
    pais:aliasCountry,tenantId:tenant,projectIds:['program'],
    identityState:'superseded_exact_alias',
    supersededByShopperId:keeperId};
  const hr={currentProjectId:'program',currentPeriodId:'period',
    sourceRevision:'same-hr-source-revision',projects:[{id:'period',periodKey:'2026-11',projectId:'program'}],
    shoppers:[{id:aliasId,shopperId:aliasId,pais:hrCountry,nombre:'Ejemplo Persona'}],
    visits:Array.from({length:4},(_,i)=>({id:'visit'+i,hrRowId:'hr-'+i,
      sourceTab:'NOV',sourceRow:i+1,periodKey:'2026-11',
      shopperId:aliasId,pais:hrCountry,estado:'realizada'}))};
  return compose({hr,protectedPayload:{shoppers:[keeper,alias],visits:[]}});
};
function assertTrueKeeper(result){
  assert.equal(result.shoppers.length,1,'one visible human');
  assert.equal(result.shoppers[0].id,keeperId,'canonical owner must be visible');
  assert.equal(result.shoppers[0].identityState,'active','retired alias is not a new shopper');
  assert.equal(result.shoppers[0].visitas,4,'all four HR visits stay associated');
  assert.equal(result.visits.filter(x=>x.shopperId===keeperId).length,4);
  assert.equal(result.diagnostics.duplicateVisitKeys,0);
}
test('VRM308: HN/Honduras equivalent after an authorized exact merge',()=>{
  const r=scenario({keeperCountry:'Honduras',aliasCountry:'HN',hrCountry:'HN'});
  assertTrueKeeper(r);
  assert.equal(r.shoppers[0].pais,'HN','HR country code must remain authoritative for Admin scope');
});
test('VRM308: GT/Guatemala equivalent after an authorized exact merge',()=>{
  const r=scenario({keeperCountry:'Guatemala',aliasCountry:'GT',hrCountry:'GT'});
  assertTrueKeeper(r);
  assert.equal(r.shoppers[0].pais,'GT','country display labels cannot conceal a keeper');
});
test('VRM309: provider-linked platform-only keeper normalizes HN to the configured code',()=>{
  const hr={currentProjectId:'program',currentPeriodId:'period',projects:[{id:'period',periodKey:'2026-11',countries:['GT','HN']}],visits:[],shoppers:[]};
  const profile={id:keeperId,shopperId:keeperId,nombre:'Ejemplo Persona',pais:'Honduras',projectIds:['program'],
    __providerExactIdentityLink:true,__providerIdentityAuthorityType:'tenant_adjudication',
    identityAuthority:'tenant_adjudication',identityAuthorityRef:'provider-receipt'};
  const r=compose({hr,protectedPayload:{shoppers:[profile],visits:[]}});
  assert.equal(r.shoppers.length,1);
  assert.equal(r.shoppers[0].pais,'HN');
  assert.equal(r.shoppers[0].country,'HN');
});
test('VRM308: different countries stay separate',()=>{
  const r=scenario({keeperCountry:'GT',aliasCountry:'HN',hrCountry:'HN'});
  assert.notEqual(r.shoppers[0].id,keeperId);
  assert.equal(r.visits.filter(x=>x.shopperId===keeperId).length,0);
});
test('VRM308: different tenant never linked',()=>{
  const r=scenario({keeperCountry:'HN',aliasCountry:'Honduras',hrCountry:'HN',tenant:'other'});
  assert.notEqual(r.shoppers[0].id,keeperId);
});
test('VRM308: absence of provider adjudication never linked',()=>{
  const r=scenario({keeperCountry:'HN',aliasCountry:'Honduras',hrCountry:'HN',approved:false});
  assert.notEqual(r.shoppers[0].id,keeperId);
});
