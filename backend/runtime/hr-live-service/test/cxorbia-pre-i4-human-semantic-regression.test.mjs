import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../../../',import.meta.url));
function readModel(){
  const context={console};context.globalThis=context;
  vm.runInNewContext(fs.readFileSync(root+'app/adapters/tya-cumulative-read-model-v2.js','utf8'),context,{filename:'tya-cumulative-read-model-v2.js'});
  return context.CX_TYA_CUMULATIVE_READ_MODEL;
}

test('PRE-I4 VRM-033 HR human name wins over technical durable profile and platform-only profile stays review-only',()=>{
  const api=readModel();
  const hr={
    currentProjectId:'cinepolis',currentPeriodId:'cinepolis-2026-09',sourceRevision:'rev-human',
    projects:[{id:'cinepolis-2026-09',projectId:'cinepolis',periodKey:'2026-09'}],
    shoppers:[{shopperId:'shopper_gt_0c198c1055',nombre:'Julissa Flores',pais:'GT',projectIds:['cinepolis']}],
    visits:[{id:'v-1',visitId:'v-1',projectId:'cinepolis',periodId:'cinepolis-2026-09',periodKey:'2026-09',shopperId:'shopper_gt_0c198c1055',shopper:'Julissa Flores',pais:'GT',estado:'agendada',outOfRange:true}],
    posts:[]
  };
  const protectedPayload={
    shoppers:[
      {id:'shopper_gt_0c198c1055',shopperId:'shopper_gt_0c198c1055',nombre:'shopper_gt_0c198c1055',username:'julissa.flores',projectIds:['cinepolis']},
      {id:'platform-only-1',shopperId:'platform-only-1',nombre:'Persona Plataforma',username:'persona.plataforma',projectIds:['cinepolis']}
    ],
    visits:[],certifications:[],liquidations:[],postulations:[],applications:[]
  };
  const out=api.compose({hr,protectedPayload});
  assert.equal(out.shoppers.length,1);
  assert.equal(out.shoppers[0].id,'shopper_gt_0c198c1055');
  assert.equal(out.shoppers[0].nombre,'Julissa Flores');
  assert.equal(out.shoppers.some(x=>x.id==='platform-only-1'),false);
  assert.equal(out.platformOnlyProfiles.some(x=>x.id==='platform-only-1'&&x.presentedToAuthorizedStaff===false),true);
  assert.equal(out.diagnostics.unmatchedProfilesExcludedFromOperationalList,true);
  assert.equal(out.diagnostics.platformOnlyProfilesPresented,0);
  assert.equal(out.visits[0].canonicalFacets.outOfRange,true);
});

test('PRE-I4 VRM-040 top-level live outOfRange remains true even when estado is another operational stage',()=>{
  const api=readModel();
  assert.equal(api.facets({estado:'agendada',outOfRange:true}).outOfRange,true);
});
