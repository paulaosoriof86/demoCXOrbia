import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const repoRoot = path.resolve(__dirname, '..', '..');
export const privateDir = process.env.CXORBIA_HR_PRIVATE_DIR || path.join(repoRoot, 'tmp', 'hr-source-private');
export const safeRegistryPath = path.join(privateDir, 'sources.safe.json');
export const secretRegistryPath = path.join(privateDir, 'sources.secrets.local.json');

export function ensurePrivateDir(){
  fs.mkdirSync(privateDir, { recursive: true });
}

export function sha(input){
  return crypto.createHash('sha256').update(String(input || ''), 'utf8').digest('hex');
}

export function makeSourceRef(rawUrl){
  return `hrsrc_${sha(rawUrl).slice(0, 24)}`;
}

export function maskUrl(rawUrl){
  const value = String(rawUrl || '').trim();
  if(!value) return '';
  try{
    const u = new URL(value);
    const host = u.host;
    const id = extractGoogleSheetId(value) || extractExcelDriveId(value) || '';
    return id ? `${u.protocol}//${host}/.../${id.slice(0, 6)}...${id.slice(-4)}` : `${u.protocol}//${host}/...`;
  }catch{
    return value.length <= 16 ? '***' : `${value.slice(0, 6)}...${value.slice(-4)}`;
  }
}

export function extractGoogleSheetId(rawUrl){
  const value = String(rawUrl || '');
  const match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : '';
}

export function extractGoogleSheetGid(rawUrl){
  const value = String(rawUrl || '');
  const gid = value.match(/[?#&]gid=([0-9]+)/);
  return gid ? gid[1] : '0';
}

export function extractExcelDriveId(rawUrl){
  const value = String(rawUrl || '');
  const resid = value.match(/[?&]resid=([^&]+)/i);
  if(resid) return decodeURIComponent(resid[1]);
  const sourcedoc = value.match(/[?&]sourcedoc=([^&]+)/i);
  if(sourcedoc) return decodeURIComponent(sourcedoc[1]).replace(/[{}]/g, '');
  return '';
}

export function detectSource(rawUrl){
  const value = String(rawUrl || '').trim();
  const googleSheetId = extractGoogleSheetId(value);
  if(googleSheetId){
    return { type: 'google_sheets', googleSheetId, gid: extractGoogleSheetGid(value), provider: 'google' };
  }
  const excelId = extractExcelDriveId(value);
  if(/sharepoint\.com|onedrive\.live\.com|office\.com|1drv\.ms/i.test(value)){
    return { type: 'excel_online', excelId, provider: 'microsoft' };
  }
  return { type: 'unknown', provider: 'unknown' };
}

function readJson(file, fallback){
  try{ return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch{ return fallback; }
}

function writeJson(file, data){
  ensurePrivateDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

export function loadSafeRegistry(){
  return readJson(safeRegistryPath, { version: 1, sources: [] });
}

export function loadSecretRegistry(){
  return readJson(secretRegistryPath, { version: 1, sources: [] });
}

export function saveRegistries(safeRegistry, secretRegistry){
  writeJson(safeRegistryPath, safeRegistry);
  writeJson(secretRegistryPath, secretRegistry);
}

export function registerPrivateSource({ rawUrl, label = 'TyA HR live source', tenantId = 'tya', projectId = 'cinepolis' }){
  if(!rawUrl || !String(rawUrl).trim()) throw new Error('Missing rawUrl');
  const sourceRef = makeSourceRef(rawUrl);
  const detected = detectSource(rawUrl);
  const now = new Date().toISOString();
  const safe = {
    sourceRef,
    label,
    tenantId,
    projectId,
    type: detected.type,
    provider: detected.provider,
    maskedUrl: maskUrl(rawUrl),
    googleSheetIdMasked: detected.googleSheetId ? `${detected.googleSheetId.slice(0, 6)}...${detected.googleSheetId.slice(-4)}` : '',
    gid: detected.gid || '',
    excelIdMasked: detected.excelId ? `${String(detected.excelId).slice(0, 6)}...${String(detected.excelId).slice(-4)}` : '',
    createdAt: now,
    updatedAt: now,
    firestoreWrites: 0,
    importsExecuted: 0
  };
  const secret = {
    sourceRef,
    rawUrl: String(rawUrl).trim(),
    createdAt: now,
    updatedAt: now
  };
  const safeRegistry = loadSafeRegistry();
  const secretRegistry = loadSecretRegistry();
  safeRegistry.sources = safeRegistry.sources.filter(s => s.sourceRef !== sourceRef).concat(safe);
  secretRegistry.sources = secretRegistry.sources.filter(s => s.sourceRef !== sourceRef).concat(secret);
  saveRegistries(safeRegistry, secretRegistry);
  return { safe, safeRegistryPath, secretRegistryPath };
}

export function getSecretSource(sourceRef){
  const safeRegistry = loadSafeRegistry();
  const secretRegistry = loadSecretRegistry();
  const safe = safeRegistry.sources.find(s => s.sourceRef === sourceRef) || safeRegistry.sources[safeRegistry.sources.length - 1];
  if(!safe) return null;
  const secret = secretRegistry.sources.find(s => s.sourceRef === safe.sourceRef);
  if(!secret) return { safe, rawUrl: '' };
  return { safe, rawUrl: secret.rawUrl };
}

export function googleCsvExportUrl(rawUrl){
  const sheetId = extractGoogleSheetId(rawUrl);
  if(!sheetId) return '';
  const gid = extractGoogleSheetGid(rawUrl);
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid || '0'}`;
}
