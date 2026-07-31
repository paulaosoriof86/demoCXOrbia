# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_AND_HR_READER_PASS__CANONICAL_HR_PUBLIC_WRITE_P0__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- Auto-entry Admin observado funcionando.
- Identidad protegida: shoppers340/340 y visitas616/616 con nombre real; placeholders0; perfiles referenciados194/194.
- Google Sheets API habilitada y HR canónica legible por la service account: PASS.

## 2. Shopper real — pendiente de publicación DEV protegida, no de recuperación de datos
`Shopper protegido` es correcto solo en el preview source-safe público. La identidad real ya existe en Firestore.

Preparado en backend:
- ruta DEV protegida con Firebase Auth/custom claims/Rules;
- Admin/Coordinación ve identidad operativa real; shopper solo su scope;
- writes deshabilitados;
- sin PII en source-safe;
- sin cambios `app/modules/*`.

Pendiente: un único redeploy del Hosting DEV existente, ya autorizado pero todavía no consumido.

## 3. HR live y meses automáticos
Fix reusable implementado y prevalidado:
- runtime no queda limitado por inventario estático hasta julio;
- metadata Sheets provider genera registry automáticamente;
- GViz fallback queda fail-closed contra tabs fantasma;
- watcher refresca ~20 s/focus/visibility;
- predeploy PASS.

## 4. P0 seguridad fuente HR — único bloqueo inmediato
La HR canónica de 30 tabs / 28 mensuales todavía tiene `anyone=writer`. Debe quedar restringida y conservar la service account como reader antes de los redeploys autorizados.

Existe otra hoja con el mismo título pero una sola pestaña `Hoja 1` que sí está restringida; no es la fuente canónica. No identificar fuente por nombre solamente.

## 5. Julio y agosto coexistentes
Julio puede seguir con visitas en ejecución mientras agosto ya tiene visitas disponibles originadas en plataforma, aunque HR aún no tenga tabs de agosto. El sistema soporta `platformOriginMayExistBeforeHrTab` y reconciliación posterior.

Las fuentes inspeccionadas todavía no muestran el registro exacto platform-origin de agosto. No copiar julio ni inventar IDs/ubicaciones/estados.

## 6. Siguiente gate
`HR CANÓNICA 30 TABS RESTRICTED + SERVICE ACCOUNT READER PRESERVED → REVALIDACIÓN READ-ONLY PASS → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

No pedir nueva autorización para esos dos redeploys si el alcance no cambia.

Después: fuente operacional exacta agosto → delta-only Firestore autorizado → preprod/cutover.

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
Añadir: auto-discovery; sharing mínimo; provider capability; plataforma-origin; privacidad por capa; identificación canónica por provider ID/estructura.

## 10. Estado seguro
Desde este bloque: provider reads + repo/docs; Cloud Run/Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.
