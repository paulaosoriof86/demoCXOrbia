# Paquete acumulado Claude — V104 frontend-only

Fecha: 2026-07-11

## Corrección

El paquete post-smoke R5 anterior era acotado a cuatro correcciones y **no era el paquete acumulado completo**. Este documento registra el paquete vigente que sí incluye:

- auditoría forense V104;
- matriz hecho/parcial/pendiente;
- patrones backend reutilizables traducidos a requisitos de producto/frontend;
- mejoras locales R5 que deben consolidarse genéricamente;
- Academia, manuales, rutas por rol y notificaciones;
- tareas exactas por prioridad;
- criterios de aceptación y pruebas.

## Baseline y carriles

Claude trabaja exclusivamente sobre `Prototype development request CXOrbia V104.zip`.

R5 sigue siendo baseline operativa de ChatGPT/Codex/backend para el empalme posterior. Claude no importa R5, no crea `tya-phase-a-*`, no copia snapshot/adapters/datos TyA y no toca `backend/`, `tools/`, workflows, Firebase, Make o Gemini reales.

## Patrones backend reutilizables que el frontend debe representar

1. Modo de datos único: demo, source-safe y connected son mutuamente excluyentes.
2. Proyecto ≠ periodo/ronda.
3. Dato faltante = empty state, `pending_source`, `pending_review` o `blocked`; nunca fixtures silenciosos.
4. Llaves estables y conflictos a revisión humana.
5. Liquidación ≠ pago confirmado.
6. Certificación práctica ≠ habilitación operativa.
7. Dry-run ≠ materialización/importación.
8. Outbox/preparado ≠ enviado/conectado.
9. Permisos por acción y entidad con tenant/proyecto/país/entityType/entityId.
10. Soft-delete/auditoría en entidades operativas.
11. Multi-tenant sin hardcode de cliente, país, moneda, HR o proveedor.

## Mejoras locales R5 a consolidar genéricamente

- aislamiento total de fixtures al cambiar de modo;
- periodo activo/cerrado proveniente de fuente;
- no transformar liquidada en pagada;
- carryover solo con fuente/revisión/auditRef;
- conflictos visibles en reviewQueue;
- UI de dry-run y materialización HOLD;
- empty states honestos en portales y finanzas;
- archivo auditado sin perder historial;
- scope multipaís por entidad;
- copy preparado/preview/pending/confirmed.

## Academia acumulada

Debe atenderse transversalmente:

- CRUD administrable de cursos/manuales/checklists/glosario;
- duplicar, versionar, revisar, aprobar, publicar preview/confirmado, archivar, restaurar y eliminar controlado;
- motivo y auditRef;
- permisos en botón y handler;
- segmentación por rol, módulo, proyecto, país y tenant;
- rutas Admin, Operaciones, Finanzas, Shopper y Cliente;
- manuales sobre modos de datos, proyecto/periodo, histórico/activo, liquidación/pago, lotes, certificación, dry-run, conflictos, archivo, permisos e integraciones;
- cada lección con propósito, pasos, botones/campos, validación, errores frecuentes, resolución, checklist y consecuencias operativas;
- notificación in-app, outbox y canal externo como estados diferentes.

## Prioridades para Claude

### Ola 1 — integridad de entrega

- manifest verificable con 0 diferencias;
- evidencia realmente incluida;
- reporte con todos los archivos modificados.

### Ola 2 — honestidad de fuente

- Portal Cliente sin RNG ni datos fabricados;
- fixtures persistidos aislados/purgados al salir de demo;
- empty states parciales y completos.

### Ola 3 — Finanzas, Certificación y Permisos

- pago confirmado exige evidencia completa;
- preview no entra en lote real;
- eliminar estimaciones sintéticas fuera de demo;
- pending_backend no habilita certificación;
- reviewer real o pending backend;
- país/tenant/proyecto/entidad en handlers sensibles.

### Ola 4 — Dashboard, trazabilidad y copy

- KPIs desde fuente o pending_source;
- restaurar historial visible real de visita;
- conservar soft-delete;
- corregir API keys, Make/Gemini, notificaciones y WhatsApp residual.

### Ola 5 — Academia y UX

- lifecycle/permisos completos de Academia;
- contenidos/rutas/checklists actualizados;
- UI dry-run/reviewQueue cuando corresponda;
- pruebas 360/390/412 y desktop.

## Entrega requerida

ZIP frontend completo incremental sobre V104, reporte único, lista exacta de archivos, manifest válido, evidencia incluida y pendientes honestos. ChatGPT/Codex auditarán y empalmarán posteriormente contra R5.
