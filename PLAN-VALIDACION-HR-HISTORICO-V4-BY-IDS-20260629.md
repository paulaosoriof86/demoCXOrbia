# PLAN-VALIDACION-HR-HISTORICO-V4-BY-IDS-20260629

## Objetivo

Validar en modo solo lectura que la carga autorizada del histórico HR GT/HN V4 quedó escrita en Firestore DEV por IDs exactos, sin repetir la carga y sin depender de conteos globales contaminados por seed/piloto DEV.

## Entrada

Archivo local esperado:

```text
firebase/private-output/hr-tya-historico-good-firestore-transform-v4.json
```

Conteos esperados desde el JSON V4:

- clients: 1
- projects: 26
- shoppers: 188
- visits: 573
- questionnaires: 556
- liquidations: 524

## Script preparado

```text
firebase/client-write-tools/validate-hr-historico-v4-by-ids-firestore-dev-sdk.mjs
```

## Qué valida

- `tenants/tya`
- `tenants/tya/clients/{clientId}`
- `tenants/tya/projects/{projectId}`
- `tenants/tya/shoppers/{shopperId}`
- `tenants/tya/projects/{projectId}/visits/{visitId}`
- `tenants/tya/projects/{projectId}/questionnaires/{questionnaireId}`
- `tenants/tya/projects/{projectId}/liquidations/{liquidationId}`

## Por qué no usa conteos globales como única prueba

Firestore DEV ya puede contener seed ficticio y piloto real previo. Por eso la prueba compara rutas e IDs esperados desde el JSON V4. Los extras encontrados dentro del tenant DEV se reportan como advertencia no bloqueante, salvo que después se confirme que pertenecen al mismo alcance histórico y deben depurarse.

## Salidas locales

El script genera salidas locales no versionadas en:

```text
firebase/private-output/resultado-validacion-hr-historico-v4-by-ids-firestore-dev.md
firebase/private-output/resultado-validacion-hr-historico-v4-by-ids-firestore-dev.json
```

## Restricciones

- No repetir carga HR V4.
- No escribir Firestore.
- No Hosting.
- No merge.
- No producción.
- No Storage/evidencias.
- No adapter global.
- No modificar `/app/modules`.

## Clasificación doble documentación

- TyA específico: valida el histórico HR GT/HN V4 del tenant `tya`.
- CXOrbia generalizable: establece patrón de validación posterior a migración por IDs exactos, evitando falsos positivos por datos DEV previos.
