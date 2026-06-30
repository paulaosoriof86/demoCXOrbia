import fs from "fs";
import path from "path";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const repoPath = process.env.CXORBIA_REPO_PATH;
const privateOutput = process.env.CXORBIA_PRIVATE_OUTPUT;
const backendConfigPath = path.join(repoPath, "app", "core", "backend-config.js");
const authOutputDir = path.join(repoPath, "firebase", "auth-dev-tools", "output");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readFirebaseConfig() {
  const text = readText(backendConfigPath);

  function pick(key) {
    const re = new RegExp(key + "\\s*:\\s*['\\\"]([^'\\\"]+)['\\\"]");
    const match = text.match(re);
    if (!match) throw new Error("No pude leer " + key + " desde backend-config.js");
    return match[1];
  }

  const enabledMatch = text.match(/enabled:\s*(true|false)/);
  const enabled = enabledMatch ? enabledMatch[1] === "true" : null;
  if (enabled !== false) throw new Error("CX.BACKEND.enabled principal no está en false. Detengo lectura.");

  return {
    apiKey: pick("apiKey"),
    authDomain: pick("authDomain"),
    projectId: pick("projectId"),
    storageBucket: pick("storageBucket"),
    messagingSenderId: pick("messagingSenderId"),
    appId: pick("appId")
  };
}

function getLocalDevPassword() {
  if (process.env.CXORBIA_DEV_PASSWORD && process.env.CXORBIA_DEV_PASSWORD.trim()) {
    return process.env.CXORBIA_DEV_PASSWORD.trim();
  }

  if (!fs.existsSync(authOutputDir)) {
    throw new Error("No existe firebase/auth-dev-tools/output para leer clave DEV local.");
  }

  const files = fs.readdirSync(authOutputDir)
    .filter((name) => /^auth-import-users-.*\.md$/i.test(name))
    .map((name) => path.join(authOutputDir, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  if (!files.length) throw new Error("No encontré reporte local auth-import-users-*.md.");

  const text = readText(files[0]);
  const match = text.match(/Password DEV temporal compartido:[\s\S]*?```text\s*([\s\S]*?)\s*```/i);
  if (!match || !match[1] || !match[1].trim()) {
    throw new Error("No pude leer la clave DEV temporal desde el reporte local.");
  }

  return match[1].trim();
}

async function countCollection(db, pathParts) {
  const snap = await getDocs(collection(db, ...pathParts));
  return snap.size;
}

async function groupVisits(db) {
  const snap = await getDocs(collection(db, "tenants", "tya", "projects", "r1", "visits"));
  const byEstado = {};
  const byPais = {};
  let withShopper = 0;
  let withoutShopper = 0;

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const estado = data.estado || "__VACIO__";
    const pais = data.pais || "__VACIO__";
    byEstado[estado] = (byEstado[estado] || 0) + 1;
    byPais[pais] = (byPais[pais] || 0) + 1;
    if (data.shopperId) withShopper += 1;
    else withoutShopper += 1;
  });

  return { byEstado, byPais, withShopper, withoutShopper };
}

async function main() {
  const app = initializeApp(readFirebaseConfig());
  const auth = getAuth(app);
  const db = getFirestore(app);

  await signInWithEmailAndPassword(auth, "super.dev@cxorbia-dev.example.com", getLocalDevPassword());

  const tenantSnap = await getDoc(doc(db, "tenants", "tya"));
  const visitGroups = await groupVisits(db);

  const counts = {
    tenant_tya_exists: tenantSnap.exists(),
    clients: await countCollection(db, ["tenants", "tya", "clients"]),
    projects: await countCollection(db, ["tenants", "tya", "projects"]),
    shoppers: await countCollection(db, ["tenants", "tya", "shoppers"]),
    visits_r1: await countCollection(db, ["tenants", "tya", "projects", "r1", "visits"]),
    postulations_r1: await countCollection(db, ["tenants", "tya", "projects", "r1", "postulations"]),
    questionnaires_r1: await countCollection(db, ["tenants", "tya", "projects", "r1", "questionnaires"]),
    notifications: await countCollection(db, ["tenants", "tya", "notifications"]),
    visits_by_estado: visitGroups.byEstado,
    visits_by_pais: visitGroups.byPais,
    visits_with_shopper: visitGroups.withShopper,
    visits_without_shopper: visitGroups.withoutShopper
  };

  const reportPath = path.join(privateOutput, "tya-real-pilot-dev-read-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(counts, null, 2), "utf8");

  console.log("== Conteos Firestore DEV piloto T&A ==");
  for (const [key, value] of Object.entries(counts)) {
    console.log(`${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`);
  }
  console.log("Reporte JSON:", reportPath);
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
