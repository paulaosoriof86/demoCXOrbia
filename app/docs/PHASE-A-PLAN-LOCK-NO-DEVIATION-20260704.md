# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_PROTOTYPE_AUTOENTRY_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers reales, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

Arquitectura fija:
- `tya-plataforma` = URL/Hosting público final; no tocar sin gate de producción.
- `cxorbia-backend-dev` = backend/Hosting DEV canónico.
- proyecto padre `cinepolis`; meses=periodos.
- no crear otro Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA → INVENTARIO/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE → WRITE PLAN → DRY-RUN/IDEMPOTENCIA → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN VISUAL → FREEZE/CUTOVER`.

Un PASS técnico no sustituye validación humana.

## 3. Cortes protegidos — no reabrir
- Corte1/2A/3 FROZEN/APROBADO; Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`.
- HR histórico hasta julio:14 periodos/616 visitas.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; mismatch0.
- Corte5 CX.data: project=`cinepolis`,periods14,visits616,currentPeriod=`2026-07`,source=firestore,fallback=false PASS.
- Auth legacy import/readback91/91 PASS; no repetir/resetear.
- claims5/5 + Rules PASS.

## 4. Corte6 — integración Auth y UX
Firebase Auth/RBAC/Rules continúa como autoridad backend real, pero no puede reescribir el contrato visible del prototipo.

P0 visuales demostrados:
1. gate separado `Acceso seguro`;
2. formulario `Usuario + Contraseña` inyectado dentro del login al seleccionar rol.

Contrato correcto del preview humano: perfil → entrada automática. Para producción, Auth real sigue obligatorio detrás del contrato operativo aprobado.

## 5. Corrección y gates
Preview humano DEV:
- auto-entry del prototipo;
- `humanCredentialPrompt=false`;
- HR source-safe explícita/read-only;
- baseline `cinepolis`,14 periodos,616 visitas;
- no fallback demo;
- Auth/RBAC/Rules en gates separados;
- writes bloqueados.

Gate estático `29b7f9404a9c2f144145fe24d5cf048f753c1e75`: PASS.

La primera ejecución autorizada falló antes de deploy por un mismatch interno entre la decisión emitida por preflight y la esperada por direct-deploy. Se corrigió en `b9f5190babcc339735cda59291417df5aea6988f`; el request seguía deploy0/consumed=false, por lo que el reintento utilizó la misma autorización.

Resultado remoto:
`PASS_EXISTING_HOSTING_DEV_PROTOTYPE_AUTO_ENTRY_SOURCE_SAFE_REMOTE_VERIFIED`.
- versión `95a1e49e5064c456`;
- release `1785452689852000`;
- prototypeAutoEntry=true;
- humanCredentialPrompt=false;
- sourceSafeVisual=true;
- 14 periodos /616 visitas;
- Hosting deploy executions1;
- preservedLegacyAuthUsers91.

## 6. Gate actual
`VALIDACIÓN VISUAL HUMANA DEL BUILD DEV AUTO-ENTRY/SOURCE-SAFE → SI APRUEBA: FREEZE CORTE6`.

No pedir password, PowerShell, scroll ni volver a probar builds rechazados.

## 7. Después de FREEZE Corte6
`REFRESH HR → RESOLVER AGOSTO HN → VALIDAR PERIODO/VISITAS → MATERIALIZAR SOLO DELTA AGOSTO → SMOKE → PREPROD/CUTOVER`.

No repetir los1,406 writes históricos.

## 8. Corte7 — sincronización/evidencias
HR↔plataforma con stable keys, no duplicación, reviewQueue, cuestionario configurable y evidencias protegidas. Make/Gemini solo con gate/revisión humana y sin retrasar cutover si lo no activado no bloquea Phase A.

## 9. Corte8 — preproducción/cutover
Requiere cortes previos congelados, refresh delta final, rollback, smoke integral y autorización específica de producción. Cutover sobre `tya-plataforma`; no cambiar URL.

## 10. Claude/prototipo
- No nueva candidata general.
- No tocar `app/modules/*` por este P0.
- Conservar auto-entry aprobado del preview humano.
- Provider/Auth no debe convertirse en UI técnica.
- P1/P2: PDF/gráficas, Excel/formato, reportKit/exportaciones, copy.

## 11. Academia
Documentar separación entre UX/preview humano y autenticación provider; flujo por rol, recuperación/cambio, scopes, shopperId exacto, mínimo privilegio y troubleshooting.

## 12. Estado seguro
Redeploy actual: Auth writes0; Firestore data writes0; Rules0; Storage/HR/legacy/payments/Functions/Make/Gemini0; nuevo Firebase/Hosting0; merge=false; producción=false.
