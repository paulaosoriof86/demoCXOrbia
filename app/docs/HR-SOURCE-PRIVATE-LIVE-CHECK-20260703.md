# HR Source private live check

Fecha: 2026-07-03
Estado: herramientas locales agregadas, sin Firestore writes.

## Archivos agregados

- `tools/hr-source/tya-hr-source-private-registry.mjs`
- `tools/hr-source/tya-hr-source-register-private.mjs`
- `tools/hr-source/tya-hr-source-live-check.mjs`

## Proposito

Preparar el conector real de HR viva sin guardar el enlace completo en el repositorio ni en Firestore.

El flujo local queda separado en dos pasos:

1. Registrar la fuente de forma privada local.
2. Ejecutar un live check contra la fuente registrada.

## Registro privado local

El registro crea dos archivos dentro de `tmp/hr-source-private`:

- `sources.safe.json`: metadatos seguros, sin URL completa.
- `sources.secrets.local.json`: URL completa solo local, no versionada.

Ambos quedan bajo `tmp/`, fuera de los archivos versionados.

## Comando de registro

```powershell
$env:CXORBIA_HR_SOURCE_URL = "PEGAR_AQUI_URL_HR_SOLO_LOCAL"
node .\tools\hr-source\tya-hr-source-register-private.mjs
```

Alternativa:

```powershell
node .\tools\hr-source\tya-hr-source-register-private.mjs --url="PEGAR_AQUI_URL_HR_SOLO_LOCAL"
```

## Live check

```powershell
node .\tools\hr-source\tya-hr-source-live-check.mjs
```

Genera reporte local en:

```text
tmp/hr-source-private/live-check
```

Archivos:

- `hrSourceLiveCheck.md`
- `hrSourceLiveCheck.json`

## Alcance actual

- Google Sheets: prueba export CSV de un `gid` y cuenta filas/columnas.
- Excel Online: prueba acceso, pero deja parsing pendiente para Graph/export connector.

## Limitacion documentada

El check local de Google Sheets valida un solo `gid`. Para HR completo multi-tab se necesitara:

- Google Sheets API con credencial backend privada; o
- export XLSX + parser backend; o
- Google Drive connector controlado por backend.

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- No se sube URL completa.
- No se suben CSV crudos.
- `canImport` permanece false.

## Siguiente paso

Conectar este live check al endpoint DEV para que `preview` pueda usar fuente viva cuando exista `sourceRef` privado, manteniendo bloqueada la importacion.
