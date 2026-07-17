# ADDENDUM MAESTRO — CARRIL OPERATIVO LOCAL REUTILIZABLE CXORBIA

Fecha: 2026-07-17

## Regla operativa

Las candidatas completas se empalman en un workspace que contenga simultáneamente el ZIP y el checkout Git autenticado. No se transportan mediante blobs, trees, workflows, Drive o Base64 desde la conversación.

Flujo permanente:

`Claude Design → ZIP → auditoría ChatGPT → plan JSON → integrador local → commit/push → verificación → validación visual`.

Codex queda como apoyo puntual para instalación o conflictos complejos, no como requisito de cada candidata.

## Multi-tenant y multi-proyecto

- El motor pertenece al producto CXOrbia.
- Cada ejecución selecciona explícitamente el tenant.
- Cada tenant debe declarar `multiProject: true` y no puede tener un proyecto global por defecto.
- Los perfiles de proyecto son opcionales y explícitos.
- Cinépolis es únicamente el primer proyecto de TyA usado para adaptar y validar el sistema.
- Sus cifras, HR, cuestionarios, pagos, certificaciones y reglas nunca se convierten en defaults del tenant o del producto.
- Los siguientes proyectos TyA deben crearse y configurarse desde la plataforma.
- Los siguientes tenants reutilizan el mismo motor con políticas propias.

## Componentes

- `tools/integration/workspace-preflight.mjs`.
- `tools/integration/empalme-candidate.mjs`.
- `tools/integration/run-latest.mjs`.
- `tools/integration/CXORBIA-EMPALMAR-ULTIMA-CANDIDATA.cmd`.
- políticas de producto, tenant y proyecto bajo `tools/integration/policies/`.
- `incoming/` para el ZIP y el plan auditado.

## Preflight y rollback

Antes de copiar se verifica repo, remoto, rama, HEAD, árbol limpio, SHA del ZIP, autorización de push, extractor, rutas permitidas y ausencia de proyecto global por defecto. Un FAIL detiene el proceso sin rutas alternativas.

El integrador respalda fuera del repo, aplica solo el delta autorizado, protege overlays/backend/docs, valida sintaxis e index, genera manifest/build-lock/registro/documentación, crea commit y push. Si falla antes del commit, restaura el respaldo.

## V156

V156 mantiene GO, con 35 archivos modificados y 0 eliminados. El carril queda preparado para aplicarla sin convertir Cinépolis en lógica global. V156 solo se considerará empalmada con commit/push verificable, build-lock V156 y validaciones aplicables.

## Estado seguro

No autoriza deploy, merge, producción, imports reales, Firestore/HR writes, Make/Gemini live, Storage real ni pagos.
