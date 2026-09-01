# RECONSTRUCCIÓN DE CANDIDATA ACUMULATIVA — MATRIZ MAESTRA

**Inicio:** 2026-08-02  
**Corrección prevalente:** 2026-08-03  
**Estado:** `SUPERSEDED_PARTIAL_AB_MATRIX__USE_COMPLETE_PHASE_A_MATRIX`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama única:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. Aviso prevalente

La matriz A+B anterior queda conservada únicamente como trazabilidad del desvío metodológico. No puede usarse como manifest, gate ni criterio de aprobación de la candidata acumulativa.

La fuente activa es:

`MATRIZ-CANDIDATA-ACUMULATIVA-PHASE-A-COMPLETA-20260803.md`.

La corrección contractual está en:

`ADDENDUM-MAESTRO-CORRECCION-RECONSTRUCCION-PHASE-A-COMPLETA-20260803.md`.

## 2. Causa de sustitución

La matriz anterior certificaba A+B y 23 archivos, priorizando CRM Ops Leads, Clientes comerciales, Comercial y Marketing. Al hacerlo dejó para checkpoints posteriores módulos indispensables y ya trabajados de Phase A:

- Dashboard Operativo acumulativo;
- Histórico y refresh;
- Visitas y Revisión Admin;
- Postulaciones y Reservas;
- Shoppers y experiencia por perfiles;
- Finanzas completa;
- Portal Cliente y Portal Shopper;
- Reportes Admin/Cliente/Shopper y exportaciones.

Eso contradijo el plan Phase A, los freezes anteriores y el orden de validación C6.

## 3. Autoridad vigente

La candidata definitiva debe recuperar y demostrar:

- RC Phase A smoke técnico y visual/consola PASS;
- M1/Corte 1 FROZEN/APROBADO;
- Corte 2A/V174 FROZEN/APROBADO;
- Corte 3/V182 `FROZEN_ACTIVE_BASELINE`;
- C6 entrada directa, HR, Staff, Shopper, Cliente, Finanzas, Portales y Reservas técnicamente PASS.

## 4. Tratamiento del trabajo A+B ya aplicado

El adapter y los archivos A+B no se eliminan automáticamente:

- se preservan como trabajo del bloque posterior;
- deben ser revisados solo por impacto transversal;
- no sustituyen la composición Phase A;
- no condicionan el freeze Phase A salvo P0 demostrado.

El manifest:

`MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802.json`

queda clasificado como:

`PARTIAL_MANIFEST_NOT_SUFFICIENT_FOR_PHASE_A_FREEZE`.

## 5. DEV actual

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Clasificación:

`TECHNICAL_COMPARISON_BUILD__NOT_FINAL_PHASE_A_CANDIDATE`.

No se pide aprobación humana fragmentada sobre ese build.

## 6. Próximo bloque vinculante

`RECUPERAR SHAS APROBADOS/SOURCE LOCKS PHASE A → COMPARAR CONTRA BLOBS VIVOS → PRESERVAR/RESTAURAR/RECONCILIAR → MANIFEST PHASE A COMPLETA → GATES ACUMULATIVOS MULTIROL/FINANZAS/REPORTES/RESERVAS`.

## 7. Estado seguro

- cambios funcionales en esta corrección documental: 0;
- deploy: 0;
- provider writes: 0;
- merge: false;
- producción: intacta.
