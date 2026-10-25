# CXOrbia TyA — momentos de validación en plataforma

Fecha: 2026-07-13

## Propósito

Definir cuándo Paula debe volver a revisar la plataforma y qué debe comprobar en cada momento. No se solicitará revisión visual después de cada script o gate backend; solo en hitos donde la revisión humana pueda confirmar datos, roles o operación real.

## Checkpoint 0 — disponible ahora

URL DEV:

`https://cxorbia-backend-dev.web.app`

Estado:

- build source-safe R15F/R16D desplegada;
- 14 periodos;
- 616 visitas;
- 210 shoppers live source-safe;
- GT 476 / HN 140;
- junio 44/44 con evidencia;
- 13/13 rutas por rol;
- 0 errores de consola o página.

Qué puede validar Paula ahora:

- navegación y módulos;
- estructura de Dashboard, Proyectos, Visitas, Shoppers, Finanzas y Academia;
- países, periodos y cobertura histórica source-safe;
- que junio no aparezca como visitas pendientes;
- que los estados no prometan pago, certificación, sincronización o producción real.

Qué NO debe validar todavía como migración definitiva:

- coincidencia documento por documento contra Firestore materializado;
- Auth/claims reales por usuario;
- certificaciones carryover materializadas;
- liquidaciones/pagos definitivos;
- sincronización HR ↔ plataforma;
- producción.

Este checkpoint sirve para validar la build y la representación source-safe, no para aprobar todavía la migración final.

## Checkpoint 1 — después de R16E read-only

R16E compara el plan canónico contra Firestore DEV y clasifica cada documento como:

- `create`;
- `update`;
- `noop`;
- `review`.

Este checkpoint no cambia la plataforma y no requiere revisión visual de Paula. Su función es impedir que la materialización sobrescriba silenciosamente datos existentes.

Estado actual de R16E:

- precheck PASS;
- normalización de flags source-safe PASS;
- comparación llegó al proveedor;
- Firestore bloqueó en `provider_query_tenant` por `RESOURCE_EXHAUSTED: Quota exceeded`;
- 0 writes, 0 imports, 0 deploy y 0 datos de proveedor persistidos.

No se repetirá la consulta hasta que la cuota esté disponible.

## Checkpoint 2 — primera revisión fuerte de migración

Momento: después de aprobar y ejecutar la materialización controlada en Firestore DEV.

Esta será la primera revisión en la que Paula podrá comprobar que la información migrada está realmente conectada a la plataforma y no solo representada por el payload source-safe.

Módulos a revisar:

1. Proyectos: TyA/Cinépolis como proyecto configurable, no hardcode global.
2. Histórico: 14 periodos y 616 visitas.
3. Visitas: país, periodo, sucursal, estado, shopper y fechas.
4. Shoppers: 210 registros live y cola separada para el gap de 3.
5. Liquidaciones: 572 controles, 196 overlays exactos y 376 pendientes de fuente exacta.
6. Finanzas: 247 filas R14C y 92 ítems en revisión, sin marcar pagos inferidos.
7. Certificaciones: 213 candidatos pendientes de fuente; no certificados por inferencia.
8. Import histórico: trazabilidad por fuente, periodo, país y llaves estables.

Criterio de aprobación:

- conteos correctos;
- muestras representativas GT/HN;
- junio tratado como pagos/liquidaciones pendientes, no visitas pendientes;
- ausencia de duplicados;
- conflictos en reviewQueue;
- cero pagos o certificaciones inventados.

## Checkpoint 3 — validación por usuarios y roles

Momento: después del gate separado de Auth/claims DEV.

Paula revisará con perfiles controlados:

- Superadmin/Admin;
- Operativo;
- Shopper;
- Cliente.

Se comprobará:

- alcance por tenant/proyecto/país;
- rutas y acciones permitidas;
- Mi Perfil shopper;
- visitas asignadas y disponibles;
- datos visibles por rol;
- ausencia de exposición de información sensible;
- Academia y notificaciones por rol.

## Checkpoint 4 — prueba operativa completa TyA

Momento: después de habilitar de forma controlada los bloques de sincronización HR/plataforma, certificaciones fuente y liquidaciones/pagos.

Casos mínimos:

- HR → plataforma;
- plataforma → HR;
- asignación sin duplicado;
- conflicto enviado a revisión;
- visita sale de disponibles al asignarse;
- cuestionario configurable por proyecto/visita;
- certificación ya presentada conservada;
- liquidación de junio visible con estado real;
- pago nunca confirmado por inferencia.

Este checkpoint requiere gates separados para Make/writeback y no se confunde con Hosting DEV.

## Checkpoint 5 — ensayo final antes de producción

Momento: después de cerrar blockers de Phase A y antes del cutover.

Paula realizará una validación final con un corte congelado:

- conteos globales y por país/periodo;
- muestras de shoppers, visitas, certificaciones y liquidaciones;
- roles y permisos;
- sincronización;
- evidencias y trazabilidad;
- rollback;
- checklist de salida.

Solo después de este checkpoint se podrá solicitar autorización de producción.

## Cadencia acordada

Paula vuelve a revisar plataforma en cuatro momentos relevantes:

1. ahora, como source-safe DEV;
2. después de materialización Firestore DEV;
3. después de Auth/roles y fuentes pendientes;
4. antes de producción.

R16E y otros comparadores backend no generarán revisiones visuales innecesarias.

## Clasificación

- **Reusable CXOrbia:** checkpoints separados para source-safe, materialización, Auth, operación y producción.
- **Exclusivo cliente:** conteos y casos TyA/Cinépolis.
- **Claude/prototipo:** conservar estados visibles y honestos; no requiere nueva candidata por este bloque.
- **Academia:** incorporar una guía de ambientes, checkpoints y criterios de aceptación por rol.
- **Sin impacto Claude:** comparación proveedor, cuota Firestore, hashes y artifacts.
