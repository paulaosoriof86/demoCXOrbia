import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const runtime={};
const context=vm.createContext({window:runtime,globalThis:runtime,module:{exports:{}}});
for(const file of ['app/adapters/cxorbia-exact-identity-contract-v1.js','app/adapters/tya-cumulative-read-model-v2.js'])
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const compose=runtime.CX_TYA_CUMULATIVE_READ_MODEL.compose;
const canonical='shopper_gt_canonical',alias='shopper_gt_alias';
const profile={id:canonical,shopperId:canonical,nombre:'Nombre histórico aprobado',pais:'GT',
  tenantId:'tya',projectIds:['cinepolis'],identityAuthority:'tenant_adjudication',
  identityAuthorityRef:'provider-ack',exactAliases:[canonical,alias],legacyLiveShopperIds:[canonical,alias]};
const canonicalRow={id:canonical,shopperId:canonical,nombre:'Nombre vigente en HR',pais:'GT'};
const aliasRow={id:alias,shopperId:alias,nombre:'Nombre antiguo de alias',pais:'GT',canonicalShopperId:canonical};

function result(shoppers,profileOverride={}){
  const hr={currentProjectId:'cinepolis',currentPeriodId:'cinepolis-2026-11',
    sourceRevision:'revision-external',projects:[{id:'cinepolis-2026-11',projectId:'cinepolis',periodKey:'2026-11'}],
    shoppers,visits:[]};
  return compose({hr,protectedPayload:{shoppers:[{...profile,...profileOverride}],visits:[]}}).shoppers;
}

for(const shoppers of [[canonicalRow,aliasRow],[aliasRow,canonicalRow]])
  test('canonical direct HR name wins regardless of adjudicated alias order',()=>{
    const composed=result(shoppers);
    assert.equal(composed.length,1);
    assert.equal(composed[0].id,canonical);
    assert.equal(composed[0].nombre,'Nombre vigente en HR');
    assert.equal(composed[0].__hrOriginalDisplayName,'Nombre vigente en HR');
  });

test('authorized explicit shopper display correction retains its higher authority',()=>{
  const composed=result([canonicalRow,aliasRow],{displayNameAuthority:'shopper_self_profile',
    displayNameUpdatedAt:'2026-11-16T00:00:00Z',displayNameActorUid:'uid-keeper',
    displayFirstName:'Nombre propio',displayLastName:'Verificado'});
  assert.equal(composed[0].nombre,'Nombre propio Verificado');
});
