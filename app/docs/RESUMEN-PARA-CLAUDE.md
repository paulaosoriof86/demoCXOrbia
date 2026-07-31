# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_LIVE_HR_AUTOMONTH_AND_SHOPPER_DISPLAY_DEV_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. No reabrir
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis14 periodos/616 visitas/current2026-07 Firestore PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar.
- Firestore protegido: shoppers340/340 y visitas616/616 con nombre real; placeholders0.

## 2. Regla producto
- HR viva; nueva pestaña mensual válida entra automáticamente, sin configuración mensual por chat.
- HR abierta/read-only es válida. No exigir `Restricted` para lectura DEV.
- Julio puede seguir en ejecución mientras agosto/mes siguiente tiene visitas platform-origin.
- Plataforma-origin antecede HR si aplica; luego reconciliar por IDs + `assignmentSource`/`assignmentSyncStatus`; nunca por nombre.

## 3. Corte 6 DEV ya desplegado
Autorización one-shot consumida.

PASS remoto:
- Cloud Run revision `cxorbia-live-hr-dev-00008-8mf`;
- Hosting version `22e81c2b783f697a`;
- 14 periodos / 616 visitas / último 2026-07;
- auto-discovery mensual activo;
- 208 identidades operativas shopper disponibles para DEV;
- `humanCredentialPrompt=false`.

No pedir ni recrear este redeploy.

## 4. Shopper visual DEV
No insertar PII sensible en módulos ni JS estático.

La ruta humana DEV ahora recibe de HR viva solo:
- nombre operativo shopper;
- shopperId estable;
- país y métricas source-safe.

Teléfono, correo, DPI, banco/cuenta, credenciales y observaciones privadas continúan excluidos. `app/modules/**` no fue modificado.

La lista shopper puede mostrar nombre real operativo y el flujo DEV de Shopper puede seleccionar identidad existente; los perfiles sensibles siguen protegidos.

## 5. Archivos de empalme backend relevantes
- `backend/runtime/hr-live-service/server.mjs`;
- `tools/hr-source/tya-live-provider-registry-identity-dev.mjs`;
- `tools/hr-source/tya-enforce-live-tab-registry.mjs`;
- `app/adapters/tya-live-source-inplace-apply.js`;
- `app/adapters/tya-live-source-refresh-watch.js`;
- `app/index-backend-dev.html`.

No rediseñar ni compensar esto desde frontend.

## 6. Julio/agosto
HR aún no tiene agosto. Agosto puede existir platform-origin antes de HR, pero el source-of-truth exacto de esas visitas todavía debe recuperarse/conectarse. No copiar julio ni inventar IDs/ubicaciones/estados.

## 7. Siguiente gate
Validación humana únicamente:
`ADMIN: nombres shopper visibles + SHOPPER: selector de identidad/módulos`.

Si PASS: freeze Corte6 → fuente exacta agosto → delta-only Firestore con autorización nueva → preprod/cutover.

## 8. P1/P2
PDF/gráficas, Excel/formato, reportKit/exportaciones y copy continúan documentados; no confundir con este gate.

## 9. Academia/manuales
Documentar auto-month real, ADC/runtime provider, open-read ≠ open-write, display identity mínima DEV y separación entre identidad operativa y PII sensible.

## 10. Estado seguro
Firestore/HR/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0 en este bloque; proyectos/Hosting nuevos0; merge=false; producción=false.
