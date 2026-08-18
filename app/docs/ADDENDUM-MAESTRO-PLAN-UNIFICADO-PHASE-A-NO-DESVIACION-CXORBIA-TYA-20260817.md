# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Plan original:** 2026-08-17  
**Sincronización correctiva:** 2026-08-18 11:51 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-ROOT-CAUSE-RECOVERY-01`  
**Estado:** `ACTIVO__PREVALENTE__FORENSIC_ROOT_CAUSE_RECOVERY__SOURCE_TRUTH_ATOMIC_CLOSE__I3_11C_HOLD__I4_I5_PRESERVED`

## 0. Naturaleza de esta actualización

Este documento **no crea una metodología nueva** ni reinicia Phase A. Conserva la ruta I1→I5 y corrige la falla metodológica que permitió que un plan previamente congelado volviera a entrar en bucle.

La auditoría forense anterior sí había identificado la necesidad de continuidad/documentación, pero esa obligación quedó como disciplina humana y no como invariante técnica de cierre. El fallo duradero fue este: un provider/runtime gate podía ejecutarse y dejar evidencia nueva sin obligar, en el mismo cierre, a sincronizar índice, source lock, checkpoint, documentos operativos y PR. Una sesión posterior podía cumplir formalmente la instrucción de “leer las fuentes vigentes” y aun así recibir un estado anterior al HEAD/evidencia real.

La corrección de raíz es convertir sincronización, prevalencia y anti-loop en **estado canónico machine-readable + cierre atómico + verificador + circuit breaker**.

## 1. Estado real de Phase A

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

Último HEAD técnico/evidencia anterior al sync documental: `528d5f0ba51e9712fee79ca0025b3dbcdf74e163`.

Scoring formal preservado:
- I1 `15/15 PASS`;
- I2 `20/20 PASS`;
- I3 `0/25` hasta PASS integral;
- I4 `0/25`;
- I5 `0/15`.

**GO-LIVE formal = 35% / 65% pendiente.** I3 integral PASS mueve directamente a 60%. No se inventan porcentajes intermedios para ocultar o exagerar avance; cada cierre reporta además avance operacional por subbloque.

## 2. Frozen / no reprocesar

Quedan bloqueados contra reproceso salvo regresión nueva, reproducible y que invalide expresamente el PASS:
- I1/I2;
- I3.1→I3.8;
- I3.9/I3.10 congelados PASS;
- Historical Shopper run `31906391682`: cero credential access/login/recovery/reset;
- TARGET_B Admin existente/PASS: no crear otro Admin;
- request08;
- I3.5B/I3.5C-2/I3.8 consumidos;
- HR: 15 períodos / 660 visitas, no reimport;
- Finance V2/historical, no rebuild;
- legal V0.4 durable, no autoaccept;
- Firestore Rules I3.11C run `32163552089`: PASS/verificado/consumido, no redeploy por la causa ya cerrada.

## 3. Diagnóstico forense actual I3.11C

Evidencia principal: `app/docs/evidence/I3-11C-STAFF-READONLY-CLOSE-LATEST.json`.

Hechos demostrados:
- Rules DEV ya están alineadas y verificadas;
- Staff runtime entra como `admin`, membership verificada, tenant `tya`;
- 15 períodos y 660 visitas cargadas;
- authority aplicada;
- router/view/project/period selectors montados;
- bridge/provider identity runtime presente y componiendo links aplicables;
- existe `1` provider identity link aplicable global;
- para el target existen `0` links aplicables;
- target live `shp-57d2e3769946`;
- canonical esperado `TYA_GT_0C0BA8856E`;
- prior link `irl_3ed1b9a65d36c5873c1306bae1621e9d` previamente provider ACK/readback, period-independent;
- canonical actual del target `null`;
- agosto: `0` canonical y `2` residuales live.

Causa viva:
`I3_11C_EXPECTED_PROVIDER_LINK_NOT_IN_APPLICABLE_RUNTIME_SET`.

Quedan exactamente por adjudicar estas posibilidades: `deleted`, `deactivated`, `re_scoped`, `mutated`, o `intact_but_nonapplicable`.

No volver a diagnosticar Rules, inexistencia de Admin, membership Staff, bridge instalado, I3.9/I3.10 ni Historical Shopper como explicación del HOLD actual.

## 4. Recuperación inmediata — ruta corta y binaria

### R1 — Source truth sincronizado antes de provider action

Este sync crea/actualiza:
- `app/docs/CXORBIA-EXECUTION-STATE.json`;
- índice vigente;
- source lock estable;
- checkpoint vigente;
- este plan;
- CAMBIOS/RESUMEN/PENDIENTES;
- addenda I3.11C marcados como historia/superseded cuando correspondía;
- verificador de sincronización;
- PR #7.

No cuenta como avance funcional de Phase A; sí elimina la clase de fallo documental que estaba provocando regresiones entre sesiones.

### R2 — Una sola adjudicación focal read-only

Frontera:
`NEW_AUTH_REQUIRED_FOCAL_PROVIDER_IDENTITY_LINK_READONLY_ADJUDICATION_NO_WRITES`.

Con autorización exacta nueva:
1. leer el prior target link exacto;
2. leer/identificar el único provider link actualmente aplicable;
3. comparar status, tenant/project scope, canonicalShopperId, sourceIdentityKey, aliases y campos de aplicabilidad estrictamente necesarios;
4. clasificar la diferencia como deleted/deactivated/re-scoped/mutated/intact-but-nonapplicable;
5. registrar `proven/disproven/unknown` y cerrar el diagnóstico.

Límites: writes/deploys/merge/production `0`; Historical Shopper access `0`; no retry automático.

### R3 — Si el drift es corregible, una sola corrección exacta

No se abre diagnóstico general. Se solicita un gate write limitado al campo/documento exacto demostrado.

Después de la única corrección autorizada:
- readback provider inmediato;
- Staff/browser read-only sobre el mismo estado;
- `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- agosto residual live `0`;
- duplicados `0`;
- I3.4/I3.6/I3.7 preservados;
- I3.9/I3.10 reutilizados sin rerun.

