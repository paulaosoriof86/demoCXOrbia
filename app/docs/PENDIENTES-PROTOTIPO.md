# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_IDENTITY_PROTECTED_PASS__AUGUST_PROVIDER_TABS_MISSING__GVIZ_PHANTOM_FIXED__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- Auto-entry Admin observado funcionando.
- Identidad protegida: shoppers340/340 y visitas616/616 con nombre real; placeholders0.

## 2. `Shopper protegido`
Correcto solo en preview source-safe público. Preprod/producción autenticada debe usar Firestore protegido. No insertar PII en JS público ni tocar `app/modules/*`.

## 3. P0 metodológico de fuente — corregido
GViz devolvía datos aunque se consultaran tabs de agosto inexistentes. Metadata provider confirmó que el workbook llega solo hasta `JULIO 26`/`JULIO 26 HN`.

Se agregó registry provider + enforcement fail-closed. Re-read final:14 periodos,28 tabs,616 visitas,agosto0. `AGOSTO 26` y `AGOSTO 26 HN` no existen. Evidencia previa GT34/HN34 queda superseded.

## 4. Bloqueante vivo
Falta la fuente autorizada de agosto. No copiar julio, no fabricar44 visitas y no escribir Firestore hasta que existan datos reales de agosto.

## 5. Siguiente gate
`AGOSTO DISPONIBLE EN HR → REFRESH PROVIDER METADATA/SOURCE-SAFE → VALIDAR GT/HN/ESTADOS → DELTA EXACTO → AUTORIZACIÓN WRITE SOLO DELTA → READBACK/SMOKE → PREPROD → CUTOVER`.

## 6. P1/P2 no bloqueante
- PDF sin gráfica final.
- Excel sin formato final.
- reportKit/exportaciones transversales.
- copy de fuentes/readiness.

## 7. Otros HOLD preservados
-21 shopper credentials sin match canónico exacto;
- demo1;
- ambiguos18/77.

No resolver por nombre/coincidencia visual.

## 8. Academia/manuales
Añadir gate de existencia de tab antes de GViz, privacidad por capa e identidad protegida.

## 9. Estado seguro
Provider reads y repo/docs únicamente; HR/Firestore/Auth/Rules/Hosting/Storage/legacy/payments/Functions/Make/Gemini writes0; merge=false; producción=false.