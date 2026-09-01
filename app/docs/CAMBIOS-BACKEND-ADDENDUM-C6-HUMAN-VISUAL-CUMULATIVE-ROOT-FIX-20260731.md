# CAMBIOS BACKEND — Corte 6 · visual acumulativa HR + perfil + finanzas

**Fecha:** 2026-07-31  
**Estado:** `C6_HUMAN_VISUAL_FAIL_PARTIAL__CUMULATIVE_ROOT_FIX_PREPARED__NO_NEW_DEPLOY__31_HOLD__NO_PRODUCTION`

## Evidencia humana
La visual sin credenciales sí resolvió el reproceso de login, pero las capturas mostraron regresión acumulativa:
- Dashboard Operativo JUL 2026 en 0 visitas aunque el baseline canónico conserva 616 visitas y julio no es cero;
- la visual no mostraba lectura HR viva/auto-refresh;
- Shoppers exponía mezcla de perfiles reales, aliases legacy, fixtures/demo y referencias técnicas;
- perfiles correctos seguían sin usuario/password/datos completos en varios casos;
- histórico/KPI incompleto para algunas identidades;
- Mis Beneficios y Finanzas aparecían vacíos.

La prueba humana queda **FAIL parcial**. Corte 6 no se congela.

## Causa raíz reproducible
1. `tya-dev-full-visual-bridge.js` reemplazaba `CX.data.shoppers`, `_visitas`, `_posts`, certificaciones y liquidaciones con el payload Firestore en vez de superponerlo a las fuentes ya aprobadas.
2. El bridge remapeaba visitas a `cinepolis-YYYY-MM`, mientras el bootstrap source-safe activo podía conservar `cinepolis::YYYY-MM`; por eso `CX.data.visitas()` filtraba 0 en el periodo activo.
3. `tya-live-source-refresh-watch.js` deshabilitaba explícitamente la lectura HR viva cuando `cxHumanFullVisual` estaba activo, contradiciendo el requisito de prueba acumulativa y auto-mes.
4. El listado usaba los 340 documentos Firestore crudos. Esto dejaba visibles aliases legacy/fixtures/referencias técnicas en lugar de partir de la identidad operacional de HR viva y enriquecerla.
5. Al quedar el periodo con 0 visitas, Finanzas y Beneficios recibían una base operativa vacía aunque los snapshots canónicos financieros aprobados seguían presentes.

## Corrección de raíz preparada en rama viva
Sin provider mutation ni deploy:

### `app/adapters/tya-dev-full-visual-bridge.js`
- cambia de **replace** a **cumulative overlay**;
- HR viva conserva periodos, visitas, IDs de periodo y navegación;
- Firestore solo enriquece por identidad técnica exacta `id/shopperId/legacyShopperId`;
- nunca usa nombre/teléfono/email para dedupe;
- conserva alias `depto/departamento`, teléfono/WhatsApp, correo, DPI, dirección, fecha de nacimiento, banco/cuenta, username y `pass` real si ya está materializado;
- si existe un documento canónico cuyo `legacyShopperId` coincide exactamente con el id de un alias legacy, el alias viejo no se expone como una segunda persona;
- fixtures demo conocidos no se agregan a la lista humana;
- referencias técnicas sin identidad operacional no se agregan como filas humanas nuevas;
- visitas Firestore se superponen por `visitId` exacto y preservan `projectId/periodId` de HR viva;
- certificaciones/liquidaciones provider quedan como evidencia protegida; no reemplazan la verdad financiera canónica ya aprobada;
- `visitsForShopper/shopperStats` sigue usando las 616 visitas y reconoce `submitida`/facets canónicos.

### `app/adapters/tya-live-source-refresh-watch.js`
- full visual ya **no deshabilita** el watcher HR;
- `fresh=1`, foco, visibility resume, carga y polling permanecen activos;
- tras cada cambio HR se reaplica el overlay protegido en memoria;
- protected browser Auth sigue siendo el único carril que deshabilita el watcher.

## Qué se preserva
- Corte3 FROZEN y R17N 1,406/1,406: no repetir;
- 616 visitas + 572 controles de liquidación + 77 certificaciones;
- Corte5 14 periodos/current 2026-07;
- Auth91/91, claims5/5, Rules PASS;
- HR live/auto-month aprobado;
- perfil Firestore120 docs/329 campos WRITE+READBACK PASS;
- snapshots financieros/pagos source-safe aprobados;
- `/app/modules/*` intacto;
- producción y merge intactos.

## Estado de proveedor
Desde la visual fallida: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0; Cloud Run deploys0; Hosting deploys0; producción=false; merge=false.

## Siguiente gate exacto
`STATIC/CODE CHECK → 1x HOSTING DEV EXISTENTE DEL FIX ACUMULATIVO → HUMAN VISUAL ACUMULATIVA HR+SHOPPER+FINANZAS → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

No se requiere nuevo Cloud Run: el endpoint server-side full-profile ya está PASS y no fue modificado.

## Clasificación
- **Reusable CXOrbia:** visual de QA acumulativa por overlays, nunca reemplazar fuentes aprobadas.
- **Exclusivo cliente:** aliases/31 HOLD TyA.
- **Claude/prototipo:** sin cambio de módulos; drill frontend pendiente solo si después del overlay persiste diferencia reproducible.
- **Academia:** enseñar composición HR viva + perfil protegido + histórico + finanzas.
- **Sin impacto Claude:** bridge/watcher DEV y gate Hosting.
