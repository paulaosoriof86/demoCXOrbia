# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_AND_HR_READER_PASS__OPEN_READ_VALID__DEV_GATE_CORRECTED__PROTECTED_SHOPPER_PREPARED`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN.
- Corte5:1,406/1,406;616 visitas;572 controles liquidación;77 certificaciones; CX.data14 periodos/current2026-07 PASS.
- Corte6: Auth91/91, claims5/5, Rules PASS; auto-entry Admin observado; Firestore protegido shoppers340/340 y visitas616/616 con identidad real, placeholders0.

## 2. HR auto-month — PASS de código/provider
- runtime live no se limita a julio;
- `fresh=1` usa metadata provider para descubrir tabs nuevas;
- fallback GViz público read-only usa registry fail-closed;
- watcher refresca ~20 s/focus/visibility;
- Google Sheets API `ENABLED`;
- service account lee la HR canónica: PASS;
- HR canónica 30 tabs / 28 mensuales / último `JULIO 26 HN`.

## 3. Corrección metodológica
La lectura abierta de HR es válida y ya estaba soportada. Fue incorrecto convertir `Restricted` en requisito para DEV.

Drive reporta `anyone=writer`; se revisa como política de edición/hardening antes de producción si corresponde. No bloquea el runtime read-only ni el redeploy DEV.

## 4. Shopper real
Identidad real lista en Firestore protegido. Ruta DEV autenticada preparada para Admin/Coordinación y shopper según scope. Pendiente de publicación Hosting DEV.

## 5. Autorización
La autorización previa de 1x Cloud Run DEV + 1x Hosting DEV sigue no consumida, pero incluía la condición `HR restringido`. Se requiere confirmación expresa del gate corregido; no ampliar alcance por inferencia.

## 6. Julio/agosto
Julio puede seguir ejecutándose mientras agosto existe como platform-origin antes de HR. Fuente exacta de agosto pendiente antes del delta Firestore; no copiar julio.

## 7. Siguiente bloque
`CONFIRMAR GATE CORREGIDO → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE → VALIDACIÓN SHOPPER REAL`.

Luego: fuente exacta agosto → delta-only autorizado → readback/preprod/cutover.

## 8. Claude/Academia
- Claude: preservar UX, no nueva candidata, no `app/modules/*`.
- Academia: separar public read/public write/provider auth y gates DEV/producción.

## 9. Estado seguro
Provider reads + repo/docs; Cloud Run/Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.
