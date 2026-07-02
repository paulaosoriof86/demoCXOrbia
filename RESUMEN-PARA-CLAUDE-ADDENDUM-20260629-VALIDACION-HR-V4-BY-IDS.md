# RESUMEN-PARA-CLAUDE-ADDENDUM-20260629-VALIDACION-HR-V4-BY-IDS

## Contexto

Se continúa el backend/migración de CXOrbia en PR #1, rama `feat/firebase-backend-dev-config-20260627`, con Firebase DEV `cxorbia-backend-dev`.

La carga del histórico HR GT/HN V4 fue autorizada por Paula y ejecutada en Firestore DEV. La validación/documentación posterior quedó incompleta, por lo que no debe repetirse la carga todavía.

## Lo conectado o preparado

Se preparó una validación de solo lectura:

```text
firebase/client-write-tools/validate-hr-historico-v4-by-ids-firestore-dev-sdk.mjs
```

La validación compara IDs exactos esperados desde:

```text
firebase/private-output/hr-tya-historico-good-firestore-transform-v4.json
```

Contra rutas Firestore DEV:

- `tenants/tya`
- `tenants/tya/clients/{clientId}`
- `tenants/tya/projects/{projectId}`
- `tenants/tya/shoppers/{shopperId}`
- `tenants/tya/projects/{projectId}/visits/{visitId}`
- `tenants/tya/projects/{projectId}/questionnaires/{questionnaireId}`
- `tenants/tya/projects/{projectId}/liquidations/{liquidationId}`

## Lo pendiente

1. Paula debe ejecutar el bloque PowerShell de validación local.
2. Revisar el reporte local generado en `firebase/private-output/`.
3. Documentar el resultado final en repo.
4. Solo si todo da `OK`, avanzar a la siguiente fase de preview/lectura funcional.

## Lo que NO se debe hacer todavía

- No repetir carga HR V4.
- No activar adapter global.
- No Hosting.
- No merge.
- No producción.
- No Storage/evidencias.
- No modificar `/app/modules`.

## Frontend pendiente para Claude

Claude debe revisar y mejorar el prototipo por lotes cuando Paula pida el documento completo. Pendientes ya identificados:

1. Configuración no funciona correctamente.
2. Lo que hoy se hace por scripts debe poder ejecutarse desde UI administrativa.
3. Crear proyecto desde plataforma debe incluir fuente externa, mapeo de columnas, países, periodos, creación automática, deduplicación, conflictos y preview antes de escribir.
4. HR debe poder operar como fuente viva, no solo como importación histórica.
5. Periodos mensuales GT/HN deben ser seleccionables y filtrables.
6. Certificaciones no vienen de HR y deben migrarse desde BD actual u otra fuente confiable.
7. Storage/evidencias sigue pendiente por Blaze.
8. Instalar como app debe usar logo/favicon del cliente y activar instalación directa cuando el navegador lo permita.

## Regla de doble documentación agregada

Se documentó la decisión:

```text
DECISION-DOBLE-DOCUMENTACION-TYA-CXORBIA-20260629.md
```

Cada hallazgo debe clasificarse como:

- TyA específico.
- CXOrbia generalizable.
- Ambos.

## Clasificación de este bloque

- TyA específico: histórico HR GT/HN V4 y tenant `tya`.
- CXOrbia generalizable: patrón de validación por IDs exactos después de migraciones y manejo de fuentes externas vivas/históricas.
