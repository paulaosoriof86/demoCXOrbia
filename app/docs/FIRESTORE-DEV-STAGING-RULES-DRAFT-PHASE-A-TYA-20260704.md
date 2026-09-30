# Firestore DEV/staging rules draft Phase A TyA

Fecha: 2026-07-04

## Archivo creado

- `app/contracts/firestore-dev-staging.rules.draft`

## Proposito

Preparar reglas Firestore DEV/staging en modo documental para Phase A, alineadas al schema y route map ya definidos.

Este archivo es borrador y no se debe desplegar directamente.

## Alcance

Cubre colecciones Phase A:

- tenant metadata;
- projects;
- shoppers;
- projectShoppers;
- hrSources;
- visits;
- postulations;
- assignments;
- certificationBanks;
- certifications;
- reviews;
- liquidations;
- contacts;
- notificationTemplates;
- notificationEvents;
- communicationsHistory;
- syncEvents.

## Principios aplicados

- Lectura solo por miembro del tenant/proyecto.
- Escritura admin/coordinacion/super segun coleccion.
- Shopper solo lee su propio perfil/vinculo cuando aplica.
- `tenantId` y `projectId` deben coincidir con la ruta.
- No guardar campos sensibles crudos.
- Deletes bloqueados por defecto.
- `syncEvents` solo permite create; no update/delete para conservar auditoria.
- Produccion no queda autorizada por este borrador.

## Sensibles bloqueados en borrador

- `dpi`;
- `governmentId`;
- `bankAccount`;
- `bankNumber`;
- `accountNumber`;
- `iban`;
- `ndaRaw`;
- `password`;
- `secret`;
- `apiKey`;
- `token`.

## Validaciones pendientes antes de usar en DEV real

1. Confirmar claims reales de Auth: `tenantId`, `projectId`, `projectIds`, `role`, `shopperId`.
2. Validar sintaxis con Firebase emulator.
3. Definir si WhatsApp/contactos se guardan como valor protegido o referencia.
4. Revisar campos sensibles adicionales segun politica final.
5. Probar lecturas por rol: admin, coordinador, shopper, cliente, super.
6. Probar denegacion cross-tenant y cross-project.
7. Probar que deletes sigan bloqueados.
8. Probar que `syncEvents` sea append-only.

## Estado

- Borrador documental creado.
- Sin reglas publicadas.
- Sin base real conectada.
- Sin deploy.
- Sin Firestore writes reales.
- Sin Auth real activado.
