# 00 - Reglas maestras, contexto y continuidad CXOrbia TyA

Fecha: 2026-07-04
Uso: este documento debe leerse al inicio de cada nueva conversacion y antes de cualquier bloque grande de trabajo.

## 1. Proposito

Evitar que Paula tenga que volver a explicar el contexto, metodologia, reglas, logicas del tenant, estado del backend, aprendizajes, errores cometidos, pendientes de Claude y alcance de produccion.

La regla principal es: antes de proponer, pedir informacion o ejecutar cambios, leer este documento y la documentacion reciente del repo.

## 2. Contexto base del proyecto

CXOrbia es una plataforma SaaS multi-tenant de mystery shopping / field operations.

El frontend aprobado es un prototipo HTML/JS modular vanilla, sin framework, ubicado en:

- `app/`
- `app/core/`
- `app/modules/`

El tenant actual es TyA. Cinépolis es un proyecto dentro de TyA, no debe ser la unica logica de la plataforma. La plataforma debe permitir otros proyectos TyA y, luego, otros tenants.

## 3. Regla de oro

El prototipo manda.

No redisenar, no reescribir modulos y no parchar UI desde backend.

El backend puede crear archivos nuevos, contratos, adaptadores, herramientas de migracion, gates, reportes, documentacion y un unico punto futuro de conexion de `CX.data`.

Si el frontend necesita ajuste, documentarlo para Claude. No tocar `app/modules` desde backend.

## 4. Aclaracion critica sobre la plataforma anterior

La plataforma actual/anterior contiene logicas valiosas, pero tambien tiene parches, fixes y comportamientos que no funcionan correctamente. Por eso Paula decidio dejar de trabajar sobre esa base y pasar al prototipo.

Regla:

- Reutilizar logicas de negocio comprobadas de la plataforma actual.
- No copiar ciegamente codigo viejo.
- No asumir que la plataforma vieja es estable.
- No reconstruir desde cero lo ya aprendido.
- Migrar y conservar reglas utiles, flujos y datos limpios hacia el prototipo/backend nuevo.

## 5. Metodologia agil obligatoria

Trabajar en bloques grandes, seguros y documentados.

La metodologia correcta es:

1. Leer contexto y documentos antes de actuar.
2. Verificar repo/rama/PR cuando se trabaje con GitHub.
3. Avanzar en GitHub directamente siempre que sea posible.
4. Reducir instrucciones manuales a Paula.
5. Pedir informacion real solo si no esta en repo, documentos, paquetes o fuentes disponibles.
6. Documentar cada archivo creado o tocado.
7. No afirmar que algo quedo hecho si el commit fue bloqueado.
8. Si un conector bloquea una accion, documentar alternativa segura.
9. No repetir levantamientos ya hechos.
10. No reiniciar plan ni retroceder sin justificacion.

## 6. Repositorio, rama y PR

Repo correcto:

- `paulaosoriof86/demoCXOrbia`

Rama activa:

- `docs-tya-v6-v71-audit`

PR actual:

- PR #7, draft, abierto

Base estable:

- `release/cxorbia-tya-rc-20260630`

Estado historico reciente:

- Sin merge.
- Sin deploy ejecutado desde estos bloques.
- Sin import real ejecutado desde estos bloques.
- Sin escritura Firestore ejecutada desde estos bloques.
- Sin produccion ejecutada desde estos bloques.

Si Paula cambia esta autorizacion, documentarlo antes de actuar.

## 7. Documentos que se deben leer primero

Leer como minimo:

- `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md`
- `CAMBIOS-BACKEND.md`
- `RESUMEN-PARA-CLAUDE.md`
- `PENDIENTES-PROTOTIPO.md`
- documentos recientes en `app/docs/`
- herramientas recientes en `tools/migration/`
- herramientas recientes en `tools/hr-source/`

Documentos recientes especialmente importantes:

- `PHASE-A-NOT-FROM-ZERO-CONTEXT-TYA-20260704.md`
- `TODAY-PRODUCTION-CUTOVER-REALITY-TYA-20260704.md`
- `PHASE-A-EXPANDED-MUST-HAVES-TYA-20260704.md`
- `HR-PLATFORM-SYNC-CONTRACT-PHASE-A-TYA-20260704.md`
- `AI-QUESTION-BANK-PHASE-A-TYA-20260704.md`
- `CLAUDE-TASKS-STATUS-V78-TYA-20260704.md`
- `V78-SOURCE-LOCK-BACKEND-CONTINUITY-TYA-20260704.md`
- `CX-DATA-INTERFACE-INVENTORY-V78-TYA-20260704.md`
- `CX-DATA-METHOD-COMPATIBILITY-MATRIX-V78-TYA-20260704.md`
- `CX-DATA-BRIDGE-DISABLED-V78-TYA-20260704.md`
- `DEV-STAGING-READINESS-TO-AUTHORIZATION-MATRIX-TYA-20260704.md`

Tambien revisar los documentos de readiness, HR Source, migracion V6/V7.1, shopper review, legacy communications, candidate review y dry-run existentes.

## 8. Metodologia para nuevas versiones de prototipo

Cada vez que Paula entregue un nuevo prototipo:

1. No incorporarlo a ciegas.
2. Hacer auditoria forense real y profunda contra la version baseline anterior.
3. Comparar archivos agregados, eliminados y modificados.
4. Revisar no solo conteo de archivos, sino impacto semantico.
5. Validar `node --check` o equivalente si aplica.
6. Validar scripts cargados en `index.html`.
7. Detectar rutas duplicadas, modulos huerfanos, versionado residual, textos que prometen integraciones reales, bugs de UI y regresiones.
8. Separar lo que resolvio, lo que empeoro, lo que queda pendiente y lo nuevo que aparece.
9. Actualizar paquete/documento de Claude.
10. Actualizar pendientes del prototipo.
11. Mantener backend protegido y empalmar solo despues de source lock.

Cualquier mejora que backend haga directamente debe documentarse para Claude si debe pasar al prototipo comercializable.

## 9. Baseline actual de prototipo

Baseline visual actual:

- V78

Reglas:

- V78 sigue como fuente visual hasta nuevo source lock.
- El backend no debe cambiar visuales.
- Los archivos nuevos de adapter/bridge creados hasta ahora estan disabled/no importados.
- No reemplazan `CX.data`.
- No modifican modulos.

## 10. Estado del adapter/backend preparado

Se ha avanzado en cadena inactiva:

- contrato `CX.data` backend adapter;
- inventario real de uso de `CX.data`;
- scaffold inactivo del adapter;
- mapa de compatibilidad metodo por metodo;
- connection point disabled;
- bridge disabled;
- contratos de fuente demo/local/backend-dev-preview/unavailable.

Nada de esto esta conectado al runtime del prototipo.

## 11. Documentacion obligatoria

Si no esta documentado, no se hizo.

Todo archivo tocado o creado debe quedar registrado en:

- `CAMBIOS-BACKEND.md`, o addendum si el update directo queda bloqueado.

Todo pendiente de frontend/Claude debe quedar en:

- `RESUMEN-PARA-CLAUDE.md`
- `PENDIENTES-PROTOTIPO.md`
- documentos acumulados para Claude si aplica.

Bugs del prototipo:

- documentar;
- no corregir desde backend;
- pasar a Claude con archivo, modulo, problema, impacto y validacion esperada.

## 12. Errores metodologicos que no se deben repetir

- Hacer auditorias superficiales.
- Decir que un avance fue pequeno solo por numero de archivos sin analizar impacto.
- Pedir a Paula informacion ya entregada o documentada.
- Reiniciar plan por falta de contexto.
- Mezclar Orbit 360, Orbia y CXOrbia.
- Usar la plataforma vieja como base tecnica estable.
- Tocar frontend aprobado desde backend.
- Usar bloques PowerShell largos y fragiles para auditorias complejas.
- Entregar ZIPs salvo que Paula los pida explicitamente.
- Afirmar que algo se hizo si el commit fue bloqueado.
- Crear o conectar bases preexistentes de otra app.
- Activar integraciones reales sin gate.
- Omitir documentacion.

## 13. Seguridad y datos

Reglas de seguridad:

- Base nueva y limpia.
- No usar base de otra app.
- Multi-tenant por `tenantId` y `projectId`.
- Datos sensibles como DPI, banco y NDA deben excluirse, cifrarse o quedar bloqueados segun politica.
- No subir datos crudos sensibles al repo.
- No pegar URLs privadas en respuestas publicas.
- No activar Make, Gemini, Auth, Storage o Firestore real sin gate claro.

## 14. Contexto operativo TyA ya conocido

No partir de cero.

Ya se trabajo:

