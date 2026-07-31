# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_AND_HR_READER_PASS__CANONICAL_HR_PUBLIC_WRITE_P0__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis14 periodos/616 visitas/current2026-07 Firestore PASS.
- Auth91/91; claims5/5; Rules PASS.
- Firestore protegido: shoppers340/340 y visitas616/616 con nombre real; placeholders0; perfiles referenciados194/194.

## 2. Regla producto que Claude debe preservar
- HR es fuente viva y las pestañas mensuales nuevas se incorporan automáticamente, sin configuración mensual por chat.
- Julio puede seguir en ejecución mientras el siguiente mes tiene visitas disponibles originadas en plataforma.
- Plataforma-origin puede anteceder a HR; luego se reconcilia por IDs estables + `assignmentSource`/`assignmentSyncStatus`, sin duplicar.
- Nunca deduplicar por nombre ni fabricar visitas copiando un mes anterior.

## 3. Provider HR
Google Sheets API ya está `ENABLED` y la service account puede leer la HR canónica por Sheets API. La fuente canónica tiene 30 tabs, 28 mensuales y último `JULIO 26 HN`.

El preflight ahora valida la HR por Sheets API directamente; Drive API no es requisito del runtime.

## 4. P0 seguridad HR aún vivo
La HR canónica de 30 tabs todavía tiene `anyone=writer`. Existe otra hoja homónima con una sola pestaña `Hoja 1` que sí está restringida; no confundirla con la fuente canónica.

Claude no debe ocultar ni compensar este P0 desde UI. La identidad de la fuente debe resolverse por provider ID/estructura, no por título.

## 5. Shopper real
`Shopper protegido` es únicamente máscara source-safe. La identidad real ya existe en Firestore.

Backend tiene preparada ruta DEV protegida separada:
- `app/core/backend-protected-dev-mode.js`;
- `app/index-backend-dev.html` usa Firebase Hosting init;
- Auth/custom claims/Firestore Rules obligatorios;
- Admin/Coordinación ve identidad real; shopper solo su scope;
- read-only; sin PII en JS público.

No tocar `app/modules/*` por este bloque. Hosting DEV no se redeploya hasta cerrar sharing P0.

## 6. Julio/agosto
HR aún no tiene `AGOSTO 26`/`AGOSTO 26 HN`. Agosto puede existir como platform-origin antes de HR; el source-of-truth exacto debe recuperarse/conectarse antes del delta Firestore. No copiar julio.

## 7. Siguiente bloque exacto
`HR CANÓNICA 30 TABS RESTRICTED + SERVICE ACCOUNT READER PRESERVED → READ-ONLY REVALIDATION PASS → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

La autorización de esos dos redeploys ya existe y está retenida/no consumida; no pedirla otra vez si el alcance no cambia.

Después: fuente exacta agosto platform-origin → delta-only idempotente → autorización Firestore data write → preprod/cutover.

## 8. P1/P2
PDF/gráficas, Excel/formato, reportKit/exportaciones y copy de fuentes/readiness continúan documentados y no bloquean este gate.

## 9. Academia/manuales
Documentar: HR viva/autodescubrimiento; plataforma-origin; sharing mínimo; source-safe vs runtime protegido; provider capability; distinguir fuente canónica de homónimos por identidad/estructura.

## 10. Estado seguro
Desde este bloque: provider reads + repo/docs. Cloud Run/Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.
