# PLAN-EMULADOR-REGLAS-FIRESTORE.md

## Objetivo

Preparar validación de `firestore.rules` con motor local, sin publicar reglas y sin tocar Firebase real.

## Estado

```text
validación lógica: hecha
motor local: pendiente
reglas publicadas: no
usuarios creados: no
claims asignados: no
seed cargado: no
adapter activo: no
producción tocada: no
```

## Casos mínimos

```text
1. sin sesión no lee tenant
2. otro tenant no lee tya
3. shopper no lee otro shopper
4. shopper con proyecto lee visita disponible
5. shopper sin proyecto no lee visita disponible
6. cliente no lee finance
7. cliente no lee postulations
8. ops no lee finance
9. auditLogs no permite update/delete
```

## Datos ficticios

```text
tenantId: tya
projectId: tya-piloto
shopper propio: eval-01
shopper ajeno: eval-02
visita disponible: tya-piloto-v01
finance demo: m01
postulation demo: post-01
log demo: log-01
```

## No permitido

```text
publicar reglas
usar datos reales
conectar app real
cargar seed real
tocar producción
```

## Resultado esperado

Crear después:

```text
RESULTADO-EMULADOR-REGLAS-FIRESTORE.md
```

## Criterio de avance

Si el motor local pasa P0, el siguiente gate será decidir si se publican reglas en DEV o si primero se preparan usuarios DEV ficticios.
