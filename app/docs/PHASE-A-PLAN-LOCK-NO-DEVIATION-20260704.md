# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_AUTOENTRY_VISUAL_OBSERVED_PASS__PROTECTED_IDENTITY_READONLY_PASS__AUGUST_REFRESH_READONLY_NEXT__NO_PRODUCTION`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers reales, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

Arquitectura fija:
- `tya-plataforma` = URL/Hosting público final; no tocar sin gate de producción.
- `cxorbia-backend-dev` = backend/Hosting DEV canónico.
- proyecto padre `cinepolis`; meses=periodos.
- no crear otro Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA → INVENTARIO/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE → WRITE PLAN → DRY-RUN/IDEMPOTENCIA → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN VISUAL → FREEZE/CUTOVER`.

Un PASS técnico no sustituye validación humana; un preview source-safe tampoco sustituye el runtime autenticado protegido.

## 3. Cortes protegidos — no reabrir
- Corte1/2A/3 FROZEN/APROBADO; Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`.
- HR histórico hasta julio:14 periodos/616 visitas.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; mismatch0.
- Corte5 CX.data: project=`cinepolis`,periods14,visits616,currentPeriod=`2026-07`,source=firestore/fallback=false PASS.
- Auth legacy import/readback91/91 PASS; no repetir/resetear.
- claims5/5 + Rules PASS.

## 4. Corte6 — integración Auth, UX e identidad
Firebase Auth/RBAC/Rules continúa como autoridad backend real, pero no puede reescribir el contrato visible del prototipo.

P0 visuales demostrados:
1. gate separado `Acceso seguro`;
2. formulario `Usuario + Contraseña` inyectado dentro del login al seleccionar rol.

Contrato correcto del preview humano: perfil → entrada automática. La visual actual confirma que ese auto-entry volvió a funcionar.

## 5. Preview humano source-safe
El preview DEV humano usa HR source-safe explícita/read-only y mantiene PII enmascarada. Por eso puede mostrar `Shopper protegido`; ese placeholder es correcto solo para el artefacto público/source-safe.

Está prohibido insertar nombres reales en el JS source-safe o convertir ese archivo estático en almacén de identidad.

## 6. Gate de identidad protegida — PASS
`PASS_C6_PROTECTED_IDENTITY_READONLY_RUNTIME_READY`.

Lectura directa del backend protegido:
- shoppers protegidos340; nombres reales340; placeholder0; sin nombre0;
- visitas canónicas616; con nombre real616; placeholder0; faltantes0;
- shopperIds distintos referenciados194;
- perfiles referenciados existentes194/194 y con nombre real194/194;
- Rules shopper protegidas/deny-by-default PASS;
- adapter Firestore carga shoppers/nombre real PASS;
- Rules desplegadas verificadas/hash consistente PASS;
- source-safe público permanece enmascarado PASS.

GitHub status: `PASS_C6_PROTECTED_IDENTITY_READONLY`.

Regla de release: Admin/Operativo autenticado debe leer Firestore protegido y ver identidad real; shopper autenticado solo la propia. El runtime protegido debe fallar si utiliza source-safe como identidad final o si renderiza `Shopper protegido` para un perfil canónico existente.

## 7. Gate actual — Agosto read-only
Ya no corresponde otra iteración de login/source-safe. El siguiente bloque exacto es:

`REFRESH HR READ-ONLY → RESOLVER/CLASIFICAR AGOSTO HN → VALIDAR AGOSTO → PREPARAR WRITE PLAN DELTA-ONLY`.

No requiere autorización de provider writes porque es lectura/reconciliación y documentación.

## 8. Gate de materialización de agosto
Solo si el plan delta queda exacto, idempotente y sin reabrir históricos, solicitar autorización específica para Firestore data writes del delta agosto.

Después:
`WRITE DELTA AGOSTO AUTORIZADO → READBACK → SMOKE → PREPROD PROTEGIDA AUTENTICADA → VALIDACIÓN IDENTIDAD REAL → FREEZE/CUTOVER`.

No repetir los1,406 writes históricos.

## 9. Corte7 — sincronización/evidencias
HR↔plataforma con stable keys, no duplicación, reviewQueue, cuestionario configurable y evidencias protegidas. Make/Gemini solo con gate/revisión humana y sin retrasar cutover si lo no activado no bloquea Phase A.

## 10. Corte8 — preproducción/cutover
Requiere cortes previos cerrados, refresh delta final, rollback, smoke integral y autorización específica de producción. Cutover sobre `tya-plataforma`; no cambiar URL.

## 11. Claude/prototipo
- No nueva candidata general.
- No tocar `app/modules/*` por este bloque.
- Conservar auto-entry aprobado del preview humano.
- Source-safe enmascarado no reemplaza identidad real del runtime protegido.
- Provider/Auth no debe convertirse en UI técnica.
- P1/P2: PDF/gráficas, Excel/formato, reportKit/exportaciones, copy.

## 12. Academia
Documentar separación entre UX/preview humano, privacidad source-safe y autenticación/identidad provider protegida; flujo por rol, recuperación/cambio, scopes, shopperId exacto, mínimo privilegio y troubleshooting.

## 13. Estado seguro
Gate identidad actual: provider reads únicamente; Auth writes0; Firestore data writes0; Rules0; Hosting0; Storage/HR/legacy/payments/Functions/Make/Gemini0; nuevo Firebase/Hosting0; merge=false; producción=false; PII exportada0.