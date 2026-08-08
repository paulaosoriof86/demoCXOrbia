# Paquete Claude completo acumulado post synthetic coverage CXOrbia TyA

Fecha: 2026-07-08  
Destino: Claude/prototipo  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge/no deploy/no produccion  
Ultimo head validado por ChatGPT antes de este paquete: `b69e012972c8862529806a76dff7a875183a12b2`  
Gates confirmados en ese head: RC Smoke, Predeploy, Drift y Visual Smoke en success.  
Estado: paquete acumulado para aprovechar capacidad de Claude sin romper backend.

## 1. Proposito

Este paquete reemplaza cualquier prompt corto anterior para Claude. Es el paquete acumulado completo para que Claude trabaje el prototipo con contexto, pendientes, cambios backend recientes, patrones reutilizables, Academia y restricciones.

Claude debe avanzar el prototipo comercializable, pero sin tocar backend, contratos, tools, workflows, integraciones reales ni datos reales.

## 2. Lectura obligatoria antes de modificar

Claude debe leer, en este orden, como fuente principal:

1. `app/docs/00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md`
2. `app/docs/ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
3. `app/docs/MASTER-CONTEXT-ADDENDUM-ACADEMIA-DEEP-INTERACTIVE-20260704.md`
4. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`
5. `RESUMEN-PARA-CLAUDE.md`
6. `PENDIENTES-PROTOTIPO.md`
7. `CAMBIOS-BACKEND.md`
8. `app/docs/AUDITORIA-CANDIDATA-V90-COPY-HONESTO-20260707.md`
9. `app/docs/V90-RESIDUAL-COPY-SWEEP-CXORBIA-20260707.md`
10. `app/docs/CLAUDE-PACKAGE-ADMIN-OPERATIVO-PHASE-A-20260707.md`
11. `app/docs/CLAUDE-PACKAGE-INDEX-REUSABLE-BACKEND-PATTERNS-CXORBIA-20260707.md`
12. `app/docs/CLAUDE-PATRONES-REUTILIZABLES-BACKEND-PRODUCTO-CXORBIA-20260707.md`
13. `app/docs/ADMIN-CONFIGURABILITY-CONTRACT-CXORBIA-20260708.md`
14. `app/docs/CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md`
15. `app/docs/SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md`
16. `app/docs/SYNTHETIC-INPUT-PACK-EXPANDED-COVERAGE-CXORBIA-20260708.md`
17. `app/docs/QUESTIONNAIRE-ROUTING-CONTRACT-CXORBIA-20260708.md`
18. `app/docs/VISIT-LIFECYCLE-CONTRACT-CXORBIA-20260708.md`
19. `app/docs/SETTLEMENT-ELIGIBILITY-CONTRACT-CXORBIA-20260708.md`
20. `app/docs/EVIDENCE-STORAGE-CONTRACT-CXORBIA-20260708.md`
21. `app/docs/HISTORICAL-IMPORT-CLEAN-CONTRACT-CXORBIA-20260708.md`
22. `app/docs/SENSITIVE-DATA-POLICY-PHASE-A-TYA-20260704.md`
23. `app/docs/ACADEMIA-IMPLEMENTATION-BACKLOG-BACKEND-TO-DATE-20260704.md`
24. `app/docs/ACADEMIA-BACKFILL-BACKEND-BLOCKS-TO-DATE-20260704.md`
25. `app/docs/ACADEMIA-COVERAGE-AUDIT-BACKEND-TO-DATE-20260704.md`

Si hay conflicto entre documentos, Claude debe detenerse y reportarlo. No debe asumir.

## 3. Reglas absolutas

Claude NO debe:

- tocar `tools/`;
- tocar `app/contracts/`;
- tocar `.github/workflows/`;
- tocar backend adapters o contratos backend;
- activar Firestore/Auth/Storage reales;
- activar HR write real;
- activar Make real;
- activar Gemini real;
- activar correo/WhatsApp real;
- activar pagos reales;
- ejecutar import real;
- agregar datos reales o sensibles;
- subir DPI, banco, NDA firmado, tokens, webhooks, adjuntos, cuerpos crudos, telefonos/correos crudos;
- hacer merge;
- hacer deploy;
- marcar production ready;
- reescribir modulos completos;
- redisenar visualmente sin necesidad;
- cambiar arquitectura.

