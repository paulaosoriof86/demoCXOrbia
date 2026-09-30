# CAMBIOS BACKEND — ADDENDUM C6 P0 DATOS Y SEPARACIÓN DE CARRILES

**Fecha:** 2026-08-01  
**Estado:** `ROOT_FIX_APPLIED_PENDING_CUMULATIVE_GATES_AND_ONE_EXISTING_HOSTING_DEV_REDEPLOY`  
**Repo/rama/PR:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft-open-no merge.

## 1. Incidencia P0 demostrada
La validación humana del build publicado mostró que la entrada directa por Administración sí abría el shell, pero el modelo operacional quedaba vacío:
- sin proyectos;
- sin periodos;
- sin proyecto asignado;
- datasource en carga;
- cero acceso a la baseline 14 periodos/616 visitas/208 shoppers.

El PASS anterior fue parcial y queda supersedido porque el smoke comprobaba el clic y la sesión, pero no el contenido posterior al ingreso.

## 2. Causa raíz
La entrada humana mezclaba dos carriles incompatibles:
- `cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV`;
- `cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV`.

La combinación producía cuatro efectos encadenados:
1. el runtime protegido tomaba ownership del backend;
2. el watcher HR se desactivaba ante cualquier `cxProtectedRuntime`;
3. el bridge full-visual rechazaba la mezcla;
4. el guard read-only interpretaba espera de lectura protegida y vaciaba `CX.data`.

## 3. Corrección de raíz aplicada
### `app/index-backend-dev.html`
- Normaliza la entrada humana a `source-safe-human-visual`.
- Elimina `cxProtectedRuntime` de toda URL humana.
- Activa `protected-technical-e2e` únicamente con el token técnico explícito.
- Solo habilita full visual cuando existe una sesión visual temporal válida.
- Declara contrato 14/616/208.

### `app/adapters/tya-dev-entry-auth-gate-v1.js`
- V5 de separación de carriles.
- Human lane: backend Firebase desactivado, `humanVisualSourceSafe=true`, HR preservada y datasource listo cuando existe 14/616/208.
- Technical lane: Firebase Auth/claims aislado, sin cambiar UX humana.
- No persiste credenciales ni habilita writes.

### `app/adapters/tya-live-source-refresh-watch-v2.js`
- V3.
- Solo se desactiva en E2E técnico explícito.
- Permanece activo en la visual humana.
- Una falla transitoria no degrada ni vacía una baseline canónica válida.

### `app/adapters/tya-dev-full-visual-bridge.js`
- V2.
- Si el token protegido falta, expira o falla, conserva HR 14/616/208 en read-only.
- El overlay protegido es enriquecimiento; nunca autoridad para borrar HR.
- Se elimina token de sesión obsoleto después de fallo.

### Gates
- `tools/qa/tya-c6-dev-entry-auth-gate.mjs`: exige exclusión mutua de carriles y contratos estáticos.
- `tools/qa/tya-c6-dev-entry-browser-smoke.mjs`: exige 14/616/208 después del clic, proyecto/periodo activos, datasource listo, ausencia de shell vacío y tres recargas estables.

## 4. Archivos documentales actualizados
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
- `app/docs/RESUMEN-PARA-CLAUDE.md`.
- `app/docs/PENDIENTES-PROTOTIPO.md`.
- Este addendum.
- Addendum Academia P0.
- PR #7 y evidencia final se actualizan con el resultado real del workflow.

## 5. Archivos bloqueados/preservados
- `app/modules/*`: sin cambios.
- Lógica de prototipo: sin rediseño.
- `app/core/*`: sin cambios en este root fix.
- Firestore/Auth/Rules/Cloud Run/Storage/HR/Make/Gemini/pagos/Reservas: cero writes.
- Producción `tya-plataforma`: intacta.
- Merge: false.

## 6. Autorización y gate
Autorización exacta de Paula:
`AUTORIZO P0 DATOS: aplicar el root fix de separación de carriles, ejecutar gates acumulativos y, solo con PASS 14/616/208 y entrada directa, realizar un único redeploy del Hosting DEV existente cxorbia-backend-dev; sin writes de datos/Auth/Rules/Cloud Run, sin merge y sin producción.`

Secuencia obligatoria:
`STATIC/DOMAIN/FINANCE/SHOPPER/RESERVATIONS → HUMAN LOCAL 14/616/208 + 3 RELOADS → TECHNICAL E2E LOCAL → READ-ONLY PREFLIGHT → 1 HOSTING DEV DEPLOY → REMOTE PARITY + SAME HUMAN GATE → TECHNICAL E2E REMOTE → EVIDENCE`.

## 7. Clasificación
- **Reusable CXOrbia:** separación de carriles, ownership de fuente, fallback HR, gate post-login y tres recargas.
- **Exclusivo TyA:** invariantes 14/616/208 y proyecto Cinépolis.
- **Claude/prototipo:** preservar UX de perfiles y consumir read model; no reimplementar Auth/fuente.
- **Academia:** diferencia entre entrar al shell y validar una experiencia funcional con datos.
- **Sin impacto Claude:** autorización one-shot, workflow y credenciales privadas del runner.

## 8. Cierre del bloque de aplicación
Root fix y gates quedaron aplicados a la rama viva. No se afirma PASS ni deploy hasta que el workflow autorizado produzca evidencia reproducible.
