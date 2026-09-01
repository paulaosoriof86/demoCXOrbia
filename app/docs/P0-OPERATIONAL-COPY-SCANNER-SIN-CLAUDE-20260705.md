# P0 operational copy scanner sin Claude - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Como Claude no tiene capacidad, se adelanto una herramienta segura para detectar textos P0 que puedan prometer envios, sincronias o automatizaciones reales antes de que el backend este activo.

## Archivos creados

- `app/contracts/p0-operational-copy-scanner.tya.contract.json`
- `tools/quality/tya-p0-operational-copy-scanner.mjs`

## Que hace

Escanea archivos en:

- `app/modules`
- `app/core`

Busca señales como:

- WhatsApp enviado;
- correo enviado;
- HR sincronizada o actualizada;
- sincronizacion externa con HR, Sheets o Make;
- cuestionario enviado;
- acciones reales Make;
- notificacion automatica.

## Salidas locales

Cuando se ejecute localmente, genera:

- `_diagnosticos/tya-p0-operational-copy-scan/p0-operational-copy-scan.json`
- `_diagnosticos/tya-p0-operational-copy-scan/p0-operational-copy-scan.md`

## Comando futuro

No ejecutar ahora salvo GO explicito.

```powershell
node tools/quality/tya-p0-operational-copy-scanner.mjs
```

## Interpretacion

- `no_p0_findings`: no encontro hallazgos P0.
- `review_required`: encontro hallazgos que requieren revision.

Exit code 2 significa revision requerida, no falla tecnica.

## Seguridad

La herramienta no modifica frontend, backend, proveedores, datos, produccion ni servicios remotos.

## Decision

Permite seguir avanzando sin Claude en auditoria objetiva, pero no corrige el frontend ni habilita source lock.
