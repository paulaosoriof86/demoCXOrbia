# PENDIENTES PROTOTIPO — Crosswalk Root Cause C6 Deterministic Suffix

**Fecha:** 2026-08-05

## P0 prevalente

El planner determinístico perdió 13 mapeos de credencial por no propagar al `relationIndex` las llaves técnicas de fuentes ya enlazadas.

```text
referencia estable=101 mapped / 8 unmapped
observado planner=88 mapped / 21 unmapped
drift=13
```

## Consecuencia

Hasta corregir el crosswalk, quedan como provisionales:

- 12 apellidos activos pendientes;
- 65 grupos y 142 identidades;
- el empate multi-Auth;
- 90 sufijos de 4 caracteres;
- la distribución del plan 340.

## Correctivo exacto

- replicar propagación de `TECH_KEYS` del clasificador estable;
- agregar gate de paridad 101/8;
- agregar hard stop por drift de credenciales;
- ejecutar solo source/static;
- no volver a leer provider con la autorización consumida.

## Bloqueos

Auth repair, contraseñas, memberships, Firestore, Rules, Storage, HR, Hosting, pagos, merge y producción continúan bloqueados.
