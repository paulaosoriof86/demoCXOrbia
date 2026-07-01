# RESUMEN-PARA-CLAUDE.md

## 2026-06-30 - Estado B2/B3 backend V57

- La RC `release/cxorbia-tya-rc-20260630` fue actualizada contra el ZIP local `Prototype development request CXOrbia V57.zip`.
- La base visual V57 no debe mezclarse con la rama vieja `feat/firebase-backend-dev-config-20260627`.
- `app/index.html` queda como demo/prototipo normal sin backend global.
- `app/index-backend-dev.html` queda como preview backend DEV.
- El backend de novedades/tablón se resolvio sin tocar `modules/tablon.js`.
- Claude solo debe recibir pendientes visuales reales del prototipo V57, no fallas del preview backend DEV.
- Issue #4 sigue siendo frontend/Claude: incorporar tablón/modal de novedades si el prototipo visual lo requiere.
- Issue #5 queda cubierto a nivel backend local con modelo `bulletins`/`bulletinReads`, pendiente validacion con emulador/reglas cuando haya Java.
- Issue #6 queda avanzado: V57 + backend DEV preservado, sin deploy ni produccion.

Resumen vivo para entregar a Claude/frontend sin mezclar incidencias de integración backend con mejoras reales del prototipo.

## 2026-06-30 — Actualización V57 recibida

Paula entregó `Prototype development request CXOrbia V57.zip` como nueva base visual más reciente de Claude. Desde este punto, el backend debe trabajarse sobre V57 sin perder Firebase DEV, reglas, Auth DEV, HR histórico, beneficios y documentación previa.

Documentos específicos creados:

- `PLAN-TRABAJO-BACKEND-V57.md`
- `PENDIENTES-PROTOTIPO-V57.md`
- `RESUMEN-PARA-CHATGPT-BACKEND-V57.md`
- `RESUMEN-PARA-CLAUDE-V57.md`
- `INCIDENCIAS-INTEGRACION-BACKEND-V57.md`
- `CAMBIOS-BACKEND-V57.md`

Reglas de continuidad:

- V57 es la nueva referencia visual/funcional.
- No usar la rama backend vieja como base visual.
- No tocar `/app/modules` para resolver backend.
- Mantener `app/index.html` como prototipo normal.
- Mantener `app/index-backend-dev.html` como único preview backend DEV.
- Cada nueva entrega de Claude debe revisarse antes de seguir para no perder backend ni documentación.

Pendientes Claude actualizados:

- Ver `PENDIENTES-PROTOTIPO-V57.md`.

Incidencias backend separadas:

- Ver `INCIDENCIAS-INTEGRACION-BACKEND-V57.md`.

Siguiente gate backend:

1. Portar preview backend sobre V57.
2. Mostrar fuente real: Firestore o localStorage/demo.
3. Mostrar Auth OK o error claro.
4. Mostrar tenant `tya`.
5. Mostrar conteos Firestore TyA.
6. Validar admin y shopper sin mezclar datos demo.

## 2026-06-30 — Continuidad RC V56 + backend DEV

### 1. Regla de trabajo

- La base visual correcta previa fue `release/cxorbia-tya-rc-20260630`.
- Esa RC venía del prototipo V56 completo y correcto.
- No usar como base visual la rama `feat/firebase-backend-dev-config-20260627` porque está divergida.
- No modificar `/app/modules` ni reescribir lógica del frontend desde backend.
- No modificar `app/index.html` para activar backend global sin autorización final.
- El único preview backend debe ser `app/index-backend-dev.html`.
- Todo cambio debe quedar documentado en `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` e incidencias backend separadas.

### 2. Estado backend DEV real

Firebase DEV:

- Proyecto: `cxorbia-backend-dev`.
- Tenant: `tya`.
- Firestore DEV configurado.
- Reglas Firestore DEV publicadas.
- Auth DEV ficticio creado/importado.
- HR histórico V4 cargado.
- `shopperBenefits` cargado.
- Lectura admin OK.
- Lectura shopper propia OK.
- Aislamiento shopper OK.
- Lectura directa de beneficio ajeno bloqueada.

Resultado validado de beneficios:

- Total beneficios: 572.
- Shoppers únicos: 188.
- GT: 441 beneficios, total 26,460.00.
- HN: 131 beneficios, total 26,200.00.
- Shopper positivo validado: `shp-b2e3d7bef69b`, 25 registros propios.

### 3. Estado del preview backend anterior

Resultado observado:

- La página abre.
- La insignia muestra backend DEV conectado.
- Pero los conteos observados fueron: proyecto `banca`, 3 proyectos, 108 visitas, 16 shoppers, 48 postulaciones y Auth pendiente.

