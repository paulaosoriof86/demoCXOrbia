# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__C5_MATERIALIZED1406_PASS__C6_AUTH91_RULES_PASS__AUTOENTRY_REMOTE_PASS__PENDING_VISUAL`

## 1. Estado general
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Baseline frontend `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- Backend DEV `cxorbia-backend-dev`; Hosting/target `cxorbia-backend-dev`/`cxorbia-dev`.
- Producción futura `tya-plataforma`: no tocada.

## 2. Bloques cerrados
- Corte1/2A/3: FROZEN/APROBADO.
- Corte5: R17N1,406/1,406;616 visitas;572 controles liquidación;77 certificaciones; CX.data `cinepolis`,14 periodos,616 visitas,currentPeriod `2026-07`,fallback=false PASS.
- Corte6 provider: claims5/5 + Rules PASS; Auth import/readback91/91 PASS; shopper88 + staff3; resets/deletes/overwrite0.

## 3. P0 visuales Corte6
- P0 #1: gate `Acceso seguro` paralelo.
- P0 #2: formulario Usuario+Contraseña inyectado al seleccionar rol y fuera del viewport.
- Contrato correcto: perfil → `selectRole(...)` → `enter()` automático.

## 4. Fix y ejecución
- Preview humano restaura auto-entry.
- `humanCredentialPrompt=false`.
- HR source-safe read-only; baseline `cinepolis`,14 periodos,616 visitas.
- Auth/RBAC/Rules permanecen en gates provider separados.
- Mutaciones bloqueadas; no fallback demo.

Gate estático: `29b7f9404a9c2f144145fe24d5cf048f753c1e75` PASS.

Primera ejecución autorizada: FAIL antes de deploy por mismatch de contrato preflight/direct-deploy. Corregido en `b9f5190babcc339735cda59291417df5aea6988f`; request seguía deploy0/consumed=false.

Reintento bajo la misma autorización: `PASS_EXISTING_HOSTING_DEV_PROTOTYPE_AUTO_ENTRY_SOURCE_SAFE_REMOTE_VERIFIED`.
- versión `95a1e49e5064c456`;
- release `1785452689852000`;
- prototypeAutoEntry=true;
- humanCredentialPrompt=false;
- sourceSafeVisual=true;
- Hosting deploy executions1;
- preservedLegacyAuthUsers91.

## 5. Gate vivo
`VALIDACIÓN VISUAL HUMANA AUTO-ENTRY/SOURCE-SAFE → SI APRUEBA FREEZE CORTE6`.

## 6. Agosto — siguiente bloque operativo
Tras FREEZE C6: `refresh HR → resolver Agosto HN → validar periodo/visitas → materializar solo delta agosto → smoke → preprod/cutover`.

No repetir los1,406 históricos.

## 7. Claude/prototipo
No nueva candidata ni cambios `app/modules/*`. Conservar auto-entry en validación humana; provider/Auth no se convierte en UI técnica. P1/P2: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy.

## 8. Academia
Preview humano: perfil → acceso automático. Producción: Auth real detrás del contrato operativo, recuperación/cambio y scopes.

## 9. Estado seguro
Redeploy actual: Auth writes0; Firestore data writes0; Rules0; Storage/HR/legacy/payments/Functions/Make/Gemini0; nuevo Firebase/Hosting0; merge=false; producción=false.
