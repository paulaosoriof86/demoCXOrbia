# RESUMEN PARA CLAUDE — Corte 4 visual P0 proven

Fecha: 2026-07-29

## Estado

No generar nueva candidata.

Paula validó visualmente Hosting DEV de Corte 4 y se demostró un P0 backend: el runtime cae a `localStorage/demo` cuando Auth temporal no está disponible, mostrando datos ficticios aunque Firestore Corte 4 está vacío.

## Qué NO corresponde a Claude

- no tocar `app/modules`;
- no crear V183;
- no cambiar contratos/adapters/backend;
- no rediseñar login/dashboard;
- no intentar ocultar el badge o los proyectos demo como solución cosmética.

## Qué sí debe conservarse en futuras candidatas

- frontend V182/Corte 3 congelado;
- ausencia de fallback demo cuando el backend real está seleccionado;
- estados honestos de fuente;
- Corte 4 y posteriores deben poder representar fuente vacía/fail-closed sin sembrar datos ficticios.

## Hallazgo reusable

Una UI puede parecer funcional y aun así estar conectada a la fuente equivocada. Los estados de data source deben reflejar fuente efectiva, autenticación y fallback real antes de dar un corte por validado.

## Pendiente

Corrección focalizada backend por ChatGPT/Codex únicamente después de autorización expresa de Paula.