# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `P0_C6_CREDENTIAL_CONTINUITY_ROOT_CAUSE_FIXED__NAMESPACED_DRYRUN91_PASS__IMPORT_AND_EXISTING_HOSTING_REDEPLOY_PREPARED_STATIC_PASS__WAITING_SINGLE_COMBINED_AUTHORIZATION__NO_PRODUCTION`

## 1. Repositorio y destinos fijos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV existente: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar todavía.
- No nueva base/Hosting/rama/PR/candidata.

## 2. Baseline que no se reabre
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL DEV: 1,406/1,406 Firestore data writes/readback, mismatch0.
- Materializado: foundation16 + perfiles125 + certificaciones77 + visitas616 + controles liquidación572.
- Corte 5 `CX.data`: re-smoke PASS source=firestore, fallback=false, project=`cinepolis`, periods14, visits616, currentPeriodId=`2026-07`.
- No repetir los 1,406 writes históricos.

## 3. Corte 6 previo preservado
- Claims autorizados: 5/5 sobre cuentas técnicas DEV; clientes2 + shoppers3 exactos.
- Rules release/readback SHA exacto PASS.
- Firestore data writes Corte6:0.
- Hosting DEV existente previo: 1/1 consumido, release/version FINALIZED, entrypoint explícito PASS.
- Esa autorización anterior está consumida y no habilita otro redeploy.

## 4. P0 continuidad de credenciales — causa raíz resuelta en fuente
La pantalla `Correo + Contraseña` rompía continuidad funcional aunque Firebase Auth fuera técnicamente correcto. TyA debe conservar `Usuario + Contraseña`; Firebase queda detrás del adapter.

Hallazgo adicional de raíz: el primer parser de credenciales consideraba duplicado un username aunque apareciera en perfiles distintos. Eso podía eliminar un acceso staff válido cuando coincidía con un shopper.

Corrección:
- namespaces `staff` / `shopper`;
- login visible `Tipo de acceso + Usuario + Contraseña`;
- identificador Firebase interno determinístico por tenant+namespace+username;
- no correo técnico visible;
- no password/token/UID persistido en localStorage;
- claims verifican namespace/rol fail-closed.

## 5. Fuente legacy procesada de forma segura
El export legacy fue procesado fuera del runtime del sistema nuevo. No se conecta la base antigua y no se sube el JSON crudo al repo.

Inventario source-safe v3:
- shoppers fuente282;
- grupos de credencial shopper seguros109;
- 93 repeticiones exactas colapsadas solo con username normalizado + legacyId + hash idénticos;
- 18 grupos ambiguos /77 registros: HOLD;
- sin password2; sin login1: HOLD;
- staff fuente4: superadmin1, coordinador2, demo1;
- bundle cifrado corregido:113 registros;
- provider writes0; PII/login/password/hash legible exportado0.

## 6. Dry-run provider read-only — PASS corregido
`READY_FOR_EXACT_AUTH_IMPORT_AUTHORIZATION`.

Entrada cifrada113 → elegibles91:
- shopper88;
- super1;
- coordinador2.

HOLD:
- 21 shopper credentials sin match exacto a perfil canónico por `legacyShopperId`;
- 1 usuario demo por rol no productivo.

Controles:
- shopper exact matches88;
- UID collisions0;
- internal-email collisions0;
- `FAIL_CLOSED_NO_OVERWRITE`;
- hash contract SHA256/rounds1;
- provider/Auth/Firestore/Rules/Hosting writes0.

El dry-run previo de 12 queda superseded; no ejecutar.

## 7. Import Auth exacto preparado — bloqueado por autorización
Preparado:
- `tools/release/cxorbia-corte6-credential-import.mjs`;
- `backend/config/corte6-credential-import-request.json`;
- `.github/workflows/cxorbia-corte6-credential-import.yml`.

