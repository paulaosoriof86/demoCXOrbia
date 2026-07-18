#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — motor canónico histórico de estados de visita R20.

  Regla central:
  - la HR entrega evidencias ortogonales (shopper, fecha programada, realizada,
    cuestionario, submitido y control operativo);
  - ningún módulo debe reconstruir el ciclo solamente desde `estado`;
  - liquidación y pago son dimensiones financieras separadas;
  - la misma regla se aplica a todos los periodos detectados, sin excepciones
    codificadas para mayo, junio o julio.

  Este archivo es source-safe: no contiene PII, URLs privadas, proveedores ni writes.
*/

const ISO_DATE = /^20\d{2}-[01]\d-[0-3]\d$/;

export function normalizedText(value){
  return String(value ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function hasValue(value){
  if(value === true) return true;
  if(value === false || value == null) return false;
  return String(value).trim() !== '';
}

export function validIsoDate(value){
  if(!hasValue(value)) return false;
  const text = String(value).trim();
  if(!ISO_DATE.test(text)) return false;
  const date = new Date(`${text}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === text;
}

export function periodYear(periodKey){
  const match = String(periodKey || '').match(/^(20\d{2})-[01]\d$/);
  return match ? Number(match[1]) : null;
}

export function dateReview(field, value, periodKey){
  if(!hasValue(value)) return null;
  if(!validIsoDate(value)) return `${field}_invalid_date`;
  const expectedYear = periodYear(periodKey);
  const actualYear = Number(String(value).slice(0,4));
  if(expectedYear && Math.abs(actualYear - expectedYear) > 1) return `${field}_outside_period_year`;
  return null;
}

function explicitFinancialConfirmation(visit, kind){
  if(kind === 'payment'){
    return visit.paymentConfirmed === true ||
      visit.paymentState === 'confirmed' ||
      hasValue(visit.paymentConfirmedAt) ||
      hasValue(visit.paymentSourceRef) ||
      hasValue(visit.paymentEvidence);
  }
  return visit.liquidationState === 'confirmed' ||
    hasValue(visit.liquidationConfirmedAt) ||
    hasValue(visit.liquidationEvidence);
}

export function deriveCanonicalVisitState(visit){
  const control = normalizedText(visit.controlDia || visit.control || visit.statusRaw);
  const reviewReasons = new Set(Array.isArray(visit.reviewReasons) ? visit.reviewReasons : []);

  const scheduledDate = validIsoDate(visit.agendada) ? visit.agendada : null;
  const realizedDate = validIsoDate(visit.realizada) ? visit.realizada : null;
  const questionnaireDate = validIsoDate(visit.cuestFecha) ? visit.cuestFecha : null;
  const submittedAt = validIsoDate(visit.submittedAt) ? visit.submittedAt : null;

  for(const [field, value] of [
    ['scheduled', visit.agendada],
    ['realized', visit.realizada],
    ['questionnaire', visit.cuestFecha],
    ['submitted', visit.submittedAt]
  ]){
    const issue = dateReview(field, value, visit.periodKey);
    if(issue) reviewReasons.add(issue);
  }

  const hasShopper = visit.hasShopper === true || hasValue(visit.shopperId) || hasValue(visit.shopperCode);
  const controlPendingAssignment = control.includes('p x asignar');
  const controlPendingSchedule = control.includes('p x agendar');
  const outOfRange = control.includes('fuera');
  const cancelled = visit.cancelled === true || visit.cancelada === true || ['cancelada','cancelled','archivada'].includes(normalizedText(visit.estado));

  if(controlPendingAssignment && hasShopper) reviewReasons.add('control_pending_assignment_but_shopper_present');
  if(controlPendingSchedule && !hasShopper) reviewReasons.add('control_pending_schedule_but_shopper_missing');
  if(scheduledDate && !hasShopper) reviewReasons.add('scheduled_date_without_shopper');
  if((realizedDate || questionnaireDate || submittedAt) && !hasShopper) reviewReasons.add('execution_evidence_without_shopper');
  if(questionnaireDate && !realizedDate) reviewReasons.add('questionnaire_without_realized_date');
  if(submittedAt && !questionnaireDate) reviewReasons.add('submitted_without_questionnaire_date');

  // La cadena se cierra por evidencia posterior: submitido prueba que existió cuestionario;
  // cuestionario prueba que la visita fue ejecutada. No se inventan fechas faltantes.
  const submitted = Boolean(submittedAt || visit.submit === true || visit.submissionState === 'confirmed_hr' || visit.workflowState === 'submitted_by_tya');
  const questionnaireCompleted = Boolean(questionnaireDate || submitted);
  const realized = Boolean(realizedDate || questionnaireCompleted);
  const scheduled = Boolean(hasShopper && scheduledDate);
  const assigned = Boolean(hasShopper);

  const liquidationConfirmed = explicitFinancialConfirmation(visit, 'liquidation');
  const paymentConfirmed = explicitFinancialConfirmation(visit, 'payment');
  const liquidationCandidate = submitted;

  let operationalStage = 'pending_assignment';
  let presentationState = 'disponible';
  if(assigned){ operationalStage = 'pending_schedule'; presentationState = 'asignada'; }
  if(scheduled){ operationalStage = 'pending_realization'; presentationState = 'agendada'; }
  if(realized){ operationalStage = 'pending_questionnaire'; presentationState = 'realizada'; }
  if(questionnaireCompleted){ operationalStage = 'pending_submission'; presentationState = 'cuestionario'; }
  if(submitted){ operationalStage = 'submitted_complete'; presentationState = 'submitida'; }
  if(liquidationConfirmed){ presentationState = 'liquidada'; }
  if(paymentConfirmed){ presentationState = 'pagada'; }
  if(outOfRange && !realized){ presentationState = 'fuera_rango'; }
  if(cancelled){ operationalStage = 'cancelled'; presentationState = 'cancelada'; }

  const assignmentState = assigned ? 'assigned' : 'unassigned';
  const schedulingState = scheduled ? 'scheduled' : (assigned ? 'pending_schedule' : 'not_applicable');
  const executionState = realized ? 'realized' : (scheduled ? 'pending_realization' : 'not_realized');
  const questionnaireState = questionnaireCompleted ? 'completed' : (realized ? 'pending' : 'not_available');
  const submissionState = submitted ? 'confirmed_hr' : (questionnaireCompleted ? 'pending_tya_submit' : 'not_submitted');
  const liquidationState = liquidationConfirmed ? 'confirmed' : (liquidationCandidate ? 'candidate_pending_financial_match' : 'not_eligible');
  const paymentState = paymentConfirmed ? 'confirmed' : (liquidationCandidate ? 'not_confirmed' : 'not_eligible');

  return {
    assigned,
    scheduled,
    realized,
    questionnaireCompleted,
    submitted,
    outOfRange,
    cancelled,
    liquidationCandidate,
    liquidationConfirmed,
    paymentConfirmed,
    assignmentState,
    schedulingState,
    executionState,
    questionnaireState,
    submissionState,
    liquidationState,
    paymentState,
    operationalStage,
    presentationState,
    controlPendingAssignment,
    controlPendingSchedule,
    reviewRequired: reviewReasons.size > 0,
    reviewReasons: [...reviewReasons].sort()
  };
}

export function applyCanonicalVisitState(visit){
  const canonical = deriveCanonicalVisitState(visit);
  return {
    ...visit,
    hasShopper: canonical.assigned,
    estado: canonical.presentationState,
    canonicalState: canonical.operationalStage,
    operationalState: canonical.operationalStage,
    assignmentState: canonical.assignmentState,
    schedulingState: canonical.schedulingState,
    executionState: canonical.executionState,
    questionnaireState: canonical.questionnaireState,
    submissionState: canonical.submissionState,
    liquidationState: canonical.liquidationState,
    paymentState: canonical.paymentState,
    liquidationCandidate: canonical.liquidationCandidate,
    paymentControlOnly: canonical.liquidationCandidate && !canonical.paymentConfirmed,
    paymentConfirmed: canonical.paymentConfirmed,
    outOfRange: canonical.outOfRange,
    reviewRequired: canonical.reviewRequired,
    reviewReasons: canonical.reviewReasons,
    canonicalFacets: {
      assigned: canonical.assigned,
      scheduled: canonical.scheduled,
      realized: canonical.realized,
      questionnaire: canonical.questionnaireCompleted,
      submitted: canonical.submitted,
      outOfRange: canonical.outOfRange,
      cancelled: canonical.cancelled,
      liquidationCandidate: canonical.liquidationCandidate,
      liquidationConfirmed: canonical.liquidationConfirmed,
      paymentConfirmed: canonical.paymentConfirmed
    }
  };
}

export function summarizeCanonicalPeriods(visits){
  const map = new Map();
  for(const visit of visits || []){
    const key = String(visit.periodKey || 'unknown');
    if(!map.has(key)) map.set(key, {
      periodKey:key, total:0, assigned:0, unassigned:0, scheduled:0, pendingSchedule:0,
      realized:0, pendingQuestionnaire:0, questionnaireCompleted:0, pendingSubmission:0,
      submitted:0, liquidationCandidates:0, liquidationConfirmed:0, paymentConfirmed:0,
      outOfRange:0, reviewRequired:0, byCountry:{}
    });
    const row = map.get(key);
    const facets = visit.canonicalFacets || deriveCanonicalVisitState(visit);
    row.total += 1;
    row.assigned += facets.assigned ? 1 : 0;
    row.unassigned += facets.assigned ? 0 : 1;
    row.scheduled += facets.scheduled ? 1 : 0;
    row.pendingSchedule += facets.assigned && !facets.scheduled && !facets.realized ? 1 : 0;
    row.realized += facets.realized ? 1 : 0;
    row.pendingQuestionnaire += facets.realized && !facets.questionnaire ? 1 : 0;
    row.questionnaireCompleted += facets.questionnaire ? 1 : 0;
    row.pendingSubmission += facets.questionnaire && !facets.submitted ? 1 : 0;
    row.submitted += facets.submitted ? 1 : 0;
    row.liquidationCandidates += facets.liquidationCandidate ? 1 : 0;
    row.liquidationConfirmed += facets.liquidationConfirmed ? 1 : 0;
    row.paymentConfirmed += facets.paymentConfirmed ? 1 : 0;
    row.outOfRange += facets.outOfRange ? 1 : 0;
    row.reviewRequired += visit.reviewRequired === true ? 1 : 0;
    const country = visit.country || visit.pais || 'unknown';
    row.byCountry[country] = (row.byCountry[country] || 0) + 1;
  }
  return [...map.values()].sort((a,b)=>a.periodKey.localeCompare(b.periodKey));
}

export function validateCanonicalHistory(visits, periods){
  const issues = [];
  const summaries = summarizeCanonicalPeriods(visits);
  const expectedPeriodKeys = new Set((periods || []).map(item => String(item.key)));
  const actualPeriodKeys = new Set(summaries.map(item => item.periodKey));

  for(const key of expectedPeriodKeys) if(!actualPeriodKeys.has(key)) issues.push({code:'period_without_visits',periodKey:key,severity:'blocker'});
  for(const summary of summaries){
    if(summary.submitted > summary.questionnaireCompleted || summary.questionnaireCompleted > summary.realized || summary.realized > summary.total){
      issues.push({code:'non_monotonic_operational_chain',periodKey:summary.periodKey,severity:'blocker',summary});
    }
    if(summary.paymentConfirmed > summary.liquidationCandidates){
      issues.push({code:'payment_without_liquidation_candidate',periodKey:summary.periodKey,severity:'blocker',summary});
    }
  }

  return {
    decision: issues.some(item=>item.severity==='blocker') ? 'HOLD_CANONICAL_HISTORY' : 'PASS_CANONICAL_HISTORY',
    periodCount: summaries.length,
    periodKeys: summaries.map(item=>item.periodKey),
    summaries,
    issues
  };
}
