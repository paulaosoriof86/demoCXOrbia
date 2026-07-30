# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `P0_PROVEN_C6_CREDENTIAL_CONTINUITY_GAP__NO_NEW_CANDIDATE__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- M1 / Corte 1 / Corte 2A: FROZEN/APROBADO.
- Corte 3: `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- R17N FINAL: 1,406/1,406 Firestore data writes/readback; no repetir.
- Corte 5 proyecto/periodo: corregido, re-smoke PASS.
- Corte 6 Auth/RBAC: 5/5 claim updates PASS; operador7/cliente2/shopper3 ready.
- Firestore Rules: desplegada/readback PASS.
- Hosting DEV existente: deploy 1/1 consumido y entrypoint explícito remoto PASS.
- No V183/R33, nueva base, Hosting, rama o PR.

## 2. P0 vivo — continuidad de credenciales/login
La visual DEV actual muestra `Correo + Contraseña`, pero ese identificador visible no corresponde al contrato operativo que debe conservarse.

Inventario read-only comprobado:
- `tenants/tya/shoppers`: `user/username/login`=0; `pass/password`=0;
- `tenants/tya/users`: 0 docs;
- tenant profile: sin configuración login persistida;
- Firebase Auth: 17 cuentas técnicas con password provider + identificador email.

Por tanto las credenciales legacy no están en el backend canónico. No crear Gmail nuevo, no pedir a Paula que adopte cuentas DEV y no presentar el correo Firebase como login final.

## 3. Corrección focalizada Claude/prototipo
No nueva candidata. La tarea visible, cuando el backend cierre el import de identidad, es únicamente:
- mantener accesos configurables por perfil/rol;
- formulario `Usuario + Contraseña`;
- Firebase Auth detrás del adapter;
- sin passwords/tokens en localStorage;
- recuperación/cambio de contraseña explícitos;
- no exponer correo interno provider, UID, claims o IDs técnicos;
- validar generación/registro de credenciales con función real existente.

No mover lógica Firestore/Auth/claims a `app/modules/*`.

## 4. Dependencia backend antes del smoke visual
`EXPORT CREDENCIALES LEGACY CONTROLADO → INVENTARIO/HASH-TYPE → PLAN AUTH IMPORT IDEMPOTENTE → AUTORIZACIÓN ÚNICA → IMPORT/READBACK → LOGIN USUARIO+CONTRASEÑA`.

Solo después se hace smoke Admin/Ops/Cliente/Shopper y freeze Corte6.

## 5. Pendientes P1/P2 no bloqueantes
- PDF: gráfica ausente al imprimir/exportar.
- Excel: formato básico/no final.
- `reportKit`: consolidación transversal y exportaciones fuera de Dashboard.
- copy de fuentes/readiness: mantener lenguaje humano, no técnico.

## 6. Agosto — dependencia backend/fuente
- Fuente materializada termina julio 2026.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después de FREEZE Corte6: refresh HR → resolver HOLD → validar visitas → materializar solo delta agosto.
- No construir agosto manualmente desde frontend y no repetir histórico.

## 7. Holds preservados
- existing profile updates22;
- legacy holds7;
- certification hold1;
- Agosto HN;
- deletes;
- pagos/lotes;
- Make/Gemini/Storage reales.

## 8. Academia/manuales
Actualizar: usuario ≠ email obligatorio; Firebase Auth como autoridad detrás del login; tenant/proyecto/rol; shopperId exacto; recuperación de acceso; mínimo privilegio; conflicto a revisión humana.

## 9. Estado seguro
Corte6: Auth claim writes5 ya autorizados; usuarios nuevos/password changes/deletes0; Firestore data writes0; Rules release1; Hosting DEV1/1; inventario credential-continuity provider writes0; Storage/HR/legacy0; pagos/Make/Gemini0; merge=false; producción=false; credenciales crudas0.
