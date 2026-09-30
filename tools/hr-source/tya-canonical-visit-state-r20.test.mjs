#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCanonicalVisitState,
  summarizeCanonicalPeriods
} from './tya-canonical-visit-state-r20.mjs';

test('Recovery P0 / unassigned visit without Disponible Desde stays available for postulation',()=>{
  const visit=applyCanonicalVisitState({
    periodKey:'2026-09',
    country:'GT',
    shopperId:null,
    shopperCode:null,
    shopper:null,
    disponibleDesde:null,
    availableFromRaw:null
  });
  assert.equal(visit.hasShopper,false);
  assert.equal(visit.canonicalFacets.available,true);
  assert.equal(visit.canonicalFacets.eligibilityBlocked,false);
  assert.equal(visit.availabilityState,'eligible_unassigned');
  assert.ok(visit.reviewReasons.includes('available_from_missing_for_unassigned_visit'));
});

test('Recovery P0 / schedule dependency remains metadata and does not hide an unassigned opportunity',()=>{
  const visit=applyCanonicalVisitState({
    periodKey:'2026-09',
    country:'HN',
    shopperId:null,
    shopperCode:null,
    shopper:null,
    disponibleDesde:'P x visita previa',
    availableFromRaw:'P x visita previa'
  });
  assert.equal(visit.canonicalFacets.available,true);
  assert.equal(visit.canonicalFacets.eligibilityBlocked,false);
  assert.equal(visit.availabilityState,'eligible_with_schedule_dependency');
  assert.equal(visit.availabilityDependency,'previous_measurement_window');
});

test('Recovery P0 / Agendadas counts programmed visits without realization only',()=>{
  const pendingRealization=applyCanonicalVisitState({
    periodKey:'2026-09',
    country:'GT',
    shopperId:'shopper-a',
    agendada:'2026-09-20'
  });
  const realized=applyCanonicalVisitState({
    periodKey:'2026-09',
    country:'GT',
    shopperId:'shopper-b',
    agendada:'2026-09-10',
    realizada:'2026-09-11'
  });
  assert.equal(pendingRealization.canonicalFacets.scheduled,true);
  assert.equal(pendingRealization.canonicalFacets.pendingRealization,true);
  assert.equal(realized.canonicalFacets.scheduled,true);
  assert.equal(realized.canonicalFacets.pendingRealization,false);

  const [summary]=summarizeCanonicalPeriods([pendingRealization,realized]);
  assert.equal(summary.total,2);
  assert.equal(summary.scheduled,1);
  assert.equal(summary.realized,1);
});

test('Recovery P0 / all unassigned visits in a period are available for postulation',()=>{
  const visits=[
    applyCanonicalVisitState({periodKey:'2026-09',country:'GT',shopperId:null,disponibleDesde:null}),
    applyCanonicalVisitState({periodKey:'2026-09',country:'GT',shopperId:null,disponibleDesde:'2026-09-16'}),
    applyCanonicalVisitState({periodKey:'2026-09',country:'HN',shopperId:null,disponibleDesde:'P1Q'})
  ];
  const [summary]=summarizeCanonicalPeriods(visits);
  assert.equal(summary.unassigned,3);
  assert.equal(summary.available,3);
  assert.equal(summary.eligibilityBlocked,0);
});
