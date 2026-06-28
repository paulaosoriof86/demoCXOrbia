# PENDIENTES-PROTOTIPO.md

Lista viva de pendientes detectados durante backend/migración. No modificar UI aquí; solo documentar para corrección posterior.

## 2026-06-27

### P0 — Confirmar repo definitivo de trabajo

- Estado: observado.
- Detalle: `paulaosoriof86/demoCXOrbia` fue confirmado por Paula como repo del prototipo modular aprobado para esta fase. `paulaosoriof86/cxorbia-tya-plataforma` no mostró claramente `/app` modular aprobado desde GitHub durante la revisión.
- Acción sugerida para Claude/Paula: definir si `demoCXOrbia` será renombrado/promovido o si sus cambios se trasladarán luego al repo privado definitivo.

### P1 — Storage pendiente por Blaze

- Estado: pendiente.
- Detalle: Storage no fue activado porque requiere plan Blaze.
- Acción sugerida: decidir si se activa Blaze en `cxorbia-backend-dev` o si Storage se deja para una fase posterior. No conectar Storage viejo como backend vivo.

### P1 — Validación de reglas Firebase

- Estado: pendiente.
- Detalle: `firestore.rules` contiene una base multi-tenant inicial. Debe validarse con emulador o Rules Playground antes de publicar.
- Acción sugerida: probar escenarios por rol: `super`, `admin`, `ops`, `shopper`, `cliente`.

### P2 — Adapter Firestore para `CX.data`

- Estado: pendiente.
- Detalle: aún no existe adapter backend. La UI hoy lee `CX.data` desde mock/localStorage.
- Acción sugerida: crear archivos nuevos en `/app/core/backend*.js`, manteniendo exactamente el contrato de `CX.data`.

### P2 — Datos reales

- Estado: pendiente.
- Detalle: no se ha migrado ningún dato real.
- Acción sugerida: preparar export limpio y piloto: 1 cliente/proyecto, 10 shoppers, 20 visitas; no conectar directo a base vieja.
