# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `P0_C6_CREDENTIAL_CONTINUITY_ROOT_CAUSE_FIXED__NAMESPACED_DRYRUN91_PASS__IMPORT_AND_EXISTING_HOSTING_REDEPLOY_PREPARED_STATIC_PASS__WAITING_SINGLE_COMBINED_AUTHORIZATION__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV existente: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar todavía.
- Sandbox C4: no destino.
- No crear nuevo Firebase, Hosting, rama, PR o candidata por rutina.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes de empalme/carril, Academia, patrones y antidesvío;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CORTE6-P0-CONTINUIDAD-CREDENCIALES-LEGACY-A-FIREBASE-20260730.md`;
6. `CORTE6-CREDENTIAL-HANDOFF-SEGURO-PREPARADO-20260730.md`;
7. `evidence/CORTE6-CREDENTIAL-INVENTORY-SOURCE-SAFE-V3.json`;
8. `evidence/CORTE6-CREDENTIAL-HANDOFF-DRYRUN-LATEST.json`;
9. `backend/config/corte6-credential-import-request.json`;
10. `backend/config/corte6-credential-continuity-hosting-request.json`;
11. `tools/release/cxorbia-corte6-credential-import.mjs`;
12. `tools/release/cxorbia-corte6-credential-continuity-hosting-prepare.mjs`;
13. `app/core/backend-browser-auth.js`;
14. `CAMBIOS-BACKEND.md`;
15. `RESUMEN-PARA-CLAUDE.md`;
16. `PENDIENTES-PROTOTIPO.md`;
17. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
18. `ACADEMIA-IMPACTO-CORTE6-AUTH-RBAC-20260730.md`;
19. evidencias R17N/CX.data/Corte6 Auth-Rules-Hosting cerradas;
20. PR #7 y HEAD vivo.

## 3. Baseline protegida — no reabrir
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL: 1,406/1,406 Firestore data writes y readback; mismatch0.
- Materializado: 616 visitas, 572 controles de liquidación, 77 certificaciones y perfiles previstos.
- Corte 5 `CX.data`: proyecto `cinepolis`, 14 periodos, 616 visitas, `currentPeriodId=2026-07`, source=firestore, fallback=false.
- Corte 6 previo: claims5/5 + Rules PASS; Hosting DEV existente 1/1 consumido y verificado.
- No repetir materialización ni reabrir snapshots superados.

## 4. Fuente real vigente
- HR materializada hasta julio 2026: 14 periodos /616 visitas /208 refs shopper.
- 208/208 refs listas →194 perfiles canónicos únicos.
- 77 certificaciones materializadas.
- 572 controles de liquidación.
- Agosto HN continúa HOLD por inconsistencia país/tab.

## 5. P0 Corte 6 — causa raíz cerrada en fuente
La pérdida de continuidad no era una necesidad de Gmail ni de correo visible. El error fue mezclar dos contratos:
- Firebase Auth requiere una identidad provider segura;
- TyA ya opera con `Usuario + Contraseña` y perfiles funcionales.

Además, el primer inventario offline deduplicaba usernames globalmente entre staff y shopper. Eso era incorrecto porque el mismo username puede existir legítimamente en namespaces diferentes.

Corrección canónica:
- namespaces de acceso `staff` y `shopper`;
- login visible `Tipo de acceso + Usuario + Contraseña`;
- Firebase usa email interno determinístico no visible;
- ninguna contraseña se guarda en repo/localStorage;
- ninguna identidad se infiere por nombre.

## 6. Inventario credential-continuity source-safe v3
Fuente legacy procesada localmente; valores crudos no persistidos en repo.

Shoppers:
- 282 registros fuente;
- 109 grupos de credencial seguros;
- 93 repeticiones exactas colapsadas solo si coinciden username normalizado + legacyId estable + hash;
- 18 grupos ambiguos /77 registros: HOLD;
- 2 sin password y1 sin login: HOLD.

Staff:
- 4 registros: superadmin1, coordinador2, demo1;
- namespace independiente `staff`.

Bundle cifrado corregido: 113 registros; provider writes0.

## 7. Dry-run provider read-only corregido — PASS
Decisión: `READY_FOR_EXACT_AUTH_IMPORT_AUTHORIZATION`.

- input cifrado:113;
- elegibles exactos:91;
- shoppers:88;
- staff:3 = super1 + coordinador2;
- shopper exact legacy match:88;
- 21 shoppers sin perfil canónico por `legacyShopperId`: HOLD;
- demo staff: HOLD por rol no productivo;
- UID/email collisions:0/0;
- política: `FAIL_CLOSED_NO_OVERWRITE`;
- hash import: SHA256 rounds1;
- provider/Auth/Firestore/Rules/Hosting writes:0.

El plan anterior de 12 identidades queda superado por la corrección de namespace y no debe ejecutarse.

## 8. Import Auth exacto preparado — NO ejecutado
- Máximo 91 identidades existentes legacy a materializar en Auth DEV.
- 88 shopper +1 super +2 coordinador.
- Mantener mismas credenciales legacy mediante import de hash; no reset.
- Claims tenant/project/role/shopperId exactos.
- No overwrite, deletes0, password resets0.
- Request `prepared_static_validation`, `enabled=false`.
- Gate CI estático/no-write: `PREPARED_C6_CREDENTIAL_IMPORT_NO_EXECUTE` PASS.

## 9. Hosting DEV continuidad preparado — NO ejecutado
- Solo sobre el mismo site `cxorbia-backend-dev`, target `cxorbia-dev`.
- No nuevo Firebase/Hosting.
- Publicará la fuente corregida `Usuario + Contraseña` con namespace y Firebase detrás del adapter.
- Requiere primero `PASS_EXACT_AUTH_IMPORT_READBACK` de las 91 identidades.
- Request `prepared_static_validation`, `enabled=false`.
- Gate CI estático/no-write: `PREPARED_C6_CREDENTIAL_CONTINUITY_HOSTING_NO_EXECUTE` PASS.
- Este será un redeploy adicional y requiere autorización nueva; la autorización Hosting anterior ya fue consumida.

## 10. Gate vivo único
`AUTORIZACIÓN COMBINADA EXACTA → AUTH IMPORT MÁX91 → READBACK → si PASS, UN REDEPLOY ADICIONAL MISMO HOSTING DEV → REMOTE VERIFY → VISUAL CON CREDENCIALES TYA EXISTENTES → FREEZE CORTE6`.

Después:
`REFRESH HR → RESOLVER HOLD AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER tya-plataforma`.

## 11. Claude / Academia
- Claude: no nueva candidata; `app/modules/*` no se toca. Login visible debe seguir contrato de producto, no copy/provider técnico.
- Academia: perfil de acceso, usuario ≠ email obligatorio, Auth detrás del adapter, namespace staff/shopper, recuperación, scopes y fail-closed.

## 12. Estado seguro
R17N histórico: 1,406 Firestore data writes cerrados. Corte6 previo: claim writes5 + Rules release1 + Hosting DEV1/1 ya ejecutados. Bloque credential-continuity actual: Auth imports0; password resets0; deletes0; Firestore data writes0; Rules0; Hosting adicional0; Storage/HR/legacy/Make/Gemini/pagos0; merge=false; producción=false; credenciales/PII crudas repo/artifacts0.