Scope exacto si Paula autoriza:
- máximo91 nuevos registros Auth derivados de credenciales legacy existentes;
- no crear contraseñas nuevas: importar hash existente;
- no resetear passwords;
- no borrar usuarios;
- no sobrescribir UID/email existentes;
- claims exactos tenant/project/role/namespace y shopperId para shoppers;
- readback obligatorio 91/91 y conteo Auth esperado17→108;
- si existe drift/collision/fallo parcial: HOLD.

Gate estático no-write: `PREPARED_C6_CREDENTIAL_IMPORT_NO_EXECUTE` PASS.

## 8. Redeploy adicional del mismo Hosting DEV preparado — bloqueado por autorización
Preparado:
- `tools/release/cxorbia-corte6-credential-continuity-hosting-prepare.mjs`;
- reutiliza `tools/release/cxorbia-existing-hosting-dev-direct-deploy.mjs` por API oficial Firebase Hosting;
- `backend/config/corte6-credential-continuity-hosting-request.json`;
- `.github/workflows/cxorbia-corte6-credential-continuity-hosting.yml`.

Solo se habilita si el import Auth anterior devuelve `PASS_EXACT_AUTH_IMPORT_READBACK` con91/91.

Scope:
- un único redeploy adicional al mismo site `cxorbia-backend-dev` / target `cxorbia-dev`;
- publica login `Usuario + Contraseña` namespaced;
- remote verify de browser-auth, entrypoint y proof;
- nuevo Firebase/Hosting0/0;
- Auth writes durante Hosting0; Firestore/Rules/Storage/HR/legacy writes0.

Gate estático no-write: `PREPARED_C6_CREDENTIAL_CONTINUITY_HOSTING_NO_EXECUTE` PASS.

## 9. Gate vivo único
`AUTORIZACIÓN COMBINADA EXACTA → AUTH IMPORT MÁX91 → READBACK → SI PASS: UN REDEPLOY ADICIONAL MISMO HOSTING DEV → REMOTE VERIFY → VISUAL CON CREDENCIALES TYA EXISTENTES → FREEZE CORTE6`.

No pedir Gmail nuevo. No pedir a Paula credenciales técnicas DEV. No compartir passwords por chat.

## 10. Agosto
- Fuente materializada llega hasta julio 2026: 14 periodos/616 visitas.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después de FREEZE Corte6: refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 11. Claude / prototipo
- No nueva candidata.
- No tocar `app/modules/*` desde backend.
- Contrato visible de acceso: `Tipo de acceso + Usuario + Contraseña`; provider interno no se expone.
- P1/P2 no bloqueante: PDF sin gráfica, Excel sin formato final, reportKit/exportaciones y copy de fuentes.

## 12. Academia
Actualizar: identidad provider detrás del login, namespace staff/shopper, usuario ≠ email obligatorio, recuperación/cambio de contraseña, tenant/proyecto/rol, shopperId exacto, dedupe seguro y fail-closed.

## 13. Clasificación
- `Reusable CXOrbia`: identity adapter namespaced, hash import, Auth/claims, import idempotente, cifrado de handoff, fail-closed.
- `Exclusivo cliente`: credenciales legacy TyA y Agosto HN.
- `Claude/prototipo`: UX focalizada de login/registro.
- `Academia`: acceso, recuperación, scopes y namespaces.
- `Sin impacto Claude`: inventarios, cifrado, dry-run, requests/workflows/gates.

## 14. Estado seguro
R17N previo: 1,406 Firestore data writes cerrados. Corte6 previo: Auth claim writes5 + Rules release1 + Hosting DEV1/1. Bloque credential-continuity actual: Auth imports0; password resets0; deletes0; Firestore data writes0; Rules0; Hosting adicional0; Storage/HR/legacy/payments/Make/Gemini0; merge=false; producción=false; credenciales/PII crudas repo/artifacts0.

## 15. Siguiente bloque exacto
`AUTORIZACIÓN ÚNICA IMPORT AUTH MÁX91 + REDEPLOY ADICIONAL MISMO HOSTING DEV CONDICIONADO A READBACK PASS → SMOKE CREDENCIALES EXISTENTES → FREEZE → AGOSTO`.