- lectura HR multi-tab;
- mapeo de columnas HR;
- reglas Cinépolis Q1/Q2;
- HR Source;
- shoppers historicos;
- postulaciones;
- candidates;
- legacy communications;
- deduplicacion;
- readiness;
- paquetes V6/V7.1;
- proyecto Cinépolis creado como si viniera desde plataforma.

No pedir nuevamente lo anterior salvo que no este disponible en documentos, repo o fuentes de la sesion.

## 15. Correccion sobre junio

No quedan visitas pendientes de primera quincena de junio.

Todas las visitas hasta junio estan ejecutadas y la informacion esta en HR.

Lo pendiente son pagos:

- pagos pendientes de primera quincena de junio;
- todos los pagos de segunda quincena de junio;
- hasta mayo los pagos estan completos y el dato viene del archivo de movimientos.

Julio aun es buen momento para lanzar porque no hay postulaciones nuevas ni carga operativa nueva relevante que migrar.

## 16. Shoppers y certificaciones

Los shoppers deben conservarse completos desde el historico de todas las hojas de la HR.

Adicionalmente deben conservarse las certificaciones ya presentadas por algunos shoppers para no pedirles repetir certificacion.

Reglas:

- Shoppers historicos no se pierden.
- Certificaciones aprobadas se respetan.
- Certificacion debe ser configurable por proyecto.
- IA puede ayudar a generar bancos de preguntas, con revision humana.
- No pedir nuevamente certificacion a quien ya la presento/aprobo, salvo regla explicita del proyecto.

## 17. Phase A real para salida de hoy

Phase A no es solo visual.

Debe incluir:

- import historico completo como base de control;
- lectura completa HR;
- multi-proyecto desde el inicio;
- flujos existentes conservados y mejorados;
- asignaciones reales sin duplicacion;
- certificaciones con historial conservado;
- Gemini para banco de preguntas/certificaciones;
- Make para sincronizar asignaciones plataforma/HR cuando se llegue al bloque real de integracion;
- V78 como baseline visual;
- hardening posterior.

## 18. Meta operativa de hoy

La meta de hoy es que puedan ingresar los shoppers y operar el ciclo base.

Debe funcionar o quedar listo para validacion inmediata:

1. Shopper ingresa.
2. Shopper ve documentos/instructivos del proyecto.
3. Shopper se certifica si aplica.
4. Shopper certificado previamente no repite certificacion.
5. Shopper ve visitas disponibles.
6. Shopper se postula.
7. Admin gestiona postulaciones correctas.
8. Postulaciones aprobadas actualizan HR via Make cuando Make este conectado.
9. Shopper agenda.
10. Shopper reprograma.
11. Shopper cancela si aplica.
12. Shopper marca visita realizada.
13. Plataforma direcciona al cuestionario segun configuracion del proyecto/visita.
14. Shopper marca cuestionario realizado.
15. Admin puede continuar revision/submitido/liquidacion.
16. Shopper ve liquidaciones historicas con estado de pago, al menos junio para el corte de hoy mientras se completa lo posterior.

## 19. Configuracion por proyecto

Cada proyecto debe poder configurar:

- nombre del proyecto;
- cliente;
- pais;
- reglas de visitas;
- documentos/instructivos;
- banco de certificacion;
- URL de HR;
- origen de HR;
- origen del cuestionario;
- URL general de cuestionario si aplica;
- link por visita si la HR trae links especificos;
- reglas de agendamiento;
- reglas de pago/liquidacion;
- integraciones Make/Gemini habilitadas o preparadas.

## 20. Origen del cuestionario

Cada proyecto debe poder indicar donde se llena el cuestionario.

Opciones:

- dentro de CXOrbia;
- TyAOnline;
- plataforma externa del cliente/proyecto;
- link general del proyecto;
- link especifico por visita tomado de la HR.

Para Cinépolis, el cuestionario utiliza TyAOnline.

Debe documentarse la URL de TyAOnline cuando se conecte/valide esa opcion. Si la URL no esta disponible en documentos/fuentes, pedirla a Paula en el momento exacto de conexion.

## 21. HR como fuente operacional

La HR debe conservar lectura completa y ser fuente principal para:

- visitas historicas;
- visitas disponibles;
- asignaciones;
- fechas;
- shopper asignado;
- estado de cuestionario;
- submitido/revision;
- links por visita si aplica;
- informacion historica de ejecucion.

