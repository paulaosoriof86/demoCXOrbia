# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__C5_DEV_MATERIALIZED_1406_CXDATA_PASS__C6_AUTH_RULES_HOSTING_TECH_PASS__P0_CREDENTIAL_CONTINUITY`

## 1. Estado general
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Baseline frontend `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- Backend DEV canónico `cxorbia-backend-dev`.
- Hosting DEV existente `cxorbia-backend-dev.web.app`, target `cxorbia-dev`.
- Hosting público final futuro `tya-plataforma`.
- No nueva candidata/base/rama/PR/Hosting.

## 2. Bloques cerrados
### Corte 1 / 2A / 3
FROZEN/APROBADO. Corte 3: 14 periodos/616 visitas, mayo44 pagadas, junio2 pagadas/42 pendientes.

### Corte 4 — preparación/mapping
CERRADO para materialización: HR hasta julio, 208/208 refs, 194 perfiles canónicos, 77 certificaciones, write plan idempotente.

### Corte 5 — materialización DEV + CX.data
- 1,406/1,406 Firestore data writes y readback; mismatch0.
- 616 visitas, 572 controles de liquidación, 77 certificaciones.
- P0 proyecto/periodo corregido focalmente.
- Re-smoke final PASS: source=firestore, fallback=false, projects1, periods14, visits616, currentProjectId=`cinepolis`, currentPeriodId=`2026-07`, blockers0.
- No repetir materialización.

### Corte 6 — Auth/RBAC + Rules + Hosting DEV técnico
**PASS técnico.**
- claims 5/5: cliente2 + shopper3 exactos;
- readiness operador7/cliente2/shopper3;
- Firestore Rules release/readback PASS;
- Firestore data writes0;
- Hosting DEV existente 1/1 consumido, sin nuevo Firebase/Hosting;
- release/version remotos FINALIZED y entrypoint explícito PASS.

## 3. P0 vivo — continuidad de credenciales
El login DEV visible `Correo + Contraseña` demostró una pérdida de continuidad funcional: la identidad provider es necesaria, pero el usuario final no debe ser forzado a adoptar correos/credenciales DEV nuevas.

Inventario read-only:
- shoppers canónicos inventariados: `user/username/login`=0; `pass/password`=0;
- users canónicos: 0;
- tenant login config: 0;
- Firebase Auth: 17 cuentas técnicas email/password.

Decisión: preservar `Usuario + Contraseña` como contrato visible y poner Firebase Auth detrás de un adapter. Fuente legacy solo por export/import controlado, sin conectar la base anterior.

## 4. Gate actual exacto
`EXPORT CREDENCIALES LEGACY CONTROLADO → INVENTARIO/HASH-TYPE → PLAN AUTH IMPORT IDEMPOTENTE → AUTORIZACIÓN ÚNICA → IMPORT/READBACK → LOGIN USUARIO+CONTRASEÑA → SMOKE ADMIN/OPS/CLIENTE/SHOPPER → FREEZE CORTE6`.

No crear Gmail nuevo ni pedir credenciales DEV a Paula.

## 5. Agosto
- Fuente canónica materializada termina julio 2026.
- Agosto HN HOLD por inconsistencia país/tab.
- Después de FREEZE Corte6: refresh fuente → resolver HOLD → validar periodo/visitas → materializar solo delta agosto.

## 6. Siguiente bloque exacto
`CREDENTIAL CONTINUITY → FREEZE CORTE6 → AGOSTO DELTA → CORTE8 PREPROD/CUTOVER`.

## 7. Claude/prototipo
No nueva candidata. Corrección focalizada login/registro: Usuario+Contraseña visible, Firebase detrás del adapter, sin mover lógica Auth/claims/Firestore a módulos. P1/P2 preservados: PDF gráfica, Excel formato, reportKit/copy.

## 8. Academia
Actualizar identidad provider detrás del login, usuario ≠ email obligatorio, recuperación de acceso, tenant/proyecto/rol, shopperId exacto y mínimo privilegio.

## 9. Clasificación
- `Reusable CXOrbia`: credential adapter, Auth/claims, import idempotente y fail-closed.
- `Exclusivo cliente`: fuente legacy TyA, credenciales históricas y Agosto HN.
- `Claude/prototipo`: login/registro focalizado.
- `Academia`: identidad/acceso/scopes.
- `Sin impacto Claude`: inventarios, gates y readback.

## 10. Estado seguro
R17N previo: 1,406 data writes. Corte6: Auth claim writes5 ya autorizados; Firestore data writes0; Rules release1; Hosting1/1; usuarios nuevos/password changes/deletes0; inventario credential-continuity provider writes0; Storage/HR/legacy0; payments0; merge=false; production=false; Make/Gemini0; credenciales crudas0.
