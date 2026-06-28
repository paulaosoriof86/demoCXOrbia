# AUTORIZACION-DRY-RUN-SEED.md

## Objetivo

Definir la autorización mínima para ejecutar, en el futuro, una simulación del seed ficticio de T&A.

Este documento no autoriza ejecución por sí solo.

## Alcance

La primera autorización será solo para dry-run.

Dry-run significa:

```text
leer seed
validar estructura
mostrar rutas
mostrar conteos
no escribir en Firebase
no crear usuarios
no activar adapter
no tocar producción
```

## Estado actual

```text
PR #1: draft
Seed real: no ejecutado
Dry-run: no ejecutado
Firestore adapter: desactivado
Datos reales: no cargados
Usuarios reales: no creados
Producción: no tocada
Base buena T&A: no corresponde todavía
```

## Condiciones antes de pedir autorización

Antes de pedir autorización a Paula para dry-run deben cumplirse:

1. Confirmar si `main` actual es base aprobada del prototipo.
2. Mantener PR #1 como draft.
3. Tener documentado el diseño del script.
4. Confirmar que el script no contiene credenciales.
5. Confirmar que la credencial DEV no se subirá al repo.
6. Confirmar que `CX.BACKEND.enabled` sigue en `false`.
7. Confirmar que el seed es ficticio.
8. Confirmar que no se tocará producción.

## Frase de autorización requerida

Para ejecutar solo dry-run, Paula debe escribir explícitamente:

```text
Autorizo ejecutar dry-run del seed ficticio T&A en DEV, sin escribir en Firebase, sin datos reales y sin tocar producción.
```

## Frase NO suficiente

No son suficientes frases generales como:

```text
continúa
hazlo
avanza
procede
```

## Autorizaciones separadas

Estas acciones requieren autorizaciones distintas:

```text
crear usuarios DEV
asignar claims
subir reglas Firestore
cargar seed con escritura real
activar adapter en DEV
pedir base buena real
cargar base buena real
desplegar hosting DEV
desplegar producción
```

## Cierre

Hasta recibir la frase exacta de autorización, solo se puede documentar y preparar.
