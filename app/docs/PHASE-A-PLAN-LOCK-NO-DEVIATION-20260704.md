# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_AND_HR_READER_PASS__OPEN_READ_VALID__DEV_GATE_CORRECTED__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis como tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev`=DEV canónico; `tya-plataforma`=Hosting final. No crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE/CONCILIACIÓN → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN → CUTOVER`.

Reglas prevalentes:
- HR se lee en vivo.
- Lectura abierta/source-safe es válida; no exigir `Restricted` para leer.
- Nueva pestaña mensual válida genera/detecta periodo automáticamente; no configuración mensual por chat.
- Fallback GViz no prueba existencia de tab; metadata provider/registry manda.
- Plataforma puede originar disponibilidad antes de HR; conciliación posterior por IDs estables + `assignmentSource`/`assignmentSyncStatus`.
- Nunca deduplicar por nombre.

## 3. Cortes protegidos
- Corte1/2A/3 FROZEN.
- Histórico14 periodos/616 visitas hasta julio.
- R17N1,406/1,406; no repetir.
- Corte5 CX.data PASS.
- Auth91/91, claims5/5 y Rules PASS.
- Identidad protegida: shoppers340/340 y visitas616/616 con nombres reales; placeholders0.

## 4. Corte6 UX/identidad
- Auto-entry Admin restaurado y observado.
- Preview source-safe mantiene PII enmascarada.
- Firestore protegido contiene identidad real.
- Ruta DEV autenticada separada preparada para validar módulos con datos reales según Auth/claims/Rules; read-only y aún no desplegada.
- No insertar PII en source-safe ni tocar `app/modules/*`.

## 5. HR live y auto-month
- runtime no queda limitado por inventario mensual estático;
- `fresh=1` reconstruye desde HR viva;
- registry mensual se deriva automáticamente de metadata provider;
- fallback GViz público read-only usa último registry provider fail-closed;
- watcher refresca periódicamente/focus;
- predeploy `cxorbia/live-hr-runtime-predeploy` PASS.

Provider actual:
- Google Sheets API `ENABLED`;
- HR canónica accesible por service account mediante Sheets API: PASS;
- HR canónica: 30 tabs, 28 mensuales, último `JULIO 26 HN`.

## 6. Corrección de seguridad/gate
Fue incorrecto hacer de `HR Restricted` una precondición de lectura o deploy DEV. Lectura abierta es un requisito operativo válido.

Drive reporta `anyone=writer`; si eso representa edición pública no deseada, debe tratarse como hardening/cutover de producción, separado del funcionamiento read-only DEV. No bloquear DEV por ese hallazgo.

## 7. Julio/agosto coexistentes
Julio puede seguir en ejecución mientras agosto existe como platform-origin antes de HR. Al aparecer HR, conciliar por IDs estables; no duplicar, no copiar julio y conflictos a review.

El source-of-truth exacto de agosto platform-origin aún debe recuperarse/conectarse antes del delta Firestore.

## 8. Gate vivo inmediato
`SHEETS API ENABLED + HR CANÓNICA READABLE + SERVICE ACCOUNT READER → CONFIRMACIÓN EXPRESA DEL GATE CORREGIDO → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

La autorización previa no fue consumida, pero incluía `HR restringido`; no ampliar por inferencia.

## 9. Después del gate DEV
1. validar HR live automática/transición de mes;
2. validar Admin/Coordinación y shopper con identidad real;
3. recuperar/conectar fuente exacta de agosto platform-origin;
4. delta-only idempotente;
5. autorización Firestore solo del delta;
6. readback/smoke → preprod → cutover `tya-plataforma`.

## 10. Claude/prototipo
No nueva candidata ni `app/modules/*`. UX del prototipo manda. Source-safe no es identidad final. P1/P2 preservados.

## 11. Academia
Documentar diferencia entre public read, public write, provider auth, mínimo privilegio y separación de gates DEV vs producción.

## 12. Estado seguro
Provider reads + repo/docs; Cloud Run deploy0; Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.
