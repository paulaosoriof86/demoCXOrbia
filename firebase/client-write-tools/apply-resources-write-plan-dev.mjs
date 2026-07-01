#!/usr/bin/env node
/* CXOrbia V57 · Apply resources metadata write-plan in DEV. Requires explicit local confirmation. */

import fs from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const REQUIRED = 'AUTORIZO_CARGAR_RESOURCES_METADATA_V57_FIRESTORE_DEV';
if(process.env.CXORBIA_CONFIRM !== REQUIRED){
  console.error(`Falta confirmacion: CXORBIA_CONFIRM=${REQUIRED}`);
  process.exit(2);
}

const input = process.argv[2];
if(!input){
  console.error('Uso: node apply-resources-write-plan-dev.mjs <write-plan.json>');
  process.exit(2);
}

const email = process.env.CXORBIA_DEV_EMAIL;
const password = process.env.CXORBIA_DEV_PASSWORD || process.env.CXORBIA_DEV_SECRET;
if(!email || !password){
  console.error('Faltan CXORBIA_DEV_EMAIL y CXORBIA_DEV_PASSWORD o CXORBIA_DEV_SECRET.');
  process.exit(2);
}

const firebaseConfig = {
  apiKey: 'AIzaSyC4TUtiDuCkJCMzPukwknImUzwzRmV0tSY',
  authDomain: 'cxorbia-backend-dev.firebaseapp.com',
  projectId: 'cxorbia-backend-dev',
  storageBucket: 'cxorbia-backend-dev.firebasestorage.app',
  messagingSenderId: '87461567267',
  appId: '1:87461567267:web:9f0d340b35b9d2038a8a96'
};

const parsed = JSON.parse(fs.readFileSync(input, 'utf8'));
const plan = parsed.writePlan || [];
if(!plan.length){
  console.error('Write plan vacio.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
await signInWithEmailAndPassword(auth, email, password);

let ok = 0;
for(const item of plan){
  await setDoc(doc(db, item.path), Object.assign({}, item.data, {updatedAt: serverTimestamp()}), {merge:true});
  ok += 1;
}

console.log(JSON.stringify({ok, projectId: firebaseConfig.projectId, mode: 'dev-only'}, null, 2));
