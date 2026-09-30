# PENDIENTES PROTOTIPO — Addendum Corte 4 bootstrap preflight

Fecha: 2026-07-29

## Frontend / Claude

No hay tarea nueva de frontend. Corte 3 continúa congelado en V182 y Corte 4 sigue siendo backend/provider.

## Pendiente real backend/provider

1. elevar temporalmente IAM de la misma cuenta de servicio del runner para cubrir Web App, Firestore, Auth, Rules y Service Usage;
2. confirmar ubicación Firestore;
3. re-ejecutar preflight;
4. ejecutar el bootstrap DEV read-only ya autorizado;
5. smoke `CX.data`;
6. validación visual;
7. freeze Corte 4.

## Estado seguro

Preflight ejecutado con provider writes=0. Sin Rules deploy, Firestore/Auth data writes, Storage, Hosting deploy, Functions, import/materialización, pagos/lotes, Make/Gemini, merge ni producción.
