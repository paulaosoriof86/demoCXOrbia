# TyA — crosswalk read-only por identidad exacta de visita

- Fecha: 2026-07-30T01:58:54.408Z
- Firebase: `cxorbia-backend-dev`, tenant `tya`.
- Fuentes: HR source-safe + visitas existentes del backend canónico.
- Evidencia permitida: visitId, hrRowId o sourceSheet+sourceRow exactos.
- Los nombres de pestaña/HR row conservan espacios porque forman parte de la identidad operacional, no son PII de shopper.
- No se leen visitas del legacy.
- No se usa nombre, email ni teléfono para enlazar.

- Referencias HR: 210.
- Resueltas a shopper canónico existente: 201.
- Conflicto multi-shopper: 0.
- Sin evidencia exacta suficiente: 9.
- Visitas HR con shopperRef: 616.
- Visitas resueltas por identidad exacta: 571.
- Hash crosswalk: `9221098951aa03d34301273c3adc8f7773a410a39901432ec6f6e3040ce4720f`.

## Seguridad
- Firestore/Auth/Storage/HR writes: 0.
- Deploy/producción/merge: 0/false/false.
- PII cruda exportada: no.
