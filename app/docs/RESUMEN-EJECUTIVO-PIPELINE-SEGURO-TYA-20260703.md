# Resumen ejecutivo - Pipeline seguro TyA

Fecha: 2026-07-03

## Objetivo

Tener una referencia unica para ejecutar y entender el pipeline local seguro de migracion TyA sin revisar toda la conversacion.

El pipeline no escribe Firestore, no importa datos y no hace deploy.

## Rama y PR

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama de trabajo: `docs-tya-v6-v71-audit`
- Base estable: `release/cxorbia-tya-rc-20260630`
- PR: #7 draft

## Script principal

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\migration\run-tya-local-safe-pipeline.ps1
```

## Que ejecuta

1. Sincroniza la rama correcta.
2. Valida Node.
3. Valida archivos requeridos.
4. Valida `tmp/tya-staging-preview`.
5. Ejecuta HR Source private flow check.
6. Ejecuta HR Source multitab preview.
7. Genera contrato DEV bloqueado.
8. Valida contrato DEV.
9. Genera matriz de gates DEV/Staging/Produccion.
10. Genera reporte local en Descargas.

## Salidas locales

- `tmp/hr-source-private-flow-check/`
- `tmp/hr-source-private/multitab-preview/`
- `tmp/tya-dev-import-contract/`
- `tmp/tya-dev-import-contract-validation/`
- `tmp/tya-production-gates-matrix/`

## Estado esperado

El estado esperado es seguro aunque existan blockers:

- `canImport=false`
- `canWriteToFirestore=false`
- `executeAllowed=false`
- `Firestore writes=0`
- `importsExecuted=0`
- `deploy=0`

Si hay errores criticos de datos, el contrato debe quedar bloqueado; eso es correcto.

## Gates que bloquean escritura futura

- DPI/PII shoppers sin politica final.
- Duplicados de cuestionario.
- Encoding/mojibake RTDB sin resolver o excluir.
- Destinatarios de notificaciones sin resolver.
- Fila adicional `JUNIO 26 HN` sin revisar.
- Liquidaciones sin cruce financiero externo.
- Rollback no probado.
- Reglas Firestore/Auth/Storage no validadas para fase real.
- Sin autorizacion explicita de Paula.

## Regla para Claude

Claude debe reflejar en el prototipo visual:

- HR Source sin guardar URL completa.
- `sourceRef` opaco o referencia enmascarada.
- Estados honestos: preview, warning, bloqueado, pendiente backend, importacion no autorizada.
- Matriz de gates por fase: DEV preview, DEV import, staging y produccion.
- No presentar preview como importacion real.

## Regla de continuidad

Un nuevo ZIP de Claude no reinicia el backend. Se audita como RC incremental, se empalma sobre la rama backend estable y se documenta lo resuelto, pendiente y nuevo para Claude.
