# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_DISABLED__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis como tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev`=DEV canónico; `tya-plataforma`=Hosting final. No crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE/CONCILIACIÓN → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN → CUTOVER`.

Reglas prevalentes:
- HR se lee en vivo.
- Una pestaña mensual válida nueva genera/detecta automáticamente el periodo; no existe configuración mensual por chat.
- En fallback GViz, contenido no prueba existencia del tab; metadata provider/registry manda.
- Plataforma puede originar disponibilidad antes de HR. La llegada posterior de HR concilia por IDs estables y `assignmentSource`/`assignmentSyncStatus`; no duplica.
- Nunca deduplicar por nombre.

## 3. Cortes protegidos
- Corte1/2A/3 FROZEN.
- Histórico14 periodos/616 visitas hasta julio.
- R17N1,406/1,406; no repetir.
- Corte5 CX.data PASS.
- Auth91/91, claims5/5 y Rules PASS.
- Identidad protegida: shoppers340/340 y visitas616/616 con nombres reales; placeholders0; perfiles referenciados194/194.

## 4. Corte6 UX/identidad
- Auto-entry Admin restaurado y observado.
- Preview público/source-safe mantiene PII enmascarada.
- Firestore protegido contiene identidad real.
- Se preparó ruta DEV autenticada separada (`backend-protected-dev-mode.js` + Hosting init) para validar módulos con datos reales según Auth/claims/Rules; read-only y aún no desplegada.
- No insertar PII en source-safe ni tocar `app/modules/*` para resolver identidad.

## 5. HR live y auto-month
Se corrigió la causa estructural:
- runtime ya no queda limitado por inventario mensual estático;
- `fresh=1` reconstruye desde HR viva;
- con Sheets API activa, registry mensual se deriva automáticamente de metadata provider;
- con fallback GViz, se usa último registry provider fail-closed;
- watcher refresca periódicamente y al recuperar foco;
- predeploy `cxorbia/live-hr-runtime-predeploy` PASS sin deploy.

Bloqueo externo exacto: Google Sheets API está `DISABLED` en el proyecto DEV existente y la service account disponible no tiene `serviceusage.services.enable`. Activarla es un gate provider de una sola vez, no una configuración mensual.

## 6. Julio/agosto coexistentes
La operación puede tener visitas pendientes de julio ejecutándose mientras agosto ya está disponible desde plataforma aunque HR aún no tenga tabs de agosto.

Por tanto:
- `platformOriginMayExistBeforeHrTab=true`;
- no exigir pestaña HR para que una visita plataforma-origin exista;
- al aparecer HR, conciliar y no duplicar;
- no clonar julio para fabricar agosto;
- conflictos pasan a review.

## 7. Gate vivo inmediato
Con autorización explícita:
`ENABLE SHEETS API EN cxorbia-backend-dev → VERIFICAR/OTORGAR SOLO LECTURA HR SI HACE FALTA → REDEPLOY CLOUD RUN DEV AUTO-MONTH → REDEPLOY HOSTING DEV PROTECTED SHOPPER → READBACK/SMOKE`.

Este bloque no incluye producción ni Firestore data writes.

## 8. Después del gate DEV
1. validar HR live automática y transición de mes sin configuración manual;
2. validar Admin/Coordinación y shopper con identidad real en runtime protegido;
3. resolver fuente operacional exacta de agosto disponible/origen plataforma;
4. generar delta-only exacto e idempotente;
5. solicitar autorización Firestore solo para ese delta;
6. readback/smoke → preprod → cutover `tya-plataforma`.

No repetir histórico/Auth91.

## 9. Claude/prototipo
No nueva candidata ni `app/modules/*`. UX del prototipo manda. No convertir provider/Auth en UI técnica. Source-safe no es identidad final. P1/P2 preservados: PDF/gráficas, Excel/formato, reportKit/exportaciones, copy.

## 10. Academia
Documentar auto-discovery mensual, fuente viva, platform-origin antes de HR, conciliación bidireccional, tab-existence gate, source-safe vs protected runtime, scopes y fail-closed.

## 11. Estado seguro
API enable0; share0; Cloud Run deploy0; Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.