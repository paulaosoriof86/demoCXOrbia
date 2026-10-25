# Pendientes prototipo addendum protected read access adapter

Fecha: 2026-07-09

Claude/prototipo debe representar de forma generica:

1. Preview publico separado de vista protegida.
2. Perfil completo bloqueado por Auth/roles.
3. Personas operativas configurables.
4. Roles tecnicos separados de cargos visibles.
5. Scopes por tenant, pais, proyecto y propio perfil.
6. Estados honestos: gate apagado, pendiente Auth, requiere acceso, preview source-safe.
7. Cliente/marca evaluada sin acceso a datos operativos protegidos.
8. Shopper/evaluador solo propio perfil.
9. Finanzas sin datos crudos sensibles.
10. ReviewQueue y auditEvent visibles como conceptos operativos.

No hardcodear nombres de tenant, proyecto, pais, moneda, fuente, reglas ni personas.
