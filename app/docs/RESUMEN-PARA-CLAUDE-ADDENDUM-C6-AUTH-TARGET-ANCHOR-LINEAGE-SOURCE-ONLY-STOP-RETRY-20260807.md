# RESUMEN PARA CLAUDE — C6 AUTH TARGET ANCHOR LINEAGE

Fecha: 2026-08-07

No tocar frontend. Este bloque fue exclusivamente backend/source-only.

Estado preservado: plan Auth final 340 filas, HOLD=0, AuthExecuted=false; SKIP13 y multi-Auth cerrados; producción intacta.

Hallazgo: el target `ac93d90d9e41512acdcd` usa `multi_source_full_name_consensus`, pero las evidencias source-safe no conservan el par exacto de bases que corroboró el apellido. Se demostró únicamente la regla estructural y los fingerprints congelados. No existe ajuste UI derivado.

Pendiente backend: bajo autorización separada, reconstruir transitoriamente el consenso con registros target-linked, confirmar `baseLoginFp` y `targetLoginFp`, y solo después resolver un único Auth candidate y snapshot password.

Academia: sin cambio de contenido ahora; cuando Auth quede activado, mantener rutas y manuales por rol sincronizados.
