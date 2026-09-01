# CAMBIOS BACKEND — ADDENDUM AUDITORÍA V171b / CORTE 1B

Fecha: 2026-07-21
Estado: `HOLD_P0_PROVEN_SHOPPER_IDENTITY`

## Qué se hizo

- Se recibió y extrajo la candidata acumulada `Prototype development request CXOrbiaV171b.zip`.
- Se calculó SHA-256: `e655ea88950c8485a497b52b3870c9b18ebef98181e1662993ef496efc17d4e2`.
- Se validaron estructura ZIP, manifiesto, inventario, hashes, sintaxis JavaScript, referencias de `index.html`, ausencia de rutas inseguras, secretos comunes y hardcode de Cinépolis en los archivos modificados.
- Se comparó focalizadamente contra los siete P0 documentados para V170.
- Se ejecutó una reproducción aislada del flujo `misvisitas` con una sesión Shopper sin `shopperId`.

## Resultado

V171b corrige estáticamente los siete P0 principales de V170, pero conserva un P0 nuevo/pendiente de aislamiento de identidad Shopper:

- `misvisitas.js` usa `shopperId || 'sh1'` y puede caer a todas las visitas;
- `reservas.js` usa el mismo fallback;
- `midia.js` amplía visitas privadas por estado, aunque pertenezcan a otro shopper;
- `app.js` mantiene un fallback demo sin guard live/real explícito.

La prueba reproducible confirmó que una sesión sin identidad puede renderizar una visita de `sh1`.

## Decisión

- GO: no.
- APPLY_DELTA_DIRECTLY: no ejecutado.
- Commit de candidata: no.
- Deploy: no.
- PR merge: no.
- Decisión: `HOLD_P0_PROVEN_SHOPPER_IDENTITY_FAIL_OPEN`.

## Archivos documentales creados

- `app/docs/AUDITORIA-CANDIDATA-V171B-CORTE1B-20260721.md`;
- `app/docs/PAQUETE-CORRECCION-CLAUDE-V171B-CORTE1B-20260721.md`;
- este addendum.

## Clasificación

- **Reusable CXOrbia:** identidad fail-closed para todas las vistas privadas Shopper.
- **Exclusivo cliente:** validación posterior con shoppers y proyectos TyA.
- **Claude/prototipo:** corrección localizada en `app.js`, `misvisitas.js`, `reservas.js` y `midia.js`.
- **Academia:** diferenciar visitas disponibles de visitas privadas y documentar sesión sin identidad.
- **Sin impacto Claude:** HR viva, backend, adapters, contratos, Cloud Run, Hosting, IAM y producción.

## Estado seguro

Se preservan V164, Corte 1A, HR viva y el último Hosting DEV aprobado. Sin escrituras HR/Firestore/Auth/Storage, importaciones, pagos, Make/Gemini live, merge ni producción.

## Siguiente bloque exacto

`CANDIDATA V171B CORREGIDA → EXECUTION_LANE_READY → AUDITORÍA FOCALIZADA → APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 1`