Si PASS integral, I3 = `25/25` y GO-LIVE formal = **60%**.

Si no cumple, el gate falla cerrado con causa nueva explícita. No se repite la misma acción tres veces.

## 5. Anti-loop duradero — protocolo obligatorio

### 5.1 Estado canónico machine-readable

`app/docs/CXORBIA-EXECUTION-STATE.json` contiene el único estado operativo estructurado: repo/rama/PR/base, progreso, bloque actual, blocker probado, gates consumidos, evidencia, límites del siguiente bloque, arquitectura producto y ambientes.

Los documentos humanos explican; el JSON evita que diferentes conversaciones interpreten una cronología vieja como estado vigente.

### 5.2 Dos capas documentales

**Capa canónica mutable/vigente**, actualizada en cada cierre:
- execution state;
- índice;
- source lock estable;
- checkpoint vigente;
- plan vigente;
- CAMBIOS;
- RESUMEN;
- PENDIENTES;
- PR #7 summary.

**Capa histórica append-only**:
- evidence;
- dated addenda;
- dated source locks;
- checkpoints previos;
- manifests/build locks.

Una fuente histórica **no conduce ejecución** salvo activación explícita desde el índice canónico.

### 5.3 Atomic Gate Close

Desde este punto un gate no se considera “cerrado y continuable” únicamente porque el proveedor haya dado PASS.

Debe existir, en el mismo bloque, una única marca `SYNC_EPOCH` coherente en todas las fuentes canónicas y el PR. Si la ejecución ocurrió pero la sincronización no terminó, el estado obligatorio es:
`EXECUTED_UNSYNCED_DO_NOT_ADVANCE`.

La siguiente sesión sincroniza primero; no reejecuta el gate anterior ni abre el posterior.

### 5.4 Pre-session consistency gate

Antes de cualquier provider/runtime action:
1. leer HEAD/PR vivo;
2. leer `CXORBIA-EXECUTION-STATE.json`;
3. leer índice/source lock/checkpoint;
4. comparar evidencia principal con frontier y consumed/frozen state;
5. ejecutar/replicar las comprobaciones del verifier.

Si existe contradicción:
`SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`.

La única acción permitida es reconciliar documentación; no ejecutar proveedor mientras exista mismatch.

### 5.5 Machine verifier

