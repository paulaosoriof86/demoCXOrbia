# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_IDENTITY_PROTECTED_PASS__AUGUST_PROVIDER_TABS_MISSING__GVIZ_PHANTOM_FIXED__NO_PRODUCTION`

## 1. No reabrir
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis14 periodos/616 visitas/current2026-07 Firestore PASS.
- Auth91/91; claims5/5; Rules PASS.

## 2. UX/identidad
- P0s de login corregidos; auto-entry Admin observado funcionando.
- `Shopper protegido` solo es máscara del preview source-safe.
- Firestore protegido: shoppers340/340 con nombre real; visitas616/616 con nombre real; placeholders0; perfiles referenciados194/194; Rules/adapter PASS.
- No poner PII en source-safe ni tocar `app/modules/*`.

## 3. Agosto — corrección crítica de causa raíz
La metadata real del Google Sheet confirma que **no existen `AGOSTO 26` ni `AGOSTO 26 HN`**. El workbook mensual llega hasta julio.

La lectura anterior que parecía devolver agosto era falsa: GViz puede responder con otra hoja cuando se pide un tab inexistente. Queda superseded cualquier conclusión previa de GT34/HN34, mismatch de país o estados de esas filas.

Fix reusable:
- registry de tabs desde provider metadata;
- GViz output se filtra contra registry;
- planner valida existencia antes de filas/país/estado/mapping.

Re-read final:14 periodos,28 tabs,616 visitas,agosto0; Firestore periodo2026-08 inexistente; delta0; `HOLD_AUGUST_REQUIRED_PROVIDER_TABS_MISSING`.

## 4. Claude/prototipo
No crear candidata, no copiar julio, no fabricar agosto, no mostrar datos sintéticos como reales y no resolver ausencia de fuente desde UI.

P1/P2 siguen documentados: PDF/gráficas, Excel/formato, reportKit/exportaciones, copy.

## 5. Backend siguiente
`FUENTE AUTORIZADA AGOSTO DISPONIBLE → REFRESH METADATA/SOURCE-SAFE → VALIDAR PAÍS/ESTADO → DELTA EXACTO → AUTORIZACIÓN WRITE SOLO DELTA`.

Después: readback/smoke → preprod protegida con identidad real → cutover.

## 6. Academia/manuales
Documentar riesgo GViz sobre tabs inexistentes, gate de existencia provider-first, source-safe vs identidad protegida y fail-closed.

## 7. Estado seguro
Todo read-only/provider + repo/docs. HR/Firestore/Auth/Rules/Hosting/Storage/legacy/payments/Functions/Make/Gemini writes0; merge=false; producción=false; PII exportada0.