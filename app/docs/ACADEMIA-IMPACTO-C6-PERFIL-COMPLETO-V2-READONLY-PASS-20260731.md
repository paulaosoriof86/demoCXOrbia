# Academia — impacto Corte 6 perfil Shopper completo V2/V3 + Firestore WRITE/READBACK PASS

**Fecha:** 2026-07-31

## Contenido reusable para Academia
- separar fuente de perfil actual de fuentes canónicas de histórico/certificación;
- transportar PII/credenciales cifradas y descifrarlas solo en memoria;
- validar identidad por llave estable antes de cualquier write;
- usar bridges secundarios solo si son reproducibles: llave técnica exacta/única o UID Auth determinístico + custom claim validado;
- tratar nombre/teléfono/email como señales de revisión, no identidad automática;
- hacer provider compare read-only y write-plan cuantificado antes de autorizar mutaciones;
- usar autorización one-shot con alcance máximo explícito;
- revalidar drift antes de provider mutation;
- hacer readback completo después del write;
- mantener missing identities en HOLD en lugar de inventar vínculos;
- distinguir password legado visible para continuidad operativa de Firebase Auth como autoridad real de autenticación;
- un PASS técnico no reemplaza validación visual humana.

## Caso Corte6
V2/V3:151 registros fuente;120 matches exactos;31 HOLD sin vínculo reproducible;0 ambiguos/invalid;329 valores de perfil.

Write autorizado y consumido:
-120 Firestore document writes;
-118 documentos con cambios reales +2 marker-only;
-329 valores escritos;
- readback120 docs/329 campos;
- mismatches0;
- Auth/password resets0; deploys0; producción=false.

La autorización quedó consumida y no puede reutilizarse para el siguiente redeploy DEV.

## Impacto en manuales/cursos/rutas
- Admin/operación: perfil protegido completo y diferencia entre credencial legacy y login Auth.
- Shopper: identidad por claims/shopperId; no selector anónimo.
- Backend: encrypted handoff → read-only compare → identity bridge reproducible → plan → autorización exacta → write → readback → visual.
- Seguridad: ningún valor PII/password en repo, logs o evidencia source-safe.
- Migración: un registro sin vínculo exacto pasa a alta/conciliación explícita, no a deduplicación heurística.

## Clasificación
- **Reusable CXOrbia:** autorización one-shot, drift gate, readback, HOLD explícito.
- **Exclusivo cliente:** universo TyA y31 identidades pendientes.
- **Claude/prototipo:** sin rediseño; mostrar perfil real bajo runtime protegido.
- **Academia:** actualizar flujo técnico/operativo de migración y seguridad.
- **Sin impacto Claude:** evidencia backend y consumo del gate.

Siguiente hito didáctico: redeploy DEV protegido y validación visual humana; todavía no producción.
