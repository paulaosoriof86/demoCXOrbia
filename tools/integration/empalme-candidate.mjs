#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  parseArgs,
  readJson,
  writeJson,
  atomicWrite,
  sha256File,
  git,
  tryCommand,
  normalizeRepoPath,
  assertCandidatePathAllowed,
  pathMatchesPrefix,
  runtimeManifest,
  copyPath,
  removePath,
  extractZip,
  resolveInside,
  sanitizeId,
  isoCompact,
} from './lib.mjs';
import { runWorkspacePreflight } from './workspace-preflight.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

function listDirectories(root, maxDepth = 4) {
  const out = [];
  function visit(dir, depth) {
    if (depth > maxDepth) return;
    for (const name of readdirSync(dir)) {
      const absolute = join(dir, name);
      const stat = statSync(absolute);
      if (!stat.isDirectory()) continue;
      out.push(absolute);
      visit(absolute, depth + 1);
    }
  }
  visit(root, 0);
  return out;
}

function findCandidateRuntimeRoot(extractRoot, runtimeRootName = 'app') {
  const direct = join(extractRoot, runtimeRootName);
  if (existsSync(join(direct, 'index.html'))) return direct;
  const matches = listDirectories(extractRoot, 5)
    .filter((dir) => basename(dir).toLowerCase() === runtimeRootName.toLowerCase())
    .filter((dir) => existsSync(join(dir, 'index.html')));
  if (matches.length !== 1) {
    throw new Error(`No se pudo identificar una única carpeta ${runtimeRootName}/ con index.html. Encontradas: ${matches.join(', ') || 'ninguna'}`);
  }
  return matches[0];
}

function collectProtectedFiles(repoRoot, productPolicy, tenantPolicy) {
  const files = new Set([...(productPolicy.protectedFiles || []), ...(tenantPolicy.protectedFiles || [])].map(normalizeRepoPath));
  const prefixes = [...(productPolicy.protectedPrefixes || []), ...(tenantPolicy.protectedPrefixes || [])].map(normalizeRepoPath);
  function walk(dir, rel = '') {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const absolute = join(dir, name);
      const nextRel = rel ? `${rel}/${name}` : name;
      const stat = statSync(absolute);
      if (stat.isDirectory()) walk(absolute, nextRel);
      else if (stat.isFile() && pathMatchesPrefix(nextRel, prefixes)) files.add(normalizeRepoPath(nextRel));
    }
  }
  walk(repoRoot);
  return [...files].sort();
}

function hashExisting(repoRoot, repoPaths) {
  const map = {};
  for (const path of repoPaths) {
    const absolute = resolveInside(repoRoot, path);
    map[path] = existsSync(absolute) ? sha256File(absolute) : null;
  }
  return map;
}

function validateProtectedHashes(repoRoot, before) {
  const changed = [];
  for (const [path, oldHash] of Object.entries(before)) {
    const absolute = resolveInside(repoRoot, path);
    const newHash = existsSync(absolute) ? sha256File(absolute) : null;
    if (newHash !== oldHash) changed.push({ path, before: oldHash, after: newHash });
  }
  if (changed.length) throw new Error(`Rutas protegidas modificadas: ${JSON.stringify(changed)}`);
}

function validateChangedSyntax(repoRoot, touchedPaths) {
  const results = [];
  for (const path of touchedPaths.filter((p) => /\.(?:js|mjs|cjs)$/i.test(p))) {
    const absolute = resolveInside(repoRoot, path);
    if (!existsSync(absolute)) continue;
    const result = tryCommand(process.execPath, ['--check', absolute], { cwd: repoRoot });
    results.push({ path, ok: result.ok, detail: result.stderr || result.stdout || 'OK' });
    if (!result.ok) throw new Error(`Sintaxis inválida en ${path}: ${result.stderr || result.stdout}`);
  }
  return results;
}

