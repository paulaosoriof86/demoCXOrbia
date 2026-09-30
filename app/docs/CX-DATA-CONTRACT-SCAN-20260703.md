# CX.data contract scan

Fecha: 2026-07-03

## Objetivo

Preparar la conexion futura de CX.data a backend real sin romper la interfaz actual del prototipo.

## Archivos agregados

- tools/backend/cx-data-contract-scan.mjs
- tools/backend/run-cx-data-contract-scan.ps1

## Que hace

Escanea archivos JS bajo app y genera reporte local con:

- metodos usados de CX.data,
- campos usados de CX.data,
- claves localStorage detectadas,
- archivos que referencian cada elemento.

## Salidas locales

- tmp/cx-data-contract-scan/cxDataContractScan.md
- tmp/cx-data-contract-scan/cxDataContractScan.json

## Seguridad

- Sin deploy.
- Sin importacion.
- Sin escritura en base.

## Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\backend\run-cx-data-contract-scan.ps1
```
