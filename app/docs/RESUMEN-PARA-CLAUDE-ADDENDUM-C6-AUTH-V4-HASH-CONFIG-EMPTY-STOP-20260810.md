# RESUMEN PARA CLAUDE — ADDENDUM C6 AUTH V4 HASH_CONFIG_EMPTY STOP_RETRY

**Fecha:** 2026-08-10  
**Estado:** backend Auth DEV detenido antes de writes; frontend preservado.

## Qué quedó resuelto

- El error previo `HASH_CONFIG_HTTP_400` fue corregido en backend removiendo el query `?mask=hashConfig` del GET administrativo.
- Gate source-only observable PASS: `31402335372`.
- Freeze Auth v4 sigue intacto: 340 filas, 118 CREATE, 9 UPDATE, 0 HOLD, digest `c0c31f...`.
- Identidad Shopper no se reabre: SKIP13, multi-Auth, lineage y plan v3 siguen cerrados.

## Qué ocurrió en runtime DEV

El único PREWRITE autorizado terminó:

```text
runId=31402395938
decision=STOP_RETRY_C6_AUTH_PLAN_V4_PREWRITE
errorCode=HASH_CONFIG_EMPTY
writeBoundaryEntered=false
AuthWrites=0
production=false
```

El parser backend busca `hashConfig` en el nivel raíz de la respuesta, pero el esquema oficial de `Config` lo ubica dentro de `signIn.hashConfig`. El próximo bloque backend deberá corregir esa ruta y comprobar la disponibilidad del permiso sensible de hash antes de otro PREWRITE.

## Qué NO debe hacer Claude

- no tocar `app/modules/*` por este hallazgo;
- no crear una nueva candidata;
- no reconstruir login ni Auth desde UI;
- no hardcodear identidades o conteos;
- no simular que Auth DEV fue activado;
- no mostrar el STOP técnico al usuario final como error visible de producto;
- no reintroducir login paralelo ni shell alterno.

## Qué debe preservar el prototipo

- composición acumulativa única;
- Login único;
- Admin/Operaciones, Shopper y Cliente;
- HR/histórico, postulaciones, visitas, certificaciones, finanzas, portales y reservas;
- Academia y rutas por rol;
- estados honestos: Auth pendiente mientras el backend no obtenga PASS.

## Impacto Academia

Incluir en troubleshooting técnico/administrativo, no en rutas básicas del usuario final:

- diferencia entre prewrite y write boundary;
- por qué un STOP_RETRY protege usuarios;
- por qué secretos/hash no se exportan;
- qué significa que un provider read falle sin alterar datos.

## Pendiente frontend

Ninguno derivado de este bloque. El problema es exclusivamente backend/provider contract.