function validateIndexScripts(repoRoot, runtimeRoot = 'app') {
  const indexPath = resolve(repoRoot, runtimeRoot, 'index.html');
  const html = readFileSync(indexPath, 'utf8');
  const missing = [];
  const scripts = [];
  const regex = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = regex.exec(html))) {
    const raw = match[1];
    if (/^(?:https?:|data:|blob:|\/\/)/i.test(raw)) continue;
    const clean = raw.split(/[?#]/, 1)[0].replace(/^\.\//, '');
    const target = resolve(dirname(indexPath), clean);
    scripts.push(clean);
    if (!existsSync(target)) missing.push(clean);
  }
  if (missing.length) throw new Error(`index.html referencia scripts inexistentes: ${missing.join(', ')}`);
  return { scripts, missing };
}

function backupTouched(repoRoot, paths, backupRoot) {
  const entries = [];
  for (const path of paths) {
    const absolute = resolveInside(repoRoot, path);
    const existed = existsSync(absolute);
    const backup = resolveInside(backupRoot, path);
    if (existed) copyPath(absolute, backup);
    entries.push({ path, existed, backup: existed ? backup : null });
  }
  return entries;
}

function rollback(repoRoot, backupEntries) {
  for (const entry of [...backupEntries].reverse()) {
    const destination = resolveInside(repoRoot, entry.path);
    if (entry.existed) copyPath(entry.backup, destination);
    else removePath(destination);
  }
}

function selectedProjectPolicies(plan, repoRoot) {
  const paths = plan.projectPolicies || [];
  if (!Array.isArray(paths)) throw new Error('projectPolicies debe ser una lista');
  return paths.map((path) => {
    const normalized = normalizeRepoPath(path);
    const absolute = resolveInside(repoRoot, normalized);
    if (!existsSync(absolute)) throw new Error(`No existe project policy explícita: ${normalized}`);
    return { path: normalized, value: readJson(absolute) };
  });
}

function validateScope(plan, productPolicy, tenantPolicy, projects) {
  if (productPolicy.multiTenant !== true) throw new Error('La política de producto debe declarar multiTenant=true');
  if (tenantPolicy.multiProject !== true) throw new Error('La política del tenant debe declarar multiProject=true');
  if (tenantPolicy.projectSelection !== 'explicit') throw new Error('La selección de proyecto debe ser explícita');
  if (tenantPolicy.defaultProjectId) throw new Error('No se permite defaultProjectId global en el tenant');
  if (!plan.tenantId || plan.tenantId !== tenantPolicy.tenantId) throw new Error(`tenantId del plan no coincide con la política: ${plan.tenantId}`);
  const ids = projects.map(({ value }) => value.projectId);
  if (new Set(ids).size !== ids.length) throw new Error('projectPolicies contiene projectId duplicados');
  for (const { value } of projects) {
    if (value.tenantId !== plan.tenantId) throw new Error(`Proyecto ${value.projectId} pertenece a otro tenant`);
  }
}

function gateCatalog(tenantPolicy, projects) {
  const catalog = new Map();
  for (const gate of tenantPolicy.gates || []) catalog.set(gate.id, gate);
  for (const { value } of projects) for (const gate of value.gates || []) catalog.set(gate.id, gate);
  return catalog;
}

function runConfiguredGates(repoRoot, plan, tenantPolicy, projects) {
  const catalog = gateCatalog(tenantPolicy, projects);
  const results = [];
  for (const id of plan.gateIds || []) {
    const gate = catalog.get(id);
    if (!gate) throw new Error(`Gate no definido: ${id}`);
    if (!Array.isArray(gate.command) || gate.command.length < 1) throw new Error(`Gate ${id} tiene comando inválido`);
    const [program, ...args] = gate.command;
    const result = tryCommand(program, args, { cwd: resolve(repoRoot, gate.cwd || '.') });
    results.push({ id, ok: result.ok, stdout: result.stdout, stderr: result.stderr });
    if (!result.ok && gate.blocking !== false) throw new Error(`Gate ${id} falló: ${result.stderr || result.stdout || result.error}`);
  }
  return results;
}

function documentationAddenda(repoRoot, plan, reportBase) {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const id = sanitizeId(plan.candidateId).toUpperCase();
  const docs = plan.documentation || {};
  const projects = reportBase.projectIds.length ? reportBase.projectIds.map((x) => `\`${x}\``).join(', ') : 'ninguno; candidata de producto general';
  const common = `\n- Candidata: \`${plan.candidateId}\`\n- SHA-256: \`${plan.candidateSha256}\`\n- Tenant: \`${plan.tenantId}\`\n- Proyectos validados: ${projects}\n- Alcance: multi-tenant y multi-proyecto; ningún proyecto se usa como default global.\n- Estado: \`EMPALMED_PENDING_POST_GATES\` hasta completar gates y smoke aplicables.\n`;
  const changePath = `app/docs/CAMBIOS-BACKEND-ADDENDUM-EMPALME-${id}-${date}.md`;
  const summaryPath = `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-EMPALME-${id}-${date}.md`;
  const pendingPath = `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-EMPALME-${id}-${date}.md`;

  atomicWrite(resolveInside(repoRoot, changePath), `# Cambios backend — empalme ${plan.candidateId}\n${common}\n## Archivos\n- Agregados: ${(plan.files?.added || []).length}.\n- Modificados: ${(plan.files?.modified || []).length}.\n- Eliminados: ${(plan.files?.removed || []).length}.\n\n## Phase A\n${docs.phaseAImpact || 'Empalme de baseline frontend; los gates operativos se ejecutan por tenant/proyecto seleccionado.'}\n\n## Reusable CXOrbia\n${docs.reusableCxorbia || 'Carril determinístico, políticas multi-tenant y selección explícita de proyectos.'}\n\n## Exclusivo cliente\n${docs.clientSpecific || 'Ninguna regla de proyecto fue promovida a lógica global.'}\n\n## Estado seguro\nSin deploy, producción, importaciones reales, writes, Make/Gemini live ni pagos reales.\n`);
  atomicWrite(resolveInside(repoRoot, summaryPath), `# Resumen para Claude — empalme ${plan.candidateId}\n${common}\n## Preservado\n${docs.preserved || 'Backend, contratos, adapters, tools, documentación y overlays protegidos por política.'}\n\n## Claude/prototipo\n${docs.claude || 'La candidata se integra como frontend comercializable. Todo ajuste futuro debe permanecer genérico por tenant/proyecto.'}\n\n## Academia\n${docs.academia || 'Revisar manuales, cursos, rutas por rol y notificaciones de los módulos realmente modificados.'}\n`);
  atomicWrite(resolveInside(repoRoot, pendingPath), `# Pendientes prototipo — post empalme ${plan.candidateId}\n${common}\n## Pendientes vivos\n${docs.pending || 'Ejecutar gates y smoke; documentar P1/P2 sin bloquear si no existe P0.'}\n\n## Regla multi-proyecto\nCinépolis o cualquier otro proyecto puede tener un perfil de validación propio, pero nunca se convierte en default del tenant ni en lógica global del producto.\n`);
  return [changePath, summaryPath, pendingPath];
}

function buildLockContent(plan, manifestPath, manifest) {
  const lock = {
    manifestFile: manifestPath.replace(/^app\//, ''),
    aggregateSha256: manifest.aggregateSha256,
    fileCount: manifest.fileCount,
    runtimeIdentity: `${plan.candidateId} empalmada · producto multi-tenant · proyectos explícitos`,
    generatedAt: new Date().toISOString(),
    sourceZipSha256: plan.candidateSha256,
    tenantId: plan.tenantId,
    projectSelection: 'explicit',
    decision: 'EMPALMED_PENDING_POST_GATES',
    note: 'Baseline generada por el carril local determinístico. Sin deploy, producción, import real ni writes.'
  };
  return `/* CXOrbia source lock generado por tools/integration */\nvar CX_SOURCE_LOCK=${JSON.stringify(lock)};\nvar CX_BUILD_ID=CX_SOURCE_LOCK.aggregateSha256.slice(0,16);\nif(typeof window!=='undefined'){window.CX=window.CX||{};window.CX.BUILD_ID=CX_BUILD_ID;window.CX.SOURCE_LOCK=CX_SOURCE_LOCK;}\n`;
}

function loadRegistry(repoRoot, registryPath) {
  const absolute = resolveInside(repoRoot, registryPath);
  if (!existsSync(absolute)) return { schemaVersion: 1, entries: [] };
  const registry = readJson(absolute);
  if (!Array.isArray(registry.entries)) throw new Error('Registro de empalmes inválido');
  return registry;
}

function main() {
  const args = parseArgs();
  const repoRoot = resolve(args.repo || process.cwd());
  const candidate = resolve(args.candidate || '');
  const planPath = resolve(args.plan || '');
  const productPolicyPath = resolve(args.policy || join(SCRIPT_DIR, 'policies/cxorbia-product.json'));
  const tenantPolicyPath = resolve(args['tenant-policy'] || join(SCRIPT_DIR, 'policies/tenants/tya.json'));
  if (!args.apply) throw new Error('Modo seguro: falta --apply. Ejecute primero workspace-preflight.mjs.');

  const preflight = runWorkspacePreflight({ repoRoot, candidate, plan: planPath, policy: productPolicyPath, tenantPolicy: tenantPolicyPath });
  if (!preflight.ok) {
    process.stdout.write(`${JSON.stringify(preflight, null, 2)}\n`);
    throw new Error('Preflight FAIL. No se aplicó ningún cambio.');
  }

  const plan = readJson(planPath);
  const productPolicy = readJson(productPolicyPath);
  const tenantPolicy = readJson(tenantPolicyPath);
  const projects = selectedProjectPolicies(plan, repoRoot);
  validateScope(plan, productPolicy, tenantPolicy, projects);

  const registryPath = productPolicy.registryPath || 'app/docs/EMPALME-CANDIDATE-REGISTRY.json';
  const registry = loadRegistry(repoRoot, registryPath);
  const prior = registry.entries.find((entry) => entry.candidateSha256 === plan.candidateSha256);
  if (prior) {
    process.stdout.write(`${JSON.stringify({ ok: true, state: 'PASS_ALREADY_APPLIED', entry: prior }, null, 2)}\n`);
    return;
  }

  const allPaths = [...(plan.files?.added || []), ...(plan.files?.modified || []), ...(plan.files?.removed || [])].map((path) => assertCandidatePathAllowed(path, productPolicy, tenantPolicy));
  const uniquePaths = [...new Set(allPaths)];
  if (uniquePaths.length !== allPaths.length) throw new Error('El plan contiene rutas duplicadas');
  if ((plan.files?.removed || []).length && plan.allowRemovals !== true) throw new Error('El plan contiene eliminaciones sin allowRemovals=true');

  const runId = `${sanitizeId(plan.candidateId)}-${isoCompact()}`;
  const extractRoot = resolve(tmpdir(), 'cxorbia-integration', runId, 'candidate');
  const backupRoot = resolve(homedir(), '.cxorbia-backups', sanitizeId(basename(repoRoot)), runId);
  mkdirSync(extractRoot, { recursive: true });
  mkdirSync(backupRoot, { recursive: true });
  const protectedBefore = hashExisting(repoRoot, collectProtectedFiles(repoRoot, productPolicy, tenantPolicy));
  const backupEntries = backupTouched(repoRoot, uniquePaths, backupRoot);
  let commitSha = null;
  let pushed = false;

  try {
    const extractor = extractZip(candidate, extractRoot);
    const candidateRuntimeRoot = findCandidateRuntimeRoot(extractRoot, productPolicy.runtimeRoot || 'app');
    const runtimePrefix = `${productPolicy.runtimeRoot || 'app'}/`;
    for (const path of [...(plan.files?.added || []), ...(plan.files?.modified || [])]) {
      const normalized = normalizeRepoPath(path);
      if (!normalized.startsWith(runtimePrefix)) throw new Error(`La candidata solo puede aportar runtime bajo ${runtimePrefix}: ${normalized}`);
      const source = resolveInside(candidateRuntimeRoot, normalized.slice(runtimePrefix.length));
      if (!existsSync(source)) throw new Error(`Archivo declarado no existe en la candidata: ${normalized}`);
      copyPath(source, resolveInside(repoRoot, normalized));
    }
    for (const path of plan.files?.removed || []) removePath(resolveInside(repoRoot, normalizeRepoPath(path)));

    validateProtectedHashes(repoRoot, protectedBefore);
    const syntax = validateChangedSyntax(repoRoot, uniquePaths);
    const indexScripts = validateIndexScripts(repoRoot, productPolicy.runtimeRoot || 'app');
    const gateResults = runConfiguredGates(repoRoot, plan, tenantPolicy, projects);

    const manifestPath = `app/docs/MANIFEST-${sanitizeId(plan.candidateId).toUpperCase()}-EMPALME-RUNTIME-R1.json`;
    const manifest = runtimeManifest(repoRoot, productPolicy, { candidateId: plan.candidateId, candidateSha256: plan.candidateSha256, tenantId: plan.tenantId, projectIds: projects.map(({ value }) => value.projectId), projectSelection: 'explicit', decision: 'EMPALMED_PENDING_POST_GATES' });
    writeJson(resolveInside(repoRoot, manifestPath), manifest);
    atomicWrite(resolveInside(repoRoot, productPolicy.buildLockPath || 'app/core/build-lock.js'), buildLockContent(plan, manifestPath, manifest));

    const reportBase = { candidateId: plan.candidateId, candidateSha256: plan.candidateSha256, tenantId: plan.tenantId, projectIds: projects.map(({ value }) => value.projectId), extractor, files: plan.files, manifestPath, aggregateSha256: manifest.aggregateSha256, syntax, indexScripts, gates: gateResults };
    const documentationPaths = documentationAddenda(repoRoot, plan, reportBase);
    const reportPath = `app/docs/RESULTADO-EMPALME-${sanitizeId(plan.candidateId).toUpperCase()}-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}.json`;
    writeJson(resolveInside(repoRoot, reportPath), { schemaVersion: 1, generatedAt: new Date().toISOString(), state: 'EMPALMED_PENDING_POST_GATES', ...reportBase, documentationPaths, safeState: 'sin deploy, producción, importaciones reales, writes, Make/Gemini live ni pagos reales' });

    registry.entries.push({ candidateId: plan.candidateId, candidateSha256: plan.candidateSha256, tenantId: plan.tenantId, projectIds: projects.map(({ value }) => value.projectId), appliedAt: new Date().toISOString(), aggregateSha256: manifest.aggregateSha256, manifestPath, reportPath, state: 'EMPALMED_PENDING_POST_GATES' });
    writeJson(resolveInside(repoRoot, registryPath), registry);
    if (!git(['status', '--porcelain=v1'], { cwd: repoRoot })) throw new Error('No se detectaron cambios después del empalme');

    if (args.commit) {
      git(['add', '-A'], { cwd: repoRoot, stdio: 'inherit' });
      git(['commit', '-m', plan.commitMessage || `feat: empalme ${plan.candidateId} multi-tenant [skip ci]`], { cwd: repoRoot, stdio: 'inherit' });
      commitSha = git(['rev-parse', 'HEAD'], { cwd: repoRoot });
      if (args.push) {
        git(['push', 'origin', `HEAD:${preflight.branch}`], { cwd: repoRoot, stdio: 'inherit' });
        pushed = true;
      }
    }

    process.stdout.write(`${JSON.stringify({ ok: true, state: args.commit ? (pushed ? 'PASS_EMPALMED_COMMITTED_PUSHED' : 'PASS_EMPALMED_COMMITTED_LOCAL') : 'PASS_EMPALMED_NOT_COMMITTED', candidateId: plan.candidateId, tenantId: plan.tenantId, projectIds: projects.map(({ value }) => value.projectId), aggregateSha256: manifest.aggregateSha256, manifestPath, reportPath, commitSha, pushed, backupRoot }, null, 2)}\n`);
  } catch (error) {
    if (!commitSha) rollback(repoRoot, backupEntries);
    throw error;
  }
}

try { main(); }
catch (error) {
  process.stderr.write(`EMPALME_FAIL: ${String(error.stack || error.message || error)}\n`);
  process.exitCode = 1;
}