Interpretación:

- El preview backend está cargando, pero todavía parece mostrar datos demo/localStorage, no datos TyA reales de Firestore.
- La insignia no debe considerarse evidencia suficiente de conexión real.
- Para pasar gate debe mostrar Auth OK, fuente Firestore, tenant TyA y conteos TyA reales.

### 4. Ruta de producción realista

Publicable solo como RC visual/demo controlada si no se cierra el gate backend.

No publicar producción operativa real hasta cerrar Auth + Firestore + tenant TyA visible.

## 2026-06-30 22:20:17 - Backend V57 rules, sin tocar prototipo
- Backend: se corrigio irestore.rules agregando las colecciones V57 faltantes despues de utomations.
- Validador: check-firestore-rules-v57-coverage.mjs ahora falla realmente si falta una regla.
- No tocar desde frontend: no se modificaron /app/modules ni logica visual.
- Pendiente para Claude: cuando trabaje el prototipo, usar el prototipo mas reciente y no reintroducir el estado localStorage/demo como si fuera backend conectado.
- Separacion obligatoria: Claude debe corregir frontend/prototipo, sin romper ni revertir avances backend V57.

## 2026-06-30 22:26:21 - Backend V57 + paquete de pendientes
- No se tocaron /app/modules.
- No se hizo deploy, merge ni carga real.
- Se completo cobertura rules V57.
- Se genero PAQUETE-PARA-CLAUDE-PENDIENTES-PROTOTIPO-V57.md.
- Claude debe trabajar sobre el prototipo mas reciente, no sobre versiones viejas.
- Claude no debe revertir avances backend V57 ni reintroducir errores ya documentados.
- Pendiente frontend/prototipo: eliminar avisos tecnicos visibles, corregir codificacion real si aparecen simbolos rotos, evitar datos demo y mantener separacion frontend/backend.

## 2026-06-30 22:29:01 - Nota de continuidad Backend V57
- Rules V57 queda con cobertura requerida.
- El fallo previo fue del bloque PowerShell/Git, no del frontend ni del prototipo.
- Claude debe trabajar sobre el prototipo mas reciente sin revertir backend V57.
- Mantener separacion frontend/backend y no tocar avances de reglas, validadores ni preview backend.

## 2026-06-30 22:36:46 - Paquete Claude y continuidad Backend V57
- Se genero/actualizo PAQUETE-PARA-CLAUDE-PENDIENTES-PROTOTIPO-V57.md.
- Claude debe trabajar sobre el prototipo mas reciente.
- No debe revertir backend V57.
- No debe reintroducir datos demo/localStorage como si fueran Firestore real.
- No debe tocar ni romper el punto de preview backend app/index-backend-dev.html.
- Pendientes principales: codificacion UTF-8, eliminar avisos tecnicos visibles, quitar datos demo/banca en TyA, corregir KPIs, HR dinamico, postulaciones, certificaciones, ranking, liquidaciones y beneficios.

## 2026-06-30 23:38:12 - Pendientes para Claude desde pruebas tipo Orbit
- Se debe mantener documentado que CXOrbia necesita pruebas equivalentes a Orbit: smoke Firestore, tenant isolation y module render smoke.
- Claude debe trabajar sobre el prototipo mas reciente, sin revertir backend V57 ni tocar helper local.
- Pendientes prototipo a no reintroducir:
  - no mostrar datos demo/banca en tenant TyA;
  - no mostrar avisos tecnicos en UI final;
  - no romper UTF-8;
  - no duplicar secciones/titulos;
  - no perder modulos existentes al mejorar frontend;
  - no tocar app/index-backend-dev.html como punto de preview backend.

## 2026-07-01 03:51:27 - Prototipo V59 aplicado y auditado

- Se aplico Prototype development request CXOrbia V59.zip como prototipo mas reciente.
- Se preservo backend protegido:
  - pp/index-backend-dev.html
  - archivos pp/core/*backend*.js
  - helper local ignorado si existe.
- Se genero AUDITORIA-PROTOTIPO-V59.md.
- Se genero PENDIENTES-PROTOTIPO-V59.md.
- Se actualizo PENDIENTES-PROTOTIPO.md.
- No se asume cierre total de pendientes de Claude hasta validacion visual.
- Auditoria V59 detecto:
  - caracteres sospechosos UTF-8: 1
  - referencias Banca: 18
  - referencias Restaurantes: 10
  - referencias localStorage: 27
- No Hosting deploy.
- No produccion.
- No Orbit.
- No datos reales.