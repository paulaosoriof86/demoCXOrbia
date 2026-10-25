# Cambios HR source-safe protected candidates

Fecha: 2026-07-09

Archivos creados:

- `backend/contracts/phase-a-hr-source-safe-to-protected-candidates-v1.json`
- `backend/config/phase-a-hr-source-safe-to-protected-candidates.source-safe.json`
- `backend/adapters/hr-source-safe-to-protected-candidates.preview.mjs`
- `tools/release/tya-hr-source-safe-protected-candidates-validate.mjs`
- `app/docs/PHASE-A-HR-SOURCE-SAFE-PROTECTED-CANDIDATES-20260709.md`

Tipo: backend dry-run reutilizable.

El bloque prepara candidatos protegidos desde un payload source-safe:

- referencias publicas de shoppers;
- candidatos de enlace de identidad;
- candidatos de carryover de certificacion;
- candidatos de liquidacion;
- candidatos de lote de pago;
- candidatos de reviewQueue;
- candidatos de auditoria.

Limites:

- sin lectura privada live;
- sin escritura Firestore;
- sin Auth real;
- sin usuarios reales;
- sin claims reales;
- sin pagos;
- sin writeback;
- sin Make/Gemini;
- sin produccion;
- sin informacion sensible.

Clasificacion:

- Reusable CXOrbia: si.
- Exclusivo cliente: no.
- Claude/prototipo: si.
- Academia: si.
