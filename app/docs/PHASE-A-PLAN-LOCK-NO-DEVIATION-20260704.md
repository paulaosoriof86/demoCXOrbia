# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-04  
**Estado:** `V7_2_RECEIVED_PREFLIGHT__EXECUTION_LANE_NOT_READY_FOR_FINAL_AUDIT_APPLY__NO_EMPALME__NO_DEPLOY__NO_PRODUCTION`

## 1. Objetivo operativo

Construir una sola candidata canónica acumulativa sobre `docs-tya-v6-v71-audit`, preservando las mejores autoridades ya aprobadas de cada módulo y aplicando únicamente deltas auditados. El primer corte operativo sigue siendo `ADMIN/OPERACIONES + SHOPPER`; Portal Cliente permanece incluido en la composición, pero su cierre funcional continúa en paralelo y no debe provocar una candidata separada.

No se permite shell reducido, composición fragmentada por módulos, nueva rama, nuevo PR, nueva candidata por rutina ni reconstrucción desde cero.

## 2. Logros verificados que no se reabren

- PR #7 draft/open/no merge.
- HEAD vivo al cierre de recuperación: `35fcc44c89df33b374ce010d06c031320e28126a`.
- Existe manifiesto único `CXORBIA-TYA-PHASE-A-COMPLETE-CANONICAL-COMPOSITION-20260804` con `singleCandidate=true`, `singleBranch=true` y autoridades explícitas por archivo/módulo.
- Composición source/static: 53/53 blobs base, 4/4 adicionales, 5/5 overrides, 0 assets faltantes, 0 scripts duplicados y 0 secretos.
- Laboratorio source-contract: cinco perfiles, política `AUDIT-*`, fingerprints, cleanup exacto y fail-closed validados.
- Run `30971991900`, artifact `8916850770`, digest `sha256:75953c600b68450a11cfac6667ac5b5cfa8eceea5c94a6a0856850a501e77dd8`.
- Decisiones: `PASS_READONLY_POST_GATES`, `PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS` y `PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT`.
- V7.1 quedó correctamente bloqueada por P0 responsive reproducible y evidencia incompleta; no fue empalmada.

## 3. Recepción V7.2 — preflight, no auditoría final

Paquete recibido: `Prototype development request V7.2.zip`.

- SHA-256: `d3b7551b3b0b30e1b071dfc74beb20009c9c523c2955cce760148da6b8727686`.
- Tamaño: 23,243 bytes.
- Entradas: 4.
- Contiene: `MANIFEST.json`, reporte V7.2, `app/app.js` y `app/styles/layout.css`.
- El CSS sí declara la anulación responsive solicitada para `#login` bajo 900 px.
- El paquete no incluye las PNG contractuales de los cinco viewports ni los escenarios 1/2/8/12 países; el propio reporte declara esa ausencia.

Esto es solo recepción/preflight. No constituye `GO`, no autoriza empalme y no reemplaza la auditoría final reproducible.

## 4. Gate de carril

```text
CANDIDATE_BYTES_AVAILABLE=true
CANDIDATE_EXTRACTABLE=true
TARGET_REPOSITORY=paulaosoriof86/demoCXOrbia
TARGET_BRANCH=docs-tya-v6-v71-audit
HEAD_BEFORE=35fcc44c89df33b374ce010d06c031320e28126a
GITHUB_IDENTITY=paulaosoriof86
GITHUB_PERMISSION=admin
REPO_CHECKOUT_COLOCATED_WITH_ZIP=false
AUTHENTICATED_DIRECT_APPLY_FROM_CHECKOUT=false
EXECUTION_LANE_READY=false
```

Causa exacta: esta sesión tiene los bytes extraídos y acceso GitHub, pero no un checkout Git autenticado y co-localizado con el ZIP. Por el lock de empalme no se puede sustituir ese carril por Contents API archivo por archivo, blobs/trees, PowerShell, workflow transportador, nueva rama/PR o tareas manuales de Paula.

## 5. Diagnóstico de causas del bucle

1. **Separación entre auditoría y ejecución:** se audita en un entorno y luego se intenta aplicar en otro, perdiendo atomicidad y obligando a repetir.
2. **Confusión entre composición canónica source-only y candidata activa:** el manifiesto existe y preserva las mejores versiones, pero aún no hay un único HEAD empalmado, desplegado, validado y congelado.
3. **Documentación dividida:** índice/checkpoint vigentes y archivos raíz antiguos expresan estados distintos; desde este corte manda el índice y checkpoint actualizados.
4. **Evidencia visual incompleta:** se han aceptado entregas con afirmaciones responsive sin capturas o geometría reproducible, causando nuevos P0 al visualizar.
5. **Reapertura de bloques protegidos:** Auth, histórico, finanzas, HR, shopper y módulos ya aprobados se han vuelto a revisar como si no existieran. Desde ahora se preservan por autoridad de archivo y solo se reabren con regresión reproducible.
6. **Demasiadas transiciones intermedias:** requests, gates y deploys separados han creado estados parciales. La salida se reduce a una cadena única con un solo deploy DEV.

## 6. Definición de candidata canónica única

La candidata canónica no será el ZIP V7.2 ni una nueva composición paralela. Será el HEAD de `docs-tya-v6-v71-audit` que resulte de:

1. preservar íntegramente el manifiesto de composición final y sus autoridades por archivo;
2. auditar V7.2 únicamente contra V7.1 y el HEAD vivo;
3. aplicar solo el delta GO de `app/app.js` y `app/styles/layout.css`;
4. emitir manifest/build-lock/verificador del nuevo HEAD;
5. pasar source/static, Laboratorio, Hosting DEV, cleanup y validación humana;
6. congelar ese mismo HEAD como `ACTIVE_CANONICAL_BASELINE`.

Las mejores versiones ya fijadas incluyen, entre otras, Dashboard, Visitas, detalle, revisión, postulaciones, reservas, shoppers, Mis Visitas, certificación, cuestionario, beneficios, documentos, Finanzas, Liquidaciones, Cliente, ReportKit, Academia, Auth de login único, HR viva y adapters canónicos. V7.2 solo puede modificar el login responsive; no puede reemplazar esos módulos.

## 7. Plan exacto de salida

### Microbloque 0 — Carril único

Abrir el workspace file-aware con el ZIP V7.2 extraído, checkout autenticado de la rama viva y HEAD `35fcc44...`. No crear otra rama/PR ni pedir otra candidata.

**Salida:** `EXECUTION_LANE_READY`.

### Microbloque 1 — Auditoría final focalizada V7.2

Comparar exclusivamente:

- V7.2 vs V7.1;
- V7.2 vs `app/app.js` y `app/styles/layout.css` del HEAD vivo;
- preservación del manifiesto canónico y backend.

Ejecutar:

- hash/manifest/alcance;
- `node --check`;
- UTF-8/BOM;
- secrets/PII;
- carga de Login;
- geometría real 1920×1080, 1440×900, 768×1024, 412×915 y 390×844;
- escenarios 1/2/8/12 países;
- validaciones `strip.top`, `aside.left`, `main.left`, ancho, `scrollWidth` y `scrollHeight`.

Las capturas faltantes del paquete deben generarse durante la auditoría; no se solicita otra candidata solo por esa ausencia.

**Salida:** `P0_PROVEN` o `AUDITED_GO_READY_DIRECT_APPLY`.

### Microbloque 2 — Empalme atómico

Solo con GO sin P0:

- `APPLY_DELTA_DIRECTLY` sobre la rama viva;
- exactamente `app/app.js` y `app/styles/layout.css` si el delta final confirma ese alcance;
- preservar backend, core, módulos, adapters, datos, contratos, tools y docs;
- un commit/push atómico;
- registrar `HEAD_AFTER`;
- emitir manifest/build-lock/verificador.

**Salida:** `EMPALMED_PENDING_POST_GATES`.

### Microbloque 3 — Gates finales sobre el mismo HEAD

- source/static completo;
- gate de composición canónica;
- gate de contrato del Laboratorio;
- rutas por rol;
- dependencias ReportKit;
- ausencia de módulos/scripts faltantes o duplicados;
- warnings P1/P2 documentados sin bloquear.

**Salida:** `TECHNICAL_PASS_PENDING_DEV_VISUAL`.

### Microbloque 4 — Único Hosting DEV

Un solo deploy del mismo HEAD/build. No segundo deploy automático.

**Salida:** URL/build exacto y smoke remoto técnico.

### Microbloque 5 — Laboratorio real controlado

En una sola sesión acumulativa:

- Admin/Operaciones y Shopper;
- cinco perfiles contractuales;
- datos temporales exclusivamente `AUDIT-*`;
- snapshot/fingerprint antes;
- escenarios de navegación, estados, HR, visitas, postulaciones, reservas, certificación, cuestionario, histórico, finanzas, liquidaciones, beneficios y Academia;
- refresh, focus y nueva pestaña;
- captura de evidencia sanitizada;
- cleanup por IDs del mismo run;
- snapshot/fingerprint final idéntico.

Fallo de cleanup es P0. No se declara PASS parcial.

### Microbloque 6 — Validación humana y freeze

Paula revisa una sola URL y una sola candidata acumulativa. Solo se corrigen diferencias reproducibles y focalizadas; no se abre otra auditoría general.

Con `APROBADO`:

- `ACTIVE_CANONICAL_BASELINE`;
- freeze de Phase A visual-operativa;
- actualización de checkpoint, índice, CAMBIOS, Claude, PENDIENTES, Academia, tracker y PR #7.

### Microbloque 7 — Cierre Phase A y cutover

Sin reabrir bloques protegidos:

- confirmar HR e histórico canónico;
- conservar shoppers y certificaciones existentes;
- confirmar ciclo Shopper completo;
- confirmar Finanzas/Liquidaciones/Pagos sin inferencias;
- confirmar Auth/RBAC y login único;
- confirmar multi-tenant/multi-proyecto y Cinépolis configurable;
- confirmar Academia, manuales y rutas por rol;
- resolver únicamente deltas reales pendientes de datos actuales;
- preparar rollback y smoke integral;
- ejecutar producción solo con autorización expresa.

Portal Cliente continúa sobre la misma candidata y no origina una rama o shell paralelo.

## 8. Circuit breakers antirretroceso

- Misma familia de fallo repetida: `STOP_RETRY`; diagnosticar y corregir causa, no volver a correr el gate completo.
- No más de una auditoría final para V7.2.
- No nueva candidata si V7.2 queda GO.
- No segundo deploy DEV.
- No reabrir Auth, R17N, Corte3, Corte5, HR, finanzas o shopper sin regresión reproducible.
- No declarar candidata canónica hasta completar empalme, gates, visual, cleanup y `APROBADO`.

## 9. Estado seguro

- V7.2 empalmada: no;
- navegador/runtime: no ejecutado en esta recepción;
- deploy DEV: 0;
- Firestore/Auth/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.
