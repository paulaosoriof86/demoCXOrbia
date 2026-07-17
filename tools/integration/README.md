# Carril local determinístico de empalmes CXOrbia

Este directorio replica el patrón operativo probado en Orbit: candidata completa + repositorio Git real + validadores + commit/push en el mismo workspace.

## Principios

- El motor pertenece al producto **CXOrbia**, no a TyA ni a Cinépolis.
- La política de tenant se selecciona explícitamente.
- La política de proyecto es opcional y explícita.
- Ningún proyecto se convierte en default del tenant o del producto.
- Cinépolis existe únicamente como el primer perfil de validación del tenant TyA.
- Nuevos proyectos TyA se crean y configuran desde la plataforma.
- Nuevos tenants reutilizan el mismo motor con otra política de tenant.

## Componentes

- `workspace-preflight.mjs`: confirma repo, rama, HEAD, árbol limpio, identidad del ZIP, autorización de push, rutas permitidas y política multi-proyecto.
- `empalme-candidate.mjs`: extrae el ZIP, aplica únicamente el delta auditado, protege backend/overlays/docs, valida, genera manifest/build-lock/registro, documenta, crea commit y hace push.
- `run-latest.mjs`: selecciona el último plan en `incoming/` y ejecuta preflight + empalme.
- `CXORBIA-EMPALMAR-ULTIMA-CANDIDATA.cmd`: acceso de una sola acción para Windows.
- `policies/cxorbia-product.json`: reglas comunes del SaaS multi-tenant.
- `policies/tenants/tya.json`: TyA declarado multi-proyecto y sin proyecto por defecto.
- `policies/projects/tya-cinepolis.json`: perfil opcional del primer proyecto; nunca se carga implícitamente.

## Flujo ordinario

1. Claude Design entrega el ZIP completo.
2. ChatGPT audita y genera `EMPALME-<VERSIÓN>.json` con SHA y delta exactos.
3. ZIP y plan se colocan en `incoming/`.
4. Se ejecuta `CXORBIA-EMPALMAR-ULTIMA-CANDIDATA.cmd`.
5. El motor hace preflight. Si falla, no modifica nada.
6. Si pasa, empalma, valida, documenta, crea commit y hace push.
7. ChatGPT verifica el commit y continúa con gates y validación visual.

## Idempotencia y rollback

- `app/docs/EMPALME-CANDIDATE-REGISTRY.json` impide aplicar dos veces el mismo SHA.
- Antes de copiar se crea respaldo fuera del repo en `%USERPROFILE%\.cxorbia-backups`.
- Si falla sintaxis, index, política, overlay o gate antes del commit, se restaura automáticamente el estado anterior.
- Un preflight fallido no habilita workflows, Drive, Base64, blobs manuales ni otra ruta paralela.

## Replicación

Para otro proyecto, copiar `policies/projects/PROJECT.template.json` y declarar solo validaciones específicas. Para otro tenant, copiar la política TyA, cambiar `tenantId`, mantener `multiProject: true` y no definir `defaultProjectId`.

## Seguridad

Este carril no autoriza deploy, producción, importaciones reales, writes Firestore/HR, Make/Gemini live ni pagos. Esas operaciones conservan gates y autorizaciones independientes.
