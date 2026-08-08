# HR Source endpoint DEV smoke

Fecha: 2026-07-03
Estado: script de validacion local agregado.

## Archivo agregado

- `tools/hr-source/tya-hr-source-dev-smoke.mjs`

## Proposito

Validar que el endpoint local HR Source responda correctamente a las tres acciones del contrato:

- `test`
- `preview`
- `sync-request`

## Validaciones

El smoke falla si:

- el endpoint no responde HTTP 200;
- falta `status`;
- `issues` no es arreglo;
- `canImport` no es `false`;
- `sync-request` no queda en estado `blocked`.

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- No deploy.
- No usa credenciales.
- No imprime PII.

## Uso local

Con el endpoint local levantado en otra ventana:

```powershell
node .\tools\hr-source\tya-hr-source-dev-smoke.mjs
```

Endpoint por defecto:

```text
http://127.0.0.1:8787/api/hr-source
```

Para usar otro endpoint:

```powershell
$env:CXORBIA_HR_SOURCE_ENDPOINT = "http://127.0.0.1:8787/api/hr-source"
node .\tools\hr-source\tya-hr-source-dev-smoke.mjs
```

## Resultado esperado

Debe imprimir:

```text
CXOrbia HR Source DEV smoke OK
```

Y un JSON con resultados por accion.

## Full check integrado

Para evitar pasos manuales separados, tambien se agrego:

- `tools/hr-source/tya-hr-source-dev-full-check.mjs`
- `app/docs/HR-SOURCE-DEV-FULL-CHECK-20260703.md`

Ese script levanta temporalmente el endpoint, ejecuta smoke, genera reporte y detiene el servidor.
