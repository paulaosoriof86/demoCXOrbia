# CAMBIOS-BACKEND.md

## 2026-07-30 — Corte 6 continuidad de credenciales: causa raíz corregida, dry-run91 PASS, ejecución bloqueada por autorización

Estado: `P0_C6_CREDENTIAL_CONTINUITY_ROOT_CAUSE_FIXED__NAMESPACED_DRYRUN91_PASS__IMPORT_AND_EXISTING_HOSTING_REDEPLOY_PREPARED_STATIC_PASS__WAITING_SINGLE_COMBINED_AUTHORIZATION__NO_PRODUCTION`.

### Qué se corrigió
El formulario DEV `Correo + Contraseña` era técnicamente válido para Firebase Auth pero rompía el contrato de acceso existente de TyA. La corrección conserva `Usuario + Contraseña` visible y mantiene Firebase Auth como autoridad detrás de un adapter.

Se detectó además una segunda causa raíz: el primer inventario de credenciales deduplicaba usernames globalmente entre staff y shopper. Se corrigió con namespaces `staff` y `shopper`, evitando eliminar accesos válidos por coincidencia de username entre perfiles.

### Fuente legacy / seguridad
- El export legacy se procesó localmente; la base anterior no se conecta al backend nuevo.
- El JSON crudo no se persiste en repo.
- Inventario source-safe v3: shoppers282; grupos seguros109; repeticiones exactas colapsadas93; grupos ambiguos18/77 registros HOLD; missing password2; missing login1.
- Staff4: superadmin1, coordinador2, demo1.
- Bundle cifrado corregido113; PII/login/password/hash legibles exportados0.

### Dry-run provider read-only
`READY_FOR_EXACT_AUTH_IMPORT_AUTHORIZATION`.
- input113;
- elegibles91 = shopper88 + super1 + coordinador2;
- shopper exact legacy match88;
- HOLD shopper_legacy_missing21;
- HOLD demo role1;
- UID collisions0;
- internal email collisions0;
- política `FAIL_CLOSED_NO_OVERWRITE`;
- SHA256 rounds1;
- provider/Auth/Firestore/Rules/Hosting writes0.

El dry-run previo de12 queda superseded y no debe ejecutarse.

### Runtime/Auth visible
`app/core/backend-browser-auth.js`:
- `Tipo de acceso` (`Administración / Coordinación` o `Shopper / Evaluador`);
- `Usuario`;
- `Contraseña`;
- email Firebase interno determinístico por tenant+namespace+username;
- namespace validado contra claims/rol;
- no password/token/UID en localStorage;
- no `app/modules/*` modificado.

### Import Auth preparado — apagado
Archivos:
- `tools/release/cxorbia-corte6-credential-import.mjs`;
- `backend/config/corte6-credential-import-request.json`;
- `.github/workflows/cxorbia-corte6-credential-import.yml`.

Scope preparado:
- máximo91 Auth imports;
- overwrite0;
- password resets0;
- deletes0;
- Firestore/Rules/Hosting/Storage/HR/legacy writes0;
- readback91/91 obligatorio;
- Auth total esperado17→108.

Gate estático/no-write: `PREPARED_C6_CREDENTIAL_IMPORT_NO_EXECUTE` PASS. Request continúa `enabled=false`.

### Hosting DEV adicional preparado — apagado
Archivos:
- `tools/release/cxorbia-corte6-credential-continuity-hosting-prepare.mjs`;
- reutiliza `tools/release/cxorbia-existing-hosting-dev-direct-deploy.mjs`;
- `backend/config/corte6-credential-continuity-hosting-request.json`;
- `.github/workflows/cxorbia-corte6-credential-continuity-hosting.yml`.

Solo puede ejecutar después de `PASS_EXACT_AUTH_IMPORT_READBACK` 91/91 y autorización expresa. Reutiliza el mismo Firebase/site/target; no crea Hosting ni proyecto.

Gate estático/no-write: `PREPARED_C6_CREDENTIAL_CONTINUITY_HOSTING_NO_EXECUTE` PASS. Request continúa `enabled=false`.

### Baseline preservada
- Corte3 FROZEN `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N 1,406/1,406 data writes/readback; no repetir.
- Corte5 CX.data PASS: `cinepolis`,14 periodos,616 visitas, periodo `2026-07`, Firestore/no fallback.
- Corte6 previo: claim writes5 + Rules release1 + Hosting DEV1/1 ya ejecutados.

### Claude/prototipo
No nueva candidata. No se tocó `app/modules/*`. La corrección reusable es separar contrato visible de acceso del identificador provider. P1/P2 preservados: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy de fuentes.

### Academia
Actualizar usuario ≠ email obligatorio; tipo de acceso/namespace; Auth detrás del adapter; recuperación; tenant/proyecto/rol; shopperId; dedupe seguro; import/readback y fail-closed.

### Siguiente bloque exacto
`AUTORIZACIÓN COMBINADA EXACTA → IMPORT AUTH MÁX91 → READBACK → SI PASS, UN REDEPLOY ADICIONAL MISMO HOSTING DEV → REMOTE VERIFY → VISUAL CON CREDENCIALES TYA EXISTENTES → FREEZE → AGOSTO`.

### Clasificación
- **Reusable CXOrbia:** identity adapter namespaced, hash import, claims, fail-closed, no-overwrite, one-shot deploy.
- **Exclusivo cliente:** credenciales legacy TyA y Agosto HN HOLD.
- **Claude/prototipo:** login/registro focalizado; no email provider visible.
- **Academia:** acceso, namespaces, recuperación y scopes.
- **Sin impacto Claude:** cifrado, requests, workflows, dry-run y evidencia source-safe.

### Estado seguro
Bloque credential-continuity actual: Auth imports0; password resets0; deletes0; Firestore data writes0; Rules0; Hosting adicional0; Storage/HR/legacy/payments/Make/Gemini0; merge=false; producción=false; PII/credenciales crudas repo/artifacts0.

---

## Histórico protegido
Los bloques previos permanecen en Git y en `app/docs/`. No reabrir Corte3, no repetir R17N y no crear nueva candidata/base/Hosting/rama/PR por rutina.
