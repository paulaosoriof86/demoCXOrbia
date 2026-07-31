# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_LIVE_HR_AUTOMONTH_AND_SHOPPER_DISPLAY_DEV_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- Auto-entry Admin preservado.
- Sheets API + lectura HR canónica PASS.
- Auto-month remoto PASS.
- Cloud Run DEV redeploy exacto `1/1` PASS.
- Hosting DEV redeploy exacto `1/1` PASS.
- Autorización de esos redeploys consumida; no reutilizar.

## 2. Shopper — pendiente solo validación visual
La ruta DEV ya publica identidad operativa mínima desde HR viva sin solicitar credenciales:
- 208 identidades operativas disponibles;
- nombre + shopperId + país/métricas;
- teléfono, correo, DPI, banco, credenciales y observaciones privadas excluidos.

`app/modules/*` no fue modificado.

Pendiente humano:
- Administración → Shoppers debe mostrar nombres operativos reales, no `Shopper protegido` en la lista viva;
- acceso Shopper DEV debe permitir seleccionar una identidad existente y recorrer módulos shopper;
- perfiles sensibles no deben quedar expuestos.

## 3. HR live y meses automáticos — cerrado técnicamente
- metadata provider refrescada en runtime;
- nueva pestaña mensual válida se incorpora sin configuración por chat;
- GViz queda solo para valores/fallback y el registry provider elimina tabs fantasma;
- watcher refresca ~20 s/focus/visibility;
- remote `tabRegistryAutoDiscovery=true`.

## 4. Julio/agosto — pendiente operacional real
HR aún no tiene tabs agosto. Julio puede seguir en ejecución y agosto puede existir platform-origin antes de HR.

Pendiente: recuperar/conectar la fuente exacta de las visitas agosto ya disponibles. No copiar julio ni inferir IDs/ubicaciones/estado. El posterior delta Firestore requiere una autorización nueva y específica.

## 5. P1/P2 no bloqueante
- PDF sin gráfica final.
- Excel sin formato final.
- reportKit/exportaciones transversales.
- copy de fuentes/readiness.

## 6. Otros HOLD preservados
- 21 shopper credentials sin match canónico exacto;
- demo1;
- ambiguos18/77.

No resolver por nombre/coincidencia visual.

## 7. Siguiente gate
`VALIDACIÓN VISUAL SHOPPERS/ROL SHOPPER → FREEZE CORTE 6 SI PASS → FUENTE EXACTA AGOSTO → DELTA-ONLY AUTORIZADO → PREPROD/CUTOVER`.

## 8. Estado seguro
Firestore/HR/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; proyectos/Hosting nuevos0; merge=false; producción=false.