Claude puede modificar `app/modules` y contenido de Academia cuando el cambio sea de prototipo/UX/copy, pero debe hacerlo de forma puntual, documentada y sin meter logica backend.

## 4. Objetivo general para Claude

Entregar una candidata nueva de prototipo que:

1. Corrija todos los textos que prometen acciones reales no activas.
2. Integre de forma comercializable los avances backend como estados preview/gates, sin prometer integraciones reales.
3. Haga visibles los pendientes administrables de Phase A.
4. Refuerce Academia profunda e interactiva con contenido de los bloques acumulados.
5. Mantenga Phase A operativa y coherente con HR, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-proyecto y cuestionarios configurables.
6. Mantenga separacion clara entre prototipo, backend preparado, provider gate off y produccion real.

## 5. Bloque P0: textos honestos acumulados

Buscar y corregir textos visibles que prometen ejecucion real cuando aun solo existe preview/gate/backend pendiente.

Terminos a buscar:

- `WhatsApp enviado`
- `Correo enviado`
- `HR sincronizada`
- `HR sincronizado`
- `shopper notificado`
- `notificado`
- `enviado`
- `Payload de prueba enviado`
- `en vivo`
- `cuestionario enviado`
- `pago realizado`
- `pagado`
- `importado`
- `sincronizado`
- `conectado`
- `Make activo`
- `Gemini activo`
- `Storage activo`

Usar copy honesto:

- `preparado`
- `pendiente confirmacion`
- `pendiente backend`
- `pendiente gate`
- `preview`
- `requiere revision`
- `no ejecutado`
- `proveedor no activo`
- `pendiente sincronizacion real`
- `pendiente envio real`
- `pendiente pago real`
- `cuestionario completado` o `cuestionario realizado`, no `cuestionario enviado`, cuando aplique.

Archivos candidatos prioritarios:

- `app/modules/postulaciones.js`
- `app/modules/dashboard.js`
- `app/modules/automatizaciones.js`
- `app/modules/cuestionario-shopper.js`
- `app/modules/correo.js`
- `app/modules/finanzas.js`
- `app/modules/importador.js`
- `app/modules/reservas.js`
- `app/modules/operacion-extra.js`
- `app/modules/academia.js`
- `app/modules/manuales-data.js`, si existe
- `app/core/topbar.js`, solo si conserva copy operativo visible de envio real

Criterio de aceptacion P0:

- No debe quedar copy visible que diga que envio/sincronizo/importo/pago/conecto algo real si el gate esta apagado.
- No debe depender solo de `production-copy-guard`; el copy en modulos debe quedar corregido de forma permanente cuando sea seguro.
- No romper navegacion, Academia, dashboard, Postulaciones, Reservas, Automatizaciones, Cuestionario shopper, Finanzas ni Importador.

## 6. Bloque UX acumulado: readiness/gates/diagnostico preview

Claude debe crear o ajustar una visualizacion clara, minimalista y honesta para diagnosticos preview, sin conectar backend real.

Debe reflejar estos conceptos:

- synthetic input pack runner;
- synthetic input pack expanded coverage;
- conflict review queue;
- import readiness;
- admin configurability;
- release readiness snapshot;
- questionnaire routing;
- visit lifecycle;
- settlement eligibility;
- evidence storage;
- historical import clean;
- rule versioning;
- notification outbox;
- assignment sync conflicts.

Estados permitidos:

- `preview listo`;
- `diagnostico ejecutado`;
- `fixture sintetico`;
- `input sanitizado`;
- `warning`;
- `fail`;
- `pendiente fuente real`;
- `pendiente gate real`;
- `pendiente revision humana`;
- `produccion no autorizada`;
- `proveedor no activo`.

Estados prohibidos salvo integracion real futura aprobada:

- `produccion lista`;
- `import real ejecutado`;
- `sync real aplicado`;
- `envio real realizado`;
- `pago real confirmado`;
- `provider activo`;
- `deploy realizado`;
- `Firestore conectado`;
- `HR sincronizada`.

