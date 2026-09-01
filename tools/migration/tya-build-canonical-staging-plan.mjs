import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const flowReportPath = process.env.CXORBIA_HR_PRIVATE_FLOW_JSON || path.join(repoRoot, 'tmp', 'hr-source-private-full-flow', 'hrSourcePrivateFullFlow.json');
const stagingPreviewDir = process.env.CXORBIA_TYA_STAGING_PREVIEW_DIR || path.join(repoRoot, 'tmp', 'tya-staging-preview');
const outDir = process.env.CXORBIA_TYA_CANONICAL_STAGING_OUT || path.join(repoRoot, 'tmp', 'tya-canonical-staging');

fs.mkdirSync(outDir, { recursive: true });

function readJson(file, fallback = null){
  try{ return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch{ return fallback; }
}

function readJsonl(file){
  try{
    return fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map(line => JSON.parse(line));
  }catch{ return []; }
}

function normText(v){
  return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim().replace(/\s+/g, ' ');
}

const MONTHS = {
  ENERO:'01', FEBRERO:'02', MARZO:'03', ABRIL:'04', MAYO:'05', JUNIO:'06', JULIO:'07', AGOSTO:'08', SEPTIEMBRE:'09', SETIEMBRE:'09', OCTUBRE:'10', NOVIEMBRE:'11', DICIEMBRE:'12'
};

function parseTab(tab){
  const raw = String(tab || '').trim();
  const normalized = normText(raw);
  const isDashboard = normalized.includes('DASHBOARD');
  const isHN = /\bHN\b/.test(normalized);
  const country = isHN ? 'HN' : 'GT';
  const words = normalized.split(' ');
  const monthName = words.find(w => MONTHS[w]) || '';
  const yy = (words.find(w => /^\d{2}$/.test(w)) || '').padStart(2, '0');
  const year = yy ? Number(`20${yy}`) : null;
  const month = monthName ? MONTHS[monthName] : '';
  const periodId = year && month ? `${year}-${month}-${country}` : '';
  let stage = 'review_required';
  if(isDashboard) stage = 'exclude_dashboard';
  else if(year === 2026 && month === '07') stage = 'preparation_not_closed';
  else if(year && month) stage = 'operational_period';
  const reviewReasons = [];
  if(isDashboard) reviewReasons.push('dashboard_tab_not_operational_visits');
  if(!periodId && !isDashboard) reviewReasons.push('unrecognized_period_tab');
  if(raw === 'JUNIO 26 HN') reviewReasons.push('known_extra_hn_row_review');
  if(raw === 'JUNIO 26') reviewReasons.push('gt_row_count_review_36');
  if(year === 2026 && month === '07') reviewReasons.push('july_preparation_not_historic_closed');
  return { raw, normalized, isDashboard, country, year, month, periodId, stage, reviewReasons };
}

function latestPreviewPeriodsFromFlow(flow){
  const coverageRows = flow?.coverage?.periodRows || [];
  if(Array.isArray(coverageRows) && coverageRows.length){
    return coverageRows.map(r => ({
      period: r.period || r.name || r.tab || 'unknown',
      countrySource: r.country || r.source || '',
      rows: Number(r.visits || r.rows || 0),
      columns: Number(r.columns || 0),
      status: r.status || ''
    }));
  }
  const previewResult = (flow?.results || []).find(r => r.action === 'preview') || {};
  return [];
}

function summarizeStagingPreview(){
  const visits = readJsonl(path.join(stagingPreviewDir, 'previewVisits.jsonl'));
  const shoppers = readJsonl(path.join(stagingPreviewDir, 'previewShoppers.jsonl'));
  const postulations = readJsonl(path.join(stagingPreviewDir, 'previewPostulations.jsonl'));
  const notifications = readJsonl(path.join(stagingPreviewDir, 'previewNotifications.jsonl'));
  const liquidations = readJsonl(path.join(stagingPreviewDir, 'previewLiquidationCandidates.jsonl'));
  const validationIssues = readJsonl(path.join(stagingPreviewDir, 'validationIssues.jsonl'));
  const visitsByPeriodCountry = {};
  for(const v of visits){
    const key = `${v.periodRaw || v.sourcePeriod || 'sin_periodo'}|${v.country || v.pais || 'sin_pais'}`;
    visitsByPeriodCountry[key] = (visitsByPeriodCountry[key] || 0) + 1;
  }
  return {
    exists: fs.existsSync(stagingPreviewDir),
    visits: visits.length,
    shoppers: shoppers.length,
    postulations: postulations.length,
    notifications: notifications.length,
    liquidationCandidates: liquidations.length,
    validationIssues: validationIssues.length,
    visitsByPeriodCountry
  };
}

const flow = readJson(flowReportPath, null);
const stagingSummary = summarizeStagingPreview();
const rawPeriods = latestPreviewPeriodsFromFlow(flow);
const canonicalPeriods = rawPeriods.map(p => {
  const parsed = parseTab(p.period);
  return {
    sourceTab: p.period,
    sourceKind: p.countrySource || 'live_hr',
    rowsDetected: p.rows,
    columnsDetected: p.columns,
    liveStatus: p.status,
    tenantId: 'tya',
    programId: 'cinepolis',
    country: parsed.country,
    year: parsed.year,
    month: parsed.month,
    periodId: parsed.periodId,
    stage: parsed.stage,
    importPolicy: parsed.stage === 'operational_period' ? 'candidate_for_staging' : 'exclude_or_review',
    reviewReasons: parsed.reviewReasons
  };
});

const blockers = [
  { id: 'B01', severity: 'critical', status: 'blocked', title: 'PII shoppers / DPI', action: 'Definir exclusion, cifrado o coleccion privada antes de import shoppers.' },
  { id: 'B02', severity: 'critical', status: 'blocked', title: 'questionnaire_marks duplicado', action: 'Excluir como fuente independiente; usar solo candidatos revisados si aplica.' },
  { id: 'B03', severity: 'warning', status: 'review_required', title: 'Liquidaciones requieren Excel financiero', action: 'Mantener como candidatas hasta cruce externo.' },
  { id: 'B04', severity: 'warning', status: 'review_required', title: 'Notificaciones sin destinatario canonico', action: 'Guardar como historial hasta resolver recipients.' },
  { id: 'B05', severity: 'warning', status: 'review_required', title: 'JUNIO 26 HN / filas adicionales', action: 'Mantener periodo en revision antes de importacion.' }
];

const plan = {
  generatedAt: new Date().toISOString(),
  mode: 'canonical-staging-plan-no-firestore-writes',
  inputs: { flowReportPath, stagingPreviewDir },
  safety: { firestoreWrites: 0, importsExecuted: 0, deploy: 0, production: 0, canImport: false },
  flowReportLoaded: !!flow,
  stagingSummary,
  liveHr: {
    tabsDetected: rawPeriods.length,
    liveXlsxTabs: rawPeriods.filter(p => p.status === 'live_xlsx_tab').length,
    fallbackCsvDetected: rawPeriods.some(p => String(p.status || '').includes('csv'))
  },
  canonicalPeriods,
  dashboardTabs: canonicalPeriods.filter(p => p.stage === 'exclude_dashboard'),
  operationalCandidates: canonicalPeriods.filter(p => p.stage === 'operational_period'),
  preparationPeriods: canonicalPeriods.filter(p => p.stage === 'preparation_not_closed'),
  reviewRequired: canonicalPeriods.filter(p => (p.reviewReasons || []).length || p.stage === 'review_required'),
  blockers,
  next: [
    'Validar que operationalCandidates coincidan con los periodos que Paula quiere migrar.',
    'Excluir dashboardTabs de visitas operativas.',
    'Mantener preparationPeriods en modo preparacion hasta cierre.',
    'Resolver blockers criticos antes de escritura DEV.',
    'Crear staging canonico con trazabilidad y sin Firestore writes.'
  ]
};

fs.writeFileSync(path.join(outDir, 'tyaCanonicalStagingPlan.json'), JSON.stringify(plan, null, 2), 'utf8');

const mdRows = canonicalPeriods.map(p => `| ${p.sourceTab} | ${p.country} | ${p.periodId || '-'} | ${p.rowsDetected} | ${p.columnsDetected} | ${p.stage} | ${(p.reviewReasons || []).join(', ') || '-'} |`);
const blockerRows = blockers.map(b => `| ${b.id} | ${b.severity} | ${b.status} | ${b.title} | ${b.action} |`);
const md = [
  '# TyA canonical staging plan',
  '',
  `Generated at: ${plan.generatedAt}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- canImport: false',
  '',
  '## Input status',
  `- Flow report loaded: ${plan.flowReportLoaded}`,
  `- Live HR tabs detected: ${plan.liveHr.tabsDetected}`,
  `- XLSX tabs: ${plan.liveHr.liveXlsxTabs}`,
  `- CSV fallback detected: ${plan.liveHr.fallbackCsvDetected}`,
  `- Staging preview exists: ${stagingSummary.exists}`,
  `- Staging visits: ${stagingSummary.visits}`,
  `- Staging shoppers: ${stagingSummary.shoppers}`,
  `- Staging postulations: ${stagingSummary.postulations}`,
  `- Staging notifications: ${stagingSummary.notifications}`,
  `- Staging liquidation candidates: ${stagingSummary.liquidationCandidates}`,
  '',
  '## Canonical period classification',
  '| Source tab | Country | periodId | Rows | Columns | Stage | Review reasons |',
  '|---|---|---|---:|---:|---|---|',
  ...(mdRows.length ? mdRows : ['| none | - | - | 0 | 0 | - | - |']),
  '',
  '## Blockers',
  '| ID | Severity | Status | Title | Action |',
  '|---|---|---|---|---|',
  ...blockerRows,
  '',
  '## Next',
  ...plan.next.map(n => `- ${n}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'tyaCanonicalStagingPlan.md'), md, 'utf8');
console.log(md);
console.log('');
console.log(`Report dir: ${outDir}`);