`tools/verify-cxorbia-source-truth-sync.mjs` comprueba como mínimo:
- presencia de todos los documentos canónicos;
- mismo `SYNC_EPOCH`;
- misma frontier actual;
- Rules I3.11C marcadas PASS/consumidas;
- blocker actual exacto;
- ausencia de estados viejos que afirmen que Rules siguen pendientes;
- addenda I3.11C antiguos marcados `SUPERSEDED_DO_NOT_EXECUTE`;
- rama esperada cuando corre dentro de checkout Git.

No es workflow ni provider action; es un gate local/repo de consistencia.

### 5.6 Circuit breaker

Cada intento técnico registra:
- hipótesis probadas;
- hipótesis descartadas;
- incógnitas restantes;
- evidencia nueva;
- reducción causal obtenida.

Si el mismo blocker aparece dos veces sin evidencia que reduzca el espacio causal, se activa `FORENSIC_STOP`. Está prohibido un tercer retry equivalente.

## 6. I4 — avance operacional visible inmediatamente después de I3

I4 no se ejecutará como infraestructura abstracta. Se cierra por capacidades que puedan comprobarse desde producto, preservando backend/contratos y el prototipo aprobado.

### I4-A — acceso operativo y shopper lifecycle inicial
- documentos/instrucciones por tenant/proyecto/visita;
- certificaciones presentadas y nuevas;
- disponibles;
- postulación;
- asignación;
- perfiles/roles/scopes;
- notificaciones asociadas;
- lectura histórica preservada.

### I4-B — planificación y ejecución de visita
- agendar;
- reprogramar;
- cancelar;
- reglas/ventanas por proyecto;
- ejecución;
- evidencias;
- cuestionario;
- submitido;
- auditoría/revisión;
- estados derivados dinámicos, no hardcode de mes/proyecto.

### I4-C — HR bidireccional y fuente operacional
- Plataforma→HR con `assignmentSource=platform` y no duplicación;
- HR→Plataforma con reconciliación exacta;
- `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`;
- conflictos a revisión, nunca overwrite silencioso;
- Make únicamente en su bloque real, bajo gates y revisión humana.

### I4-D — liquidaciones, pagos y Finanzas Phase A
- histórico preservado;
- hasta mayo pagado según fuente documentada;
- junio con estado de liquidación/pago real;
- reglas de honorarios/reembolsos configurables;
- no hardcode Cinépolis;
- trazabilidad por tenant/proyecto/visita/shopper.

### I4-E — multi-proyecto, configuración y no-code
- crear/configurar proyectos sin cambiar código de producto;
- selectors tenant/proyecto/período;
- reglas, documentos, certificación, agenda, pagos e integraciones por configuración;
- origen de cuestionario: CXOrbia, TyAOnline, plataforma externa, link general o link por visita;
- evidencia/Storage y privacidad bajo gate;
- Gemini solo cuando llegue su bloque real y siempre con revisión humana donde corresponda.

### I4-F — Academia, manuales y operación humana
Cada capacidad I4 actualiza en paralelo:
- cursos/manuales;
- rutas por rol;
- notificaciones;
- instrucciones de proyecto;
- material de certificación;
- impacto legal/privacidad cuando aplique.

Academia no se deja para el final si el comportamiento operacional cambió.

## 7. I5 — salida a producción

I5 se conserva completo:
1. freeze de candidata/source sin P0;
2. SHA exacto;
3. manifest;
4. build-lock;
5. verifier;
6. preproducción;
7. rollback probado/documentado;
8. E2E same-build de Admin/Staff/Shopper y flujos Phase A;
9. revisión de P0/P1/P2;
10. autorización expresa de Paula para producción;
11. deploy/cutover;
12. smoke productivo;
13. baseline productivo activo e inmutable como referencia.

No merge/deploy/producción antes de gate explícito.

## 8. Continuidad post-producción

Producción no es final de desarrollo. Después del go-live:
- `CXORBIA-EXECUTION-STATE.json` mantiene ambientes DEV/preprod/prod y baseline productivo activo;
- cada evolución usa rama/carril autorizado, evidencia y Atomic Gate Close;
- el verifier sigue siendo obligatorio;
- una incidencia productiva no autoriza reabrir PASS históricos indiscriminadamente;
- hotfixes se limitan a causa reproducible y se sincronizan igual que cualquier gate;
- documentación, Claude/prototipo y Academia continúan versionados con el producto.

