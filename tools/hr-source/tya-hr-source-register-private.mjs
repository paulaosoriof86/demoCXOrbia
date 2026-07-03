import { registerPrivateSource } from './tya-hr-source-private-registry.mjs';

function arg(name){
  const prefix = `--${name}=`;
  const found = process.argv.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : '';
}

const rawUrl = arg('url') || process.env.CXORBIA_HR_SOURCE_URL || '';
const label = arg('label') || process.env.CXORBIA_HR_SOURCE_LABEL || 'TyA HR live source';
const tenantId = arg('tenantId') || process.env.CXORBIA_TENANT_ID || 'tya';
const projectId = arg('projectId') || process.env.CXORBIA_PROJECT_ID || 'cinepolis';

if(!rawUrl){
  console.error('Missing source URL. Use --url="..." or env CXORBIA_HR_SOURCE_URL.');
  process.exit(1);
}

const result = registerPrivateSource({ rawUrl, label, tenantId, projectId });

console.log('CXOrbia HR source private registration OK');
console.log(JSON.stringify({
  sourceRef: result.safe.sourceRef,
  label: result.safe.label,
  tenantId: result.safe.tenantId,
  projectId: result.safe.projectId,
  type: result.safe.type,
  provider: result.safe.provider,
  maskedUrl: result.safe.maskedUrl,
  safeRegistryPath: result.safeRegistryPath,
  secretRegistryPath: result.secretRegistryPath,
  firestoreWrites: 0,
  importsExecuted: 0
}, null, 2));
