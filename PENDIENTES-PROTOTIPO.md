# PENDIENTES-PROTOTIPO.md

Lista viva de pendientes detectados durante backend/migración. No modificar UI aquí; solo documentar para corrección posterior.

## 2026-06-27

### P0 — Separar prototipo comercializable y tenant T&A

- Estado: definido.
- Detalle: `paulaosoriof86/demoCXOrbia` es el repo del prototipo modular aprobado y seguirá como plataforma comercializable. T&A Consultores será el primer cliente/tenant real migrado a CXOrbia.
- Acción sugerida para Claude/Paula: mantener CXOrbia genérico y multi-tenant; no hardcodear T&A, Cinépolis, shoppers reales ni URLs productivas dentro de módulos o core UI.

### P0 — Confirmar repo definitivo de producción

- Estado: pendiente administrativo.
- Detalle: `paulaosoriof86/demoCXOrbia` fue confirmado por Paula como repo del prototipo modular aprobado para esta fase. `paulaosoriof86/cxorbia-tya-plataforma` no mostró claramente `/app` modular aprobado desde GitHub durante la revisión.
- Acción sugerida para Claude/Paula: definir más adelante si `demoCXOrbia` será renombrado/promovido, si se mantendrá como prototipo comercial, o si los cambios se replicarán al repo privado definitivo de T&A.

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

### P2 — Datos reales T&A

- Estado: pendiente.
- Detalle: no se ha migrado ningún dato real. T&A debe entrar como tenant `tya`, no como lógica fija del prototipo.
- Acción sugerida: preparar export limpio y piloto: 1 cliente/proyecto, 10 shoppers, 20 visitas; no conectar directo a base vieja.
