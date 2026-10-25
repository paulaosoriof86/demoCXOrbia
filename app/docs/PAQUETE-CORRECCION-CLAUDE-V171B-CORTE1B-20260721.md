# Paquete de corrección Claude — V171b / Corte 1B

Fecha: 2026-07-21
Estado: `P0_PROVEN_SHOPPER_IDENTITY_CORRECTION_REQUIRED`

## Regla de continuidad

Partir exactamente de la candidata acumulada V171b auditada. Preservar todas las mejoras acumuladas V165–V171: `CX.reportKit`, reportes multiformato por rol, multiproyecto, branding, gráficas, editor, Panorama, add-ons, Novedades y correcciones de los siete P0 de V170. No reconstruir desde V164 ni eliminar funcionalidades para ocultar el fallo.

## Alcance autorizado mínimo

- `app/modules/misvisitas.js`;
- `app/modules/reservas.js`;
- `app/modules/midia.js`;
- `app/app.js`, únicamente para restringir el fallback demo de identidad.

No modificar backend, `CX.data`, adapters live, contratos, Cloud Run, Hosting, IAM, HR ni producción.

## P0 demostrado

V171b todavía usa identidad fail-open para Shopper:

```js
const sid=(CX.session.user&&CX.session.user.shopperId)||'sh1';
```

En `misvisitas.js`, además, cuando no existe `visitsForShopper`, cae a `data.visitas()` y puede mostrar todas las visitas del periodo.

Una prueba reproducible con el archivo real de la candidata, una sesión Shopper sin `shopperId` y un fixture de `sh1` confirmó que la pantalla renderiza una visita ajena.

También permanecen caminos equivalentes en `reservas.js`, filtros amplios por estado en `midia.js` y un fallback `sh1` en `app.js` que debe quedar limitado exclusivamente a modo demo explícito.

## Correcciones obligatorias

### 1. `app/modules/misvisitas.js`

- Eliminar todo fallback `|| 'sh1'`.
- Sin `shopperId` verificable: cero filas, cero acciones y estado seguro de identidad pendiente.
- Si `CX.data.visitsForShopper` no existe: usar `[]`; queda prohibido caer a `CX.data.visitas()`.
- Todas las acciones deben revalidar la identidad antes de operar sobre una visita.

### 2. `app/modules/reservas.js`

- Eliminar `|| 'sh1'`.
- Sin identidad Shopper: cero reservas visibles, cero creación, cero aprobación y cero cancelación.
- Toda lectura y escritura local de reservas debe estar vinculada al `shopperId` real de sesión.

### 3. `app/modules/midia.js`

- En rol Shopper, “Mi Día”, “Tu próxima visita” y cualquier cronograma privado deben filtrar exclusivamente por `v.shopperId === shopperId`.
- El estado `asignada`, `agendada` o `realizada` nunca reemplaza la identidad.
- Las oportunidades generales deben permanecer únicamente en “Visitas Disponibles”, con sus reglas de elegibilidad, no mezclarse con visitas privadas.
- Sin `shopperId`: cero contenido privado.

### 4. `app/app.js`

- El fallback `sh1` solo puede existir bajo un guard explícito de modo demo, por ejemplo `CX.dataSource.mode === 'demo'` o helper equivalente ya vigente.
- En modo live/real, una sesión Shopper sin identidad debe bloquear el acceso a datos privados y mostrar un estado de configuración pendiente.
- No convertir selección visual de rol en autenticación o autorización real.

## Gates vinculantes

1. `node --check` en todos los JS tocados.
2. Cero fallback ejecutable `|| 'sh1'` en flujos live/real.
3. Fixture Shopper A: solo visitas, reservas y cronograma de A.
4. Fixture Shopper B: solo visitas, reservas y cronograma de B.
5. Sesión Shopper sin `shopperId`: cero filas privadas y cero acciones.
6. Ausencia de `visitsForShopper`: `misvisitas` permanece vacío; nunca usa `data.visitas()`.
7. Una visita de B con estado `agendada` no aparece en “Mi Día” de A.
8. El fallback demo queda probado únicamente con modo demo explícito.
9. `mireportes`, beneficios y demás vistas privadas conservan aislamiento por identidad.
10. Las siete correcciones V170 continúan pasando: router `super`, extensiones, facetas canónicas, add-ons por tenant/proyecto, geo-checkin fail-closed y reportes sin métricas inventadas.
11. Cero cambios backend/adapters/contratos/IAM/Hosting/producción.

## Entrega requerida

- candidata completa acumulada derivada de V171b;
- lista exacta de archivos modificados;
- delta por archivo y por P0;
- resultados de los fixtures A/B/sin identidad;
- búsqueda global de fallbacks `sh1` explicando cualquier aparición legítima de demo;
- capturas de Mis Visitas, Reservas y Mi Día para A y para sesión sin identidad;
- inventario y manifiesto reconciliados, rotulando correctamente bytes UTF-8;
- impacto Reusable CXOrbia, exclusivo TyA, Academia y sin impacto backend.

## Flujo posterior

`CANDIDATA V171B CORREGIDA → EXECUTION_LANE_READY → AUDITORÍA FOCALIZADA → GO: APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 1`
