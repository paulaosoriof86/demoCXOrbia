# RUTA-CRITICA-DEV-PR1.md

## Objetivo

Consolidar la ruta crítica para avanzar más rápido sin saltar gates sensibles.

## Estado actual

```text
PR #1: draft
backend scaffold: creado
CX.BACKEND.enabled: false
reglas: creadas, no publicadas
validación lógica reglas: aprobada P0
emulador local: pendiente
usuarios DEV: no creados
claims DEV: no asignados
seed ficticio: validado, no escrito
adapter: no activo
producción: no tocada
```

## Ruta rápida por gates

### Gate 1 — Emulador reglas

Autoriza ejecutar motor local con datos ficticios.

Resultado esperado:

```text
RESULTADO-EMULADOR-REGLAS-FIRESTORE.md
```

### Gate 2 — Publicar reglas en DEV

Solo después de emulador aprobado.

Resultado esperado:

```text
RESULTADO-PUBLICACION-REGLAS-DEV.md
```

### Gate 3 — Usuarios DEV ficticios

Crear usuarios de prueba no reales y claims.

Resultado esperado:

```text
RESULTADO-USUARIOS-CLAIMS-DEV.md
```

### Gate 4 — Seed ficticio con escritura DEV

Cargar solo datos demo/anónimos a Firestore DEV.

Resultado esperado:

```text
RESULTADO-SEED-FICTICIO-DEV.md
```

### Gate 5 — Adapter DEV controlado

Activar `CX.BACKEND.enabled` solo en rama/preview DEV.

Resultado esperado:

```text
RESULTADO-ADAPTER-DEV.md
```

### Gate 6 — Sync con main

Solo si Paula confirma que `main` es base visual aprobada.

Resultado esperado:

```text
RESULTADO-SYNC-MAIN-PR1.md
```

## Lo que no se hace todavía

```text
no merge
no deploy producción
no base buena real
no Storage real
no datos bancarios
no NDA
no evidencias reales
no tocar app/modules
```

## Regla de avance

Cada gate sensible requiere autorización separada. Los gates documentales se pueden seguir preparando sin tocar Firebase ni producción.
