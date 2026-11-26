import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const repo = path.resolve(process.argv[2] || '.');
const git = (...args) => execFileSync('git', ['-C', repo, ...args], {encoding:'utf8'}).trim();
const producer = 'fb7f80287f81691338fd868fc36881fc84781e0e';
const served = 'd727f3be67a4430f08216dbb37cccba790f934f5';
const control = 'ad41f22624f88321f6d636925796e347998cb77c';
const commandFile = 'backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs';
const owners = ['academy', 'commercial', 'finance', 'operational', 'project', 'shopper'];
const providerFile = name => 'backend/runtime/cxorbia-' + name + '-command-provider-v1.mjs';
const textAt = (sha, file) => git('show', sha + ':' + file);
const pin = file => git('rev-parse', served + ':' + file);
const load = file => import(pathToFileURL(path.join(repo,file)));
const pins = {};
const commandTypes = {};
assert.equal(git('rev-parse','HEAD'),producer);
for (const file of [commandFile,...owners.map(providerFile)]) {
  pins[file] = pin(file);
  assert.equal(git('hash-object', file), pins[file]);
}
for (const owner of owners) {
  const provider = await load(providerFile(owner));
  commandTypes[owner] = provider.COMMAND_TYPES;
}
const registered = Object.values(commandTypes).flat();
assert.equal(registered.some(type => /import/i.test(type)), false);
const {createHrSnapshotReconciler} = await load(commandFile);
let invoked = [];
const dependencies = Object.fromEntries(['verifyPrincipal','readSnapshot','ensureAdmin','shopperPolicy','operationalPolicy'].map(key => [key, () => {invoked.push(key); throw Error('unexpected dependency '+key);}]));
const reconcile = createHrSnapshotReconciler(dependencies);
const rev = createHash('sha256').update('E10 synthetic fixture').digest('hex');
const base = {version:'cxorbia-command-adapter-v1',commandType:'hr.snapshot.reconcile',entityType:'hrSnapshot',entityId:rev,expectedVersion:rev,tenantId:'fixture-tenant',projectId:'fixture-project',periodId:null,requirePeriod:false,idempotencyKey:'qa-e10-source-only-fixture-reconcile'};
const rejected = await reconcile({command:{...base,payload:{rows:[{ref:'QA-E10-N1'}]}}});
assert.equal(rejected.code,'HR_RECONCILIATION_COMMAND_INVALID'); assert.deepEqual(invoked,[]);
assert.equal(rejected.providerAck,false); assert.equal(rejected.providerWrites,0);
const router = textAt(served,'app/modules/importador.js');
const frontend = textAt(served,'app/core/importador.js');
assert.match(router,/CX\.importador\.commit\(d\.nuevos,p\)/); assert.match(frontend,/CX\.data\._visitas\.push\(/);
const contract = JSON.parse(textAt(served,'backend/contracts/hr-import-control-phase-a-v1.json'));
const config = JSON.parse(textAt(served,'firebase.json'));
const actualRoute=config.hosting.rewrites.find(rewrite=>rewrite.source==='/v1/cxorbia/commands');
assert.equal(actualRoute.run.serviceId,'cxorbia-live-hr-dev');
const rows = JSON.parse(textAt(control,'docs/checkpoints/CXORBIA_I3_FROZEN_FUNCTIONAL_TASK_CONTRACTS_20261125.json'));
const e10=rows.tasks.find(t=>t.taskId==='E10');
assert.equal(e10.acceptanceBindingSha256,'b74b83a1ebd1afeca4c420e64d476e811bf8d90d982abe4a1060a557b4bffa4f');
const extraPins = ['app/modules/importador.js','app/core/importador.js','app/modules/operacion-extra.js','backend/contracts/hr-import-control-phase-a-v1.json','backend/adapters/hr-import-control-adapter.preview.mjs','backend/contracts/cxdata-firestore-phase-a-v1.json','firestore.rules','firebase.json'];
for(const f of extraPins)pins[f]=pin(f);
const scopeDoc='docs/checkpoints/CXORBIA_I3_VRM379_E10_SCOPE_20261125.json';
const previous=JSON.parse(textAt(control,scopeDoc));
assert.equal(previous.allowedFunction,'CX.importador.autoMap');
console.log(JSON.stringify({
  schemaVersion:'cxorbia.i3.e10.durable-command-route-readback.v1',iteration:'I3',state:'HOLD',source:served,sourceTree:git('rev-parse',served+'^{tree}'),producer,control,
  scope:'OFFLINE_SOURCE_DISPATCH_INVENTORY_AND_EXISTING_SNAPSHOT_CONTRACT_PROBE',route:actualRoute,pins,hostedDispatcherKinds:commandTypes,commandInventoryCount:registered.length,
  importCommandsRegistered:registered.filter(type=>/import/i.test(type)),
  possibleReconciliation:{commandType:base.commandType,source:'independently read canonical snapshot',customRowsAccepted:false,observedError:rejected.code,observedProviderWrites:rejected.providerWrites,observedProviderAck:rejected.providerAck,dependenciesCalled:invoked},
  officialE10:{acceptanceBinding:e10.acceptanceBindingSha256,ownerPaths:e10.ownerPaths,routeRoles:e10.roleRoutes,originalContract:e10.frozenAuthority,servedButton:'hrCommit → CX.importador.commit → CX.data._visitas.push',mappingPatchScope:previous.allowedFunction},
  otherNamedSurfaces:{hrImportControl:{status:contract.status,contractPath:'hrImportRuns',implementation:'saveImportRun/saveSanitizedRow return pendingImplementation'},hrImportsRules:'Operator read and Admin write permissions for historical, sanitized control records. A rule does not implement a row import into visits.',rutasHrImport:'Button resolves to a demo toast.'},
  durableE10OwnerIdentified:false,retainedUiProof:'docs/checkpoints/CXORBIA_I3_D08_E10_COMPONENT_READBACK_20261125.json',liveAttempt:false,remoteWrites:0,realRowsImported:0,newDomainMatches:0,production:false,
  next:'Recover an approved row-import command owner and its binding or adjudicate the missing implementation under the original E10 contract before connecting any writer. The existing explicit reconciliation only accepts a revision with empty payload.'
},null,2));
