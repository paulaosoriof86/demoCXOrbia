# HR Source DEV full check

Fecha: 2026-07-03
Estado: script local de prueba integral agregado.

## Archivo agregado

- `tools/hr-source/tya-hr-source-dev-full-check.mjs`

## Propósito

Ejecutar una prueba local integral del flujo HR Source DEV sin pasos manuales separados.

El script:

1. Verifica que exista `tmp/tya-staging-preview`.
2. Levanta temporalmente `tools/hr-source/tya-hr-source-dev-server.mjs`.
3. Espera a que el endpoint local responda.
4. Ejecuta acciones `test`, `preview` y `sync-request`.
5. Valida que `canImport=false`.
6. Valida que `sync-request` quede `blocked`.
7. Detiene el servidor.
8. Genera reporte Markdown y JSON.

## Salidas locales

En:

```text
tmp/hr-source-dev-full-check
```

Genera:

- `hrSourceDevFullCheck.md`
- `hrSourceDevFullCheck.json`

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- No deploy.
- No credenciales.
- No importa datos.
- No abre producción.
- No imprime PII.

## Uso local

Desde la raíz del repo:

```powershell
node .\tools\hr-source\tya-hr-source-dev-full-check.mjs
```

## Resultado esperado

Debe mostrar resultados para:

- `test`
- `preview`
- `sync-request`

Y debe confirmar:

```text
canImport=false
Firestore writes=0
Imports executed=0
```

## URL de preview sugerida

El script imprime la URL relativa de preview:

```text
app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxHrSourceLocal=1
```

## Siguiente paso

Después de validar este full check local, el siguiente avance será construir el conector real Google Sheets / Excel Online con fuente privada y manteniendo `canImport=false` hasta autorización explícita.