## 7. Bloque administrabilidad acumulada

Todos los modulos/opciones deben tender a ser administrables desde plataforma por tenant/proyecto, con roles, versionado, auditRef, gate y revision humana.

Claude debe reflejar visualmente, sin backend real:

### Proyecto/tenant

- pais;
- moneda;
- HR URL/origen como referencia opaca;
- cuestionario/origen;
- documentos requeridos;
- reglas;
- certificacion;
- agendamiento;
- reprogramacion;
- cancelacion;
- pagos;
- integraciones;
- roles/permisos;
- gates.

### NDA

- plantilla;
- version;
- vigencia;
- estado;
- creador;
- aprobador;
- auditRef;
- gate;
- reaceptacion;
- aceptaciones ya presentadas conservadas.

Estados honestos NDA:

- `pendiente`;
- `aceptado`;
- `version vencida`;
- `requiere nueva aceptacion`;
- `bloqueado por gate`.

No modificar silenciosamente una aceptacion ya presentada o firmada.

### Planes

Planes administrables y versionados por tipo:

- operativo;
- proyecto;
- certificacion;
- pagos;
- evidencias;
- automatizaciones;
- Academia.

Estados:

- borrador;
- en revision;
- aprobado;
- activo;
- pausado;
- reemplazado;
- archivado.

Cambios criticos deben pedir razon y mostrar gate/revision humana antes de activar/reemplazar versiones.

## 8. Bloque conflict review/import readiness

Claude debe reflejar una UX visible para cola de conflictos e import readiness, sin backend real.

La bandeja de conflictos debe mostrar:

- conflicto;
- entidad afectada;
- severidad `info`, `warning`, `blocker`;
- sourceRefs opacas;
- estado `abierto`, `en revision`, `resuelto`, `rechazado`, `archivado`;
- auditRef;
- razon obligatoria para resolver/rechazar.

Readiness por area debe mostrar:

- proyectos;
- visitas;
- shoppers;
- asignaciones;
- certificaciones;
- liquidaciones;
- pagos;
- rutas de cuestionario.

Reglas:

- Si hay `blocker`, la UI debe bloquear import/activacion y mostrar revision humana requerida.
- `ready_preview` no significa importado.
- `resolved` preview no significa aplicado real.
- sourceRef opaca no significa fuente real conectada.
- No deduplicar por nombre, sucursal o coincidencia visual.
- Si falta llave estable suficiente, mostrar revision humana.

## 9. Bloque Phase A operativo

Claude debe mantener Phase A enfocada en operacion real futura controlada TyA, sin desviarse.

Debe estar reflejado:

- HR como fuente operacional completa;
- import historico como base de control, no import real aun;
- shoppers historicos completos desde HR;
- certificaciones ya presentadas conservadas;
- visitas hasta junio ejecutadas; junio pendiente es pagos/liquidaciones, no visitas;
- liquidaciones con estado de pago;
- minimo corte junio;
- multi-proyecto desde el inicio;
- Cinepolis como un proyecto TyA, no logica unica;
- proyecto configurable por tenant/proyecto;
- cuestionario configurable por proyecto/visita: CXOrbia, TyAOnline, plataforma externa, link general o link por visita desde HR;
- Make futuro con gate;
- Gemini futuro con revision humana.

## 10. Bloque sincronizacion HR/plataforma

Claude debe reflejar la logica, sin activar sincronizacion real:

Plataforma -> HR:

- aprobacion/asignacion registra origen plataforma;
- Make futuro actualizara HR;
- visita sale de disponibles;
- no duplica al reflejarse en HR.

HR -> Plataforma:

- asignacion en HR se detectara;
- asigna shopper;
- visita sale de disponibles;
- no duplica si ya venia de plataforma.

Llaves estables:

- tenantId;
- projectId;
- visitId/hrRowId;
- shopperId;
- assignmentSource;
- assignmentSyncStatus;
- lastSyncedAt.

Si hay conflicto:

- no sobrescribir silenciosamente;
- enviar a revision humana;
- mostrar sourceRefs opacas.

