## 2026-07-16 - V151 auditoría comercial / dos P0 restantes

- Candidata externa: `Prototype development request (3).zip`; identidad interna V151.
- ZIP SHA-256: `5d364e22371d2d97bed45745cdcd986e38e814b0a2c87d7529f6b31e48b620f9`.
- Manifest V151: 200 archivos, aggregate `ef55c21d16e0cb2d6c62a145266b3bfd17274c4b1ffd2bfe2e33f69f5cd7dc51`, 0 diferencias.
- JavaScript: 0 fallos de sintaxis.
- Alcance corregido: Claude mantiene el prototipo comercializable genérico; no configura TyA/Cinépolis.
- Se conservan los proyectos demo curados Retail, Banca y Restaurantes.
- Hallazgo P0: la migración deduplica, pero deja visibles `Proyecto A`, `Test Dedupe Unico` y `Equipo Operativo (prueba)`.
- Hallazgo P0: V151 todavía permite lenguaje técnico en superficies `admin`; admin/ops/coordinador/aliado también son audiencias comerciales.
- Paquete focalizado: `PAQUETE-EXCLUSIVO-CLAUDE-V151-CIERRE-COMERCIAL-2P0-20260716.zip`, SHA-256 `670d2dd9c6133a2c1e753c2e63f1642e36ec4a382af30beb2868cf462dcec50b`.
- No hubo empalme, deploy, producción, imports ni writes.

Clasificación:

- `Reusable CXOrbia`: demo limpio, cleanup de fixtures y copy por audiencia.
- `Exclusivo cliente`: sin cambio TyA/Cinépolis.
- `Claude/prototipo`: solo dos P0.
- `Academia`: técnico interno solo para super; contenido comercial en lenguaje funcional.
- `Sin impacto Claude`: TyA source-safe y exclusión Hosting se resolverán en backend/empalme.

## 2026-07-15 - R18E validación visual NO-GO / paquete R19

- Hosting DEV y smoke técnico R18D permanecen PASS.
- Revisión visual de Paula confirmó errores funcionales no cubiertos por el smoke anterior.
- Se documentaron reglas definitivas de `Pend. realizar`, shopper activo, visitas postulables, país nuevo y medición quincenal Cinépolis.
- Se creó `app/docs/AUDITORIA-VISUAL-R18E-NO-GO-20260715.md`.
- Se creó `app/docs/PLAN-R19-CIERRE-MODULO-A-MODULO-20260715.md`.
- Se creó `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-R19-VISUAL-NO-GO-20260715.md`.
- Se creó `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-R19-VISUAL-NO-GO-20260715.md`.
- Se creó `app/docs/ACADEMIA-IMPACT-R19-VISUAL-NO-GO-20260715.md`.
- Paquete externo Claude: `cxorbia-claude-r19-cierre-operativo-visual-20260715`, con cinco bloques P0, matriz de aceptación, protocolo anti-reproceso y 15 evidencias.
- El siguiente bloque queda encadenado: candidata Claude → auditoría delta → gates semánticos → empalme → Hosting DEV → revisión visual Paula → freeze.
- No se modificó runtime, frontend, backend, datos, Firebase ni integraciones en este registro.

Clasificación:

- `Reusable CXOrbia`: estados ortogonales, contexto proyecto/periodo, configuración reusable, gates semánticos y freeze por módulo.
- `Exclusivo cliente`: Cinépolis mensual/quincenal y evidencia TyA.
- `Claude/prototipo`: cinco P0 del paquete R19.
- `Academia`: sincronización obligatoria de conceptos de estados, periodo de medición, finanzas y PWA.
- `Sin impacto Claude`: documentación de proceso, checkpoint y PR.

## 2026-07-15 - R18E Firebase Hosting DEV controlado

- Autorización explícita limitada a Firebase Hosting DEV del build V131 R18D.
- Proyecto: `cxorbia-backend-dev`.
- Target: `cxorbia-dev`.
- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`.
- Build: `v131-r18d-source-safe-20260715-r18e`.
- Commit exacto desplegado: `fe9a498863dd8454c174971781e8dbbb606a3131`.
- Firebase Hosting version: `projects/87461567267/sites/cxorbia-backend-dev/versions/32e865ce08af0d99`.
- Workflow `29442279729`: todas las etapas PASS.
- Smoke local y remoto: `PASS_R18D_VISIBLE_OVERLAYS`.
- Validado remotamente: 14 periodos, 616 visitas, 44 visitas activas, 216 shoppers, 196 controles financieros y 92 revisiones.
- Finanzas, Shoppers y Certificación renderizados; 0 errores de consola/página, blockers o warnings.
- No producción, Firestore/Auth/Storage/HR writes, imports, Make, Gemini ni pagos.
- Credencial temporal eliminada del runner.
- Workflow R18D restaurado a smoke-only.
- Autorización, workflows y marcadores temporales de uso único eliminados; no queda deploy automático activo.

## 2026-07-15 - R18D hotfix focalizado reconciliado

- Candidata recibida: `Prototype development request CXOrbia V131 fix.zip`, versión interna V132.
- SHA-256 candidata: `788a32a6d44e0686b0627a47e4e4e038fdbe7d3befd3dde2651ff542706918bb`.
- Auditoría delta contra baseline activa V131: no se repitió auditoría general ni empalme completo.
- Se conservó `data.project()` y se agregó `period: () => p` únicamente al adapter local de `serieMensual()`.
- Workflow R18D `29437465036`: `PASS_R18D_VISIBLE_OVERLAYS`.
- 0 pagos, lotes o certificaciones confirmadas; 0 writes/imports/deploy/producción.

## 2026-07-14 - Empalme controlado V131

- Candidata interna V131 aceptada y empalmada.
- 45 archivos runtime integrados.
- Finanzas preserva separacion proyecto-periodo.
- Topbar V131 aceptado.
- Importador usa CX.dataSource.sourceContract().
- Sin deploy, produccion, import real ni writes.
