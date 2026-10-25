# CAMBIOS BACKEND — ADDENDUM VALIDACIÓN VISUAL ACUMULATIVA

**Fecha:** 2026-08-02  
**Estado:** `VISUAL_VALIDATION_REQUIRED_PER_CUMULATIVE_CHECKPOINT__NO_TECHNICAL_PASS_SUBSTITUTION`

## Cambio documental

Se incorporó `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md` para impedir que la reconstrucción vuelva a declarar módulos o cortes aprobados únicamente por gates técnicos.

## Regla nueva prevalente dentro de la reconstrucción

- ninguna familia se aprueba funcionalmente sin validación visual expresa de Paula;
- la aprobación queda vinculada al build, commit, manifest y URL exactos;
- los módulos se revisan uno por uno dentro de checkpoints acumulativos;
- no se hace deploy por archivo ni se espera hasta el final de todos los módulos;
- cada build nuevo revalida de forma abreviada las familias ya aprobadas;
- cualquier hallazgo se corrige sobre la misma candidata acumulativa;
- un PASS técnico no sustituye la revisión humana.

## Checkpoints

1. A+B: shell/runtime + CRM Ops Leads, Dashboard y hoja de ruta.
2. +C+D: operación, histórico y experiencia Shopper.
3. +E+F: Finanzas, portales y reportes.
4. +G: administración, Academia y revisión acumulativa final.

## Criterios recuperados, no arbitrarios

Entrada humana única, proyecto/periodo separados, HR viva, navegación por rol, ausencia de demo en TyA, cero métricas fabricadas, estabilidad sin reload/pantalla blanca, identidad Shopper exacta, Finanzas delegadas/regalía 0 y reportes con alcance/periodo/fuente coherentes.

## Clasificación

- **Reusable CXOrbia:** validación visual por build y checkpoint acumulativo.
- **Exclusivo cliente:** criterios TyA/Cinépolis.
- **Claude/prototipo:** no presentar PASS técnico como aprobación visual.
- **Academia:** manuales y cursos deben corresponder al build aprobado.
- **Sin impacto Claude:** SHAs, manifests y trazabilidad.

## Estado seguro

Cambios funcionales 0; Hosting/Cloud Run/provider writes 0; merge false; producción intacta.