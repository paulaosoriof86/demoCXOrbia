# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_PROTOTYPE_AUTOENTRY_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. No reabrir
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; no repetir.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas,currentPeriod=`2026-07`,source=firestore/fallback=false PASS.
- Auth legacy import/readback91/91 PASS: shopper88 + super1 + coordinador2; Auth17→108; resets/deletes/overwrite0.
- claims5/5 + Firestore Rules PASS.
- No nueva candidata/base/Hosting/rama/PR por rutina.

## 2. P0 visuales y solución definitiva
- Build 1 rechazado: gate separado `Acceso seguro`.
- Build 2 rechazado: `Usuario + Contraseña` inyectado al seleccionar perfil y formulario fuera del viewport.
- Contrato correcto: `app.js` mantiene perfil → `selectRole(...)` → `enter()` automático.

La ruta humana DEV quedó corregida sin tocar módulos:
- auto-entry del prototipo;
- `humanCredentialPrompt=false`;
- HR source-safe read-only como fuente visual;
- baseline `cinepolis`,14 periodos,616 visitas;
- Auth/RBAC/Rules validados por gates provider separados;
- mutaciones bloqueadas y sin fallback demo.

## 3. Gate/redeploy
Gate estático: `29b7f9404a9c2f144145fe24d5cf048f753c1e75` → `PREPARED_C6_PROTOTYPE_AUTO_ENTRY_NO_EXECUTE` PASS.

La primera ejecución autorizada falló antes de deploy por incompatibilidad interna de nombres de decisión entre preflight y direct-deploy. Se corrigió en `b9f5190babcc339735cda59291417df5aea6988f`; el request seguía sin consumir y con deploy0, así que se reintentó bajo la misma autorización.

Resultado final:
`PASS_EXISTING_HOSTING_DEV_PROTOTYPE_AUTO_ENTRY_SOURCE_SAFE_REMOTE_VERIFIED`.

- versión `sites/cxorbia-backend-dev/versions/95a1e49e5064c456`;
- release `sites/cxorbia-backend-dev/releases/1785452689852000`;
- prototypeAutoEntry=true;
- humanCredentialPrompt=false;
- sourceSafeVisual=true;
- 14 periodos /616 visitas / proyecto `cinepolis`;
- preservedLegacyAuthUsers91;
- Hosting deploy executions1.

## 4. Claude/prototipo
No crear nueva candidata ni rehacer este fix. No tocar `app/modules/*` por este tema. Conservar:
- UX del producto manda;
- preview humano no muestra infraestructura Auth;
- Auth real queda detrás del contrato operativo y gates;
- no reintroducir `Acceso seguro` ni formulario de credenciales en validación humana;
- producción debe mantener autenticación real y recuperación/cambio de acceso.

P1/P2 preservados: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy de fuentes.

## 5. Agosto
Después de FREEZE Corte6: `refresh HR → resolver Agosto HN → materializar solo delta agosto → smoke → preprod/cutover`. No rematerializar histórico.

## 6. Academia/manuales
Preview humano: perfil → entrada automática; HR source-safe visible; Auth validado por gate separado. Producción: acceso real aprobado, recuperación/cambio, scopes y provider interno oculto.

## 7. Estado seguro / gate vivo
Redeploy actual: Auth writes0; Firestore data writes0; Rules0; Storage/HR/legacy/payments/Functions/Make/Gemini0; nuevo Firebase/Hosting0; merge=false; producción=false.

Gate vivo: `VALIDACIÓN VISUAL HUMANA → SI APRUEBA FREEZE C6 → AGOSTO DELTA`.
