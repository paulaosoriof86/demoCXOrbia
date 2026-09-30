import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const R=require('../../app/adapters/cxorbia-identity-roll-forward-v1.js');

const links=[
  {id:'tenant-wide',tenantId:'tenant-a',sourceSystem:'hr',sourceIdentityKey:'source-person-1',canonicalShopperId:'canonical-1',status:'active',authorityType:'tenant_adjudication',authorityRef:'adjudication-1'},
  {id:'project-specific',tenantId:'tenant-a',projectScope:'project-b',sourceSystem:'hr',sourceIdentityKey:'source-person-2',canonicalShopperId:'canonical-2',status:'confirmed',authorityType:'provider_exact',authorityRef:'provider-2'},
  {id:'other-tenant',tenantId:'tenant-b',sourceSystem:'hr',sourceIdentityKey:'source-person-1',canonicalShopperId:'canonical-b',status:'active',authorityType:'tenant_adjudication',authorityRef:'adjudication-b'}
];
const index=R.buildIndex(links);
for(const periodKey of ['2026-08','2026-09','2027-01']){
  const result=index.resolve({tenantId:'tenant-a',projectId:'project-a',sourceSystem:'hr',sourceIdentityKey:'source-person-1',periodKey},{tenantId:'tenant-a',projectId:'project-a',sourceSystem:'hr'});
  assert.equal(result.ok,true);assert.equal(result.canonicalShopperId,'canonical-1');assert.equal(result.periodIndependent,true);
}
assert.equal(index.resolve({tenantId:'tenant-b',projectId:'project-a',sourceSystem:'hr',sourceIdentityKey:'source-person-1'},{tenantId:'tenant-b',projectId:'project-a',sourceSystem:'hr'}).canonicalShopperId,'canonical-b');
assert.equal(index.resolve({tenantId:'tenant-a',projectId:'project-a',sourceSystem:'hr',sourceIdentityKey:'source-person-2'},{tenantId:'tenant-a',projectId:'project-a',sourceSystem:'hr'}).ok,false);
assert.equal(index.resolve({tenantId:'tenant-a',projectId:'project-b',sourceSystem:'hr',sourceIdentityKey:'source-person-2'},{tenantId:'tenant-a',projectId:'project-b',sourceSystem:'hr'}).canonicalShopperId,'canonical-2');
assert.equal(R.normalizeLink({tenantId:'tenant-a',sourceSystem:'hr',sourceIdentityKey:'source-person-3',canonicalShopperId:'canonical-3',status:'active',authorityType:'tenant_adjudication',authorityRef:'adjudication-3',periodKey:'2026-08'}).ok,false);
assert.equal(R.normalizeLink({tenantId:'tenant-a',sourceSystem:'hr',name:'Person Name',canonicalShopperId:'canonical-3',status:'active',authorityType:'tenant_adjudication',authorityRef:'adjudication-3'}).ok,false);
console.log('PASS_CXORBIA_IDENTITY_ROLL_FORWARD_PERIOD_INDEPENDENT');
