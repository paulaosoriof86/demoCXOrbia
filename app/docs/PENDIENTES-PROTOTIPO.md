# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_DISABLED__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- Auto-entry Admin observado funcionando.
- Identidad protegida: shoppers340/340 y visitas616/616 con nombre real; placeholders0; perfiles referenciados194/194.

## 2. Shopper real — pendiente de publicación DEV protegida, no de recuperación de datos
`Shopper protegido` es correcto solo en el preview source-safe público. La identidad real ya existe en Firestore.

Preparado en backend:
- ruta DEV protegida con Firebase Auth/custom claims/Rules;
- Admin/Coordinación ve identidad operativa real; shopper solo su scope;
- writes deshabilitados;
- sin PII en source-safe;
- sin cambios `app/modules/*`.

Pendiente: un único redeploy del Hosting DEV existente para poder validar visualmente módulos con datos shopper reales.

## 3. HR live y meses automáticos
Regla definitiva: una pestaña mensual nueva de HR debe entrar automáticamente como periodo, sin configuración mensual por chat.

Fix reusable ya implementado:
- runtime no queda limitado por inventario estático hasta julio;
- metadata Sheets provider genera registry automáticamente cuando API está disponible;
- GViz fallback queda fail-closed contra tabs fantasma;
- watcher refresca ~20 s y al volver a foco;
- predeploy PASS.

## 4. Bloqueante provider vivo
Google Sheets API está `DISABLED` en el proyecto DEV existente y la service account actual no tiene `serviceusage.services.enable`. Por eso el código automático aún no puede operar de punta a punta con metadata Sheets.

Pendiente de una sola activación provider: habilitar Sheets API con identidad propietaria; después verificar read-only del HR y redeploy del Cloud Run DEV existente.

## 5. Julio y agosto coexistentes
Julio puede seguir con visitas en ejecución mientras agosto ya tiene visitas disponibles originadas en plataforma, aunque HR aún no tenga tabs de agosto. El sistema debe soportar `platformOriginMayExistBeforeHrTab` y reconciliar al aparecer HR.

No copiar julio ni inventar filas de agosto. Para materializar disponibilidad agosto hace falta su fuente operacional exacta/plataforma-origin y un write gate separado.

## 6. Siguiente gate
`ENABLE SHEETS API EXISTENTE → VERIFICAR READ-ONLY HR → REDEPLOY CLOUD RUN DEV AUTO-MONTH → REDEPLOY HOSTING DEV PROTECTED SHOPPER → READBACK/SMOKE`.

Después: resolver fuente operacional exacta de agosto → delta-only Firestore autorizado → preprod/cutover.

## 7. P1/P2 no bloqueante
- PDF sin gráfica final.
- Excel sin formato final.
- reportKit/exportaciones transversales.
- copy de fuentes/readiness.

## 8. Otros HOLD preservados
- 21 shopper credentials sin match canónico exacto;
- demo1;
- ambiguos18/77.

No resolver por nombre/coincidencia visual.

## 9. Academia/manuales
Añadir: auto-discovery de periodos; provider capability gate; plataforma-origin antes de HR; conciliación bidireccional; privacidad source-safe vs runtime autenticado.

## 10. Estado seguro
API enable0; share0; Cloud Run deploy0; Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Functions/Make/Gemini writes0; merge=false; producción=false.