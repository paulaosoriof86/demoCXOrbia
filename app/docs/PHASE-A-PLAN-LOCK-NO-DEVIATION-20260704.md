# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_LIVE_HR_AUTOMONTH_AND_SHOPPER_DISPLAY_DEV_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis como tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev`=DEV canónico; `tya-plataforma`=Hosting final. No crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE/CONCILIACIÓN → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN → CUTOVER`.

Reglas prevalentes:
- HR se lee en vivo.
- Lectura abierta/read-only es válida; no exigir `Restricted` para lectura DEV.
- Nueva pestaña mensual válida genera/detecta periodo automáticamente; no configuración mensual por chat.
- Fallback de filas no prueba existencia de tab; metadata provider/registry manda.
- Plataforma puede originar disponibilidad antes de HR; conciliación posterior por IDs estables + `assignmentSource`/`assignmentSyncStatus`.
- Nunca deduplicar por nombre.

## 3. Cortes protegidos
- Corte1/2A/3 FROZEN.
- Histórico14 periodos/616 visitas hasta julio.
- R17N1,406/1,406; no repetir.
- Corte5 CX.data PASS.
- Auth91/91, claims5/5 y Rules PASS; no reimportar.
- Identidad protegida: shoppers340/340 y visitas616/616 con nombres reales; placeholders0.

## 4. Corte6 — estado actual
Auto-entry Admin preservado. El redeploy DEV de HR viva + visual shopper se ejecutó exactamente una vez por destino y terminó PASS:
- Cloud Run revision `cxorbia-live-hr-dev-00008-8mf`;
- Hosting version `22e81c2b783f697a`;
- 14 periodos / 616 visitas / último 2026-07;
- `tabRegistryAutoDiscovery=true`;
- 208 identidades operativas shopper disponibles;
- `humanCredentialPrompt=false`.

La autorización quedó consumida y no puede reutilizarse.

## 5. HR live y auto-month
- metadata mensual se consulta en runtime;
- Cloud Run usa ADC/runtime service account para metadata provider;
- GViz puede servir valores/fallback, pero registry provider elimina tabs fantasma;
- `fresh=1` fuerza lectura real;
- watcher refresca periódicamente/focus;
- una futura pestaña agosto/septiembre entra automáticamente.

## 6. Shopper DEV sin PII sensible
Para validación humana se expone únicamente `display_name_only`:
- nombre operativo;
- shopperId estable;
- país y métricas source-safe.

Se excluyen teléfono, correo, DPI, banco/cuenta, credenciales y observaciones privadas. El endpoint source-safe normal permanece enmascarado. No tocar `app/modules/*` para este empalme.

## 7. Julio/agosto coexistentes
Julio puede seguir en ejecución mientras agosto existe como platform-origin antes de HR. Al aparecer HR, conciliar por IDs estables; no duplicar, no copiar julio y conflictos a review.

El source-of-truth exacto de las visitas agosto platform-origin aún debe recuperarse/conectarse antes del delta Firestore.

## 8. Gate vivo inmediato
`VALIDACIÓN HUMANA ADMIN: NOMBRES SHOPPER + SHOPPER: SELECTOR DE IDENTIDAD/MÓDULOS`.

Si PASS: congelar Corte6 sin otro redeploy.

## 9. Después del freeze Corte6
1. recuperar/conectar fuente exacta de agosto platform-origin;
2. generar delta-only idempotente;
3. solicitar autorización Firestore únicamente para ese delta;
4. readback/smoke;
5. preprod;
6. cutover `tya-plataforma` con autorización específica de producción.

Nunca repetir histórico/Auth91.

## 10. Claude/prototipo
No nueva candidata ni `app/modules/*`. UX del prototipo manda. P1/P2 (PDF/gráficas, Excel/formato, reportKit/exportaciones/copy) permanecen documentados y no bloquean este gate visual.

## 11. Academia
Documentar: provider registry vivo, ADC, open-read vs open-write, platform-origin antes de HR, identidad operativa mínima vs PII sensible y state machine one-shot.

## 12. Estado seguro
Firestore/HR/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0 en este bloque; proyectos/Hosting nuevos0; merge=false; producción=false.
