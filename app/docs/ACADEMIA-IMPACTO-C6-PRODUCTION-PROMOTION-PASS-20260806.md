# ACADEMIA — Impacto C6 promoción del proyecto limpio existente

**Fecha:** 2026-08-06

## Aprendizaje reusable

Un entorno limpio puede promoverse a producción sin cambiar sus identificadores técnicos cuando existe aceptación expresa, contrato trazable y gates previos al cutover. La promoción contractual no equivale a un deploy.

## Caso CXOrbia TyA

Se autorizó promover `cxorbia-backend-dev`, aceptando `cxorbia-dev`, `cxorbia-backend-dev` y `cxorbia-live-hr-dev` como identificadores técnicos futuros de producción. El gate source-only obtuvo PASS, pero HR viva, Auth, smoke, validación humana, rollback y autorización de cutover siguen pendientes.

## Manuales y cursos

Documentar la diferencia entre: estrategia de promoción, contrato source-only, gates operativos, autorización de deploy y cutover efectivo. No hay cambios en rutas por rol, notificaciones ni interfaz de Academia.
