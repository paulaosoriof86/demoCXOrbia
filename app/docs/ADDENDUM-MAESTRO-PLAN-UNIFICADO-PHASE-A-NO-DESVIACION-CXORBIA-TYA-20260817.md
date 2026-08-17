# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Fecha:** 2026-08-17  
**Última sincronización de estado:** 2026-08-17 13:39 -06:00  
**Estado:** `ACTIVO__PREVALENTE_PARA_SECUENCIA_Y_CONTINUIDAD__MISMA_CANDIDATA__NO_REPROCESO__I1_PASS__I2_PASS__I3_EN_CURSO__I3_2_DEPLOY_PARITY_PASS_RUNTIME_FOCAL_OPEN__I4_I5_PENDIENTES`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama única:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Base:** `release/cxorbia-tya-rc-20260630`

## 0. Decisión

Este documento **NO crea un plan nuevo**. Unifica y hace explícita la secuencia entre:

1. el Plan Phase A por Cortes 0B→8;
2. la auditoría forense del 14-ago con bloques S1→S6;
3. el plan durable de cinco iteraciones I1→I5;
4. los source locks técnicos sucesivos;
5. los pendientes operativos Phase A ya documentados desde julio.

Cuando haya conflicto de **secuencia, porcentaje, “siguiente acción” o estado actual** entre documentos históricos, prevalece este addendum junto con el source lock técnico más reciente. Las reglas de negocio, seguridad, no-reproceso, multi-tenant, multi-proyecto, Academia y gates de proveedor siguen vigentes y no se reducen.

No nueva candidata, rama, PR, reconstrucción general ni reauditoría general. Una corrección focal no reinicia el plan ni un subgate ya PASS.

## 1. Capas del mismo plan

- **I1→I5** = eje de avance formal.
- **Cortes 0B→8** = cobertura funcional histórica que no puede perderse.
- **S1→S6** = controles forenses intermedios obligatorios dentro de I1→I5.
- **I3/I4/I5 subgates** = secuencia exacta actual, sin huecos implícitos.

Los seis S1→S6 NO crean una sexta iteración.

## 2. Crosswalk — Cortes históricos → cinco iteraciones

| Plan histórico | Cobertura | Ubicación actual | Regla |
|---|---|---|---|
| Corte 0B | motor canónico histórico + tenant/login + visual | I1/I2 cerrados + exact-build en I3/I5 | no reabrir histórico |
| Corte 1 | contexto, proyecto/periodos, HR e histórico | I1/I2 + I3 runtime | HR no se reimporta |
| Corte 2 | ciclo Shopper completo | I3 identidad/persistencia + I4 operación E2E | Shopper histórico no se reprocesa |
| Corte 3 | Finanzas/liquidaciones/pagos | I4 | preservar Finance V2 + source-safe/histórico |
| Corte 4 | `CX.data` backend / interfaz estable | I1/I2 PASS | no reconstruir `CX.data` |
| Corte 5 | materialización DEV, idempotencia, trazabilidad | I2/I3; writes operativos I4 bajo gate | no repetir materializaciones PASS |
| Corte 6 | Auth/RBAC por persona/rol/scope | I3 | Admin e histórico PASS; Shopper nuevo pendiente |
| Corte 7 | HR bidireccional, evidencias y conflictos | I4 | writer real gated; no duplicar |
| Corte 8 | preproducción, rollback, producción | I5 | solo después de I4 PASS |

## 3. S1→S6 dentro de I1→I5

| Bloque | Significado | Iteración | Estado |
|---|---|---|---|
| S1 | canonical runtime | I1/I2 + regresión I3 | arquitectura base cerrada; runtime I3.2 abierto |
| S2 | persistencia real detrás de `CX.data` | I2 + I4 E2E | I2 PASS; validar por flujo |
| S3 | Shopper/Auth administrativo | I3 | histórico/Admin PASS; Shopper nuevo pendiente |
| S4 | HR bidireccional | I4 | pendiente, gate HR/Make |
| S5 | Finanzas | I4 | histórico preservado; validar antes de fuente nueva |
| S6 | E2E del MISMO build | cierre I4 + I5 | pendiente |

## 4. Avance formal

- I1 — `15/15 PASS`.
- I2 — `20/20 PASS`.
- I3 — `0/25 EN CURSO` hasta cierre integral.
- I4 — `0/25`.
- I5 — `0/15`.

**GO-LIVE formal: 35% completado / 65% pendiente.**

