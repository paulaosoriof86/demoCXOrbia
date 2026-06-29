# ESTADO-GATES-PR1.md

## Objetivo

Centralizar el estado de gates para PR #1.

## Estado general

```text
PR #1: draft
Merge: bloqueado
Deploy Hosting: bloqueado
Producción: bloqueada
Datos reales: bloqueados
Base buena T&A: bloqueada
Firestore rules DEV: publicadas
Auth DEV ficticio: completado
Jerarquía tenant/cuenta/proyecto: aclarada y documentada
Seed ficticio dry-run: completado
Seed ficticio carga Firestore: completado DEV
Adapter: preparado, desactivado
```

## Matriz de gates

| Gate | Estado | Responsable | Nota |
|---|---|---|---|
| Confirmar base `main` | pendiente | Paula / Claude | `main` trae cambios frontend amplios |
| Mantener PR draft | activo | ChatGPT | No mergear |
| Firestore rules | completado DEV | Paula/ChatGPT | Publicadas en `cxorbia-backend-dev` |
| Auth DEV | completado DEV | Paula/ChatGPT | 6 usuarios ficticios importados |
| Claims/customAttributes DEV | completado DEV | ChatGPT/DEV | Claims visibles correctos en ID token |
| Jerarquía tenant/cuenta/proyecto | completado documental | ChatGPT | Tenant=consultora, cuenta=cliente final, proyecto=campaña/ronda |
| Seed ficticio dry-run | completado | Paula/ChatGPT | Validaciones OK; 19 rutas simuladas |
| Seed ficticio carga Firestore | completado DEV | Paula/ChatGPT | 19 escrituras completadas por Firebase Web SDK |
| Adapter DEV | bloqueado | Paula autoriza | Sigue desactivado |
| Storage | bloqueado | Paula | Pendiente Blaze y reglas |
| Base buena T&A | bloqueado | Paula autoriza | Después de adapter validado |
| Producción T&A | bloqueado | Paula autoriza | No tocar |

## Gate completado — Firestore rules DEV

```text
firebase.cmd deploy --only firestore:rules --project cxorbia-backend-dev
```

Resultado reportado:

```text
Deploy complete!
```

Documentación:

- `RESULTADO-PUBLICACION-REGLAS-DEV.md`
- `RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-REGLAS-DEV-PUBLICADAS.md`

## Gate completado — Auth DEV ficticio y claims/customAttributes

Resultado reportado:

```text
Starting importing 6 account(s).
Imported successfully.
```

Documentación:

- `RESULTADO-USUARIOS-CLAIMS-DEV.md`
- `RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-AUTH-DEV-COMPLETADO.md`
- `PLAN-ALTERNATIVO-AUTH-IMPORT-CLI-DEV.md`

## Gate documental completado — jerarquía tenant/cuenta/proyecto

Decisión:

```text
Tenant = consultora cliente de CXOrbia
Cuenta = cliente final / marca / cuenta comercial de la consultora
Proyecto = campaña, ronda o programa operativo configurado en CXOrbia
Visita = unidad operativa dentro del proyecto
```

Documentación:

- `ARQUITECTURA-JERARQUIA-TENANT-CUENTA-PROYECTO.md`
- `MAPEO-CXDATA-FIRESTORE.md`
- `firebase/seed-tya-piloto.json`

## Gate completado — dry-run seed ficticio actualizado

Resultado reportado:

```text
Validaciones: OK
== Dry-run seed TYA actualizado finalizado ==
```

Resumen:

```text
Visitas: 8
Postulaciones: 3
Cuestionarios: 1
Escrituras simuladas: 19
```

Documentación:

- `RESULTADO-DRY-RUN-SEED-TYA-ACTUALIZADO.md`
- `PLAN-DRY-RUN-SEED-TYA-ACTUALIZADO.md`
- `firebase/validate-seed-dry-run.cjs`

## Gate completado — carga seed ficticio Firestore DEV

Resultado reportado:

```text
Escrituras completadas: 19
== Carga seed Firestore DEV finalizada ==
```

Documentación:

- `RESULTADO-CARGA-SEED-FIRESTORE-DEV.md`
- `RESULTADO-CARGA-SEED-FIRESTORE-DEV-INTENTO-1-FALLIDO.md`
- `firebase/client-write-tools/load-seed-firestore-dev-sdk.mjs`
- `firebase/client-write-tools/package.json`

Confirmaciones:

```text
No se activó adapter.
No se hizo deploy de Hosting.
No se hizo merge.
No se tocó producción.
```

## Advertencia pendiente

```text
[W] 51:14 - Unused function: canAccessProject.
```

No bloqueó la publicación. Revisar luego sin cambiar permisos funcionales.

## No hacer todavía

```text
no sincronizar automáticamente con main
no mergear PR #1
no desplegar Hosting
no activar Firestore adapter
no pedir base buena real
no tocar producción
```

## Próximo avance permitido sin autorización externa

Solo documentación, revisión de archivos y preparación de planes.

## Próximo avance que sí requiere autorización

Cualquier deploy de Hosting, activación del adapter, Storage, base real o producción.
