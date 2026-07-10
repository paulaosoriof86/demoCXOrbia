# Resumen addendum - Protected Firestore rules DEV draft

Fecha: 2026-07-09

## Para Claude/prototipo

Debe representar que la plataforma distingue entre:

- preview público source-safe;
- perfil protegido con Auth/RBAC;
- reviewQueue;
- auditEvents;
- liquidaciones/pagos auditados sin ejecución real;
- reglas draft no desplegadas.

No debe mostrar PII en preview público ni sugerir que Auth/Firestore rules están activos si siguen en gate.

## Para backend

Se agregó un draft de reglas Firestore DEV alineado al esquema protegido. Todas las escrituras están bloqueadas. Las lecturas protegidas dependen de roles Phase A y Auth, pero el archivo es draft y no está desplegado.

## Para Academia

Debe explicar la diferencia entre datos source-safe y datos protegidos, roles de acceso, campos prohibidos, gates, auditEvents y reviewQueue.

## Estado seguro

No producción, no deploy, no Auth real, no Firestore writes, no imports, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.
