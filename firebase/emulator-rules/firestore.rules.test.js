import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

const projectId = 'cxorbia-rules-test';
const rulesPath = path.resolve(process.cwd(), '../../firestore.rules');

const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: {
    rules: fs.readFileSync(rulesPath, 'utf8')
  }
});

async function seed() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'tenants/tya'), { name: 'T&A Demo' });
    await setDoc(doc(db, 'tenants/tya/shoppers/eval-01'), { shopperId: 'eval-01', nombre: 'Evaluador 01' });
    await setDoc(doc(db, 'tenants/tya/shoppers/eval-02'), { shopperId: 'eval-02', nombre: 'Evaluador 02' });
    await setDoc(doc(db, 'tenants/tya/projects/tya-piloto'), { projectId: 'tya-piloto', nombre: 'Piloto' });
    await setDoc(doc(db, 'tenants/tya/projects/tya-piloto/visits/tya-piloto-v01'), { visitId: 'tya-piloto-v01', estado: 'disponible' });
    await setDoc(doc(db, 'tenants/tya/projects/tya-piloto/finance/m01'), { id: 'm01', monto: 100 });
    await setDoc(doc(db, 'tenants/tya/projects/tya-piloto/postulations/post-01'), { id: 'post-01', shopperId: 'eval-02' });
    await setDoc(doc(db, 'tenants/tya/auditLogs/log-01'), { id: 'log-01', action: 'seed' });
  });
}

function auth(uid, token) {
  return testEnv.authenticatedContext(uid, token).firestore();
}

async function run() {
  await testEnv.clearFirestore();
  await seed();

  const anonDb = testEnv.unauthenticatedContext().firestore();
  const otherTenantAdmin = auth('admin-otro', { role: 'admin', tenantId: 'otro-tenant', projectIds: ['tya-piloto'] });
  const shopper = auth('shopper-01', { role: 'shopper', tenantId: 'tya', projectIds: ['tya-piloto'], shopperId: 'eval-01' });
  const shopperNoProject = auth('shopper-02', { role: 'shopper', tenantId: 'tya', projectIds: [], shopperId: 'eval-01' });
  const client = auth('cliente-01', { role: 'cliente', tenantId: 'tya', projectIds: ['tya-piloto'] });
  const ops = auth('ops-01', { role: 'ops', tenantId: 'tya', projectIds: ['tya-piloto'] });
  const admin = auth('admin-01', { role: 'admin', tenantId: 'tya', projectIds: ['tya-piloto'] });

  await assertFails(getDoc(doc(anonDb, 'tenants/tya')));
  await assertFails(getDoc(doc(otherTenantAdmin, 'tenants/tya')));
  await assertFails(getDoc(doc(shopper, 'tenants/tya/shoppers/eval-02')));
  await assertSucceeds(getDoc(doc(shopper, 'tenants/tya/projects/tya-piloto/visits/tya-piloto-v01')));
  await assertFails(getDoc(doc(shopperNoProject, 'tenants/tya/projects/tya-piloto/visits/tya-piloto-v01')));
  await assertFails(getDoc(doc(client, 'tenants/tya/projects/tya-piloto/finance/m01')));
  await assertFails(getDoc(doc(client, 'tenants/tya/projects/tya-piloto/postulations/post-01')));
  await assertFails(getDoc(doc(ops, 'tenants/tya/projects/tya-piloto/finance/m01')));
  await assertFails(updateDoc(doc(admin, 'tenants/tya/auditLogs/log-01'), { action: 'changed' }));
  await assertFails(deleteDoc(doc(admin, 'tenants/tya/auditLogs/log-01')));

  console.log('P0 Firestore rules emulator tests passed');
}

try {
  await run();
} finally {
  await testEnv.cleanup();
}
