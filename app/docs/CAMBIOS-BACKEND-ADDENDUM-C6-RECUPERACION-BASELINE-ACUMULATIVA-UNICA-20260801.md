# CAMBIOS BACKEND — C6 RECUPERACIÓN DE BASELINE ACUMULATIVA ÚNICA

**Fecha:** 2026-08-01  
**Estado:** `ROOT_FIX_CODE_APPLIED__LOCAL_STATIC_CONTRACT_PASS__PENDING_READONLY_RUNTIME_GATES_AND_FRESH_DEV_DEPLOY_AUTHORIZATION`  
**Repo/rama/PR:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft-open-no merge.

## 1. P0 humano que supersede el cierre anterior

La validación humana del Hosting DEV demostró que el último build no era la baseline acumulativa aprobada. La entrada directa mantenía la HR, pero abría una experiencia reducida y fragmentada:

- Shopper sin identidad autenticada;
- Dashboard con julio seleccionado y agosto fabricado por reloj;
- KPIs y flujo por fases calculados por lógicas distintas;
- comparativo sin todos los periodos vivos de HR;
- perfiles, WhatsApp, credenciales y certificaciones no proyectados;
- identidades Shopper repetidas/no reconciliadas;
- Portal Cliente sin todas las mejoras ya aceptadas;
- Finanzas sin la configuración contractual del proyecto en la experiencia humana.

El PASS postdeploy anterior queda conservado únicamente como evidencia técnica parcial. No congela Corte 6.

## 2. Autoridad recuperada

La recuperación no selecciona pantallas aisladas ni crea otra candidata. Parte del HEAD vivo y recompone una sola experiencia con las autoridades ya aprobadas:

| Dominio | Autoridad vigente recuperada |
|---|---|
| Login | `PASS_EXISTING_HOSTING_DEV_SINGLE_LOGIN_REMOTE_VERIFIED` · commit `c6f1638e...` |
| Histórico completo | R20 `all_verified_or_detected_hr_periods` · commit `f9e7f65b...` |
| Dominio/Finanzas/Shopper | `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE` · commit `e8cc8301...` |
| Operación | HR viva, todos los periodos detectados; no cifras congeladas |
| Perfil/certificación | Firestore protegido como overlay por crosswalk exacto |
| Honorarios | configuración del proyecto Cinépolis: GT Q60 / HN L200 |
| UI | módulos aprobados existentes; sin reescritura de `app/modules/*` |

## 3. Causa raíz estructural

El índice publicado activaba dos carriles incompatibles:

1. un carril humano `source-safe` que deshabilitaba Firebase Auth y restauraba sesiones sintéticas;
2. un carril protegido separado que sí tenía identidad real y composición canónica.

Además, los adapters que corregían estados, comparativos, perfiles, certificaciones y Portal Shopper dependían de un token visual oculto. La URL normal de Paula no los activaba.

Por eso los archivos correctos podían existir en la rama y, simultáneamente, no formar parte de la experiencia humana publicada.

## 4. Delta focal aplicado

### `app/index-backend-dev.html`

- La entrada humana normal se normaliza como `authenticated-human-canonical`.
- Activa el runtime protegido y los adapters canónicos en la misma URL.
- Conserva el carril E2E técnico solo cuando existe su token explícito.
- Elimina del build humano el cargado de:
  - `adapters/tya-dev-entry-auth-gate-v1.js`;
  - `adapters/tya-dev-full-visual-bridge.js`.
- Conserva:
  - login visible integrado del producto;
  - `tya-protected-auth-hr-authority-bridge-v1.js`;
  - dominio canónico;
  - Portal Shopper canónico;
  - Finanzas canónicas;
  - módulos frontend vigentes.

### `app/adapters/tya-c6-unified-human-runtime-v1.js`

Nuevo adapter reusable que:

- reafirma Auth/claims como autoridad del principal;
- conserva HR viva como autoridad operativa para todos los periodos;
- elimina únicamente sesiones sintéticas obsoletas;
- agrega login de Cliente mediante el mismo flujo visible Usuario + Contraseña;
- aplica honorario contractual Q60/L200 cuando la fila HR no contiene monto;
- no sobrescribe montos financieros exactos;
- presenta el comparativo con todos los periodos disponibles en `periodOperationalSummary`;
- usa únicamente KPIs derivables de la fuente;
- reactiva la proyección después de Auth, refresh HR y recomposición;
- mantiene provider writes, deploys, merge y producción en cero.

### `tools/qa/tya-c6-unified-cumulative-runtime-gate.mjs`

Gate estático/read-only que exige:

- una sola entrada humana autenticada;
- ausencia del override de rol directo;
- ausencia del token visual oculto como requisito funcional;
- Auth integrada + HR authority bridge;
- dominio/Shopper/Finanzas canónicos;
- 14 periodos HR desde 2025-06 hasta 2026-07;
- ausencia de agosto sin tab de fuente;
- honorario Q60/L200;
- cero writes y producción.

## 5. Archivos preservados

- `app/modules/*`: sin cambios.
- `app/core/data.js`, `app.js`, `backend-browser-auth.js`: sin reescritura.
- HR, Firestore, Auth, Rules, Storage, Cloud Run, Make, Gemini, pagos: cero writes.
- Hosting DEV: cero deploys en este bloque.
- Producción `tya-plataforma`: intacta.
- Merge: false.

## 6. Gate siguiente

Secuencia obligatoria:

`STATIC ROOT CONTRACT → LOCAL/READ-ONLY RUNTIME → AUTH REAL STAFF/CLIENT/SHOPPER → HR ALL PERIODS → KPI=PHASE=DRILL → COMPARATIVE ALL PERIODS → PROFILE/CERT/HISTORY → CLIENT → FINANCE CONFIG → 3 RELOADS → EVIDENCE`.

Solo con PASS corresponde solicitar autorización fresca para un único deploy del Hosting DEV existente. No se reutiliza ninguna autorización consumida.

## 7. Clasificación

- **Reusable CXOrbia:** runtime humano único, Auth integrada, ownership de fuente, gate acumulativo.
- **Exclusivo TyA:** periodos HR, contrato Q60/L200, proyecto Cinépolis.
- **Claude/prototipo:** conservar módulos y consumir el read model; no reimplementar reglas por pantalla.
- **Academia:** trazabilidad de versiones aprobadas, fuente viva y no regresión acumulativa.
- **Sin impacto proveedor:** este bloque no ejecuta proveedor ni producción.
