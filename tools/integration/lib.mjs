#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync, rmSync, renameSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) { out._.push(token); continue; }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) { out[key] = next; i += 1; }
    else out[key] = true;
  }
  return out;
}

export function readJson(path) { return JSON.parse(readFileSync(path, 'utf8')); }
export function atomicWrite(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.tmp-${process.pid}-${Date.now()}`;
  writeFileSync(temp, content, 'utf8');
  renameSync(temp, path);
}
export function writeJson(path, value) { atomicWrite(path, `${JSON.stringify(value, null, 2)}\n`); }
export function sha256Buffer(buffer) { return createHash('sha256').update(buffer).digest('hex'); }
export function sha256File(path) { return sha256Buffer(readFileSync(path)); }
export function git(args, options = {}) {
  const output = execFileSync('git', args, { cwd: options.cwd, encoding: 'utf8', stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...(options.env || {}) } });
  return output == null ? '' : String(output).trim();
}
export function tryCommand(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: options.cwd, encoding: 'utf8', stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...(options.env || {}) } });
  return { ok: result.status === 0, status: result.status, stdout: (result.stdout || '').trim(), stderr: (result.stderr || '').trim(), error: result.error ? String(result.error.message || result.error) : null };
}
export function normalizeRepoPath(input) {
  const normalized = String(input || '').replaceAll('\\', '/').replace(/^\.\//, '');
  if (!normalized || normalized.startsWith('/') || normalized.includes('../') || normalized === '..') throw new Error(`Ruta de repo inválida: ${input}`);
  return normalized;
}
export function isPathUnderPrefix(path, prefix) {
  const p = normalizeRepoPath(path);
  const q = normalizeRepoPath(prefix).replace(/\/$/, '');
  return p === q || p.startsWith(`${q}/`);
}
export function pathMatchesPrefix(path, prefixes = []) { return prefixes.some((prefix) => isPathUnderPrefix(path, prefix)); }
export function assertCandidatePathAllowed(path, productPolicy, tenantPolicy) {
  const p = normalizeRepoPath(path);
  if (!pathMatchesPrefix(p, productPolicy.allowedCandidateRoots || ['app/'])) throw new Error(`Ruta fuera de raíces permitidas: ${p}`);
  const protectedPrefixes = [...(productPolicy.protectedPrefixes || []), ...(tenantPolicy.protectedPrefixes || [])];
  const protectedFiles = new Set([...(productPolicy.protectedFiles || []), ...(tenantPolicy.protectedFiles || [])].map(normalizeRepoPath));
  if (pathMatchesPrefix(p, protectedPrefixes) || protectedFiles.has(p)) throw new Error(`La candidata intenta tocar una ruta protegida: ${p}`);
  return p;
}
export function walkFiles(rootDir, options = {}) {
  const files = [];
  const excludePrefixes = (options.excludePrefixes || []).map((x) => x.replaceAll('\\', '/').replace(/\/$/, ''));
  function visit(dir) {
    for (const name of readdirSync(dir)) {
      const absolute = join(dir, name);
      const rel = relative(rootDir, absolute).split(sep).join('/');
      if (excludePrefixes.some((prefix) => rel === prefix || rel.startsWith(`${prefix}/`))) continue;
      const stat = statSync(absolute);
      if (stat.isDirectory()) visit(absolute); else if (stat.isFile()) files.push(rel);
    }
  }
  visit(rootDir);
  return files.sort();
}
export function runtimeManifest(repoRoot, policy, metadata = {}) {
  const runtimeRoot = resolve(repoRoot, policy.runtimeRoot || 'app');
  if (!existsSync(runtimeRoot)) throw new Error(`No existe runtimeRoot: ${runtimeRoot}`);
  const files = walkFiles(runtimeRoot, { excludePrefixes: policy.manifestExclude || ['docs', '.DS_Store'] }).filter((path) => path !== '.DS_Store' && !path.endsWith('/.DS_Store')).map((path) => ({ path: `${policy.runtimeRoot || 'app'}/${path}`, sha256: sha256File(join(runtimeRoot, ...path.split('/'))) }));
  const aggregateInput = files.map((item) => `${item.path}:${item.sha256}`).join('\n');
  return { schemaVersion: 1, generatedAt: new Date().toISOString(), runtimeRoot: policy.runtimeRoot || 'app', fileCount: files.length, aggregateSha256: sha256Buffer(Buffer.from(aggregateInput, 'utf8')), ...metadata, files };
}
export function copyPath(source, destination) { mkdirSync(dirname(destination), { recursive: true }); copyFileSync(source, destination); }
export function removePath(path) { rmSync(path, { recursive: true, force: true }); }
export function extractZip(zipPath, destination) {
  mkdirSync(destination, { recursive: true });
  const attempts = process.platform === 'win32' ? [['tar', ['-xf', zipPath, '-C', destination]], ['bsdtar', ['-xf', zipPath, '-C', destination]]] : [['unzip', ['-q', zipPath, '-d', destination]], ['tar', ['-xf', zipPath, '-C', destination]], ['bsdtar', ['-xf', zipPath, '-C', destination]]];
  const errors = [];
  for (const [command, args] of attempts) { const result = tryCommand(command, args); if (result.ok) return { command, args }; errors.push(`${command}: ${result.stderr || result.error || `exit ${result.status}`}`); }
  throw new Error(`No fue posible extraer el ZIP. ${errors.join(' | ')}`);
}
export function resolveInside(root, repoPath) {
  const normalized = normalizeRepoPath(repoPath);
  const absolute = resolve(root, ...normalized.split('/'));
  const rootAbsolute = resolve(root);
  if (absolute !== rootAbsolute && !absolute.startsWith(`${rootAbsolute}${sep}`)) throw new Error(`Path traversal rechazado: ${repoPath}`);
  return absolute;
}
export function sanitizeId(value) { return String(value || '').trim().replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'candidate'; }
export function isoCompact(date = new Date()) { return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z'); }
