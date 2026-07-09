# CX.data runtime switch gate Phase A

Fecha: 2026-07-09  
Bloque: runtime switch gate CX.data  
Estado: gate creado, switch no autorizado todavia.

## 1. Objetivo

Definir las condiciones exactas para cambiar `CX.data` desde data demo/mock hacia TyA/Cinepolis real-data preview o staging, usando un unico punto controlado, con rollback y sin tocar modulos UI.

Este gate existe para evitar dos errores:

1. Seguir en data demo y creer que ya estamos listos para produccion.
2. Conectar datos reales de forma apresurada, rompiendo modulos o exponiendo PII.

## 2. Archivos creados

- `backend/contracts/cxdata-runtime-switch-gate-phase-a-v1.json`
- `tools/contracts/tya-cxdata-runtime-switch-gate-validate.mjs`
- `app/docs/CXDATA-RUNTIME-SWITCH-GATE-PHASE-A-20260709.md`

## 3. Politica de unico punto

El switch solo puede hacerse en:

- `app/core/data.js`; o
- un unico adapter precargado antes de los modulos, solo con autorizacion explicita.

Queda prohibido:

- parchar `app/modules/**` para meter datos;
- hardcodear Cinepolis dentro de modulos UI;
- crear hacks de datos por modulo;
- llamar providers desde UI.

## 4. Modos definidos

- `demo_only`: estado actual observado, no apto para produccion.
- `manifest_preview_only`: permite ver readiness source-safe, no visitas/shoppers vivos.
- `sanitized_preview_readonly`: preview desde datos sanitizados, sin writes.
- `dev_runtime_preview`: switch DEV bloqueado hasta GO, rollback y smoke.
- `production_runtime`: bloqueado hasta DEV verificado, smoke GO y GO produccion.

## 5. Requisitos antes de DEV runtime preview

- Manifest HR source-safe generado.
- Visitas sanitizadas o preview manifest-only aceptado explicitamente.
- Cinepolis como proyecto normal configurable.
- Data demo no usada como fuente final.
- Politica DPI/sensibles aplicada.
- `questionnaire_marks` duplicado excluido.
- `JUNIO 26 HN` en review_required.
- Shopper canonical mismatch no promovido silenciosamente.
- Certificaciones ya presentadas preservadas o mapeadas.
- Junio tratado como pagos/liquidaciones, no visitas pendientes.
- Rollback documentado.
- Smoke checklist documentado.
- GO explicito de Paula.

## 6. Requisitos antes de produccion

- URL DEV/preview verificada.
- Runtime mostrando TyA/Cinepolis real-data preview o staging, no demo final.
- Smoke humano GO.
- Sin errores criticos de consola.
- Sin providers sin gate.
- Sin writes Firestore no autorizados.
- Sin HR writeback sin Make/outbox gate.
- Sin pagos marcados pagados sin auditoria/evidencia.
- Rollback ejecutable.
- GO produccion de Paula.

## 7. NO GO

No hacer switch ni produccion si:

- `app/core/data.js` sigue demo como fuente final.
- Cinepolis queda hardcodeado en modulos UI.
- Hay PII en repo/logs.
- Se commitea HR URL/fileId.
- Se importa DPI sin politica.
- `questionnaire_marks` se importa como fuente independiente siendo duplicado.
- `JUNIO 26 HN` se importa automaticamente.
- Pagos quedan pagados sin auditoria/evidencia.
- Certificaciones preservadas se piden de nuevo sin regla.
- El switch toca varios modulos UI.
- No hay rollback.
- No hay smoke.

## 8. Validador creado

`tools/contracts/tya-cxdata-runtime-switch-gate-validate.mjs`

Valida:

- contrato runtime switch;
- contrato bridge real-data;
- contrato manifest HR;
- presencia de adapter bridge;
- que `CX.data` exista;
- si `app/core/data.js` sigue demo/generico;
- que no se haya autorizado switch sin input sanitizado.

Por defecto no cambia runtime. Solo reporta.

## 9. Impacto real en Phase A / produccion

Este bloque deja claro el camino para que la plataforma empiece a visualizar TyA real/sanitizado sin romper la arquitectura:

HR source-safe -> bridge -> CX.data -> runtime DEV -> smoke -> produccion.

No conecta aun, pero evita hacer el switch sin control.

## 10. Trabajo previo recuperado

Recupera:

- HR viva multi-tab;
- staging canonico source-safe;
- puente real-data preview;
- Cinépolis como proyecto normal;
- reglas HR/Q1/Q2;
- certificaciones preservadas;
- liquidaciones junio;
- legacy util como trazabilidad.

## 11. Claude/prototipo

Pendientes derivados:

- Si se requiere UI para estado de fuente, documentarlo para Claude.
- Mantener paquete Claude corto: 3 a 5 tareas criticas.
- No hardcodear Cinepolis.
- Mantener estados honestos: demo, preview, staging, importado, produccion.
- Academia debe explicar fuente HR, preview, staging, produccion y review_required.

## 12. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin runtime switch.
- Sin modulos modificados.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
