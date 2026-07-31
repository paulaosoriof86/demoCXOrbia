# CAMBIOS-BACKEND — Corte 6 · reconciliación de perfil extra recuperada y endurecida

**Fecha:** 2026-07-31  
**Estado:** `PROFILE_EXTRA_EXPORT_RECOVERED__RECONCILIATION_V2_PREPARED__SENSITIVE_SCOPE_HELD__NO_WRITE__NO_DEPLOY`

## 1. Fuente existente recuperada
Se recuperó desde File Library el export ya entregado `tya-plataforma-default-rtdb-export (6).json`, con fecha 2026-07-30. No se pidió reenvío y no se conectó la RTDB legacy.

La lectura confirma que `tya_shoppers_extra` contiene perfiles reales con campos operativos y, en algunos registros, campos adicionales como:
- username/user;
- WhatsApp/teléfono;
- email;
- país, ciudad y departamento;
- DPI/documento;
- dirección y fecha de nacimiento;
- certificaciones e histórico de certificaciones;
- aceptación de términos, estado/aprobación de cuenta y origen de registro;
- contadores históricos legacy.

Password/UID legacy no se incorporan al perfil canónico.

## 2. Reconciliador v2
Se endureció `tools/qa/cxorbia-corte6-profile-extra-export-readonly.mjs`.

Reglas:
- entrada: export JSON existente con `tya_shoppers_extra`;
- preferencia por `root.tya_shoppers_extra`; wrappers conocidos son solo fallback;
- conserva object key cuando constituye ID técnico estable;
- excluye metadata `_eliminados`;
- match permitido únicamente por `record.id` o object key técnico estable → `Firestore legacyShopperId` exacto;
- prohibido match por nombre, teléfono o email;
- duplicados, mismatch key/id o múltiples perfiles canónicos quedan HOLD;
- cualquier valor ya existente distinto queda conflicto; nunca overwrite silencioso;
- salida source-safe: únicamente conteos, nunca valores personales.

## 3. Separación de campos por riesgo/autoridad
### Operativos `fill-missing` candidatos
- username;
- teléfono/WhatsApp;
- email;
- país;
- ciudad;
- departamento.

Estos pueden entrar al futuro delta exacto únicamente si el match estable es único y la fuente canónica está vacía.

### Sensibles — HOLD hasta almacenamiento/RBAC protegido
- DPI/documento;
- dirección;
- fecha de nacimiento.

No se planifican dentro del documento `shoppers` actual porque las Rules vigentes permiten leer ese documento a roles operador (`super/admin/ops/coordinador`). La seguridad real se decide en Rules/backend, no por ocultamiento UI.

### Evidencia únicamente; no copiar como estado canónico
- `certs` / `histCerts`: las 77 certificaciones canónicas ya materializadas siguen siendo autoridad; no duplicar intentos/historial dentro del perfil;
- `visitas`: las 616 visitas canónicas siguen siendo autoridad; el contador legacy no reemplaza el histórico;
- estado/activo, aceptación de términos, aprobación de cuenta, origen de registro y rating: se inventarían semánticas si se copian sin contrato; permanecen como evidencia de reconciliación.

## 4. Seguridad y no desviación
- Firestore writes: 0.
- Auth writes/password changes: 0.
- Rules deploys: 0.
- Hosting/Cloud Run deploys: 0.
- HR/legacy/Storage/payments/Make/Gemini writes: 0.
- Producción: false.
- Merge: false.
- No se copió DB legacy ni PII al repo.

## 5. Bloqueo técnico real restante
File Library permite leer/verificar el archivo, pero no entrega un filesystem path ni bytes reutilizables por el runner GitHub/Node. Por esa frontera de herramientas, el reconciliador v2 todavía no puede ejecutar el compare completo contra Firestore desde GitHub sin un handoff cifrado/local del mismo export.

No se sustituirá esto por conexión a la base vieja, transcripción manual de PII ni matching por nombre.

## 6. Clasificación
- **Reusable CXOrbia:** reconciliación por ID estable, fill-missing, separación operacional/sensible/evidence-only y fail-closed.
- **Exclusivo cliente:** contenido real TyA de `tya_shoppers_extra`.
- **Claude/prototipo:** no rediseñar; el perfil debe consumir el contrato protegido cuando quede disponible. No mostrar una contraseña inventada.
- **Academia:** migración por contrato, PII protegida por backend/Rules y diferencia entre evidencia legacy y estado canónico.
- **Sin impacto Claude:** Corte3, R17N, Corte5, Auth91/91, claims y Rules ya validados no se reabren.

## 7. Siguiente bloque exacto
`HANDOFF CIFRADO PERFIL EXTRA DEL EXPORT EXISTENTE → RECONCILIACIÓN V2 READ-ONLY CONTRA FIRESTORE → DELTA OPERATIVO EXACTO + HOLDS → COMBINAR CON USERNAME88 → AUTORIZACIÓN FIRESTORE ESPECÍFICA SI PROCEDE → READBACK → REDEPLOY DEV AUTORIZADO → VISUAL PROTEGIDA`.
