## 2026-07-15 - R18D hotfix focalizado reconciliado

- Candidata recibida: `Prototype development request CXOrbia V131 fix.zip`, versión interna V132.
- SHA-256 candidata: `788a32a6d44e0686b0627a47e4e4e038fdbe7d3befd3dde2651ff542706918bb`.
- Auditoría delta contra baseline activa V131: no se repitió auditoría general ni empalme completo.
- La candidata contenía el fix necesario, pero su archivo completo regresaba `porPais()` de `data.project()` a `data.period()` respecto del runtime empalmado.
- Empalme reconciliado: se conservó `data.project()` y se agregó `period: () => p` únicamente al adapter local de `serieMensual()`.
- Archivo funcional modificado: `app/core/finanzas-core.js`.
- CI modificado: `.github/workflows/cxorbia-phase-a-r18d-visible-overlays-smoke.yml` ahora se activa y valida ante cambios de Finanzas.
- No se importaron `core/build-lock.js` ni `docs/MANIFEST-V132.json` de la candidata porque correspondían al árbol prototipo, no a la unión runtime activa.
- Source lock actualizado mediante `app/docs/MANIFEST-V131-R18D-HOTFIX-R1.json` y `app/core/build-lock.js`.
- Registro canónico actualizado en `backend/contracts/prototype-baseline-registry-v1.json` sin crear baseline paralela.
- Workflow R18D `29437465036`: `PASS_R18D_VISIBLE_OVERLAYS`.
- Finanzas, Shoppers y Certificación renderizan; 0 errores de consola/página.
- 14 periodos, 616 visitas, 44 visitas del periodo activo, 216 shoppers, 196 controles financieros y 92 revisiones financieras.
- 0 pagos, lotes o certificaciones confirmadas; 0 writes/imports/deploy/producción.

Clasificación:

- `Reusable CXOrbia`: adapters locales deben satisfacer contratos completos sin alterar identidad proyecto/periodo; CI debe dispararse por el archivo funcional afectado.
- `Exclusivo cliente`: conteos TyA/Cinépolis y overlays R14C/R11D.
- `Claude/prototipo`: P0 de Finanzas cerrado; no se requiere nuevo paquete.
- `Academia`: sin cambio de curso o contenido; solo mantener distinción proyecto/periodo y estados financieros honestos.
- `Sin impacto Claude`: source lock, registro, workflow y evidencia backend.

## 2026-07-14 - Empalme controlado V131

- Candidata interna V131 aceptada y empalmada.
- 45 archivos runtime integrados.
- Finanzas preserva separacion proyecto-periodo.
- Topbar V131 aceptado.
- Importador usa CX.dataSource.sourceContract().
- Sin deploy, produccion, import real ni writes.
