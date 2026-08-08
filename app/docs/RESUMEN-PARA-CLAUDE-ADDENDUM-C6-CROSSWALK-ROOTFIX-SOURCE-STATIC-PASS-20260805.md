# RESUMEN PARA CLAUDE — Addendum C6 Crosswalk Root Fix Source/Static PASS

**Fecha:** 2026-08-05  
**Estado backend:** `PASS_C6_DETERMINISTIC_SUFFIX_CROSSWALK_ROOTFIX_SOURCE_STATIC`

## Conectado y preservado

- contrato Shopper normal `nombre.apellido`;
- excepción autorizada solo ante colisión: `nombre.apellido.<sufijo técnico no PII>`;
- sufijo determinístico 4/6/8 derivado de `tenantId + shopperId`;
- contraseña contractual `Nombre123*`;
- autoridad Firebase Auth + claims + `shopperId`;
- 340 perfiles dentro del contrato del plan;
- HR, histórico, visitas, certificaciones y liquidaciones como fuentes técnicas;
- frontend canónico, módulos, diseño y `CX.data` sin cambios.

## Correctivo backend aplicado

El planner ahora propaga al `relationIndex` las llaves técnicas de toda fuente HR, visita, certificación o liquidación enlazada. También bloquea `readyForAuthRepair` cuando la futura lectura no alcance la referencia estable `101 credenciales mapped / 8 unmapped`.

## Evidencia

```text
run=31066003792
job=92503740935
commit=6160ef89b75bcdf9068c210810c528d3c6d13db1
PASS_C6_DETERMINISTIC_SUFFIX_CROSSWALK_ROOTFIX_SOURCE_STATIC
providerReads=0
providerWrites=0
```

## Ajustes frontend

Ninguno en este bloque. No tocar:

- `/app/modules`;
- `/app/core`;
- Login;
- `CX.data`;
- formularios o estilos.

Cuando el backend termine la futura revalidación provider y eventual repair DEV, Claude solo deberá asegurar que el formulario de acceso acepte el identificador visible entregado al shopper, incluido el sufijo cuando corresponda. No se debe generar ni inferir el sufijo en frontend.

## Pendiente

Los agregados provider anteriores —65 grupos, 142 identidades, 12 apellidos pendientes y un empate multi-Auth— siguen siendo provisionales hasta una nueva lectura expresamente autorizada. No usarlos para cambiar UI, textos, manuales ni rutas.

## Academia y manuales

Pendiente incorporar, tras resultado provider final:

- explicación de login normal frente a excepción por colisión;
- soporte y recuperación de credencial sin exponer el shopperId;
- principio de no fusionar personas por nombre visible;
- trazabilidad técnica de HR/visitas/certificaciones/liquidaciones;
- revisión humana ante empate multi-Auth.