## 11. Bloque liquidaciones/pagos/Mis beneficios

Claude debe reforzar:

- junio es corte de pagos/liquidaciones pendientes, no visitas pendientes;
- visita realizada no equivale a pago;
- cuestionario realizado no equivale a submitido ni pago;
- submitido/revision gatean liquidacion;
- liquidaciones deben tener estado;
- pagos reales no ejecutados;
- lotes seleccionables por admin;
- movimientos individuales asociados a lote/item;
- Mis beneficios separa honorario, boleto, combo, reembolso total, total y estado;
- no exponer banco, DPI, NDA, notas internas ni datos sensibles.

Estados honestos sugeridos:

- no elegible;
- elegible preview;
- en revision;
- preparado;
- pendiente pago real;
- confirmado por revision;
- bloqueado por datos faltantes;
- conflicto requiere revision.

## 12. Bloque cuestionarios/certificaciones/Gemini

Claude debe reflejar:

- cuestionario configurable por proyecto/visita;
- ruta CXOrbia;
- TyAOnline;
- plataforma externa;
- referencia general;
- referencia por visita desde HR;
- `cuestionario realizado/completado` no `enviado` si no hay envio real;
- certificaciones ya presentadas conservadas;
- bancos de preguntas Gemini futuros con revision humana;
- Gemini no activo;
- no autoaprobar sin gate.

## 13. Bloque evidencias/Storage

Claude debe reflejar:

- evidencias por proyecto/visita;
- foto/video/audio/recibo/documento como tipo requerido;
- Storage futuro pendiente gate;
- no subir archivos reales;
- no mostrar adjuntos crudos;
- no aceptar base64 ni cuerpos crudos;
- estados: requerido, preparado, pendiente carga real, pendiente revision, aceptado preview, rechazado requiere motivo.

## 14. Bloque datos sensibles

Claude debe evitar exponer:

- DPI;
- pasaporte;
- banco;
- cuenta bancaria;
- NDA firmado;
- firmas;
- telefonos/correos crudos;
- webhooks;
- tokens;
- secrets;
- adjuntos;
- base64;
- cuerpos de email/WhatsApp crudos;
- URLs privadas.

Usar:

- referencias opacas;
- estado protegido;
- requiere autorizacion;
- pendiente backend seguro;
- dato no visible por politica.

## 15. Bloque Academia profunda e interactiva

Claude debe actualizar Academia con profundidad real y no superficial.

Debe incluir rutas por rol:

- superadmin;
- admin;
- ops;
- finance;
- shopper;
- academy_admin;
- technical_reviewer.

Debe incluir cursos/manuales/checklists/glosario sobre:

1. Phase A y alcance operativo.
2. HR como fuente operacional.
3. Import historico preview vs import real.
4. Shoppers historicos y llaves estables.
5. Certificaciones ya presentadas y carryover.
6. Visitas, reservas, franja, quincena y rango.
7. Postulaciones y asignaciones.
8. Sincronizacion HR/plataforma.
9. Cola de conflictos.
10. Import readiness.
11. Admin configurability.
12. NDA versionado y reaceptacion.
13. Planes versionados.
14. Rule versioning.
15. Changelog/centro de actualizaciones.
16. Notification outbox.
17. WhatsApp/correo con gate apagado.
18. Email/user mailbox provider-agnostic.
19. CRM/documentos externos con referencias opacas.
20. Shopper communication history.
21. Ranking/scoring sin autoasignacion real.
22. Cuestionario routing.
23. Evidencias/Storage futuro.
24. Liquidaciones/pagos/Mis beneficios.
25. Cinepolis Boleto/Combo.
26. Synthetic input pack runner.
27. Synthetic expanded coverage.
28. Release readiness snapshot.
29. Source-safe report.
30. Datos sensibles y privacidad.
31. Diferencia entre preparado, preview, gate, proveedor configurado, proveedor activo y ejecucion real.
32. Revision humana obligatoria.

Academia debe evitar decir que algo ya esta conectado, enviado, pagado, importado o desplegado si solo esta preparado.

## 16. Patrones reutilizables CXOrbia que Claude debe incorporar visualmente

