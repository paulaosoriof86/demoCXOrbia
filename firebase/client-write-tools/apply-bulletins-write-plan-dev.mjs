#!/usr/bin/env node
/*
  CXOrbia V57 · Aplicar write plan Bulletins en Firebase DEV
  Requiere confirmación explícita por variable de entorno.
  No publicar Hosting. No tocar producción.
*/

import fs from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const REQUIRED = 'AUTORIZO_CARGAR_BULLETINS_V57_FIRESTORE_DEV';
if (process.env.CXORBIA_CONFIRM !== REQUIRED) {
  console.error(`Falta confirmación: CXORBIA_CONFIRM=${REQUIRED}`);
  process.exit(2);
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Uso: node apply-bulletins-write-plan-dev.mjs <write-plan.json>');
  process.exit(2);
}

const email = process.env.CXORBIA_DEV_EMAIL;
const password = process.env.CXORBIA_DEV_PASSWORD;
if (!email || !password) {
  console.error('Faltan CXORBIA_DEV_EMAIL y CXORBIA_DEV_PASSWORD en variables de entorno.');
  process.exit(2);
}

const firebaseConfig = {
  apiKey: 'AIzaSyC4TUtiDuCkJCMzPukwknImUzwzRmV0tSY',
  authDomain: 'cxorbia-backend-dev.firebaseapp.com',
  projectId: 'cxorbia-backend-dev',
  storageBucket: 'cxorbia-backend-dev.firebasestorage.app',
  messagingSenderId: '87461567267',
  appId: '1:87461567267:web:9f0d340b35b9d2038a8a96',
};

const parsed = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const plan = parsed.writePlan || [];
if (!plan.length) {
  console.error('El write plan está vacío.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

await signInWithEmailAndPassword(auth, email, password);

let ok = 0;
for (const item of plan) {
  if (!item.path || !item.data) throw new Error('Write plan inválido');
  const payload = { ...item.data, updatedAt: serverTimestamp() };
  await setDoc(doc(db, item.path), payload, { merge: true });
  ok += 1;
}

console.log(JSON.stringify({ ok, projectId: firebaseConfig.projectId, mode: 'dev-only' }, null, 2));
