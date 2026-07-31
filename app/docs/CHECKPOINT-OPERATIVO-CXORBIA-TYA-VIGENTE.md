# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_AND_HR_READER_PASS__OPEN_READ_VALID__DEV_GATE_CORRECTED__REDEPLOY_AUTH_NOT_CONSUMED__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. No reabrir
- Corte3 FROZEN.
- R17N1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones.
- Corte5 CX.data Firestore: cinepolis,14 periodos,616 visitas,currentPeriod2026-07,fallback=false PASS.
- Auth91/91; claims5/5; Rules PASS.
- Identidad protegida: shoppers340/340 y visitas616/616 con nombre real; placeholders0; perfiles referenciados194/194.

## 3. Regla operacional confirmada
- HR se lee en vivo.
- Lectura abierta/source-safe de HR es válida y ya formaba parte del diseño histórico mediante GViz fallback.
- Cada nueva pestaña mensual válida debe generar/detectar automáticamente el periodo sin configuración por chat.
- Julio puede continuar ejecutándose mientras el siguiente mes ya tiene visitas disponibles de origen plataforma.
- Plataforma-origin puede anteceder a HR; luego se reconcilia por IDs estables + `assignmentSource`/`assignmentSyncStatus`, sin duplicar.
- Dedupe por nombre: prohibido.

## 4. Provider/autodiscovery — PASS
Revalidación read-only:
- Google Sheets API `ENABLED`.
- Service account puede leer la HR canónica por Sheets API: HTTP 200.
- HR canónica: 30 tabs / 28 mensuales / último `JULIO 26 HN`.
- Runtime `fresh=1` y auto-month preparados; fallback público GViz permanece read-only/fail-closed.

## 5. Corrección metodológica
Fue incorrecto convertir el sharing `Restricted` en requisito de lectura/despliegue DEV. Se mezclaron dos planos:
- **lectura viva**: abierta/source-safe o service account; válida y actualmente PASS;
- **política de edición**: Drive reporta `anyone=writer`; se revisa separadamente antes de producción si implica edición pública no deseada.

El finding de escritura pública ya no bloquea el redeploy DEV read-only.

## 6. Autorización DEV
Paula había autorizado 1x redeploy Cloud Run DEV + 1x redeploy Hosting DEV, pero la frase incluía la condición `HR restringido` sugerida por ChatGPT. Como esa condición cambia al corregir el gate, la autorización previa permanece **no consumida** y no se amplía por inferencia.

Gate técnico correcto:
`SHEETS API ENABLED + HR CANÓNICA READABLE + SERVICE ACCOUNT READER → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

No Firestore/HR/Auth/Rules/Storage/Make/Gemini/pagos/merge/producción.

## 7. Shopper real
Firestore protegido sí tiene los datos. Ruta DEV autenticada preparada:
- `app/core/backend-protected-dev-mode.js`;
- `index-backend-dev.html` con Firebase Hosting init;
- Auth + custom claims + Rules;
- Admin/Coordinación ve identidad real, shopper solo su scope;
- read-only; sin PII en source-safe.

## 8. Julio/agosto
HR aún no tiene tabs de agosto. Julio puede continuar en ejecución y agosto puede existir como disponibilidad platform-origin antes de HR. El origen exacto de esas visitas se conecta antes del delta Firestore; no clonar julio ni inferir IDs/ubicaciones/estado.

## 9. Siguiente gate exacto
Confirmación expresa del **gate DEV corregido sin exigir `Restricted`** → ejecutar los dos redeploys ya acotados → readback/smoke → validación visual shopper real.

Después: fuente operacional exacta agosto → delta-only autorizado → preprod/cutover.

## 10. Academia
Patrón reusable: distinguir lectura pública, escritura pública y autenticación provider; nunca convertir una política de hardening en bloqueo técnico de lectura si el producto no lo exige.

## 11. Estado seguro
Desde este bloque: provider reads + repo/docs. Cloud Run/Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false. Histórico/Auth91 preservados.
