# TyA — crosswalk read-only por identidad exacta de visita

- Fecha: 2026-07-30T02:59:42.595Z
- Firebase: `cxorbia-backend-dev`, tenant `tya`.
- Fuentes: HR source-safe + visitas existentes del backend canónico.
- Evidencia permitida: visitId, hrRowId o sourceSheet+sourceRow exactos.
- Los nombres de pestaña/HR row conservan espacios porque forman parte de la identidad operacional, no son PII de shopper.
- No se leen visitas del legacy.
- No se usa nombre, email ni teléfono para enlazar.

- Referencias HR: 208.
- Resueltas a shopper canónico existente: 201.
- Conflicto multi-shopper: 0.
- Sin evidencia exacta suficiente: 7.
- Visitas HR con shopperRef: 616.
- Visitas resueltas por identidad exacta: 571.
- Hash crosswalk: `309cb8e76d1a7e21082ea675a7dfa92a80ec41c706a770192e251f8584dce1c3`.

## Seguridad
- Firestore/Auth/Storage/HR writes: 0.
- Deploy/producción/merge: 0/false/false.
- PII cruda exportada: no.
