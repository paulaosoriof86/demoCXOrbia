# CAMBIOS BACKEND — Corte 4 · P0-C4-VIS-01 fix + revalidación remota PASS

**Fecha:** 2026-07-29  
**Estado:** `P0_TECHNICALLY_FIXED__REMOTE_REVALIDATION_PASS__HUMAN_VISUAL_PENDING`

## 1. Autorización consumida

Texto exacto autorizado por Paula:

`Autorizo corrección focalizada de P0-C4-VIS-01 y un único Hosting DEV de revalidación de Corte 4, sin data writes ni producción`

Authorization ID: `c4-p0-vis01-revalidate-20260729-01`.

## 2. P0 atendido

`P0-C4-VIS-01 — FORBIDDEN_DEMO_FALLBACK_ON_AUTH_PENDING`.

La visual anterior demostró que, al no existir ya el principal temporal de Auth, el runtime publicado mostraba `localStorage/demo`, datos ficticios y proyectos Retail/Banca/Restaurantes en lugar de fail-close vacío.

## 3. Corrección focalizada aplicada

Solo se modificaron archivos backend/core del runtime:

- `app/core/backend-config-preview-dev.js`
  - fija el preview protegido como `connected/loading` antes del primer render;
  - desactiva `CX.BRAND.demoMode` únicamente en Preview DEV Corte 4;
  - declara explícitamente que no existe fallback a demo/localStorage.
- `app/core/backend-cxdata-readonly-corte4.js`
  - vacía los seeds antes del primer render cuando Corte 4 está en preview read-only;
  - sincroniza `CX.dataSource` como backend protegido;
  - inicializa `CX_BACKEND_LAST_STATE.fallbackUsed=false`;
  - inicializa también `CX_CORTE4_READONLY.fallbackUsed=false` desde el primer estado vacío;
  - mantiene `readOnly=true`, `writeMode=disabled` y bloqueo de acciones/escrituras.
- `app/core/backend-preview-status.js`
  - un `backend-error` bajo fail-closed ya no se rotula como demo/localStorage;
  - reporta `firestore-read-error` / `Firestore protegido · sin fallback` cuando Auth no está disponible.

No se modificó ningún archivo de `app/modules/`.

## 4. Incidentes de runner antes del deploy real

Hubo dos stops seguros antes de ejecutar Hosting:

1. el primer preflight del runner nuevo falló por un typo interno en el `grant_type` OAuth del propio script de validación; se corrigió a `urn:ietf:params:oauth:grant-type:jwt-bearer`;
2. el diagnóstico local posterior encontró que `CX_CORTE4_READONLY.fallbackUsed` quedaba temporalmente indefinido aunque el runtime ya no mostraba datos demo.

Ninguno de esos stops ejecutó Hosting ni produjo provider/data writes. Se mantuvo el gate fail-closed y no se consumió la única ejecución real autorizada hasta que el diagnóstico read-only quedó PASS.

## 5. Diagnóstico y corrección del estado público

El único fallo funcional restante del diagnóstico era `CX_CORTE4_READONLY.fallbackUsed` indefinido durante la ventana inicial. Se corrigió en `app/core/backend-cxdata-readonly-corte4.js` inicializando el estado público del guard desde `clearToBackendEmpty()`.

Diagnóstico read-only final:

- commit trigger: `58f227e2d67c0efa15c363e19e2cbcfea91e19b8`;
- `cxorbia/c4p0vis01-diagnostic = success`;
- `cxorbia/c4p0local-pass = success`;
- provider writes del diagnóstico: `0`.

## 6. Revalidación Hosting DEV

Trigger/deployed source commit: `424eca2ae5a7cd6f240dfc97b17048f3c124eb2c`.

Statuses:

- `cxorbia/c4p0vis01-revalidation = success`;
- `cxorbia/c4p0vis01-deploys1 = success`.

Esto demuestra que el runner ejecutó exactamente **1** Hosting DEV de revalidación dentro de esta autorización y que el navegador remoto pasó las invariantes:

- fuente efectiva inicia en Firestore/fail-closed, nunca `localStorage/demo`;
- proyectos=0, visitas=0, shoppers=0, postulaciones=0;
- `CX.dataSource.mode=connected`;
- fixtures deshabilitados;
- `CX.BRAND.demoMode=false`;
- `fallbackUsed=false` en estado backend y guard Corte 4;
- no aparecen `Proyecto Retail`, `Proyecto Banca`, `Proyecto Restaurantes` ni `Demo comercial · datos ficticios`;
- entrada al shell admin conserva los mismos conteos en cero y no reintroduce fixtures.

URL humana de revalidación:

`https://cxorbia-tya-dev-260729-c4.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&p0vis01=424eca2ae5a7cd6f240dfc97b17048f3c124eb2c`

## 7. Seguridad

- Firestore document writes: `0`.
- Auth user writes: `0`.
- Auth config writes: `0`.
- Storage writes: `0`.
- Rules deploys: `0`.
- Functions: `0`.
- imports/materialización: `0`.
- HR writes: `0`.
- Make/Gemini: `0`.
- pagos/lotes: `0`.
- merge: `false`.
- producción: `false`.

La autorización one-shot quedó consumida y el workflow de revalidación fue puesto en HOLD. El diagnóstico read-only también quedó cerrado después del PASS.

## 8. Clasificación obligatoria

- **Reusable CXOrbia:** fail-closed antes del primer render, fuente efectiva separada de Auth, `fallbackUsed=false` observable desde estado inicial, autorización one-shot y gate navegador no-demo.
- **Exclusivo cliente:** projectId `cxorbia-tya-dev-260729-c4` y tenant `tya`.
- **Claude/prototipo:** sin cambio de módulos UI; no requiere nueva candidata por este P0.
- **Academia:** documentar diferencia entre provider PASS, estado público incompleto y gate visual/no-fallback.
- **Sin impacto Claude:** workflows, requests Firebase, provider preflight, Hosting DEV y cleanup de autorización.

## 9. Gate vivo

No congelar Corte 4 todavía. Falta únicamente **revalidación visual humana de Paula** sobre la URL nueva.

Si la visual no demuestra otro P0: `FREEZE CORTE 4 → RETIRAR IAM TEMPORAL A VIEWER → CORTE 5`.
