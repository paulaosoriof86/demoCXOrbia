# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_P0_SINGLE_LOGIN_FIX_APPLIED_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH__NO_PRODUCTION`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers reales, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

Arquitectura vinculante:
- `tya-plataforma` = legacy a retirar + Hosting/URL pública final;
- `cxorbia-backend-dev` = backend DEV canónico;
- Hosting DEV existente = `cxorbia-backend-dev.web.app`, target `cxorbia-dev`;
- proyecto padre `cinepolis`; meses = periodos;
- no crear otro Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA → INVENTARIO/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE → WRITE PLAN → DRY-RUN/IDEMPOTENCIA → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN VISUAL → FREEZE/CUTOVER`.

Para candidatas frontend continúa `EXECUTION_LANE_READY → AUDITORÍA → GO/P0 → APPLY_DELTA_DIRECTLY`.

## 3. Cortes protegidos — no reabrir
- Corte1 /2A: FROZEN/APROBADO.
- Corte3: `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- HR histórico canónico:14 periodos/616 visitas hasta julio 2026.
- R17N FINAL DEV:1,406/1,406 data writes/readback; mismatch0.
- Corte5 `CX.data`: project=`cinepolis`, periods14, visits616, currentPeriod=`2026-07`, source=firestore, fallback=false PASS.
- Auth legacy import:91/91 readback PASS.
- No repetir históricos ni reabrir snapshots superados.

## 4. Fuente/identidad materializada
- HR hasta julio: perfiles, certificaciones y visitas materializados según R17N.
- Certificaciones:77 materializadas + HOLD documentados.
- 616 visitas,572 controles de liquidación.
- Agosto HN HOLD por inconsistencia país/tab.

## 5. Corte6 — Auth/RBAC/Rules preservado
- claims autorizados5/5;
- Rules canónicas desplegadas/readback PASS;
- Auth legacy exacto91/readback91/91 PASS;
- password resets/deletes/overwrite0;
- namespaces `staff/shopper` preservados.

Firebase Auth sigue siendo la autoridad. El selector visual de rol nunca reemplaza Auth.

## 6. P0 doble login — causa raíz y resolución
La validación humana rechazó el build DEV anterior porque mostraba `Acceso seguro` como una segunda pantalla antes del login normal. La migración Auth91/91 era válida; la integración visual estaba desviada.

Fix ya aplicado en rama:
1. eliminado el gate backend separado;
2. login normal CXOrbia/TyA como único punto visible;
3. credenciales reales dentro de la misma tarjeta cuando correspondan;
4. sesión Firebase válida restaurada silenciosamente;
5. no limpiar sesión por rutina;
6. logout real;
7. provider/email técnico oculto;
8. errores de credencial vs scope/namespace seguros;
9. config `product-login-session`;
10. gates predeploy/remotos bloquean la reaparición del gate antiguo.

## 7. Gate técnico de la corrección
Revalidación estática ejecutada sin provider writes:
- commit `790d4d514b8e7b4630063ebf2aebba5997e3ec26`;
- estado GitHub `success`;
- contexto `PREPARED_C6_SINGLE_LOGIN_HOSTING_NO_EXECUTE`.

La autorización anterior está consumida. No hubo redeploy en esta corrección.

## 8. Gate actual
`AUTORIZACIÓN ÚNICA DE REDEPLOY DEL MISMO HOSTING DEV → PRECHECK SINGLE-LOGIN → DEPLOY1 → SMOKE REMOTO → VALIDACIÓN VISUAL → FREEZE CORTE6`.

Paula no debe repetir la prueba del build viejo, compartir password ni ejecutar PowerShell.

## 9. Después de FREEZE Corte6
`REFRESH HR → RESOLVER AGOSTO HN → VALIDAR PERIODO/VISITAS → MATERIALIZAR SOLO DELTA AGOSTO → SMOKE → PREPROD/CUTOVER`.

No repetir los1,406 writes históricos.

## 10. Corte7 — sincronización/evidencias
HR↔plataforma con stable keys, no duplicación, reviewQueue, cuestionario configurable y evidencias protegidas. Make/Gemini solo con gate y revisión humana. No debe retrasar cutover si lo no activado no bloquea Phase A.

## 11. Corte8 — preproducción/cutover
Requiere cortes previos congelados, refresh delta final, rollback, smoke integral y autorización específica de producción. Cutover sobre el mismo Hosting/URL público `tya-plataforma`; no cambiar URL.

## 12. Claude/prototipo
- No nueva candidata general.
- No tocar `app/modules/*` por este P0.
- El fix single-login ya fue aplicado focalizadamente en el punto de integración autorizado.
- Claude debe conservar el patrón reusable y no reintroducir un gate backend separado.
- P1/P2 preservados: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy de fuentes.

## 13. Academia
Actualizar manuales/cursos/rutas para enseñar un único acceso visible; Auth/provider detrás del adapter; recuperación/cambio, scopes tenant/proyecto/rol, shopperId exacto, dedupe seguro y troubleshooting.

## 14. Estado seguro
R17N cerrado; Auth91/91 preservado. Corrección P0 hasta este punto: Auth writes0; Firestore data writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; producción=false.
