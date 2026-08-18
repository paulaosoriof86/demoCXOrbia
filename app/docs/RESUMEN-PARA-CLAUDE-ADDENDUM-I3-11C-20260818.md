# RESUMEN PARA CLAUDE — Addendum I3.11C

Fecha: 2026-08-18
Estado: `SIN_CAMBIO_FRONTEND__FIRESTORE_RULES_DEV_GATE_PENDING`

No hay corrección UI ni tarea de prototipo para Claude en este bloque.

La causa del HOLD I3.11 quedó fuera de `/app/modules`: el runtime provider exacto está cargado y el bridge precompose está instalado, pero la lectura browser de `tenants/tya/shopperIdentityLinks` queda bloqueada porque el `firestore.rules` vigente no coincide con la versión DEV documentada como desplegada.

Claude debe preservar:
- módulos y UX actuales;
- IDs/contratos exactos de identidad;
- ausencia de fuzzy matching por nombre, correo o teléfono;
- I3.9/I3.10 congelados PASS;
- Historical Shopper sin reproceso.

Claude NO debe crear parche visual, hardcodear el shopper objetivo ni intentar compensar desde frontend una denegación de Firestore Rules.

Siguiente bloque backend, sujeto a autorización de Paula: un único deploy DEV de `firestore.rules` exacto y posterior validación Staff read-only. Sin Hosting, Auth writes, Firestore data writes, HR, Storage, Make, Gemini, pagos, merge o producción.

Clasificación: `Sin impacto Claude`.
