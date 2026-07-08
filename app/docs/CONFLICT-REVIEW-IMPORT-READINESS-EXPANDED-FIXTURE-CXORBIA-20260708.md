# Conflict Review / Import Readiness Expanded Fixture CXOrbia

Fecha: 2026-07-08  
Bloque: input sintetico/sanitizado ampliado para conflict review/import readiness  
Archivo tecnico: `tools/contracts/cxorbia-conflict-review-import-readiness-expanded-fixture.mjs`  
Estado: preview-only, sin fuentes reales.

## 1. Objetivo

Este bloque prepara un input sintetico/sanitizado ampliado para validar el contrato de conflict review/import readiness con mas escenarios, sin usar HR real, datos reales, base vieja, payloads crudos ni datos sensibles.

## 2. Que cubre

El fixture ampliado incluye tres conflictos sinteticos:

1. `assignment_source_conflict` como blocker.
2. `shopper_identity_ambiguous` como warning en revision.
3. `payment_status_conflict` como warning abierto.

Tambien incluye readiness por area:

- projects;
- visits;
- shoppers;
- assignments;
- certifications;
- settlements;
- payments;
- questionnaire_routes.

## 3. Reglas aplicadas

El fixture exige:

- `mode = preview_only`;
- `sourceSafe = true`;
- `isSyntheticOrSanitized = true`;
- sourceRefs opacas;
- stable keys;
- revision humana;
- importGate cerrado;
- no dedupe visual;
- no auto merge;
- no overwrite sin revision;
- sin import real;
- sin writes reales;
- sin Make/Gemini/email/WhatsApp/pagos reales;
- sin datos sensibles.

## 4. Impacto Phase A

Este fixture ayuda a preparar la operacion controlada de Phase A porque permite probar como se verian conflictos reales futuros antes de conectar fuentes reales.

Escenarios relevantes:

- conflicto de asignacion plataforma/HR;
- identidad shopper ambigua sin usar DPI ni datos crudos;
- estatus de pago en revision sin banco ni datos sensibles;
- bloqueo de import si hay blocker.

## 5. Impacto Claude/prototipo

Claude debe reflejar estos escenarios si implementa bandeja de conflictos/readiness:

- mostrar severidad;
- mostrar estado de cola;
- mostrar sourceRefs opacas;
- mostrar stable keys de forma no sensible;
- mostrar razon de revision;
- bloquear import/activacion cuando hay blocker;
- no resolver conflictos automaticamente;
- no deduplicar por nombre o coincidencia visual.

## 6. Impacto Academia

Academia debe explicar:

- que es una cola de conflictos;
- que significa blocker vs warning;
- por que un import se bloquea;
- que es una sourceRef opaca;
- que son stable keys;
- por que no se deduplica visualmente;
- como revisar conflictos de asignacion, identidad y pago;
- por que payment review no equivale a pago real.

## 7. Relacion con hallazgo de Academia

El hallazgo de acciones administrativas faltantes en Academia queda documentado en `app/docs/NEXT-CANDIDATE-AUDIT-ACADEMIA-ADMIN-ACTIONS-20260708.md` y `PENDIENTES-PROTOTIPO.md`.

Este bloque backend no modifica Academia, pero mantiene la regla de que todo impacto en Academia debe quedar traducido a pendiente operativo de Claude.

## 8. Clasificacion obligatoria

- Reusable CXOrbia: si. Fixture ampliado reusable para conflict queue/import readiness.
- Exclusivo cliente: no. Los escenarios representan Phase A sin datos TyA reales ni HR real.
- Claude/prototipo: si. Debe inspirar UI de bandeja de conflictos/readiness.
- Academia: si. Requiere explicacion por rol y checklist de revision.
- Sin impacto Claude: no toca UI directamente, pero genera tareas claras de prototipo.

## 9. Estado seguro

Sin cambios en `/app/modules`.  
Sin cambios en `/app/core`.  
Sin runtime real.  
Sin deploy.  
Sin produccion.  
Sin Firestore/Auth/Storage real.  
Sin HR writes reales.  
Sin Make/Gemini real.  
Sin correos/WhatsApp reales.  
Sin pagos reales.  
Sin import real.  
Sin datos sensibles.