Al cerrar I3 integralmente: **60%**. I4 PASS: **85%**. I5 PASS: **100%**.

Los subgates PASS de I3 no suman puntos formales, pero quedan congelados y no se repiten.

## 5. Trabajo congelado — NO REPROCESAR

1. I1/I2 PASS.
2. Historical Shopper run `31906391682` PASS; reset único consumido; futuras continuaciones `passwordResets=0`.
3. request08 consumido/no rerun.
4. TARGET_B Admin sign-in real PASS run `32049054855`; Paula ingresó; no crear/rotar/reemplazar.
5. HR viva 15 periodos / 660 visitas hasta AGO 2026; no reimportar.
6. cumulative read model V2, Shopper portal V2, protected HR authority V2, state semantics V2, Finance V2 y exact identity contract.
7. Finance source-safe/historical payments mayo/junio ya construidos; no reconstruir.
8. Nunca matching por nombre/email/teléfono/WhatsApp/username/similitud.
9. materialización legal V0.4 y deploy legal previos no se rerun.
10. consentimiento legal nunca se automatiza.

## 6. I3 — secuencia completa

### I3.1 — authority/composition source fix

**PASS source-only.** Root-project/period scope compatible y assignment HR separado de postulación persistida.

### I3.2 — exact-head runtime + DEV deploy

**PARCIAL, NO CERRADO.**

Run `32058831910`, job `95475132736`:

- source/request preflight PASS;
- Firebase Hosting DEV deploy exacto `1` PASS;
- remote root/direct parity PASS;
- remote hash `952319a9a2cac7e61eff01f21c67f8e079de695e3bbc67767c4023c47f8271a7`;
- authenticated Staff runtime FAIL `staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK`.

El readiness antes del FAIL ya confirmó Auth Staff, membership, HR authority, data projects/visits no vacíos, current project/period y app visible. La antigua aserción agrupaba empty-shell/backend-empty/no-project/no-period/source-block, por lo que no se escogió una causa por intuición.

Harness granular source-only commit `58b39f0cff760a37cb00a0f4d4e2adabcea5c24e`; source preflight run `32060010492`, job `95478920028`, PASS, cero provider/deploy/writes.

El one-shot original está consumido. **I3.2B** requiere gate nuevo si se ejecuta nuevamente runtime autenticado/deploy.

### I3.3 — Proyecto/Periodos/HR/Historico

Debe demostrar en shell exacto: Cinépolis, 15 periodos, AGO activo, 660 visitas, navegación e histórico por país/periodo.

### I3.4 — Postulación vs Asignación HR

`_posts`/Postulaciones = persistencia real; HR assignments = estado operacional distinto; cero `hr-post-*` como aprobación de plataforma.

### I3.5 — crosswalk exacto agosto

Reutilizar perfiles/crosswalk; review de conflictos; no fuzzy, no reset histórico.

### I3.6 — Mi Perfil + Histórico Shopper

Sesión → shopperId/crosswalk → perfil → histórico/certificación; reload/new-tab sin pérdida.

### I3.7 — legal V0.4 durable receipt/readback

Paula ya realizó la interacción humana. Falta provider ACK/readback exact identity + legalVersion + digest y reload/new-tab sin nueva solicitud válida. Doble presentación P1 solo si no bloquea routing. No autoaccept.

### I3.8 — Admin crea/actualiza UN Shopper nuevo por provider

`Admin create/update → validación exacta → Auth → claims → membership → profile/shopper → crosswalk → provider ACK → refresh/readback`.

Histórico `passwordResets=0`; cero writes a otras identidades; no localStorage como verdad.

### I3.9 — Shopper nuevo E2E

Login real + claims/membership/profile/crosswalk + workspace + reload + new-tab + segundo contexto.

### I3.10 — KPI derivados/state semantics

Estructurales AGO ya comprobados: 44 total, 32 asignadas, 12 sin asignar, 25 agendadas, 7 sin agendar, 18 realizadas, 26 pendientes. Falta cuestionario/submit/fuera-rango/liquidación-pago semánticos.

### I3.11 — cierre integral I3

Solo aquí I3 pasa a `25/25`, cuando el mismo build prueba Admin existente, Shopper histórico, Shopper nuevo provider-backed, legal receipt durable, proyecto/periodos/HR, identidad exacta y cero false-success/local truth.

## 7. I4 — Phase A operacional completa

### I4.1 documentos/instructivos + certificación
Shopper ve documentos; certificación configurable; certificaciones presentadas/aprobadas se conservan.

