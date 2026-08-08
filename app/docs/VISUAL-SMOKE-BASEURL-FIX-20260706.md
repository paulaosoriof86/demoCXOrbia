# Visual smoke baseURL fix

Fecha: 2026-07-06

Se reviso el primer run de visual smoke.

Resultado inicial:

- Run ID: `28837245890`
- Workflow: `CXOrbia Phase A Visual Smoke`
- Paso fallido: `Run visual smoke`
- Artifact: `phase-a-visual-smoke-report`

Diagnostico:

- El artifact solo contenia captura PNG.
- La captura estaba en blanco.
- El script navegaba con `page.goto('/')` sin baseURL.
- La falla era del harness, no necesariamente de la app.

Correccion:

- `tools/qa/tya-phase-a-visual-smoke.mjs` ahora usa `currentBaseURL`.
- `enterRole` navega a la URL completa local.
- El contexto de Playwright recibe baseURL.
- El script escribe reporte JSON/MD aun si ocurre error fatal.

Estado seguro: sin deploy, sin produccion, sin merge final, sin proveedores reales, sin imports y sin datos sensibles.

Siguiente paso: revisar nuevo run de visual smoke. Si falla, el artifact debe incluir reporte estructurado.
