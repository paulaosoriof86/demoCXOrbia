# PENDIENTES PROTOTIPO — ADDENDUM C6 DUPLICATE OWNERSHIP

**Fecha:** 2026-08-10  
**Estado:** `HUMAN_OWNERSHIP_DECISION_REQUIRED_4`

## Pendiente vivo

Quedan exactamente cuatro grupos Auth históricos pendientes de decisión humana de ownership/disposition:

```text
1acdcb3782b7cf351056
2c4d19f2b066835473d3
54225792eeb65f6739c0
ae2f920fe6d9ce1fdd82
```

No existe keeper técnicamente demostrable con la evidencia source-safe vigente. No repetir provider: la lectura previa ya demostró equivalencia/no unicidad.

A–C no son los principals staff canónicos importados. Para `ae2f...`, ambos candidates son históricos y el Cliente canónico actual existe como principal separado ya validado.

## No hacer

- no reconstruir las 340 identidades;
- no inferir keeper por antigüedad, orden, nombre o coincidencia visual;
- no pedir otra lectura provider para obtener los mismos campos;
- no repair Auth dentro de este bloque;
- no compensar desde frontend;
- no PREWRITE/Activation/smoke/deploy/merge/producción.

## Ruta corta

Capturar una decisión humana mínima y source-safe de ownership/disposition para estos cuatro grupos. Después, y solo si la decisión produce una acción técnica inequívoca, preparar un repair focal separado con snapshot/readback/rollback.