## 9. Arquitectura comercial multi-tenant / no-code

### 9.1 Regla cardinal

TyA es **primer tenant de validación**. Cinépolis es **primer proyecto normal configurable**. Son fixtures operativos valiosos, no arquitectura global.

Toda mejora debe responder primero: ¿es reusable CXOrbia, tenant-specific o project-specific? Lo reusable se expresa como contrato/config/adapter; lo específico vive en configuración, no disperso en módulos.

### 9.2 Contrato de Project/Tenant Configuration

La plataforma debe poder parametrizar progresivamente:
- país, moneda, timezone y locale;
- fuente de HR/roadmap;
- mapping de columnas/campos/IDs;
- frecuencia/períodos;
- cuestionario/origen/provider/link policy;
- documentos/instrucciones;
- reglas y certificación;
- disponibilidad/postulación/asignación;
- agendamiento/reprogramación/cancelación;
- ejecución/evidencia/revisión;
- honorarios/reembolsos/liquidaciones/pagos;
- roles/scopes;
- notificaciones;
- integraciones/gates;
- privacidad/retención;
- Academia/manuales/cursos/rutas por rol.

### 9.3 Fuentes de roadmap desacopladas

Objetivo de adapters configurables:
- Google Sheets;
- Excel;
- CSV;
- API;
- CXOrbia nativo;
- import manual;
- plataforma/proveedor externo;
- link general o por visita cuando corresponda.

El contrato de dominio no cambia por la fuente. Ningún source adapter puede deduplicar identidad solo por nombre/email/teléfono o coincidencia visual.

### 9.4 Alta no-code de nuevos proyectos

Target flow:
`crear proyecto → elegir/configurar fuente → mapear campos → validar identidades/IDs → dry-run → revisar conflictos → activar → monitorear sync`.

No se exige que todo el builder visual esté terminado antes del go-live TyA, pero cada backend/config creado desde ahora debe ser compatible con ese destino y no introducir deuda hardcoded que lo impida.

## 10. Claude/prototipo — registro obligatorio de mejoras locales

Backend no parchea silenciosamente `/app/modules` ni `/app/core`.

Toda mejora/hallazgo que deba llegar al prototipo se documenta con:
- archivo/módulo afectado;
- problema observado;
- contrato backend que debe respetar;
- comportamiento esperado;
- criterios de aceptación;
- si es reusable, tenant-specific o project-specific;
- impacto responsive/accesibilidad/roles cuando aplique;
- impacto en Academia/manuales/notificaciones.

Una corrección local TyA que revele una capacidad comercializable se promueve a patrón reusable/documentado; no se deja enterrada como parche Cinépolis.

## 11. Clasificación obligatoria por bloque

Cada cierre debe declarar explícitamente:
- `Reusable CXOrbia`;
- `Exclusivo tenant`;
- `Exclusivo proyecto`;
- `Claude/prototipo`;
- `Academia`;
- `Sin impacto Claude`.

## 12. Definition of Done de cualquier bloque futuro

Un bloque se considera terminado solo si:
1. objetivo técnico/operacional alcanzado o HOLD reproducible;
2. efectos provider contados;
3. safety bounds comprobados;
4. evidencia guardada;
5. causalidad `proven/disproven/unknown` documentada;
6. impacto reusable/tenant/project clasificado;
7. Claude/prototipo actualizado si corresponde;
8. Academia/manuales/notificaciones actualizados si corresponde;
9. canonical docs + PR sincronizados al mismo `SYNC_EPOCH`;
10. source truth verifier PASS;
11. siguiente bloque exacto único definido;
12. no se abrió una nueva metodología para evadir un problema del plan.

## 13. Siguiente bloque exacto

`NEW_AUTH_REQUIRED_FOCAL_PROVIDER_IDENTITY_LINK_READONLY_ADJUDICATION_NO_WRITES`.

Nada anterior se reprocesa. Nada posterior se abre hasta adjudicar esta diferencia focal o demostrar una causa nueva con evidencia reproducible.
