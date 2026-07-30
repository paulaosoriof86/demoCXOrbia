# TyA — crosswalk read-only por identidad exacta de visita

- Fecha: 2026-07-30T01:56:05.841Z
- Firebase: `cxorbia-backend-dev`, tenant `tya`.
- Fuentes: HR source-safe + visitas existentes del backend canónico.
- Evidencia permitida: visitId, hrRowId o sourceSheet+sourceRow exactos.
- No se leen visitas del legacy.
- No se usa nombre, email ni teléfono para enlazar.

- Referencias HR: 210.
- Resueltas a shopper canónico existente: 0.
- Conflicto multi-shopper: 0.
- Sin evidencia exacta suficiente: 210.
- Visitas HR con shopperRef: 616.
- Visitas resueltas por identidad exacta: 0.
- Hash crosswalk: `177cb13f3067c5feb035dc8ac5a33423ee73aafea8bc56ee86f9d048881bb9c5`.

## Seguridad
- Firestore/Auth/Storage/HR writes: 0.
- Deploy/producción/merge: 0/false/false.
- PII cruda exportada: no.
