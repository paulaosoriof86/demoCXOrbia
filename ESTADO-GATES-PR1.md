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
Seed ficticio: preparado, no ejecutado
Adapter: preparado, desactivado
```

## Matriz de gates

| Gate | Estado | Responsable | Nota |
|---|---|---|---|
| Confirmar base `main` | pendiente | Paula / Claude | `main` trae cambios frontend amplios |
| Mantener PR draft | activo | ChatGPT | No mergear |
| Firestore rules | completado DEV | Paula/ChatGPT | Publicadas en `cxorbia-backend-dev` el 2026-06-28 |
| Auth DEV | pendiente | Paula/ChatGPT | No crear usuarios sin autorización |
| Claims DEV | pendiente | ChatGPT/DEV | No implementar desde frontend |
| Seed ficticio dry-run | pendiente | Paula autoriza | Solo simulación |
| Seed ficticio escritura | bloqueado | Paula autoriza | Después de dry-run/usuarios/claims según plan |
| Adapter DEV | bloqueado | Paula autoriza | Solo después de seed/reglas |
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
no cargar seed
no crear usuarios
no asignar claims
no pedir base buena real
no tocar producción
```

## Próximo avance permitido sin autorización externa

Solo documentación, revisión de archivos y preparación de planes.

## Próximo avance que sí requiere autorización

Cualquier dry-run, escritura, deploy de Hosting, usuario, claim o activación del adapter.

Frase del siguiente gate disponible:

```text
Autorizo crear usuarios DEV ficticios y asignar claims en Firebase DEV, sin usuarios reales, sin datos reales, sin activar adapter y sin tocar producción.
```