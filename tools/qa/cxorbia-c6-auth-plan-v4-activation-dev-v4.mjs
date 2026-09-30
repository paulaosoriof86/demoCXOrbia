#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const baseTool = path.join(here, 'cxorbia-c6-auth-plan-v4-activation-dev-v1.mjs');
const badMask = '?mask=hashConfig';
const oldExtraction = 'const body=await response.json(),hashConfig=body?.hashConfig||body?.hash_config;';
const newExtraction = 'const body=await response.json(),hashConfig=body?.signIn?.hashConfig;';

const source = fs.readFileSync(baseTool, 'utf8');
const maskOccurrences = source.split(badMask).length - 1;
if (maskOccurrences !== 1) throw new Error(`HASH_CONFIG_MASK_OCCURRENCES_${maskOccurrences}`);
const extractionOccurrences = source.split(oldExtraction).length - 1;
if (extractionOccurrences !== 1) throw new Error(`HASH_CONFIG_EXTRACTION_OCCURRENCES_${extractionOccurrences}`);

const patched = source.replace(badMask, '').replace(oldExtraction, newExtraction);
if (patched.includes(badMask)) throw new Error('HASH_CONFIG_MASK_STILL_PRESENT');
if (patched.includes(oldExtraction)) throw new Error('HASH_CONFIG_ROOT_EXTRACTION_STILL_PRESENT');
if (!patched.includes(newExtraction)) throw new Error('HASH_CONFIG_SIGNIN_EXTRACTION_MISSING');
if (!patched.includes("admin/v2/projects/${encodeURIComponent(projectId)}/config")) throw new Error('HASH_CONFIG_GET_RESOURCE_MISSING');
if (!patched.includes('sourceSafe.prewrite={pass:true')) throw new Error('PREWRITE_PASS_MARKER_MISSING');
if (!patched.includes('state.writeBoundaryEntered=true')) throw new Error('WRITE_BOUNDARY_MARKER_MISSING');

const prewritePass = patched.indexOf('sourceSafe.prewrite={pass:true');
const writeBoundary = patched.indexOf('state.writeBoundaryEntered=true');
const firstCreate = patched.indexOf('await auth.createUser');
if (!(prewritePass >= 0 && writeBoundary > prewritePass && firstCreate > writeBoundary)) throw new Error('WRITE_BOUNDARY_ORDER_DRIFT');

const runtimeTool = path.join(here, `.cxorbia-c6-auth-plan-v4-activation-dev-v4-runtime-${process.pid}.mjs`);
fs.writeFileSync(runtimeTool, patched, 'utf8');
try {
  const check = spawnSync(process.execPath, ['--check', runtimeTool], { stdio: 'inherit' });
  if (check.status !== 0) process.exit(check.status ?? 1);
  if (process.argv.includes('--source-repair-self-test')) {
    console.log('PASS_C6_AUTH_PLAN_V4_HASHCONFIG_HARNESS_SYNTAX_ROOTFIX_SOURCE_ONLY');
    process.exit(0);
  }
  const child = spawnSync(process.execPath, [runtimeTool, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: process.env
  });
  process.exit(child.status ?? 1);
} finally {
  try { fs.unlinkSync(runtimeTool); } catch {}
}
