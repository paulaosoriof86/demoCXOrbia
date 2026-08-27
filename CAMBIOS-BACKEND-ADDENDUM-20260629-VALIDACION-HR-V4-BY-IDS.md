# CAMBIOS-BACKEND-ADDENDUM-20260629-VALIDACION-HR-V4-BY-IDS

## 2026-06-29 — Validación HR histórico V4 por IDs exactos

### Archivos creados

- `firebase/client-write-tools/validate-hr-historico-v4-by-ids-firestore-dev-sdk.mjs`
- `PLAN-VALIDACION-HR-HISTORICO-V4-BY-IDS-20260629.md`
- `DECISION-DOBLE-DOCUMENTACION-TYA-CXORBIA-20260629.md`

### Tipo

Nuevo / documentación / herramienta local de solo lectura.

### Qué cambió

Se agregó un script de validación Firestore DEV que:

- lee el JSON local HR histórico V4;
- calcula las rutas Firestore esperadas por ID exacto;
- inicia sesión con el usuario DEV ficticio `super.dev@cxorbia-dev.example.com`;
- valida existencia de cada documento esperado;
- lee IDs reales dentro del alcance DEV para reportar extras no bloqueantes;
- genera reporte Markdown y JSON local en `firebase/private-output/`.

### Por qué

La carga HR histórico V4 ya fue autorizada y ejecutada, pero la validación/documentación posterior quedó incompleta. El siguiente paso correcto es validar por IDs exactos contra Firestore DEV, no repetir carga y no usar conteos globales como única prueba porque DEV ya puede contener seed/piloto previo.

### Impacto en frontend

Ninguno. No se modificó `/app/modules`, no se tocó UI, no se activó adapter global y no se publicó Hosting.

### Pendiente/riesgo

- Ejecutar el script localmente desde PowerShell.
- Revisar el reporte local generado.
- Si el estado es `OK`, documentar el resultado final en el repo.
- Si el estado es `REVISAR`, no repetir carga hasta analizar faltantes por ruta/ID.

### Clasificación doble documentación

- TyA específico: histórico HR GT/HN V4, tenant `tya`, conteos y periodos de T&A.
- CXOrbia generalizable: patrón de validación por IDs exactos después de migraciones con datos DEV previos.

### Restricciones conservadas

- No Hosting.
- No merge.
- No producción.
- No Storage/evidencias.
- No adapter global.
- No modificación de `/app/modules`.
