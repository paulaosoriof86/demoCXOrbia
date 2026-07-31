# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_AND_HR_READER_PASS__OPEN_READ_VALID__DEV_GATE_CORRECTED__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis14 periodos/616 visitas/current2026-07 Firestore PASS.
- Auth91/91; claims5/5; Rules PASS.
- Firestore protegido: shoppers340/340 y visitas616/616 con nombre real; placeholders0.

## 2. Regla producto
- HR es fuente viva y las pestañas mensuales nuevas se incorporan automáticamente, sin configuración mensual por chat.
- Lectura abierta/source-safe de HR es válida; el builder mantiene fallback GViz público read-only.
- Sheets API ya está habilitada y la service account lee la HR canónica.
- Julio puede seguir en ejecución mientras el siguiente mes tiene visitas platform-origin.
- Plataforma-origin puede anteceder a HR; reconciliar por IDs estables + `assignmentSource`/`assignmentSyncStatus`; nunca deduplicar por nombre.

## 3. Corrección metodológica
No volver a exigir `Restricted` como condición para lectura HR o redeploy DEV. Fue una mezcla incorrecta entre:
- capacidad de lectura viva;
- política de edición/sharing.

Drive sigue reportando `anyone=writer` en la HR canónica. Ese finding debe revisarse separadamente como hardening/cutover de producción si implica edición pública no deseada, pero **no bloquea el DEV read-only**.

## 4. Shopper real
`Shopper protegido` es máscara source-safe. La identidad real ya existe en Firestore.

Backend tiene preparada ruta DEV protegida:
- `app/core/backend-protected-dev-mode.js`;
- `app/index-backend-dev.html` con Firebase Hosting init;
- Auth/custom claims/Rules obligatorios;
- Admin/Coordinación ve identidad real; shopper solo su scope;
- read-only; no PII en JS público.

No tocar `app/modules/*` por este bloque.

## 5. Autorización DEV
La autorización previa de 1x Cloud Run DEV + 1x Hosting DEV no fue consumida. Como incluía la condición `HR restringido` sugerida por ChatGPT y esa condición fue corregida, no ejecutar bajo un alcance inferido.

Gate correcto:
`SHEETS API ENABLED + HR CANÓNICA READABLE + SERVICE ACCOUNT READER → CONFIRMACIÓN EXPRESA DEL GATE CORREGIDO → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

## 6. Julio/agosto
HR aún no tiene tabs de agosto. Agosto puede existir como platform-origin antes de HR. Recuperar/conectar source-of-truth exacto antes del delta Firestore; no copiar julio.

## 7. P1/P2
PDF/gráficas, Excel/formato, reportKit/exportaciones y copy siguen documentados y no bloquean este gate DEV.

## 8. Academia/manuales
Documentar diferencia entre public read, public write, provider auth y mínimo privilegio; no convertir hardening de permisos en requisito técnico de lectura.

## 9. Estado seguro
Provider reads + repo/docs. Cloud Run/Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.