Estos son patrones de producto, no exclusivos de TyA:

- multi-tenant por tenantId/projectId;
- configuracion administrable por proyecto;
- llaves estables;
- sourceRefs opacas;
- revision humana;
- gates por integracion;
- auditRef;
- estados honestos;
- preview vs ejecucion real;
- source-safe inputs;
- synthetic fixtures;
- readiness dashboard;
- conflict queue;
- admin actions con motivo;
- versionado de reglas/planes/NDA;
- no overwrite silencioso;
- no dedupe visual;
- datos sensibles protegidos;
- provider-agnostic integrations;
- Make/Gemini como providers futuros con gate;
- Academia transversal por rol.

## 17. Archivos/modulos donde Claude puede trabajar

Claude puede tocar, con cuidado y cambios puntuales:

- `app/modules/academia.js`
- `app/modules/automatizaciones.js`
- `app/modules/configuracion.js`
- `app/modules/correo.js`
- `app/modules/cuestionario-shopper.js`
- `app/modules/dashboard.js`
- `app/modules/finanzas.js`
- `app/modules/importador.js`, si existe
- `app/modules/misvisitas.js`
- `app/modules/operacion-extra.js`
- `app/modules/postulaciones.js`
- `app/modules/proyecto-wizard.js`
- `app/modules/proyectos.js`
- `app/modules/reservas.js`
- `app/modules/revision-admin.js`
- `app/modules/shoppers.js`
- `app/modules/visita-detalle.js`
- documentos `app/docs/` asociados a su entrega.

Debe evitar tocar `app/core` salvo copy visible puntual y justificado. Si necesita tocar core, debe explicar exactamente por que.

## 18. Validaciones esperadas por Claude

Claude debe ejecutar o reportar:

- revision de scripts en `app/index.html`;
- no scripts locales faltantes;
- no duplicados de IDs en Academia;
- `node --check` de JS modificados si aplica;
- busqueda de residuos P0: enviado/sincronizado/notificado/en vivo/importado/conectado/pagado;
- navegacion basica sin pantalla blanca;
- Academia abre;
- Dashboard abre;
- Postulaciones abre;
- Reservas abre;
- Automatizaciones abre;
- Cuestionario shopper abre;
- Finanzas abre;
- no datos sensibles visibles;
- no providers activos.

## 19. Documentacion esperada por Claude

Claude debe entregar:

1. Lista exacta de archivos modificados.
2. Tabla de textos corregidos por archivo.
3. Modulos donde agrego estados/diagnostico preview.
4. Cambios en Academia por curso/manual/ruta/rol.
5. Pendientes que quedan.
6. Riesgos detectados.
7. Confirmacion de que no toco backend/tools/contracts/workflows.
8. Confirmacion de que no activo providers ni produccion.
9. ZIP/prototipo candidato nuevo.

Si toca docs, crear un documento en `app/docs/` con nombre tipo:

`CAMBIOS-CLAUDE-CANDIDATE-COMPLETO-POST-SYNTHETIC-COVERAGE-YYYYMMDD.md`

## 20. Criterio GO/NO GO para aceptar candidata Claude

GO solo si:

- no hay errores JS;
- no hay pantalla blanca;
- no se rompe navegacion;
- Academia abre y conserva rutas/cursos;
- no quedan promesas visibles de envio/sync/pago/import/conexion real sin gate;
- no se tocan backend/tools/contracts/workflows;
- no se activan providers;
- no se agregan datos sensibles;
- los cambios son puntuales y documentados;
- se conserva Phase A.

NO GO si:

- reescribe modulos completos sin necesidad;
- redisenia sin autorizacion;
- cambia arquitectura;
- toca backend o contracts;
- rompe Academia;
- oculta pendientes en vez de mostrarlos como gates;
- promete produccion o integraciones reales;
- incluye datos reales/sensibles;
- deduplica por coincidencia visual;
- modifica aceptaciones NDA ya presentadas;
- marca pagos como reales sin confirmacion.

## 21. Prompt compacto para pegar en Claude

Usa este prompt completo:

