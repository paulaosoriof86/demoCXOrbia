# HR Source private full flow TyA

Fecha: 2026-07-03
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Cerrar la validacion pendiente de lectura completa HR/historico sin escribir datos, usando una URL privada local que no se sube al repositorio.

## Archivos agregados

- `tools/hr-source/tya-hr-source-private-full-flow.mjs`
- `tools/hr-source/run-tya-hr-source-private-full-flow.ps1`

## Que valida

El flujo:

1. Registra la URL HR en registro privado local.
2. Genera `sourceRef` opaco.
3. Levanta endpoint DEV local.
4. Ejecuta `test`.
5. Ejecuta `preview`.
6. Ejecuta `sync-request`.
7. Valida que `canImport=false`.
8. Valida que `sync-request` quede bloqueado.
9. Reporta tabs/periodos detectados.
10. Reporta filas/visitas por tab y pais.
11. Reporta issues sin importar ni escribir.

## Seguridad

- La URL completa solo queda local en `tmp/hr-source-private/sources.secrets.local.json`.
- El repo solo guarda codigo, no URL ni CSV/XLSX crudos.
- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Produccion: 0.
- `canImport=false`.

## Uso local

Desde cualquier carpeta en PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\paula\OneDrive\Documentos\GitHub\demoCXOrbia-rc-20260630\tools\hr-source\run-tya-hr-source-private-full-flow.ps1"
```

El runner detecta repo/rama y pide la URL HR en la consola local. No pegar URL en ChatGPT.

## Salidas locales

En:

```text
tmp/hr-source-private-full-flow
```

Genera:

- `hrSourcePrivateFullFlow.md`
- `hrSourcePrivateFullFlow.json`
- `runner-private-full-flow-*.txt`

## Criterio de exito

Para considerar cerrada la lectura HR/historico:

- `test`: HTTP 200.
- `preview`: HTTP 200.
- `sync-request`: HTTP 200 y `status=blocked`.
- todos con `canImport=false`.
- reporte incluye tabs/periodos esperados.
- reporte incluye filas por pais/periodo.
- diferencias quedan como issues/revision, no como importacion.

## Si falla

No repetir empalme ni reiniciar. Revisar el reporte local:

- si falta staging preview: ejecutar pipeline seguro de staging antes del full flow;
- si falla XLSX: revisar permisos/export de Google Sheets;
- si cae a CSV fallback: no considerar lectura historica completa;
- si faltan tabs/meses: documentar como bloqueo antes de importar.

## Estado

Listo para ejecucion local guiada. No autoriza escritura DEV ni produccion.
