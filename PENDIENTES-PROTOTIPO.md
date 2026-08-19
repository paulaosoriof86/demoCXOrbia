# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-LIFECYCLE-PASS-25`

I4-A cerrado PASS; no reabrir.

Pendiente activo único: `I4B_VISIT_LIFECYCLE_READINESS__NO_PROVIDER_WRITES`.

Revisar/reutilizar ciclo existente: postulación→aprobación/asignación→agenda/reprogramación/cancelación→ejecución/evidencias→cuestionario→submit→review/auditoría→estado final. Identificar exactamente qué puede probarse sin writes y consolidar en **un solo** futuro gate cualquier Firestore/operational write necesario, evitando otra cadena de autorizaciones pequeñas.

Después: I4-C → I4-D → I4-E → I4-F → I5.