## 22. Sincronizacion HR/plataforma con Make

Flujo plataforma -> HR:

1. Paula/admin aprueba postulacion o asigna shopper desde plataforma.
2. Plataforma registra asignacion con origen plataforma.
3. Make actualiza HR.
4. La visita sale de disponibles.
5. Si luego la HR refleja la misma asignacion, no duplicar.

Flujo HR -> plataforma:

1. Paula/admin asigna directamente en HR.
2. Plataforma/Make detecta el cambio.
3. Plataforma asigna shopper.
4. La visita sale de disponibles.
5. Si esa asignacion ya venia de plataforma, no duplicar.

No deduplicar por coincidencia visual simple. Usar llave estable.

Campos recomendados:

- `tenantId`
- `projectId`
- `visitId`
- `hrRowId`
- `shopperId`
- `assignmentSource`
- `assignmentSyncStatus`
- `lastSyncedAt`
- `syncConflict`

## 23. Regla de conflictos

No sobrescribir silenciosamente.

Enviar a revision si:

- misma visita con shoppers diferentes;
- HR y plataforma tienen fechas incompatibles;
- fila HR sin identificador suficiente;
- shopper no existe en plataforma;
- asignacion cruza proyecto incorrecto;
- hay duda de deduplicacion.

## 24. Que pedir a Paula y cuando

Antes de pedir algo, revisar repo, documentos y fuentes.

Pedir solo cuando:

- el dato no este documentado;
- el acceso real sea necesario para conectar;
- exista ambiguedad que pueda causar error operativo;
- se requiera autorizacion explicita para escritura, deploy, Make, Gemini, Auth o produccion.

Pedir Make solo cuando se llegue al bloque real de integracion Make.

Pedir URL TyAOnline solo si no esta en documentos/fuentes cuando se conecte el origen de cuestionario.

## 25. Claude y prototipo comercializable

Somos un tenant TyA, pero las mejoras utiles deben pasar a Claude cuando puedan mejorar el prototipo comercializable.

Cada hallazgo debe separarse:

- logica especifica del tenant TyA;
- mejora general SaaS/comercializable;
- bug del prototipo;
- ajuste UX;
- ajuste de configurabilidad.

Cada mejora hecha directamente por backend que afecte el prototipo debe documentarse para Claude.

## 26. Pendientes Claude acumulados conocidos

Pendientes actuales documentados:

- `app/modules/novedades.js`: revisar `nvBanner`.
- `app/modules/saas-console.js`: version default de nuevo tenant no debe quedar antigua.
- Textos de honestidad visual: no prometer WhatsApp/Make/Gemini real si no esta activo.
- PWA: validar experiencia install-aware sin prometer descarga automatica imposible en iOS.
- Configuracion de proyecto debe soportar HR, cuestionario, origen cuestionario, links por visita y multi-proyecto.

## 27. Criterios para nueva candidata Claude

Pedir nueva candidata cuando:

- haya suficientes pendientes frontend acumulados;
- un pendiente frontend bloquee Phase A;
- se vaya a probar punto unico de conexion real;
- se necesite validar UX/PWA antes de demo;
- haya bug visual critico;
- nueva configurabilidad de proyecto deba pasar al prototipo comercializable.

## 28. Respuesta esperada al iniciar nuevas conversaciones

La nueva conversacion debe:

1. Leer este documento.
2. Verificar repo/rama/PR.
3. Leer documentos recientes.
4. Resumir estado en 5-10 lineas.
5. Continuar desde el ultimo bloque real.
6. No pedir datos ya documentados.
7. No cambiar frontend sin instruccion clara y documentacion para Claude.
8. Si se necesita dato real, pedir solo el dato puntual y explicar por que no esta disponible.

## 29. Checklist antes de cada bloque

Antes de actuar:

- ¿Lei reglas maestras?
- ¿Verifique repo/rama/PR?
- ¿Se si estoy en backend o frontend/Claude?
- ¿Estoy evitando tocar modulos?
- ¿Estoy reutilizando lo ya documentado?
- ¿Estoy pidiendo solo informacion necesaria?
- ¿Estoy documentando cambios?
- ¿Estoy evitando repetir errores previos?

## 30. Estado de este documento

Este documento es fuente maestra de continuidad.

Debe mantenerse vivo. Si Paula corrige una logica, decision, regla, alcance o error de interpretacion, actualizar este documento o crear addendum referenciado.
