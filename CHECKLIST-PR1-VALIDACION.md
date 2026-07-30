# CHECKLIST-PR1-VALIDACION.md

## PR

`#1 — chore(backend): preparar Firebase DEV y migración T&A`

## Objetivo

Mantener el PR en modo borrador hasta completar validaciones técnicas y autorización explícita de Paula. Este checklist evita merge, deploy o activación accidental.

## Estado actual

- PR: abierto como draft.
- Rama: `feat/firebase-backend-dev-config-20260627`.
- Base: `main`.
- Estado técnico: rama diverged, detrás de `main` por 1 commit.
- Producción: no tocada.
- Deploy: no ejecutado.
- Adapter: desactivado.
- Datos reales: no cargados.

## Bloqueos antes de merge

| Bloqueo | Estado | Acción |
|---|---|---|
| Rama detrás de `main` | pendiente | Sincronizar antes de merge |
| Reglas Firestore sin prueba | pendiente | Validar en DEV o Rules Playground |
| Usuarios DEV sin claims | pendiente | Crear solo con autorización |
| Seed ficticio no cargado | pendiente | Cargar en DEV controlado |
| Adapter no probado | pendiente | Activar solo en DEV/preview |
| Módulos no verificados con Firestore | pendiente | Probar dashboard, visitas, shoppers, postulaciones y beneficios |
| Storage pendiente por Blaze | pendiente | Mantener cerrado |
| Base buena T&A | no corresponde todavía | Esperar señal definida en `MIGRACION-BASE-BUENA-TYA.md` |

## Validación de archivos críticos

### Deben existir

```text
.firebaserc
firebase.json
firestore.rules
firestore.indexes.json
storage.rules
app/core/backend-config.js
app/core/backend-firebase.js
IMPORTACION-TYA-PILOTO.md
VALIDACION-TYA-PILOTO.md
MATRIZ-ROLES-FIRESTORE.md
AUTH-DEV-TYA.md
MIGRACION-BASE-BUENA-TYA.md
firebase/seed-tya-piloto.json
firebase/README.md
CAMBIOS-BACKEND.md
RESUMEN-PARA-CLAUDE.md
PENDIENTES-PROTOTIPO.md
ARQUITECTURA-TENANTS-TYA.md
```

### Único archivo existente modificado

```text
app/index.html
```

La modificación permitida es únicamente cargar:

```html
<script src="core/backend-config.js"></script>
<script src="core/backend-firebase.js"></script>
```

## Validación negativa

Antes de avanzar, confirmar:

- `/app/modules` no fue modificado.
- `CX.BACKEND.enabled` sigue en `false`.
- No existen credenciales privadas en repo.
- No existe service account en repo.
- No hay datos reales en `firebase/seed-tya-piloto.json`.
- `storage.rules` sigue cerrado.
- No se hizo deploy a producción.
- No se conectó base vieja como backend vivo.

## Orden recomendado del siguiente bloque técnico

1. Sincronizar rama con `main` sin mergear PR.
2. Revisar que no cambie `/app/modules`.
3. Validar reglas Firestore manualmente.
4. Preparar método seguro de claims DEV.
5. Pedir autorización a Paula antes de crear usuarios DEV.
6. Cargar seed ficticio en DEV.
7. Probar adapter en DEV/preview.
8. Documentar hallazgos.
9. Decidir si el PR continúa, se divide o se ajusta.

## Regla final

Este PR no debe pasar de draft, no debe mergearse y no debe desplegarse hasta que Paula autorice explícitamente.
