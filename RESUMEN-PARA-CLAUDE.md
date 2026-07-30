# RESUMEN-PARA-CLAUDE.md

## ESTADO VIGENTE — 2026-07-29

### Baseline y cortes
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- M1 / Corte 1 / Corte 2A: `FROZEN/APROBADO`.
- Corte 3: `FROZEN_ACTIVE_BASELINE`.
- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; **no crear V183/R33**.
- R26–R32: 135/135 PASS; HR remota, Hosting DEV y smoke de pagos PASS.

### Corrección arquitectónica prevalente
El tramo de Corte 4 que intentó forzar Firebase nuevo/vacío quedó superado por la recuperación forense posterior.

- Legacy operativo a retirar: Firebase `tya-plataforma`; solo fuente de datos útiles limpios.
- Backend DEV canónico: `cxorbia-backend-dev`; contiene materialización sustancial y se **reutiliza**.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico de Corte 4; no destino de materialización.
- Hosting/URL pública actual `tya-plataforma` se conserva para el cutover final.

No volver a proponer otra base Firebase por este bloque.

### Backend canónico confirmado
Inventario read-only de `cxorbia-backend-dev`:
- Auth 17;
- projects 29;
- visits 619;
- questionnaires 557;
- shoppers 215;
- liquidations 255;
- shopperBenefits 572;
- certifications 0.

R16E provider compare read-only: PASS; plan 1,415 operaciones; create 1,414 / update 1 / noop 0 / review 0; 244 extras preservados; deletes 0. `create=1414` significa paths canónicos-shadow ausentes, no backend vacío.

### Legacy shoppers/certificaciones — refresh ejecutado PASS
Autorización de Paula consumida exclusivamente para read-only de shoppers/certificaciones en `tya-plataforma`; writes/Auth/deploy/producción=0.

Resultado vigente:
- 281 representaciones crudas;
- 149 shoppers únicos por stable ID;
- 128 duplicados de almacenamiento colapsados;
- 1 conflicto real dentro del mismo stable ID;
- 78 certificaciones útiles = 76 intentos + 2 markers;
- 30 recovery mirrors colapsados;
- 22 perfiles ya existentes enlazados por normalización determinística del mismo ID técnico;
- 120 perfiles create-candidate;
- 7 perfiles HOLD = 6 coincidencias solo por nombre + 1 conflicto de fuente;
- 77 certificaciones candidatas + 1 HOLD.

Nombre nunca se usa como llave de deduplicación.

### Diff de perfiles existentes
En los 22 stable-linked:
- phone faltante: 22;
- email faltante: 8;
- diferencias no vacías preservadas: code 22, name 2, city 1.

Regla de producto: fill-missing-only puede planificarse; nunca sobrescribir silenciosamente un valor canónico no vacío. `code` legacy y `code` canónico no deben asumirse semánticamente equivalentes solo por nombre de campo.

### R17N post-legacy — PASS NO EXECUTE
- Foundation: 16.
- HR protected refs: 210 HOLD crosswalk.
- Legacy profiles: 120 create + 22 existing diff + 7 HOLD.
- Certificaciones: 77 candidatas + 1 HOLD.
- Visitas HR-first: 616.
- Liquidation controls: 572; pagos 0.
- Potencial antes de resolver existing profile updates: 1,401.
- Máximo incluyendo hasta 22 updates: 1,423.
- Offline idempotence hash: `979d45fa174b8d7aac9810a4a56fb234fffeaedac1442fc811bee55ea41e2e8e` PASS.
- Autorización de writes: 0.

### Bloqueo semántico único pendiente
Las 210 referencias shopper protegidas generadas desde HR no coinciden por stable ID ni stable code con los 215 shoppers existentes:
- reuse stable HR ID: 0;
- reuse stable HR code: 0;
- unmapped: 210;
- collision: 0.

No resolver por nombre. Crear 210 perfiles adicionales arriesga duplicación; omitirlos deja visitas canónicas apuntando a referencias sin perfil.

La siguiente solución correcta es un crosswalk read-only usando **identidad exacta de visita ya materializada** en `cxorbia-backend-dev` contra HR source-safe: `hrRowId`, `sourceSheet/sourceRow` o `visitId`. No leer visitas legacy. Este nuevo provider read necesita autorización separada porque el refresh autorizado estaba limitado a shoppers/certificaciones.

### Lo que Claude NO debe hacer ahora
- no preparar V183/R33;
- no reabrir Corte 3/Finanzas;
- no crear nueva base;
- no tocar backend/contracts/tools/workflows;
- no deduplicar shoppers por nombre;
- no crear UI temporal para solucionar identidad;
- no pedir recertificación a shoppers con carryover válido;
- no activar providers reales.

### Backlog frontend no bloqueante preservado
- PDF sin gráfica visible al imprimir;
- Excel con formato básico;
- mejora transversal de `reportKit`;
- copy genérico de fuentes.

### Academia/manuales
Distinguir: perfil de shopper, referencia de asignación HR, identidad Auth, certificación histórica, stable key y review. Una referencia HR pendiente de crosswalk no significa error del shopper ni obliga recertificación.

### Siguiente bloque exacto backend
`AUTORIZAR VISIT-IDENTITY CROSSWALK READ-ONLY EN cxorbia-backend-dev → RESOLVER HR shopperRef POR hrRowId/sourceSheet/sourceRow/visitId → REBUILD R17N FINAL → IDEMPOTENCIA → AUTORIZACIÓN SOLO DE WRITES EXACTOS → SMOKE CX.data → CORTES 6–8 → CUTOVER tya-plataforma`.

## Estado seguro
Legacy/Firestore/Auth/Storage/HR writes=0; deploy=0; merge=false; producción=false; pagos/lotes/Make/Gemini=0.
