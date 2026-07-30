# CHECKLIST-AUTH-DEV-SIN-USUARIOS.md

## Objetivo

Checklist para revisar la fase Auth DEV antes de crear cualquier usuario o claim.

Este archivo no crea usuarios, no asigna claims y no toca Firebase.

## Checklist previo

```text
[ ] Firebase DEV confirmado: cxorbia-backend-dev
[ ] Auth Email/Password habilitado
[ ] Firestore rules listas para prueba
[ ] CASOS-PRUEBA-FIRESTORE.md actualizado
[ ] PLAN-AUTH-CLAIMS-DEV.md actualizado
[ ] No hay credenciales en repo
[ ] No hay contraseñas en repo
[ ] No hay service account en repo
[ ] CX.BACKEND.enabled sigue false
[ ] Producción no se toca
```

## Checklist de usuarios DEV futuros

```text
[ ] Usuario admin DEV ficticio definido
[ ] Usuario ops DEV ficticio definido
[ ] Usuario shopper DEV ficticio definido
[ ] Usuario cliente DEV ficticio definido
[ ] Usuario otro tenant DEV ficticio definido
[ ] Correos no personales o autorizados
[ ] Contraseñas temporales no documentadas en repo
```

## Checklist de claims futuros

```text
[ ] admin tiene role=admin
[ ] ops tiene role=ops
[ ] shopper tiene role=shopper
[ ] shopper tiene shopperId
[ ] cliente tiene role=cliente
[ ] todos tienen tenantId correcto
[ ] todos tienen projectIds correctos
[ ] usuario externo tiene tenantId distinto para prueba deny
```

## Validación posterior futura

Cuando se creen usuarios y claims con autorización, validar:

```text
[ ] admin puede leer proyecto
[ ] ops no puede leer finance
[ ] shopper puede leer su perfil
[ ] shopper no puede leer otro shopper
[ ] shopper puede leer visita disponible de proyecto asignado
[ ] shopper sin proyecto no puede leer visita disponible
[ ] cliente no puede leer finance
[ ] cliente no puede leer postulations
[ ] otro tenant no puede leer tenant tya
```

## Estado

```text
Usuarios creados: no
Claims asignados: no
Firebase escrito: no
Producción tocada: no
```
