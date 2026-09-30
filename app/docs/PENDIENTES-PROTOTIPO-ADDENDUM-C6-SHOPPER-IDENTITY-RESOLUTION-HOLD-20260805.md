# PENDIENTES PROTOTIPO — C6 Shopper Identity Resolution HOLD

**Fecha:** 2026-08-05

## Bloqueos reales

1. Resolver una colisión Auth con dos candidatas técnicas.
2. Resolver las dos candidatas Shopper asociadas a Paula mediante `shopperId`, HR, visitas, legacy y actividad; nunca por nombre.
3. Recalcular las colisiones reales de `nombre.apellido` después de corregir el resolver.

## Defecto del resolver que debe corregirse

El resolver generó 109 `canonical_name_incomplete` porque solo aceptó apellido explícito o apellido desde credencial ya enlazada. Debe permitir:

- nombre completo del perfil exacto ya enlazado por `shopperId`;
- login técnico almacenado en ese perfil;
- datos de HR o legacy enlazados mediante claves exactas.

Esto no autoriza coincidencia de personas por nombre visual.

## Baseline

```text
109 credenciales
101 mapeadas
8 sin mapear
21 missing Auth = 13 mapeadas + 8 sin mapear
16 login exceptions en el conjunto vigente
18 password exceptions en el conjunto vigente
```

Los antiguos `30/28` deben reconciliarse por cambio de pertenencia de los 13 registros recuperados, no exigirse como igualdad.

## Plan producido

```text
CREATE_AUTH=22
UPDATE_AUTH=8
NO_OP=73
HOLD=110
PRESERVE_NO_AUTH=127
TOTAL=340
```

No ejecutar el plan hasta eliminar falsos holds, resolver Paula y la colisión Auth, y obtener nuevo gate PASS.

## Prohibiciones

Cero Auth/password/membership/Firestore/Rules/Storage/HR writes, deploy, Cloud Run, Make, Gemini, pagos, merge o producción.
