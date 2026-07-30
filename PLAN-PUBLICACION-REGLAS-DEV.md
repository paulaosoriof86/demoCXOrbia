# PLAN-PUBLICACION-REGLAS-DEV.md

## Objetivo

Preparar el gate para publicar `firestore.rules` únicamente en Firebase DEV.

## Estado previo requerido

```text
validación lógica P0: hecha
validación local/emulador: sin fallo visible reportado
admin dry checks: finalizados
producción: no tocada
```

## Alcance del gate

```text
publicar firestore.rules en proyecto DEV
no publicar hosting
no crear usuarios
no asignar claims
no cargar seed
no activar adapter
no tocar producción
```

## Proyecto permitido

```text
cxorbia-backend-dev
```

## Comando previsto

```powershell
firebase deploy --only firestore:rules --project cxorbia-backend-dev
```

## Validación previa obligatoria

Antes de publicar, confirmar:

```text
firebase use muestra cxorbia-backend-dev o se usa --project cxorbia-backend-dev
firestore.rules existe
firestore.indexes.json existe
firebase.json existe
no se incluye hosting en el comando
no se incluye storage en el comando
```

## Resultado esperado

Crear después:

```text
RESULTADO-PUBLICACION-REGLAS-DEV.md
```

## No autorizado todavía

Este documento no autoriza ejecutar publicación. Solo prepara el gate.
