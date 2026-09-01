# Pendientes prototipo addendum - Protected Firestore rules DEV draft

Fecha: 2026-07-09

## Pendientes para la próxima candidata Claude

1. Mostrar de forma genérica que datos públicos/source-safe y datos protegidos son capas distintas.
2. Si el usuario intenta abrir perfil completo sin Auth, mostrar `requiere acceso` o `pendiente Auth`.
3. No mostrar datos personales en preview público.
4. Representar roles configurables por tenant/proyecto.
5. Representar reviewQueue y auditEvents sin afirmar que ya escriben en Firestore.
6. Mostrar liquidaciones/pagos como estado auditado, no ejecución real.
7. Mantener copy honesto: reglas en draft, gates apagados, Auth pendiente.
8. No hardcodear cliente, proyecto, países, monedas, logos o fuentes.
9. Actualizar Academia vinculada a esta separación.

## No debe hacer Claude

- No simular que rules están desplegadas.
- No mostrar PII en preview.
- No mezclar perfil protegido con referencia pública.
- No prometer pagos ni integraciones reales.
