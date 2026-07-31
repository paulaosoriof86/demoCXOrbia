# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_AND_HR_READER_PASS__OPEN_READ_VALID__DEV_GATE_CORRECTED__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- Auto-entry Admin observado funcionando.
- Identidad protegida: shoppers340/340 y visitas616/616 con nombre real; placeholders0.
- Google Sheets API habilitada y HR canónica legible por service account: PASS.

## 2. Shopper real
`Shopper protegido` es correcto solo en preview source-safe. La identidad real ya existe en Firestore.

Preparado:
- ruta DEV protegida con Firebase Auth/custom claims/Rules;
- Admin/Coordinación ve identidad real; shopper solo su scope;
- read-only, sin PII en source-safe;
- sin cambios `app/modules/*`.

Pendiente: publicar esa ruta mediante el único Hosting DEV redeploy acotado.

## 3. HR live y meses automáticos
- runtime no se limita por inventario estático;
- metadata Sheets genera registry automáticamente;
- GViz público read-only sigue siendo fallback válido y fail-closed contra tabs fantasma;
- watcher refresca ~20 s/focus/visibility;
- predeploy PASS.

## 4. Corrección metodológica
No exigir HR `Restricted` para leer ni para desplegar DEV. La lectura abierta es parte del contrato operativo.

Drive reporta `anyone=writer` en la HR canónica; este asunto se revisa separadamente antes de producción si implica edición pública no deseada. No usarlo para bloquear validación DEV read-only.

## 5. Autorización
La autorización anterior para 1x Cloud Run DEV + 1x Hosting DEV quedó no consumida, pero incluía `HR restringido`. Se requiere únicamente confirmar el gate corregido antes de ejecutar, porque no se amplía una autorización por inferencia.

## 6. Julio/agosto
Julio puede seguir en ejecución mientras agosto ya existe como platform-origin antes de HR. Fuente exacta de agosto pendiente de conectar antes del delta Firestore; no copiar julio ni inventar IDs/ubicaciones/estados.

## 7. P1/P2 no bloqueante
- PDF sin gráfica final.
- Excel sin formato final.
- reportKit/exportaciones transversales.
- copy de fuentes/readiness.

## 8. Otros HOLD preservados
- 21 shopper credentials sin match canónico exacto;
- demo1;
- ambiguos18/77.

## 9. Estado seguro
Provider reads + repo/docs; Cloud Run/Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.
