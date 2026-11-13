import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const owner='app/adapters/cxorbia-shopper-admin-command-contract-v1.js';
const source=fs.readFileSync(owner,'utf8');
const forbidden=()=>{throw new Error('BROWSER_SIDE_EFFECT_FORBIDDEN');};
const root={CX:{},localStorage:{setItem:forbidden,getItem:forbidden},fetch:forbidden};
root.window=root;
vm.runInNewContext(source,root,{filename:owner,timeout:1000});
const contract=root.CX.shopperAdminCommandContract;
const base={tenantId:'tenant-A',projectIds:['project-GT','project-GT'],periodId:'2026-11',expectedVersion:'rev-3',idempotencyKey:'unique-123',actorRole:'admin',actorId:'staff-1'};

test('Q2 shopper command owner exports a frozen, provider-ACK-only contract',()=>{
  assert.ok(Object.isFrozen(contract));
  assert.equal(contract.successRequiresProviderAck,true);
  assert.equal(contract.browserCredentialStorageAllowed,false);
  assert.equal(contract.localStoragePersistenceAllowed,false);
  assert.equal(contract.protectedDataRequiresEncryption,true);
});

test('Q2 shopper create validates exact scope, exposes no browser credential, separates protected data',()=>{
  const invalid=contract.create({profile:{firstName:'Luz'}});
  assert.equal(invalid.ok,false);
  for(const reason of ['missing-tenantId','missing-projectIds','missing-periodId','missing-idempotencyKey','missing-expectedVersion','missing-actorRole'])
    assert.ok(invalid.errors.includes(reason),reason);
  const valid=contract.create({...base,profile:{firstName:'Luz',lastName:'Paz',email:'luz@example.test',dpi:'protected-id',ctaNum:'protected-account',password:'must-not-copy'},identity:{externalShopperId:'HR-123'}});
  assert.equal(valid.ok,true);
  const cmd=valid.command;
  assert.equal(cmd.commandType,'shopper.create');
  assert.deepEqual(Array.from(cmd.payload.projectIds),['project-GT']);
  assert.equal(cmd.payload.profile.firstName,'Luz');
  assert.equal(cmd.payload.profile.dpi,undefined);
  assert.equal(cmd.payload.profile.password,undefined);
  assert.equal(cmd.payload.protectedProfile.dpi,'protected-id');
  assert.equal(cmd.payload.protectedProfile.ctaNum,'protected-account');
  assert.equal(cmd.payload.protectedProfile.password,undefined);
  assert.equal(cmd.payload.auth.browserPasswordAllowed,false);
  assert.equal(cmd.payload.auth.browserTokenAllowed,false);
  assert.equal(cmd.payload.auth.principalRequired,true);
  assert.equal(cmd.payload.protectedProfilePolicy.encryptAtRestRequired,true);
  assert.equal(cmd.payload.protectedProfilePolicy.browserPersistenceAllowed,false);
  assert.equal(cmd.payload.persistence.providerAckRequired,true);
  assert.equal(cmd.payload.persistence.localStorageAllowed,false);
  assert.equal(cmd.payload.exactIdentityAnchors.externalShopperId,'HR-123');
  assert.equal(cmd.authorization.providerEnforcementRequired,true);
});

test('Q2 shopper update keeps protected patch separate and requires a shopper identifier',()=>{
  assert.ok(contract.update({...base,patch:{nombre:'Luz'}}).errors.includes('missing-shopperId'));
  const result=contract.update({...base,shopperId:'SHOP-01',patch:{nombre:'Luz',banco:'BAN-01',password:'discard'}});
  assert.equal(result.ok,true);
  assert.equal(result.command.payload.patch.nombre,'Luz');
  assert.equal(result.command.payload.patch.banco,undefined);
  assert.equal(result.command.payload.protectedPatch.banco,'BAN-01');
  assert.equal(result.command.payload.patch.password,undefined);
  assert.equal(result.command.payload.protectedPatch.password,undefined);
  assert.equal(result.command.entityId,'SHOP-01');
});

test('Q2 adjudication requires human confirmation and preserves explicit exact identity boundaries',()=>{
  const args={...base,canonicalShopperId:'SHOP-1',aliasShopperIds:['SHOP-1','SHOP-2','SHOP-2'],keeperShopperId:'SHOP-1'};
  const held=contract.identityAdjudicate(args);
  assert.equal(held.ok,false);
  assert.ok(held.errors.includes('human-confirmation-required'));
  assert.ok(held.errors.includes('keeper-access-confirmation-required'));
  const allowed=contract.identityAdjudicate({...args,humanConfirmed:true,keeperAccessConfirmed:true,preserveHistoricalVisitRows:true,authoritativeVisitIds:['VIS-1']});
  assert.equal(allowed.ok,true);
  assert.deepEqual(Array.from(allowed.command.payload.aliasShopperIds),['SHOP-2']);
  assert.equal(allowed.command.payload.fuzzyMatching,false);
  assert.equal(allowed.command.payload.periodIndependent,true);
  assert.equal(allowed.command.payload.preserveHistoricalVisitRows,true);
  assert.equal(allowed.command.authorization.humanAdjudicationRequired,true);
});

test('Q2 distinct identity review cannot remap and requires evidence of human decision',()=>{
  const args={...base,shopperIds:['A','B'],reason:'two different people'};
  assert.equal(contract.identityReviewResolve(args).ok,false);
  const cmd=contract.identityReviewResolve({...args,humanConfirmed:true}).command;
  assert.equal(cmd.commandType,'shopper.identity.review.resolve');
  assert.equal(cmd.payload.identityRemap,false);
  assert.equal(cmd.payload.resolution,'distinct');
  assert.equal(cmd.payload.fuzzyMatching,false);
  assert.equal(cmd.authorization.humanAdjudicationRequired,true);
});

test('Q2 retirement is non-physical and credential reset remains server-only',()=>{
  const delArgs={...base,shopperId:'SHOP-01',reason:'confirmed duplicate'};
  assert.equal(contract.deleteShopper(delArgs).ok,false);
  const retired=contract.deleteShopper({...delArgs,humanConfirmed:true});
  assert.equal(retired.ok,true);
  assert.equal(retired.command.payload.physicalDelete,false);
  assert.equal(retired.command.payload.preserveHistory,true);
  assert.equal(retired.command.payload.preserveHr,true);
  assert.equal(retired.command.payload.dependencyPreviewRequired,true);
  const reset=contract.credentialReset({...base,projectId:'project-GT',shopperId:'SHOP-01'});
  assert.equal(reset.ok,true);
  assert.equal(reset.command.payload.serverOnly,true);
  assert.equal(reset.command.payload.browserPasswordAllowed,false);
  assert.equal(reset.command.payload.browserTokenAllowed,false);
  assert.equal(reset.command.authorization.providerEnforcementRequired,true);
});
