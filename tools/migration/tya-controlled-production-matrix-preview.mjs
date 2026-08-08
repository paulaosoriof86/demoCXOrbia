#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'controlled-production-matrix-phase-a.tya.contract.json');

function parseArgs(argv) {
  const args = { input: null, output: null, format: 'markdown' };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];
    if (token === '--input') { args.input = next; i += 1; }
    else if (token.startsWith('--input=')) args.input = token.slice('--input='.length);
    else if (token === '--output') { args.output = next; i += 1; }
    else if (token.startsWith('--output=')) args.output = token.slice('--output='.length);
    else if (token === '--format') { args.format = next; i += 1; }
    else if (token.startsWith('--format=')) args.format = token.slice('--format='.length);
  }
  return args;
}

function readJson(filePath) {
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
  if (!fs.existsSync(resolved)) throw new Error(`Missing file: ${path.relative(root, resolved)}`);
  return JSON.parse(fs.readFileSync(resolved, 'utf8'));
}

function writeOutput(outputPath, content) {
  if (!outputPath) {
    console.log(content);
    return;
  }
  const resolved = path.isAbsolute(outputPath) ? outputPath : path.join(root, outputPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
  console.log(JSON.stringify({ matrix: 'tya-controlled-production-matrix-preview', status: 'written', output: path.relative(root, resolved) }, null, 2));
}

function hasPrototypeBlocker(summary) {
  if (!summary) return true;
  if (summary.productionDecision && String(summary.productionDecision).includes('frontend_p0')) return true;
  const rows = Array.isArray(summary.areaRows) ? summary.areaRows : [];
  return rows.some((row) => row.area === 'prototype_audit' && String(row.status).includes('blocked'));
}

function buildMatrix(summary) {
  const prototypeBlocked = hasPrototypeBlocker(summary);
  const backendReportAvailable = Boolean(summary?.reportName || summary?.sourceValidator);
  const sourceDecision = summary?.productionDecision || 'not_reported_local_chain_pending';
  const rows = [
    {
      section: 'frontend_p0_required',
      priority: 'P0',
      item: 'Corregir mensajes visibles que prometen envio, sync o movimiento real con gates apagados',
      status: prototypeBlocked ? 'blocked' : 'manual_review_required',
      owner: 'Claude_frontend',
      evidenceRef: 'app/docs/AUDITORIA-FORENSE-V87-CXORBIA-20260705.md',
      nextAction: 'Entregar candidata correctiva con delta real y auditar nuevamente',
      productionImpact: 'blocks_source_lock'
    },
    {
      section: 'frontend_p0_required',
      priority: 'P0',
      item: 'Reemplazar cuestionario enviado por realizado/completado pendiente revision cuando aplique',
      status: prototypeBlocked ? 'blocked' : 'manual_review_required',
      owner: 'Claude_frontend',
      evidenceRef: 'app/docs/PENDIENTES-CLAUDE-ADDENDUM-V87-AUDITORIA-20260705.md',
      nextAction: 'Aplicar correccion quirurgica sin ampliar Academia',
      productionImpact: 'blocks_source_lock'
    },
    {
      section: 'backend_preview_ready',
      priority: 'P0',
      item: 'Manifest sintetico, runner, readiness map, bridge y reporte sanitizado disponibles',
      status: 'preview_ready',
      owner: 'ChatGPT_backend',
      evidenceRef: 'app/docs/PHASE-A-TRACKER-ADDENDUM-RELEASE-READINESS-SANITIZED-REPORT-20260705.md',
      nextAction: 'Usar solo como preview hasta ejecucion local y auditoria frontend',
      productionImpact: 'preview_only'
    },
    {
      section: 'backend_local_execution_pending',
      priority: 'P0',
      item: 'Ejecutar cadena local de readiness sin ExecuteValidators',
      status: backendReportAvailable ? 'manual_review_required' : 'pending_local_execution',
      owner: 'ChatGPT_backend',
      evidenceRef: 'tools/migration/tya-synthetic-pack-release-readiness-local-chain.ps1',
      nextAction: 'Correr localmente cuando haya repo disponible y revisar salidas',
      productionImpact: 'does_not_block_if_documented'
    },
    {
      section: 'backend_local_execution_pending',
      priority: 'P0',
      item: 'Generar reporte sanitizado desde snapshot local',
      status: backendReportAvailable ? 'manual_review_required' : 'pending_local_execution',
      owner: 'ChatGPT_backend',
      evidenceRef: 'tools/migration/tya-release-readiness-sanitized-report-local.ps1',
      nextAction: 'Generar reporte 05 sanitizado desde 04 snapshot report',
      productionImpact: 'does_not_block_if_documented'
    },
    {
      section: 'post_p0_p1',
      priority: 'P1',
      item: 'Incorporar availableFrom, outboxStatus, mailboxId, formVersion, externalFolderRef y crmEntityId en UI/readiness',
      status: 'deferred_until_after_p0',
      owner: 'Claude_frontend',
      evidenceRef: 'app/docs/CLAUDE-ACUMULADO-POST-V87-SYNTHETIC-RUNNER-20260705.md',
      nextAction: 'Planificar despues de cerrar P0 y reauditar candidata',
      productionImpact: 'deferred_post_p0'
    },
    {
      section: 'academia_later',
      priority: 'P1',
      item: 'Explicar preview vs produccion, gates, blockers y revision manual en Academia',
      status: 'deferred_until_after_p0',
      owner: 'Claude_frontend',
      evidenceRef: 'app/docs/ACADEMIA-IMPACT-RELEASE-READINESS-SANITIZED-REPORT-TYA-20260705.md',
      nextAction: 'No ampliar Academia hasta corregir P0',
      productionImpact: 'deferred_post_p0'
    },
    {
      section: 'source_lock_blockers',
      priority: 'P0',
      item: 'Source lock bloqueado mientras prototype_audit siga blocked_prototype_pending',
      status: prototypeBlocked ? 'blocked' : 'manual_review_required',
      owner: 'Paula_manual_decision',
      evidenceRef: 'app/docs/RELEASE-READINESS-BRIDGE-SYNTHETIC-PACK-TYA-20260705.md',
      nextAction: 'Solo reconsiderar despues de candidata correctiva auditada',
      productionImpact: 'blocks_production'
    },
    {
      section: 'production_decision',
      priority: 'P0',
      item: 'Decision de salida controlada',
      status: 'blocked',
      owner: 'Paula_manual_decision',
      evidenceRef: sourceDecision,
      nextAction: 'Mantener no produccion hasta P0 corregido, auditoria nueva y reporte local revisado',
      productionImpact: 'blocks_production'
    }
  ];
  return {
    matrix: 'tya-controlled-production-matrix-preview',
    generatedAt: new Date().toISOString(),
    sourceReportDecision: sourceDecision,
    runtimeEnabled: false,
    productionAllowed: false,
    deployAllowed: false,
    mergeAllowed: false,
    importRealDataAllowed: false,
    rows
  };
}

function validateMatrix(matrix, contract) {
  const issues = [];
  for (const flag of ['runtimeEnabled', 'productionAllowed', 'deployAllowed', 'mergeAllowed', 'importRealDataAllowed']) {
    if (matrix[flag] !== false) issues.push(`${flag}_must_remain_false`);
    if (contract[flag] !== false) issues.push(`contract_${flag}_must_remain_false`);
  }
  for (const [index, row] of matrix.rows.entries()) {
    for (const field of contract.requiredMatrixFields || []) if (!row[field]) issues.push(`row_${index}_missing_${field}`);
    if (!contract.matrixSections?.includes(row.section)) issues.push(`row_${index}_unsupported_section:${row.section}`);
    if (!contract.priorities?.includes(row.priority)) issues.push(`row_${index}_unsupported_priority:${row.priority}`);
    if (!contract.allowedStatuses?.includes(row.status)) issues.push(`row_${index}_unsupported_status:${row.status}`);
    if (!contract.ownerTypes?.includes(row.owner)) issues.push(`row_${index}_unsupported_owner:${row.owner}`);
    if (!contract.productionImpactValues?.includes(row.productionImpact)) issues.push(`row_${index}_unsupported_productionImpact:${row.productionImpact}`);
  }
  return issues;
}

function markdown(matrix, issues) {
  const lines = [];
  lines.push('# Matriz de produccion controlada Phase A - CXOrbia TyA');
  lines.push('');
  lines.push(`GeneratedAt: ${matrix.generatedAt}`);
  lines.push('');
  lines.push('## Decision ejecutiva');
  lines.push('');
  lines.push('- Estado: no source lock, no produccion, no deploy, no merge.');
  lines.push(`- Decision fuente: ${matrix.sourceReportDecision}`);
  lines.push(`- Issues de matriz: ${issues.length ? issues.join(' | ') : 'none'}`);
  lines.push('');
  lines.push('## Gates');
  lines.push('');
  lines.push(`- productionAllowed: ${matrix.productionAllowed}`);
  lines.push(`- deployAllowed: ${matrix.deployAllowed}`);
  lines.push(`- mergeAllowed: ${matrix.mergeAllowed}`);
  lines.push(`- importRealDataAllowed: ${matrix.importRealDataAllowed}`);
  lines.push('');
  for (const section of [...new Set(matrix.rows.map((row) => row.section))]) {
    lines.push(`## ${section}`);
    lines.push('');
    for (const row of matrix.rows.filter((item) => item.section === section)) {
      lines.push(`### ${row.item}`);
      lines.push(`- priority: ${row.priority}`);
      lines.push(`- status: ${row.status}`);
      lines.push(`- owner: ${row.owner}`);
      lines.push(`- evidenceRef: ${row.evidenceRef}`);
      lines.push(`- nextAction: ${row.nextAction}`);
      lines.push(`- productionImpact: ${row.productionImpact}`);
      lines.push('');
    }
  }
  lines.push('## Safety');
  lines.push('');
  lines.push('- Esta matriz es preview/documental.');
  lines.push('- No autoriza produccion, deploy, merge, import, proveedores, pagos ni escrituras reales.');
  lines.push('- No elimina blockers sin nueva evidencia y auditoria.');
  return lines.join('\n');
}

try {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  let summary = null;
  if (args.input) summary = readJson(args.input);
  const matrix = buildMatrix(summary);
  const issues = validateMatrix(matrix, contract);
  if (args.format === 'json') writeOutput(args.output, `${JSON.stringify({ ...matrix, validationIssues: issues }, null, 2)}\n`);
  else writeOutput(args.output, markdown(matrix, issues));
  if (issues.length) process.exitCode = 2;
} catch (error) {
  console.error(JSON.stringify({ matrix: 'tya-controlled-production-matrix-preview', status: 'error', productionAllowed: false, error: error.message }, null, 2));
  process.exitCode = 1;
}
