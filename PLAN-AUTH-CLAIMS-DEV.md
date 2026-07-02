# PLAN-AUTH-CLAIMS-DEV.md

## Objetivo

Preparar la fase de Auth y custom claims para Firebase DEV, sin crear usuarios todavía.

## Estado actual

```text
Firebase DEV: cxorbia-backend-dev
Auth Email/Password: habilitado
Usuarios DEV: no creados
Claims DEV: no asignados
Adapter: desactivado
Producción: no tocada
```

## Claims requeridos

Las reglas Firestore esperan claims mínimos:

```text
role
tenantId
projectIds
shopperId
```

`shopperId` aplica solo para rol `shopper`.

## Roles DEV propuestos

```text
super
admin
ops
shopper
cliente
```

## Claims por rol

### Admin T&A DEV

```json
{
  "role": "admin",
  "tenantId": "tya",
  "projectIds": ["tya-piloto"]
}
```

### Ops T&A DEV

```json
{
  "role": "ops",
  "tenantId": "tya",
  "projectIds": ["tya-piloto"]
}
```

### Shopper T&A DEV

```json
{
  "role": "shopper",
  "tenantId": "tya",
  "projectIds": ["tya-piloto"],
  "shopperId": "eval-01"
}
```

### Cliente T&A DEV

```json
{
  "role": "cliente",
  "tenantId": "tya",
  "projectIds": ["tya-piloto"]
}
```

### Usuario externo de prueba

```json
{
  "role": "admin",
  "tenantId": "otro-tenant",
  "projectIds": ["tya-piloto"]
}
```

## Reglas de seguridad

```text
no crear usuarios reales todavía
no usar correos personales reales sin autorización
no guardar contraseñas en repo
no guardar service accounts en repo
no crear claims desde frontend
no tocar producción
no activar adapter por crear claims
```

## Método recomendado

Los claims deben asignarse con una herramienta segura de administración fuera del navegador y fuera del repo.

La credencial de administración debe vivir solo en entorno local seguro o secreto temporal. No debe subirse a GitHub.

## Orden correcto futuro

```text
1. validar reglas en DEV o Rules Playground
2. definir credencial segura fuera del repo
3. pedir autorización expresa a Paula
4. crear usuarios DEV ficticios
5. asignar claims DEV
6. probar casos de CASOS-PRUEBA-FIRESTORE.md
7. mantener CX.BACKEND.enabled=false hasta completar pruebas
```

## Criterio de avance

No pasar a escritura del seed ni activación del adapter hasta que los roles DEV puedan probar reglas correctamente.

## Estado

```text
Plan creado: sí
Usuarios creados: no
Claims asignados: no
Reglas publicadas: no
Producción tocada: no
```