```text
CXOrbia TyA — PAQUETE CLAUDE COMPLETO ACUMULADO POST SYNTHETIC COVERAGE

Trabaja en repo paulaosoriof86/demoCXOrbia, rama docs-tya-v6-v71-audit, PR #7 draft/open/no merge/no deploy/no produccion. Ultimo head validado por ChatGPT: b69e012972c8862529806a76dff7a875183a12b2 con RC Smoke, Predeploy, Drift y Visual Smoke en success.

Antes de modificar, lee obligatoriamente:
- app/docs/00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md
- app/docs/ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md
- app/docs/MASTER-CONTEXT-ADDENDUM-ACADEMIA-DEEP-INTERACTIVE-20260704.md
- app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md
- RESUMEN-PARA-CLAUDE.md
- PENDIENTES-PROTOTIPO.md
- CAMBIOS-BACKEND.md
- app/docs/AUDITORIA-CANDIDATA-V90-COPY-HONESTO-20260707.md
- app/docs/V90-RESIDUAL-COPY-SWEEP-CXORBIA-20260707.md
- app/docs/CLAUDE-PACKAGE-ADMIN-OPERATIVO-PHASE-A-20260707.md
- app/docs/CLAUDE-PACKAGE-INDEX-REUSABLE-BACKEND-PATTERNS-CXORBIA-20260707.md
- app/docs/CLAUDE-PATRONES-REUTILIZABLES-BACKEND-PRODUCTO-CXORBIA-20260707.md
- app/docs/ADMIN-CONFIGURABILITY-CONTRACT-CXORBIA-20260708.md
- app/docs/CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md
- app/docs/SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md
- app/docs/SYNTHETIC-INPUT-PACK-EXPANDED-COVERAGE-CXORBIA-20260708.md
- app/docs/QUESTIONNAIRE-ROUTING-CONTRACT-CXORBIA-20260708.md
- app/docs/VISIT-LIFECYCLE-CONTRACT-CXORBIA-20260708.md
- app/docs/SETTLEMENT-ELIGIBILITY-CONTRACT-CXORBIA-20260708.md
- app/docs/EVIDENCE-STORAGE-CONTRACT-CXORBIA-20260708.md
- app/docs/HISTORICAL-IMPORT-CLEAN-CONTRACT-CXORBIA-20260708.md
- app/docs/SENSITIVE-DATA-POLICY-PHASE-A-TYA-20260704.md
- app/docs/ACADEMIA-IMPLEMENTATION-BACKLOG-BACKEND-TO-DATE-20260704.md
- app/docs/ACADEMIA-BACKFILL-BACKEND-BLOCKS-TO-DATE-20260704.md
- app/docs/ACADEMIA-COVERAGE-AUDIT-BACKEND-TO-DATE-20260704.md

Reglas absolutas: no tocar tools, app/contracts, workflows, backend adapters, integraciones reales, Firestore/Auth/Storage/HR/Make/Gemini/correo/WhatsApp/pagos/import real, datos sensibles, merge, deploy ni produccion. No redisenar ni reescribir modulos completos. Mantener UTF-8. Si hay conflicto entre documentos, detenerte y reportarlo.

Objetivo: entregar una candidata de prototipo que corrija textos honestos P0, integre visualmente avances backend como preview/gates, refuerce Academia profunda, y mantenga Phase A operativa.

Bloques obligatorios:
1. Corregir copy P0: WhatsApp enviado, Correo enviado, HR sincronizada, shopper notificado, enviado, Payload enviado, en vivo, cuestionario enviado, pago realizado, pagado, importado, sincronizado, conectado, Make/Gemini/Storage activo. Sustituir por preparado, pendiente confirmacion, pendiente backend, pendiente gate, preview, requiere revision, no ejecutado, proveedor no activo, pendiente sincronizacion real, pendiente envio real, pendiente pago real, cuestionario completado/realizado.
2. UX diagnostica preview: synthetic input pack runner, expanded coverage, conflict review queue, import readiness, admin configurability, release readiness, questionnaire routing, visit lifecycle, settlement eligibility, evidence storage, historical import clean, rule versioning, notification outbox, assignment sync conflicts. Mostrar pass/fail/warnings, gates apagados, fuente real pendiente y produccion no autorizada.
3. Administrabilidad: tenant/proyecto, reglas, HR/origen, cuestionarios, documentos, NDA, planes, evidencias, certificaciones, Academia, notificaciones, postulaciones, shoppers, visitas, reservas, asignaciones, reprogramaciones, cancelaciones, liquidaciones, pagos, integraciones, roles y gates. NDA y planes deben ser editables/versionados, sin modificar aceptaciones ya presentadas.
4. Conflict review/import readiness: bandeja de conflictos con severidad, estado, sourceRefs opacas, auditRef y razon obligatoria. Readiness por proyectos, visitas, shoppers, asignaciones, certificaciones, liquidaciones, pagos y rutas de cuestionario. No dedupe visual ni por nombre.
5. Phase A: HR fuente operacional, historico como control, shoppers historicos, certificaciones presentadas conservadas, junio pendiente pagos no visitas, liquidaciones/pagos, multi-proyecto, Cinepolis como proyecto TyA, cuestionarios configurables, Make/Gemini futuros con gate.
6. HR/plataforma sync: plataforma->HR y HR->plataforma con llaves tenantId, projectId, visitId/hrRowId, shopperId, assignmentSource, assignmentSyncStatus, lastSyncedAt. Conflictos a revision humana.
7. Liquidaciones/Mis beneficios: honorario, boleto, combo, reembolso total, total, estado, lote/item, sin banco/DPI/NDA. Visita realizada no equivale pago; cuestionario realizado no equivale submitido ni pago.
8. Cuestionarios/certificaciones: CXOrbia/TyAOnline/externo/general/HR por visita, certificaciones ya presentadas, Gemini con revision humana, no autoaprobar.
9. Evidencias/Storage: tipos requeridos, Storage pendiente gate, sin adjuntos crudos/base64, estados honestos.
10. Datos sensibles: no exponer DPI, banco, NDA firmado, firmas, telefonos/correos crudos, webhooks, tokens, secrets, adjuntos, base64, cuerpos crudos, URLs privadas. Usar referencias opacas y estados protegidos.
11. Academia profunda: rutas por rol, cursos/manuales/checklists/glosario para todos los bloques acumulados, especialmente synthetic runner, expanded coverage, source-safe, gates, conflict queue, import readiness, admin configurability, liquidaciones/pagos, cuestionarios, evidencias y datos sensibles.
12. Patrones reutilizables CXOrbia: multi-tenant, project config, stable keys, sourceRefs opacas, human review, gates, auditRef, estados honestos, preview vs real, source-safe inputs, synthetic fixtures, readiness dashboard, conflict queue, admin actions con motivo, versionado, no overwrite silencioso, no dedupe visual, privacy, provider-agnostic integrations, Academia transversal.

Archivos candidatos: app/modules/academia.js, automatizaciones.js, configuracion.js, correo.js, cuestionario-shopper.js, dashboard.js, finanzas.js, importador.js si existe, misvisitas.js, operacion-extra.js, postulaciones.js, proyecto-wizard.js, proyectos.js, reservas.js, revision-admin.js, shoppers.js, visita-detalle.js y docs app/docs relacionados. Evita app/core salvo copy visible puntual y justificado.

Validaciones: scripts index, no scripts faltantes, no IDs duplicados Academia, node --check JS modificados, busqueda de residuos P0, navegacion base, Academia/Dashboard/Postulaciones/Reservas/Automatizaciones/Cuestionario/Finanzas abren, no datos sensibles, no providers activos.

Entrega: ZIP/prototipo candidato nuevo, lista de archivos modificados, textos corregidos por archivo, modulos con diagnostico preview, cambios Academia por curso/manual/ruta/rol, pendientes restantes, riesgos, confirmacion de que no tocaste backend/tools/contracts/workflows ni activaste providers/produccion.
```

## 22. Estado seguro de este paquete

Este paquete es documentacion para Claude. No cambia runtime. No activa backend. No cambia `app/modules`. No cambia `app/core`. No hace deploy. No hace merge. No importa datos. No conecta proveedores. No contiene datos sensibles.
