# CAMBIOS-BACKEND — Corte 6 · reconciliación de perfil extra preparada

**Fecha:** 2026-07-31  
**Estado:** `PROFILE_EXTRA_EXPORT_RECONCILIATION_PREPARED__WAITING_EXISTING_FILELIBRARY_SOURCE__NO_WRITE`

Se preparó `tools/qa/cxorbia-corte6-profile-extra-export-readonly.mjs` para procesar el export ya entregado sin conectar la RTDB legacy.

Contrato:
- entrada: JSON exportado existente con `tya_shoppers_extra`;
- match permitido únicamente `export.id → Firestore legacyShopperId` exacto;
- prohibido match por nombre/teléfono;
- compara username, teléfono/WhatsApp, email, país, ciudad, DPI/documento, certificaciones, visitas y estado;
- planifica solo `fill-missing`;
- cualquier diferencia contra un valor ya existente se clasifica conflicto; no overwrite automático;
- password excluido del delta de perfil;
- evidencia final contiene solo conteos, nunca valores personales.

El export ya existe en File Library, pero el servicio de recuperación está devolviendo `RetrievalClientResponseError` en esta sesión. No se solicita reenvío mientras se pueda recuperar el insumo ya entregado.

No se ejecutó este reconciliador todavía. Firestore/Auth/legacy/HR writes0; deploys0; producción=false; merge=false.
