# Data source selector contract V78 TyA

Fecha: 2026-07-04

## Proposito

Definir el contrato del selector de fuente de datos para que el prototipo pueda distinguir demo, local y backend DEV sin cambiar los modulos.

## Estados permitidos

| Estado | Significado | Uso permitido |
|---|---|---|
| demo | datos ficticios del prototipo | demostracion visual |
| local | datos del navegador | pruebas sin backend |
| backend-dev-preview | datos DEV staging en preview | revision controlada |
| unavailable | backend no disponible | fallback seguro |

## Reglas

- El selector no debe cambiar visuales ni logicas de modulos.
- El selector debe exponer estado claro para debug y soporte.
- Si backend DEV no esta disponible, no debe romper la navegacion.
- Si el estado es preview, debe mantenerse como lectura/revision.
- La fuente seleccionada debe respetar tenantId y projectId.

## Mensajes tecnicos esperados

- Fuente demo.
- Fuente local.
- Fuente backend DEV preview.
- Backend no disponible.
- Preview sin autorizacion de accion real.

## Estado

- Contrato documental.
- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
