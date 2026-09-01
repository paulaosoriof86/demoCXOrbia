# CAMBIOS-BACKEND — Corte 6 · reconciliación de perfil extra recuperada y endurecida

**Fecha:** 2026-07-31  
**Estado:** `PROFILE_EXTRA_EXPORT_RECOVERED__RECONCILIATION_V2__ENCRYPTED_HANDOFF_READY__NO_WRITE__NO_DEPLOY`

## 1. Fuente existente recuperada
Se recuperó desde File Library el export ya entregado `tya-plataforma-default-rtdb-export (6).json`, con fecha 2026-07-30. No se pidió reenvío y no se conectó la RTDB legacy.

La lectura confirma que `tya_shoppers_extra` contiene perfiles reales con campos operativos y, en algunos registros, campos adicionales como username/user, WhatsApp/teléfono, email, país, ciudad, departamento, DPI/documento, dirección, fecha de nacimiento, certificaciones/histórico, términos y metadata de cuenta.

Password/UID legacy no se incorporan al perfil canónico.

## 2. Reconciliador v2
Se endureció `tools/qa/cxorbia-corte6-profile-extra-export-readonly.mjs`.

Reglas:
- preferencia por `root.tya_shoppers_extra`; wrappers conocidos son fallback;
- conserva object key cuando constituye ID técnico estable;
- excluye metadata `_eliminados`;
- match únicamente por `record.id` u object key técnico estable → `Firestore legacyShopperId` exacto;
- prohibido match por nombre, teléfono o email;
- duplicados, mismatch key/id o múltiples perfiles canónicos quedan HOLD;
- valor no vacío distinto queda conflicto; nunca overwrite;
- salida source-safe: solo conteos.

## 3. Separación por riesgo/autoridad
### Operativos `fill-missing` candidatos
username, teléfono/WhatsApp, email, país, ciudad y departamento.

### Sensibles — HOLD
DPI/documento, dirección y fecha de nacimiento.

No se escriben en `/shoppers/{id}` mientras las Rules actuales permitan leer esos documentos a `super/admin/ops/coordinador`. La seguridad real se decide en backend/Rules, no por ocultamiento UI.

### Evidencia únicamente
- `certs` / `histCerts`: las 77 certificaciones canónicas siguen siendo autoridad;
- `visitas`: las 616 visitas canónicas siguen siendo autoridad;
- activo/estado, aceptación de términos, aprobación/origen y rating: no copiar sin contrato semántico.

## 4. Handoff cifrado preparado
La File Library permite leer/verificar el export, pero no expone bytes/filesystem path reutilizable por GitHub/Node. Para superar esa frontera sin PII cruda se preparó:

- `tools/local/cxorbia-corte6-profile-extra-handoff.html`: OFFLINE; lee el export local, excluye pass/password y UID legacy, y cifra el bundle con RSA-OAEP + AES-GCM antes de disco;
- `tools/qa/cxorbia-corte6-profile-extra-handoff-dryrun.mjs`: descifra solo en memoria con el gate DEV y compara exacto contra Firestore;
- `.github/workflows/cxorbia-corte6-profile-extra-readonly.yml`: se dispara solo al ingresar el bundle cifrado, usa provider read-only y persiste exclusivamente evidencia source-safe;
- `backend/config/corte6-profile-extra-readonly-request.json`: `waiting_encrypted_bundle`, todos los writes/deploys en0.

La llave pública existente quedó explícitamente separada por dominio AAD para credenciales y perfil extra; la privada continúa cifrada en reposo.

## 5. Seguridad y no desviación
- Firestore writes: 0.
- Auth writes/password changes: 0.
- Rules deploys: 0.
- Hosting/Cloud Run deploys: 0.
- HR/legacy/Storage/payments/Make/Gemini writes: 0.
- Producción: false.
- Merge: false.
- No se copió DB legacy ni PII cruda al repo.

## 6. Tooling
Un intento documental de actualización encontró un `409` por SHA stale y se releyó el archivo antes de continuar; no produjo cambios parciales ni provider effects. El request de perfil extra quedó verificado en estado `waiting_encrypted_bundle`.

## 7. Clasificación
- **Reusable CXOrbia:** reconciliación por ID estable, fill-missing, separación operacional/sensible/evidence-only, cifrado antes de handoff y fail-closed.
- **Exclusivo cliente:** contenido real TyA de `tya_shoppers_extra`.
- **Claude/prototipo:** no rediseñar; consumir contrato protegido cuando quede disponible; no mostrar contraseña inventada.
- **Academia:** migración por contrato, PII protegida por backend/Rules, evidencia legacy vs estado canónico y handoff cifrado.
- **Sin impacto Claude:** Corte3, R17N, Corte5, Auth91/91, claims y Rules no se reabren.

## 8. Siguiente bloque exacto
`GENERAR BUNDLE CIFRADO DEL EXPORT YA EXISTENTE → RECONCILIACIÓN READ-ONLY AUTOMÁTICA → DELTA OPERATIVO EXACTO + HOLDS → COMBINAR CON USERNAME88 → AUTORIZACIÓN FIRESTORE ESPECÍFICA SI PROCEDE → READBACK → REDEPLOY DEV AUTORIZADO → VISUAL PROTEGIDA`.