### I4.2 disponibles + postulaciones
Visitas disponibles reales; Shopper postula; Admin gestiona; no duplicación.

### I4.3 asignación + agenda + reprogramación + cancelación
Cada comando vía adapter canónico + ACK.

### I4.4 realizada + cuestionario + submit/revisión
Origen cuestionario configurable CXOrbia/TyAOnline/externo/link general/link visita; facets comunes Admin/Shopper/Finance.

### I4.5 HR bidireccional / Make
Plataforma→HR y HR→Plataforma por llaves exactas; conflicto→review; writer gated.

### I4.6 Finanzas/liquidaciones/pagos
Preservar mayo/junio source-safe; liquidación ≠ pago; `reviewRequired` no entra a lote; agosto sin fuente exacta fail-closed.

### I4.7 multi-proyecto/configuración
Cliente/país/moneda/HR/cuestionario/documentos/certificación/agendamiento/pagos/evidencias/integraciones configurables.

### I4.8 roles/scopes
Admin, Ops/Coordinación, Shopper histórico, Shopper nuevo y Cliente; permisos + rechazos fail-closed.

### I4.9 evidencias/Storage
Solo si el flujo Phase A lo requiere; ownership/scope; Storage gated; no false-success.

### I4.10 Academia/manuales/rutas/notificaciones
Manual, curso/lección, checklist, errores, glosario, ruta por rol y notificaciones por flujo cambiado.

### I4.11 Gemini
Provider-gated, revisión humana; live solo si operación actual lo necesita.

### I4.12 S6 E2E integral del MISMO build
Dashboard/HR/Historico/Shoppers/Visitas/Postulaciones/agenda/reprogramación/cancelación/realizada/cuestionario/submit/certificación/documentos/Finance/Config/Cliente/Academia/persistencia/negative scopes/exact SHA.

I4 = `25/25` solo con esta matriz PASS.

## 8. I5 — exact build/preproducción/go-live

### I5.1 freeze funcional
Cero P0; P1/P2 documentados.

### I5.2 exact build
SHA + manifest + build-lock + verificador + charset/secrets inventory.

### I5.3 preproducción remota exacta
Deploy exact SHA + parity.

### I5.4 rollback
Verificable antes del cutover.

### I5.5 E2E final same-build
Matriz crítica sobre artefacto remoto exacto.

### I5.6 autorización producción
Gate explícito antes de merge/deploy/producción.

### I5.7 deploy/cutover/smoke
SHA exacto, roles/rutas críticas, persistencia/HR/Finance.

### I5.8 freeze final
`ACTIVE_BASELINE_PHASE_A_PRODUCTION` + documentación final.

## 9. Circuit breakers permanentes

1. No auditoría general sin drift/P0 nuevo.
2. No repetir PASS congelado.
3. No nueva candidata/rama/PR/workflow.
4. Fallo focal retoma mismo subgate.
5. No visualizar build viejo.
6. No porcentaje formal por subgate parcial.
7. No localStorage como verdad productiva.
8. No éxito antes de ACK.
9. No fuzzy identity.
10. No reimportar HR para corregir composición.
11. No reconstruir Finance por periodo nuevo.
12. No autoaceptar legal/NDA.
13. No Make/Gemini/Storage/HR writes/pagos/deploy/producción sin gate.
14. No assignment HR como postulación.
15. No hardcode Cinépolis global.
16. No omitir Academia/manuales/rutas/notificaciones.
17. Todo subgate cierra con evidencia, HEAD y documentación.
18. Request one-shot consumido no se rerun; nueva ejecución = gate nuevo.

## 10. Documentos sincronizados por cambio de estado

Después de cada bloque: índice, este plan cuando cambie estado/secuencia, source lock, checkpoint, tracker, CAMBIOS, Claude, PENDIENTES, Academia, PR y manifest/build-lock cuando aplique.

Ningún documento puede anunciar como siguiente acción un subgate cerrado o request consumido.

## 11. Siguiente acción exacta

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

Después del PASS se continúa I3.3→I3.11 sin regresar a Admin histórico, Shopper histórico, HR import o Finance reconstruida.

## 12. Clasificación

- Reusable CXOrbia: crosswalk, S1→S6, same-build E2E, granular runtime diagnostics.
- Exclusivo cliente: TyA/Cinépolis/legal V0.4.
- Claude/prototipo: no reconstruir módulos; P0 solo focal.
- Academia: I4.10 + readiness efectivo.
- Sin impacto Claude: secuencia/gates/source locks internos.
