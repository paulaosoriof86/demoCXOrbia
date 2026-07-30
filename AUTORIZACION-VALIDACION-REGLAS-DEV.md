# AUTORIZACION-VALIDACION-REGLAS-DEV.md

## Objetivo

Definir la autorización mínima para ejecutar validación real de reglas en DEV o Rules Playground.

Este documento no ejecuta validación.

## Alcance permitido con autorización

```text
leer firestore.rules
simular claims ficticios
simular rutas ficticias
registrar resultados
no publicar reglas
no crear usuarios
no cargar seed
no activar adapter
no tocar producción
```

## Frase requerida

Para ejecutar solo validación de reglas, Paula debe escribir:

```text
Autorizo validar reglas Firestore en DEV o Rules Playground, sin publicar reglas, sin crear usuarios, sin cargar seed, sin activar adapter y sin tocar producción.
```

## Frases no suficientes

```text
continúa
procede
hazlo
avanza
```

## Archivos a usar

```text
firestore.rules
CASOS-PRUEBA-FIRESTORE.md
PLAN-VALIDACION-REGLAS-DEV.md
PLANTILLA-RESULTADO-VALIDACION-REGLAS-DEV.md
```

## Resultado esperado

```text
RESULTADO-VALIDACION-REGLAS-DEV.md
```

## Siguiente gate

Si la validación P0 pasa, se podrá pedir autorización separada para usuarios DEV ficticios o escritura controlada del seed.
