## 2026-07-20 - Corte 1A HR viva confirmada y redeploy de estabilidad/reportes

- Paula confirmó lectura HR viva con cambios reales: una fecha de cuestionario actualizó KPI y una asignación HR retiró una visita disponible del shopper.
- Causa raíz de recargas: la revisión incluía timestamps regenerados; el watcher recargaba aunque no cambiara el negocio.
- Causa raíz de reportes bloqueados: el build live no cargaba `CX_TYA_CORTE1_REPORTS`.
- Se creó `app/adapters/tya-corte1-report-projection-live.js`.
- Se actualizaron `backend/runtime/hr-live-service/server.mjs`, `app/adapters/tya-live-source-refresh-watch.js` y `tools/release/tya-source-safe-live-binding-build-r22.mjs`.
- No se modificaron `app/modules/**` ni `app/core/**`.
- Run DEV `29794082358`, job `88521746632`: todos los pasos PASS.
- Source HEAD desplegado: `42f1c1f9c9f142c34ee92224af425712c7c1e396`.
- Decisión: `PASS_LIVE_HR_STABLE_REVISION_AND_LIVE_REPORTS_DEV_DEPLOY`.
- Artefacto `8481386393`, digest `sha256:0a278c92c608e5e4887f9692e12cfa9dac2ea487c3e9badfb960e9d4bae3e54e`.
- Pendiente frontend: Panorama por periodo; diseño, branding, gráficas y administración real de reportes.
- Pendiente de cierre: validación visual, retiro del workflow temporal y freeze solo con `APROBADO`.
- Estado seguro: sin merge, producción, import real, escrituras HR/Firestore/Auth/Storage, Make/Gemini live ni pagos.

Clasificación:

- `Reusable CXOrbia`: revisión estable, bootstrap/cache, watcher anti-loop y proyección live de reportes.
- `Exclusivo cliente`: fuente TyA/Cinépolis DEV parametrizada por tenant/proyecto.
- `Claude/prototipo`: Panorama y diseño/administración de reportes localizados por archivo/módulo.
- `Academia`: lectura viva, diferencia HR/resultados y exportación por rol.
- `Sin impacto Claude`: Cloud Build, Cloud Run, Hosting, IAM y workflow temporal.

---

## 2026-07-16 - V155 auditoría / único P0 comercial restante

- Candidata externa: `Prototype development request (5).zip`; identidad interna V155.
- ZIP SHA-256: `5dfd63bb7568e5dba9d70d6817b03998b8cb01a3cc144ac17f63fbb8a729ab13`.
- Manifest V155: 204 archivos, aggregate `1c32731bcb249d5e8c2291d89932afbedf42f15687a849865b613aa85f231f51`, 0 diferencias.
- JavaScript: 0 fallos de sintaxis.
- P0 proyectos aprobado: limpieza tenant-scoped, sanitización repetible de fixtures y preservación de otros tenants.
- Gates protegidos aprobados: `hasTechAccess=false`, curso `a_backend` oculto, Finanzas protegida y PWA con un único propietario.
- Único P0 restante: copy técnico visible en superficies comerciales y ausencia de gate automatizado por rol/módulo.
- Ejemplos confirmados en `core/ui.js`, `core/topbar.js`, `core/automations.js`, `core/manuales-data.js`, `modules/dashboard.js`, `modules/postulaciones.js`, `modules/hr-source.js`, `modules/importador.js`, `modules/integraciones.js`, `modules/marketing.js` y `modules/proyectos.js`.
- Paquete focalizado: `PAQUETE-EXCLUSIVO-CLAUDE-V155-UNICO-P0-GATE-COMERCIAL-20260716.zip`, SHA-256 `995e5964ada9f3cc3f730fe32de897c0b88394e2a6882a5c51debebf23ddc549`.
- No hubo empalme, deploy, producción, imports ni writes.

Clasificación:

- `Reusable CXOrbia`: gate automatizado de lenguaje comercial por rol/módulo.
- `Exclusivo cliente`: sin cambio TyA/Cinépolis.
- `Claude/prototipo`: un único P0.
- `Academia`: manuales/cursos comerciales sin jerga interna; técnico solo para audiencia protegida.
- `Sin impacto Claude`: baseline registry, Hosting y empalme TyA permanecen posteriores.

## 2026-07-16 - V153 auditoría delta / dos P0 reales restantes

- Candidata externa: `Prototype development request (4).zip`; identidad interna V153.
- ZIP SHA-256: `bb5727668dc6356358b09867df7415b12c318b8bcf2e08e909d728644032d377`.
- Manifest V153: 202 archivos, aggregate `ea2543b1726e4fc32fb4e2b5e95a58e5e057f499c812e2d905e07bbd91ccb1dd`, 0 diferencias.
- JavaScript: 0 fallos de sintaxis.
- Delta contra V151: 18 archivos modificados, 4 agregados y 0 eliminados.
- Protecciones preservadas: Finanzas usa `data.project()` y adapter `project()/period()/visitas()`; PWA conserva un único listener.
- P0 confirmado: migración de proyectos elimina residuos sin comprobar tenant y queda desactivada para residuos creados después de la marca de migración.
- P0 confirmado: curso técnico `a_backend` no queda oculto porque el filtro usa el ID incorrecto.
- P0 confirmado: `?internal=1` concede acceso técnico al admin comercial.
- P0 confirmado: persisten textos técnicos visibles en módulos/manuales comerciales.
- No hubo empalme, deploy, producción, imports ni writes.

## 2026-07-16 - V151 auditoría comercial / dos P0 restantes

- Candidata externa: `Prototype development request (3).zip`; identidad interna V151.
- Manifest V151: 200 archivos, 0 diferencias y 0 fallos de sintaxis.
- Se conservan los proyectos demo curados.
- Hallazgos: residuos de proyectos visibles y lenguaje técnico en superficies comerciales.
- No hubo empalme, deploy, producción, imports ni writes.

## 2026-07-15 - R18E validación visual NO-GO / paquete R19

- Hosting DEV y smoke técnico R18D permanecen PASS.
- Revisión visual de Paula confirmó errores funcionales no cubiertos por el smoke anterior.
- Se documentaron reglas definitivas de `Pend. realizar`, shopper activo, visitas postulables, país nuevo y medición quincenal Cinépolis.
- El siguiente bloque quedó encadenado a candidata, auditoría delta, empalme, Hosting DEV, revisión visual y freeze.
- No se modificó runtime, frontend, backend, datos, Firebase ni integraciones en ese registro.
