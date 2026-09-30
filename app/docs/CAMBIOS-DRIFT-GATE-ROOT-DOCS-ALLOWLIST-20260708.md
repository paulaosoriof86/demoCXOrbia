# Cambios - Drift Gate Root Docs Allowlist

Fecha: 2026-07-08  
Bloque: correccion puntual de gate despues de admin configurability  
Estado: seguro, sin runtime real.

## Contexto

Despues del bloque `admin configurability contract`, el workflow `CXOrbia RC Phase A Drift Gate` fallo con `NO_GO_DRIFT` porque detecto como bloqueados los documentos raiz obligatorios:

- `CAMBIOS-BACKEND.md`
- `RESUMEN-PARA-CLAUDE.md`
- `PENDIENTES-PROTOTIPO.md`

Esos archivos son parte de la documentacion obligatoria del proyecto y deben poder actualizarse en bloques backend seguros.

## Cambio aplicado

Se actualizo `tools/release/tya-rc-phase-a-drift-gate.mjs` para permitir esos tres documentos raiz en `allowedExact`:

- `CAMBIOS-BACKEND.md`
- `RESUMEN-PARA-CLAUDE.md`
- `PENDIENTES-PROTOTIPO.md`

Tambien se agrego `rootRequiredDocs: true` al reporte de politica permitida y a la salida markdown.

## Por que es seguro

- No se permite ningun archivo runtime nuevo por esta correccion.
- No se permite `app/modules/**`, `app/core/**`, `app/index.html` ni estilos runtime por fuera de la politica existente.
- Solo se permite documentacion raiz que ya forma parte de la regla obligatoria del proyecto.
- No activa deploy, produccion, proveedores, base de datos, import, pagos, Make, Gemini, correo ni WhatsApp.

## Impacto Claude/prototipo

Ningun cambio visual directo.  
Mantiene vigente la obligacion de actualizar `RESUMEN-PARA-CLAUDE.md` y `PENDIENTES-PROTOTIPO.md` para que Claude reciba los pendientes acumulados.

## Impacto Academia

Ningun cambio de contenido operativo nuevo.  
Refuerza que cada bloque siga documentando impacto Academia cuando aplique.

## Clasificacion

- Reusable CXOrbia: si. Gate reusable para permitir docs raiz obligatorios sin abrir runtime.
- Exclusivo cliente: no.
- Claude/prototipo: indirecto, porque conserva los docs raiz que Claude debe leer.
- Academia: indirecto, mantiene trazabilidad de impacto Academia.
- Sin impacto Claude: parcialmente, porque no modifica UI ni runtime.

## Estado seguro

- Sin cambios en `/app/modules`.
- Sin cambios en `/app/core`.
- Sin deploy.
- Sin produccion.
- Sin Firestore/Auth/Storage real.
- Sin HR writes reales.
- Sin Make/Gemini real.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.
