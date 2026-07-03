# Gate ejecucion local pipeline TyA

Fecha: 2026-07-03

## Objetivo

Definir cuando Paula debe ejecutar el pipeline local seguro.

## Ejecutar solo cuando

- La rama este sincronizada.
- El runner este corregido.
- El staging preview exista localmente.
- Paula quiera validar localmente reportes.

## Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\migration\run-tya-local-safe-pipeline.ps1
```

## Resultado esperado

- Reporte en Descargas.
- Carpetas tmp actualizadas.
- Estado bloqueado si hay gates pendientes.
- Sin deploy.
- Sin importacion.
- Sin escritura.

## Que enviar de regreso

Pegar el reporte completo generado en Descargas.
