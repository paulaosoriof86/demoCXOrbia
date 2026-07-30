# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN__CANONICAL_BACKEND_RECOVERED__LEGACY_REFRESH_PASS__VISIT_IDENTITY_CROSSWALK_201_OF_210__REAL_IDENTITY_POLICY_LOCKED__NO_DATA_WRITES__NO_PRODUCTION`

## 1. Repositorio y seguridad
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Legacy/Firestore/Auth/Storage/HR writes=0; deploy=0; production=false; merge=false.

## 2. Arquitectura vinculante
- Legacy TyA = Firebase `tya-plataforma`; plataforma actual a retirar, fuente de datos útiles limpios y Hosting/URL pública a preservar.
- `cxorbia-backend-dev` = backend DEV canónico de CXOrbia/TyA; reutilizar.
- `cxorbia-tya-dev-260729-c4` = sandbox técnico; no destino de materialización.
- No nueva base Firebase por este bloque.

## 3. Corte 3 — FROZEN
Baseline `CXORBIA-TYA-CORTE3-V182-20260729`: 14 periodos / 616 visitas hasta julio; 34 GT + 10 HN por periodo. Mayo 44 pagadas; junio 2 pagadas / 42 pendientes. P1/P2 reportes/copy no bloquean.

## 4. Backend canónico / HR viva
Inventario read-only `cxorbia-backend-dev`: Auth 17, clients 3, projects 29, visits 619, questionnaires 557, shoppers 215, liquidations 255, postulations 3, applications 1, notifications 20, shopperBenefits 572, certifications 0.

Gap preservado:
- julio GT+HN faltante en topología period-country previa: 44 visitas;
- `sprint5-visit-mutation-no-real-data`: HOLD_NO_DELETE;
- `hr-58fb469666080189`: HOLD_NO_DELETE;
- pilotos `julio-pilot`, `r1`, `tya-piloto`: preservar.

HR viva: 15 periodos / 30 tabs / 684 visitas / 236 referencias shopper; julio GT34/HN10 correcto; `AGOSTO 26 HN` HOLD por país/tab incorrecto.

## 5. Legacy shoppers/certificaciones — READ-ONLY PASS
La lectura se ejecutó directamente contra Firebase RTDB del proyecto actual `tya-plataforma`, nodo `tya_shoppers_extra`.

Resultado:
- 281 representaciones crudas;
- 149 shoppers únicos;
- 128 duplicados de almacenamiento colapsados;
- 1 conflicto interno de fuente;
- 78 certificaciones útiles = 76 intentos + 2 markers;
- 30 recovery mirrors colapsados;
- 22 perfiles stable-linked;
- 120 perfiles create candidate;
- 7 HOLD.

La evidencia GitHub no contiene PII cruda, pero esa sanitización no significa que la identidad real deba perderse en la plataforma final.

## 6. Política de identidad real
Vigente `ADDENDUM-IDENTIDAD-REAL-SHOPPER-PII-SOURCE-SAFE-VS-PLATAFORMA-20260729.md`.

- `source-safe` = protección de repo/log/evidencia.
- perfil final = identidad real y datos útiles en backend protegido.
- Admin/Operativo TyA debe poder ver identidad real conforme a RBAC/Rules.
- Shopper ve su propio perfil/historial permitido.
- Cliente solo ve el alcance autorizado.
- DPI/banco/NDA/adjuntos se conservan solo si aplican y bajo controles adecuados.
- no name-only automerge = integridad de dedupe, no anonimización.

## 7. Visit-identity crosswalk — READ-ONLY PASS
Autorización ejecutada contra `cxorbia-backend-dev` usando HR source-safe + visitas canónicas existentes por `visitId`, `hrRowId` y `sourceSheet+sourceRow`; no se leyeron visitas legacy.

Resultado v2:
- refs shopper HR: 210;
- refs resueltas: 201;
- refs pendientes: 9;
- conflictos multi-shopper: 0;
- visitas HR con shopperRef: 616;
- visitas resueltas por identidad exacta: 571;
- visitas sin evidencia canónica exacta: 45;
- target canonical shopper inexistente: 0;
- mapping hash: `9221098951aa03d34301273c3adc8f7773a410a39901432ec6f6e3040ce4720f`;
- provider/data writes: 0.

### Corrección de causa raíz del gate
El primer intento dio 0/210 porque el sanitizador del crosswalk rechazaba espacios en `sourceSheet/hrRowId`, anulando las llaves reales. Se separaron `safeTechnicalId` y `safeSourceIdentity`; el rerun v2 resolvió 201/210. No fue un problema de datos TyA ni del backend.

## 8. R17N
El R17N previo mantiene idempotencia PASS y writes autorizados=0. Ya no se considera final: debe reconstruirse incorporando el crosswalk 201/210 y manteniendo las 9 referencias restantes en HOLD hasta resolver su identidad con evidencia suficiente.

## 9. Bloqueo real actual
Quedan **9 referencias shopper HR** sin enlace canónico y **45 visitas** sin una visita histórica exacta suficiente para derivar el shopper. No existen conflictos multi-shopper.

No corresponde crear duplicados ni ocultar nombres. Corresponde reconciliar esas 9 referencias con la **identidad real autorizada** de shopper, sin publicar PII en GitHub y sin sobrescribir conflictos.

## 10. Ruta a producción
`RECONCILIAR 9 IDENTIDADES RESTANTES → R17N FINAL → IDEMPOTENCIA → WRITE PLAN EXACTO → AUTORIZACIÓN DE WRITES → MATERIALIZACIÓN DEV → SMOKE CX.data/Auth/RBAC → CORTES 6–8 → CUTOVER tya-plataforma`.

## 11. Claude/Academia
- Claude: no nueva candidata, no P0 nuevo, no reabrir V182. Al existir perfil canónico real, la UI autorizada debe mostrar identidad real; `Shopper protegido` no es identidad final.
- Academia: privacidad por rol, PII, perfil canónico, referencia HR, Auth, certificación y dedupe deben explicarse como capas distintas.
- Reusable CXOrbia: proveedor real → backend protegido → artefacto source-safe → crosswalk por evidencia → review de conflictos.

## 12. Estado seguro
Sin merge, producción, import real, Firestore/Auth/Storage/HR writes, deploy, pagos/lotes, Make ni Gemini.
