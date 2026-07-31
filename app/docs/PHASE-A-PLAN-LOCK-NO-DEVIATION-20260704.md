# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_AND_HR_READER_PASS__CANONICAL_HR_PUBLIC_WRITE_P0__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis como tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev`=DEV canónico; `tya-plataforma`=Hosting final. No crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA/SEGURIDAD DE FUENTE → MAPPING/IDENTIDAD → PROVIDER COMPARE/CONCILIACIÓN → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN → CUTOVER`.

Reglas prevalentes:
- HR se lee en vivo.
- Una pestaña mensual válida nueva genera/detecta automáticamente el periodo; no existe configuración mensual por chat.
- En fallback GViz, contenido no prueba existencia del tab; metadata provider/registry manda.
- Plataforma puede originar disponibilidad antes de HR. La llegada posterior de HR concilia por IDs estables y `assignmentSource`/`assignmentSyncStatus`; no duplica.
- Nunca deduplicar por nombre.
- Una fuente HR con acceso público de edición es P0 y bloquea producción.
- Fuentes homónimas se distinguen por provider ID/estructura, no por título visual.

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
- Ruta DEV autenticada separada (`backend-protected-dev-mode.js` + Hosting init) preparada para validar módulos con datos reales según Auth/claims/Rules; read-only y aún no desplegada.
- No insertar PII en source-safe ni tocar `app/modules/*` para resolver identidad.

## 5. HR live y auto-month
Se corrigió la causa estructural:
- runtime ya no queda limitado por inventario mensual estático;
- `fresh=1` reconstruye desde HR viva;
- registry mensual se deriva automáticamente de metadata provider;
- fallback GViz usa último registry provider fail-closed;
- watcher refresca periódicamente y al recuperar foco;
- predeploy `cxorbia/live-hr-runtime-predeploy` PASS sin deploy.

Provider actual:
- Google Sheets API `ENABLED`;
- HR canónica accesible por la service account mediante Sheets API: PASS;
- HR canónica: 30 tabs, 28 mensuales, último `JULIO 26 HN`;
- Drive API no es requisito del runtime HR.

## 6. P0 seguridad de la fuente HR
Metadata real de Drive sigue mostrando `anyone=writer` en la HR canónica de 30 tabs. Debe quedar restringida a usuarios autorizados y conservar la service account como reader.

Existe otra hoja con el mismo título pero una sola pestaña `Hoja 1`, ya restringida; no es la fuente canónica.

## 7. Julio/agosto coexistentes
La operación puede tener visitas pendientes de julio ejecutándose mientras agosto ya está disponible desde plataforma aunque HR aún no tenga tabs de agosto.

Por tanto:
- `platformOriginMayExistBeforeHrTab=true`;
- no exigir pestaña HR para que una visita plataforma-origin exista;
- al aparecer HR, conciliar y no duplicar;
- no clonar julio para fabricar agosto;
- conflictos pasan a review.

El registro exacto source-of-truth de esas visitas agosto platform-origin no está en las fuentes inspeccionadas. La materialización requiere recuperarlo/conectarlo antes del write delta-only.

## 8. Gate vivo inmediato
`HR CANÓNICA 30 TABS RESTRICTED + SERVICE ACCOUNT READER PRESERVED → REVALIDACIÓN READ-ONLY PASS → REDEPLOY CLOUD RUN DEV AUTO-MONTH → REDEPLOY HOSTING DEV PROTECTED SHOPPER → READBACK/SMOKE`.

Paula ya autorizó un redeploy de cada destino DEV y la autorización está retenida/no consumida. No pedirla otra vez si el alcance no cambia.

## 9. Después del gate DEV
1. validar HR live automática y transición de mes sin configuración manual;
2. validar Admin/Coordinación y shopper con identidad real en runtime protegido;
3. recuperar/conectar fuente operacional exacta de agosto platform-origin;
4. generar delta-only exacto e idempotente;
5. solicitar autorización Firestore solo para ese delta;
6. readback/smoke → preprod → cutover `tya-plataforma`.

No repetir histórico/Auth91.

## 10. Claude/prototipo
No nueva candidata ni `app/modules/*`. UX del prototipo manda. No convertir provider/Auth en UI técnica. Source-safe no es identidad final. P1/P2 preservados: PDF/gráficas, Excel/formato, reportKit/exportaciones, copy.

## 11. Academia
Documentar auto-discovery mensual, fuente viva, platform-origin antes de HR, conciliación bidireccional, tab-existence gate, sharing mínimo, source-safe vs protected runtime, scopes, fail-closed y fuente canónica por provider identity.

## 12. Estado seguro
Desde este bloque: provider reads + repo/docs; Cloud Run deploy0; Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.
