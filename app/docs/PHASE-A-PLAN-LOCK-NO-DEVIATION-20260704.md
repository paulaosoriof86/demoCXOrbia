# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_P0_PROTOTYPE_AUTOENTRY_FIX_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH__NO_PRODUCTION`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers reales, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

Arquitectura fija:
- `tya-plataforma` = URL/Hosting público final; no tocar sin gate de producción;
- `cxorbia-backend-dev` = backend/Hosting DEV canónico;
- proyecto padre `cinepolis`; meses=periodos;
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

## 4. Corte6 — lección de integración Auth
Firebase Auth/RBAC/Rules continúa como autoridad backend real. Pero la infraestructura no puede reescribir el contrato visible del prototipo.

Se demostraron dos P0 visuales:
1. gate separado `Acceso seguro`;
2. formulario `Usuario + Contraseña` inyectado dentro de la tarjeta al seleccionar rol.

El segundo P0 confirma que **single-login no era suficiente**: el comportamiento aprobado era **auto-entry del perfil en el preview humano**. `app.js` ya conserva ese contrato; el desvío provenía del wrapper backend/Auth.

## 5. Corrección obligatoria vigente
Para el **preview humano DEV**:
1. selección de perfil → entrada automática, como el prototipo;
2. no pedir credenciales desconocidas ni crear formularios técnicos;
3. conservar HR source-safe explícita/read-only para recorrer la UI;
4. baseline visual `cinepolis`,14 periodos,616 visitas;
5. no fallback demo;
6. Auth/RBAC/Rules se mantienen en gates técnicos separados;
7. writes continúan bloqueados;
8. diagnóstico visible debe decir source-safe y no simular una sesión Firebase humana.

Para producción, Auth real sigue siendo obligatorio detrás del contrato operativo aprobado y requiere recuperación/cambio de acceso; esta ruta humana DEV no es un bypass de producción.

## 6. Gate técnico del fix
Revalidación estática:
- commit `29b7f9404a9c2f144145fe24d5cf048f753c1e75`;
- estado `success`;
- contexto `PREPARED_C6_PROTOTYPE_AUTO_ENTRY_NO_EXECUTE`;
- baseline source-safe14/616 PASS;
- provider writes/deploy0.

La autorización de Hosting previa está consumida. El Hosting DEV público todavía sirve el build rechazado.

## 7. Gate actual
`AUTORIZACIÓN FRESCA DE UN ÚNICO REDEPLOY DEL MISMO HOSTING DEV → PRECHECK → DEPLOY1 → SMOKE REMOTO AUTO-ENTRY/SOURCE-SAFE → VALIDACIÓN VISUAL → FREEZE CORTE6`.

No pedir a Paula password, PowerShell, scroll ni nueva prueba del build viejo.

## 8. Después de FREEZE Corte6
`REFRESH HR → RESOLVER AGOSTO HN → VALIDAR PERIODO/VISITAS → MATERIALIZAR SOLO DELTA AGOSTO → SMOKE → PREPROD/CUTOVER`.

No repetir los1,406 writes históricos.

## 9. Corte7 — sincronización/evidencias
HR↔plataforma con stable keys, no duplicación, reviewQueue, cuestionario configurable y evidencias protegidas. Make/Gemini solo con gate/revisión humana y sin retrasar cutover si lo no activado no bloquea Phase A.

## 10. Corte8 — preproducción/cutover
Requiere cortes previos congelados, refresh delta final, rollback, smoke integral y autorización específica de producción. Cutover sobre `tya-plataforma`; no cambiar URL.

## 11. Claude/prototipo
- No nueva candidata general.
- No tocar `app/modules/*` por este P0.
- Conservar el auto-entry aprobado del preview humano.
- Provider/Auth no debe convertirse en UI técnica.
- P1/P2: PDF/gráficas, Excel/formato, reportKit/exportaciones, copy.

## 12. Academia
Documentar separación entre UX/preview humano y autenticación provider; flujo por rol, recuperación/cambio, scopes, shopperId exacto, mínimo privilegio y troubleshooting.

## 13. Estado seguro
Desde el segundo P0: Auth writes0; Firestore data writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/Functions/Make/Gemini0; merge=false; producción=false.
