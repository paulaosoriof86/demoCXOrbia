# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__C5_MATERIALIZED1406_PASS__C6_AUTH91_RULES_PASS__AUTOENTRY_FIX_STATIC_PASS__PENDING_REDEPLOY_VISUAL`

## 1. Estado general
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Baseline frontend `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- Backend DEV `cxorbia-backend-dev`; mismo Hosting DEV/target `cxorbia-backend-dev`/`cxorbia-dev`.
- Producción futura `tya-plataforma`: no tocada.

## 2. Bloques cerrados
- Corte1/2A/3: FROZEN/APROBADO.
- Corte5: R17N 1,406/1,406,616 visitas,572 controles liquidación,77 certificaciones; CX.data Firestore project=`cinepolis`,periods14,visits616,currentPeriod=`2026-07`,fallback=false PASS.
- Corte6 provider: claims5/5 + Rules PASS; Auth import/readback91/91 PASS (shopper88 + staff3); resets/deletes/overwrite0.

## 3. Validación visual Corte6 — secuencia real
### P0 #1
Gate separado `Acceso seguro` antes del login normal → NO APROBADO.

### P0 #2
Se eliminó el gate paralelo, pero el backend siguió interceptando la selección de rol y añadió `Usuario + Contraseña` dentro del login. La captura humana confirma que esto tampoco preserva el prototipo y que el formulario queda fuera del viewport.

Contrato canónico comprobado: `app.js` selecciona perfil y entra automáticamente. No corresponde pedir credenciales desconocidas para validar visualmente DEV.

## 4. Fix vigente en rama
- Human visual DEV conserva auto-entry del prototipo.
- `humanCredentialPrompt=false`.
- Dataset de validación: HR source-safe explícita, `cinepolis`,14 periodos,616 visitas.
- Auth/RBAC/Rules permanecen separados como gates provider ya validados.
- Mutaciones bloqueadas; no fallback demo.
- Diagnóstico visible rotula source-safe y no simula Auth humano.

## 5. Gate estático
Commit `29b7f9404a9c2f144145fe24d5cf048f753c1e75`:
`success · PREPARED_C6_PROTOTYPE_AUTO_ENTRY_NO_EXECUTE`.

No hubo service account, deploy ni provider writes porque el request anterior ya está consumido.

## 6. Gate vivo
`AUTORIZACIÓN FRESCA 1 REDEPLOY MISMO HOSTING DEV → PRECHECK → DEPLOY1 → REMOTE SMOKE AUTO-ENTRY/SOURCE-SAFE → VISUAL PAULA → FREEZE C6`.

## 7. Agosto — siguiente bloque operativo
Tras FREEZE C6: `refresh HR → resolver Agosto HN → validar periodo/visitas → materializar solo delta agosto → smoke → preprod/cutover`.

No repetir los1,406 históricos.

## 8. Claude/prototipo
No nueva candidata y no tocar módulos. Conservar UX auto-entry del prototipo en validación humana; provider/Auth no debe convertirse en una pantalla técnica. P1/P2: PDF/gráficas, Excel/formato, reportKit/exportaciones, copy.

## 9. Academia
DEV humano: selección de perfil → acceso automático. Producción: Auth real detrás del contrato operativo, recuperación/cambio y scopes; no enseñar provider interno como paso de usuario.

## 10. Clasificación
- **Reusable CXOrbia:** separación entre validación UX y gates provider; source-safe visual honesto.
- **Exclusivo cliente:** HR/credenciales TyA y Agosto HN.
- **Claude/prototipo:** preservar auto-entry; no introducir UI Auth técnica.
- **Academia:** flujo real por rol y troubleshooting.
- **Sin impacto Claude:** Auth91, Rules, evidencia/provider gates.

## 11. Estado seguro
Desde el segundo P0: Auth writes0; Firestore data writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/Functions/Make/Gemini0; merge=false; producción=false.
