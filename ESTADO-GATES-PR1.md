# ESTADO-GATES-PR1.md

## Objetivo

Centralizar el estado de gates para PR #1.

## Estado general

```text
PR #1: draft
Merge: bloqueado
Deploy: bloqueado
Producción: bloqueada
Datos reales: bloqueados
Base buena T&A: bloqueada
Seed ficticio: preparado, no ejecutado
Adapter: preparado, desactivado
```

## Matriz de gates

| Gate | Estado | Responsable | Nota |
|---|---|---|---|
| Confirmar base `main` | pendiente | Paula / Claude | `main` trae cambios frontend amplios |
| Mantener PR draft | activo | ChatGPT | No mergear |
| Firestore rules | pendiente | ChatGPT/DEV | Validar casos documentados |
| Auth DEV | pendiente | Paula/ChatGPT | No crear usuarios sin autorización |
| Claims DEV | pendiente | ChatGPT/DEV | No implementar desde frontend |
| Seed ficticio dry-run | pendiente | Paula autoriza | Solo simulación |
| Seed ficticio escritura | bloqueado | Paula autoriza | Después de dry-run |
| Adapter DEV | bloqueado | Paula autoriza | Solo después de seed/reglas |
| Storage | bloqueado | Paula | Pendiente Blaze y reglas |
| Base buena T&A | bloqueado | Paula autoriza | Después de adapter validado |
| Producción T&A | bloqueado | Paula autoriza | No tocar |

## No hacer todavía

```text
no sincronizar automáticamente con main
no mergear PR #1
no desplegar
no activar Firestore
no cargar seed
no crear usuarios
no pedir base buena real
no tocar producción
```

## Próximo avance permitido sin autorización externa

Solo documentación, revisión de archivos y preparación de planes.

## Próximo avance que sí requiere autorización

Cualquier dry-run, escritura, deploy, usuario, claim o activación del adapter.
