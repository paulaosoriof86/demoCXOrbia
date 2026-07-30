# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__C5_MATERIALIZED1406_PASS__C6_AUTH91_RULES_PASS__AUTOENTRY_VISUAL_OBSERVED_PASS__PROTECTED_IDENTITY_READONLY_PASS__AUGUST_REFRESH_NEXT`

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
- Captura humana actual: auto-entry ya funciona; shell Admin carga con Cinépolis/JUL2026.

## 4. Source-safe vs identidad real
El preview humano actual usa HR source-safe, por lo que `Shopper protegido` es el placeholder deliberado de la capa pública/read-only. No debe copiarse PII a ese artefacto.

La capa protegida se validó aparte y quedó PASS:
- shoppers340 / nombres reales340 / placeholders0;
- visitas616 / nombres reales616 / placeholders0;
- perfiles canónicos referenciados194/194 con nombre real;
- Rules y adapter protegidos PASS;
- status `PASS_C6_PROTECTED_IDENTITY_READONLY`.

## 5. Gate vivo
`REFRESH HR READ-ONLY → RESOLVER/CLASIFICAR AGOSTO HN → VALIDAR PERIODO/VISITAS → PREPARAR DELTA-ONLY WRITE PLAN`.

No provider writes en este bloque.

## 6. Agosto — siguiente write gate
Tras plan/dry-run exacto: solicitar autorización explícita para materializar **solo delta agosto**. Luego readback/smoke y preprod protegida autenticada con identidad real. No repetir los1,406 históricos.

## 7. Claude/prototipo
No nueva candidata ni cambios `app/modules/*`. Conservar auto-entry; no convertir provider/Auth en UI técnica; no tratar source-safe como identidad final. P1/P2: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy.

## 8. Academia
Preview humano source-safe puede enmascarar PII. Runtime autenticado protegido debe mostrar identidad según rol/scopes. Documentar mínimo privilegio, recuperación y troubleshooting.

## 9. Estado seguro
Gate identidad: provider reads; Auth writes0; Firestore data writes0; Rules0; Hosting0; Storage/HR/legacy/payments/Functions/Make/Gemini0; merge=false; producción=false; PII exportada0.