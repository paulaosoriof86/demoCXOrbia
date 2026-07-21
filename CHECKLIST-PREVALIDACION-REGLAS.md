# CHECKLIST-PREVALIDACION-REGLAS.md

## Objetivo

Checklist previo para validar reglas Firestore sin ejecutar acciones sensibles.

## Antes de validar

```text
[ ] PR #1 sigue draft
[ ] CX.BACKEND.enabled sigue false
[ ] firebase/seed-tya-piloto.json sigue ficticio
[ ] no hay credenciales en repo
[ ] no hay service account en repo
[ ] no hay usuarios DEV creados desde este PR
[ ] no hay producción involucrada
[ ] no hay deploy
```

## Archivos listos

```text
[ ] firestore.rules
[ ] CASOS-PRUEBA-FIRESTORE.md
[ ] PLAN-VALIDACION-REGLAS-DEV.md
[ ] PLANTILLA-RESULTADO-VALIDACION-REGLAS-DEV.md
[ ] AUTORIZACION-VALIDACION-REGLAS-DEV.md
```

## Datos ficticios listos

```text
[ ] tenantId tya
[ ] projectId tya-piloto
[ ] shopper propio eval-01
[ ] shopper ajeno eval-02
[ ] visita disponible tya-piloto-v01
[ ] finance demo m01
```

## Validación permitida

```text
simulación de reglas
claims ficticios
rutas ficticias
registro de resultados
```

## Validación no permitida sin autorización adicional

```text
publicar reglas
crear usuarios
asignar claims
cargar seed
activar adapter
desplegar hosting
tocar producción
```

## Cierre

No ejecutar validación real hasta recibir la frase exacta definida en `AUTORIZACION-VALIDACION-REGLAS-DEV.md`.
