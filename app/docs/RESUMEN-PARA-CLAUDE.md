# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_AUTOENTRY_VISUAL_OBSERVED_PASS__PROTECTED_IDENTITY_READONLY_PASS__AUGUST_REFRESH_READONLY_NEXT__NO_PRODUCTION`

## 1. No reabrir
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; no repetir.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas,currentPeriod=`2026-07`,source=firestore/fallback=false PASS.
- Auth legacy import/readback91/91 PASS: shopper88 + super1 + coordinador2; Auth17→108; resets/deletes/overwrite0.
- claims5/5 + Firestore Rules PASS.
- No nueva candidata/base/Hosting/rama/PR por rutina.

## 2. P0 visuales de login — corregidos
- Build1 rechazado: gate separado `Acceso seguro`.
- Build2 rechazado: `Usuario + Contraseña` inyectado al seleccionar perfil y fuera del viewport.
- Contrato correcto: `app.js` mantiene perfil → `selectRole(...)` → `enter()` automático.
- Build actual: captura humana demuestra auto-entry al shell Admin.

## 3. `Shopper protegido` — no es un bug de datos
La visual humana actual usa HR source-safe estática/read-only. Esa capa pública debe enmascarar PII y por eso contiene `Shopper protegido`.

**No corregir esto poniendo nombres reales en `app/data/tya-hr-source-safe-periods.js`, módulos o Hosting público.**

La identidad real ya está materializada y protegida en Firestore DEV. Gate read-only final:
`PASS_C6_PROTECTED_IDENTITY_READONLY_RUNTIME_READY`.

- shoppers protegidos340; nombres reales340; placeholders0; missing0;
- visitas616; nombres reales616; placeholders0; missing0;
- shopperIds canónicos referenciados194;
- perfiles referenciados194/194 existentes y194/194 con nombre real;
- Rules shopper/deny-by-default PASS;
- adapter protegido de shoppers/nombre real PASS;
- Rules desplegadas/hash PASS;
- source-safe público permanece enmascarado PASS.

## 4. Regla Claude/prototipo
No crear nueva candidata ni tocar `app/modules/*` por este tema. Preservar:
- UX del producto manda;
- preview humano source-safe puede enmascarar PII;
- runtime autenticado protegido debe usar Firestore y mostrar identidad real según rol;
- Admin/Operativo ve identidad operativa necesaria; shopper solo su perfil;
- no reintroducir `Acceso seguro` ni formularios técnicos en preview humano;
- producción mantiene autenticación real, recuperación/cambio y scopes.

Un placeholder source-safe nunca debe convertirse en identidad final de producción.

P1/P2 preservados: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy de fuentes.

## 5. Backend — siguiente bloque exacto
`REFRESH HR READ-ONLY → RESOLVER/CLASIFICAR AGOSTO HN → VALIDAR AGOSTO → PREPARAR DELTA-ONLY WRITE PLAN`.

No materializar agosto sin write plan/dry-run exacto y autorización explícita. No reabrir1,406 históricos.

## 6. Después del delta agosto
`WRITE DELTA AUTORIZADO → READBACK/SMOKE → PREPROD PROTEGIDA AUTENTICADA → VALIDAR IDENTIDAD REAL → CUTOVER tya-plataforma`.

## 7. Academia/manuales
Enseñar la diferencia entre anonimización de artefactos source-safe y visibilidad autorizada en runtime protegido; identidad provider queda detrás del contrato operativo; aplicar mínimo privilegio, shopperId exacto y troubleshooting por capa.

## 8. Estado seguro
Gate identidad: provider reads únicamente; Auth writes0; Firestore data writes0; Rules0; Hosting0; Storage/HR/legacy/payments/Functions/Make/Gemini0; nuevo Firebase/Hosting0; merge=false; producción=false; PII/IDs exportados0.