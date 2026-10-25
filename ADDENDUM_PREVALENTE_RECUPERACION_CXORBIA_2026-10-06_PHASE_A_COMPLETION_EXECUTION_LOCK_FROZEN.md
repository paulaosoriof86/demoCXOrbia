# ADDENDUM PREVALENTE — I3 / PHASE A COMPLETION EXECUTION LOCK — 2026-10-06

**ID:** `CXORBIA-I3-PHASE-A-COMPLETION-EXECUTION-LOCK-20261006`  
**Estado:** `FROZEN_PREVALENT_UNTIL_I3_GO_AND_I4_PRODUCTION_LOCK_OR_NEWER_EXPLICIT_SUPERSESSION`  
**Iteración:** `I3 — FUNCTIONAL CLOSURE`  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama canónica:** `recovery/cxorbia-phase-a-20260831`  
**Producción:** `DO_NOT_TOUCH`  
**Control HEAD leído antes de este lock:** `64c5d79c0b96d713c1d67a488741197adb91486d`  
**Control tree leído antes de este lock:** `c5a62d21ca8105433f13dd16e75810802efc3cbd`  
**Product source humana rechazada y todavía autoridad de partida:** `be4e54e92285cef24f4b4c5442383a8076df6664`  
**Product tree:** `53061fa8d5faae8f0213840ff9d12d4a710508a3`

## 1. Motivo

El checkpoint humano del 06-10-2026 rechazó la candidata DEV aun cuando la source y el artifact servido estaban sincronizados entre sí. La causa estructural demostrada es una combinación de `RELEASE_COMPOSITION_FAILURE + VISUAL_DEFECT + FUNCTIONAL_DEFECT`: durante remediaciones sucesivas se preservaron fixes técnicos, pero la última autoridad visual/funcional aprobada de cada módulo no quedó protegida de forma monotónica y exhaustiva.

Este addendum NO crea otra metodología, I5, candidata, rama, overlay, materializador ni auditoría general. Su único propósito es impedir pérdida de hallazgos/trabajo y congelar el carril completo que falta desde el estado vivo actual hasta `PRODUCTION_LOCK`.

## 2. Fuentes mecánicas prevalentes de este lock

1. `RECOVERY-I3-HUMAN-VISUAL-FAIL-OBSERVATION-MAP-20261006.json` — autoridad de las **45 observaciones** del checkpoint humano. Ninguna puede desaparecer por no repetirse en una conversación posterior.
2. `RECOVERY-I3-MODULE-TRUTH-MATRIX-20261006-V7.json` — autoridad modular viva para la candidata `be4e54e...`.
3. `CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V285_2026-10-06.json` — ledger acumulativo; findings cerrados sólo se reabren con drift exacto reproducible.
4. `CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json` — descriptor canónico vivo.
5. `ADDENDUM_PREVALENTE_RECUPERACION_CXORBIA_2026-10-06_HUMAN_VISUAL_FAIL_CUMULATIVE_FRONTEND_RECOVERY_FROZEN.md` — regla `RECOVER, DO NOT REBUILD`.
6. `CXORBIA_I3_PHASE_A_COMPLETION_EXECUTION_LOCK_2026-10-06.json` — lock mecánico creado junto con este addendum.

Ante contradicción futura, el GitHub vivo sólo puede superar este lock mediante evidencia más nueva, explícita, con BEFORE/AFTER, causa, owner, readback y sin violar los contratos Recovery.

## 3. Verdad modular al congelar

`RECOVERY-I3-MODULE-TRUTH-MATRIX-20261006-V7.json` declara:

- dominios Phase A evaluados: **21**;
- `MATCH`: **13**;
- `APPROVED_NOT_COMPOSED`: **3**;
- `TRUE_FUNCTIONAL_DEFECT`: **5**;
- `phaseAComplete=false`;
- `allModulesMatch=false`.

Por tanto I3 permanece `HOLD`. La recuperación pendiente se limita a los ocho dominios no-MATCH y a la re-certificación transversal que naturalmente debe repetirse sobre la única source successor/artifact final.

## 4. Alcance bloqueante completo de Phase A pendiente

### 4.1 Base / shell / frontend transversal — `APPROVED_NOT_COMPOSED`

Recuperar selectivamente la autoridad visual aprobada de shell/layout y preservar deltas posteriores probados. No wholesale revert. No introducir otro diseño no autorizado. Deben preservarse expresamente las mejoras ya aceptadas: Academia actual, dirección actual de Mi Perfil y dirección actual de Mis Visitas.

Criterios humanos transversales: tipografía legible, contraste suficiente, tenant accent, tablas delimitadas, iconos/emojis profesionales, modales con jerarquía, acciones visibles, ningún label técnico crudo. Todo delta visual posterior requiere BEFORE/AFTER + scope.

### 4.2 Beneficios — `APPROVED_NOT_COMPOSED`

Recuperar jerarquía de tarjetas/tabla aprobada, headings humanos inequívocos, identidad canónica transversal y diseño premium, preservando read model/pagos posteriores demostrados.

### 4.3 Dashboard operativo / superficies de acción — `APPROVED_NOT_COMPOSED`

Recuperar en la superficie aprobada: selección múltiple, acciones masivas, WhatsApp/correo cuando su provider lo permita, solicitar/agendar, acciones contextuales por estado, acción individual y acceso al detalle; no aceptar que esas capacidades existan solamente en un drill-down distinto si el frontend aprobado las exponía en la operación principal.

### 4.4 Identidad / sesión / owner canónico — `TRUE_FUNCTIONAL_DEFECT`

Cerrar la divergencia observada `login Julissa -> sidebar/Mi Día Paula` mediante readback exacto de `uid`, `visibleLogin`, `session.user`, `shopperId`, `canonicalShopperId`, `identityMap`, profile owner, Mi Día owner y sidebar owner antes de cambiar owner de código.

Preservar adjudicación humana: Julissa Flores = canónica `shopper_gt_0c198c1055`; alias `shopper_gt_86254c4228`; visibleLogin `julissa.flores`; no reactivar alias como persona separada; no fuzzy/name-only merge.

### 4.5 Shoppers / Mi Perfil / Mis Visitas — `TRUE_FUNCTIONAL_DEFECT`

Cerrar en un mismo owner package:

- shopper puede corregir nombre/apellido como `display/profile identity authority`; HR original queda como alias/source evidence;
- no escribir HR externa sin contrato/ACK;
- país visible y derivado determinísticamente; ciudad/región cuando exista autoridad segura;
- filtro por país en Shoppers;
- Admin autorizada ve perfil completo y datos bancarios completos; otros roles conservan protección;
- preservar merge/adjudicación de identidades ya funcional;
- Agendar debe pasar E2E real con owner exacto + provider ACK + readback + reload;
- check-in: cámara/foto + GPS + timestamp + visitId + Storage/provider ACK; no pérdida de evidencia;
- para cuestionario externo, evidencia recuperable/descargable; para cuestionario interno futuro, vínculo automático a visita/cuestionario;
- preservar el diseño actual de Mis Visitas y mejorar sólo contraste/jerarquía aprobada.

### 4.6 Certificaciones — `TRUE_FUNCTIONAL_DEFECT`

Resolver con una sola autoridad:

- carryover: sólo shoppers con evidencia válida de certificación legacy pueden aparecer vigentes;
- recuperar banco/certificación Cinépolis ya existente antes de recrear;
- múltiples certificaciones / Certificación 1 / Certificación 2 / recertificación con selector;
- `Crear certificación con IA`: provider seguro, exact question count, grounding, `pending_review`, reviewer distinto y UI humana sin error técnico crudo;
- misma autoridad consumida por Mis Visitas y Certificaciones.

### 4.7 Visitas / detalle / revisión / Postulaciones / Asignaciones — `TRUE_FUNCTIONAL_DEFECT`

Recuperar frontend aprobado y conservar contracts durables actuales:

- detalle rico de visita, histórico y labels humanos;
- `revision-admin.js` se preserva si permanece MATCH exacto;
- Gestión de Postulaciones no puede convertirse en otro listado de Visitas;
- aprobar, rechazar, standby, editar, reasignar, cancelar/liberar, asignaciones, pedir acción al shopper, agendamientos;
- targets aplicables correctos en `Pedir acción al shopper`;
- provider ACK/readback/reload/no duplicados;
- `VRM-259` badge permanece cerrado salvo drift exacto.

### 4.8 Finanzas / Liquidaciones / Lotes / Movimientos / CxP / CxC — `TRUE_FUNCTIONAL_DEFECT`

Cerrar integralmente:

- Movimientos durable provider-backed;
- CxP = obligaciones pendientes con shoppers/proveedores; CxC = obligaciones/derechos del cliente/casa matriz según modelo;
- Liquidaciones con acciones humanas por fila;
- pago individual usando el mismo contrato durable con un `visitId`;
- lote con selección sólo de filas elegidas, no obligación de incluir todas;
- fecha, referencia y readback;
- carga de soporte de pago en plataforma, Storage durable, asociación a pago/lote y consulta posterior por shopper cuando corresponda;
- extracción asistida de referencia sólo como ayuda, nunca inventar monto/referencia;
- conciliación con estados humanos separados: información suficiente, pago registrado, soporte/confirmación externa, pagado y conciliado;
- Dashboard financiero y beneficios consumen la misma verdad durable;
- no localStorage/browser-memory como verdad.

**Corte histórico congelado:**

- hasta **julio 2026 inclusive**: pagado/conciliado históricamente;
- **agosto 2026**: pagado el **02-10-2026**;
- **septiembre 2026**: sólo las liquidaciones realmente pagadas el **02-10-2026** se incluyen en ese lote; las demás permanecen pendientes;
- desde **01-10-2026** inicia operación financiera viva;
- remesa/anticipo T&A se registra como fuente de fondos/movimiento durable según su naturaleza, no como ingreso inventado;
- NO inferir cuáles filas de septiembre fueron pagadas si la evidencia durable no permite identificarlas. Sólo en ese caso se pide a Paula una única decisión con lista concreta.

## 5. Mejora HR externa embebida — preservada sin desviar Phase A

Se conserva como decisión arquitectónica: HR/Google Sheet externa sigue siendo autoridad; CXOrbia puede mostrar una vista viva y editar por provider/API con ACK/idempotencia. No iframe público como segunda verdad, no copia local autoritativa.

Se clasifica `P1_POST_GO_LIVE` salvo que un contrato Phase A previo demuestre que la visualización/edición embebida ya era P0. La decisión no se pierde y debe quedar en backlog sellado posterior al `PRODUCTION_LOCK` si no entra a Phase A.

## 6. Mecanismo anti-pérdida / anti-descarrilamiento

Desde este lock, cada observación/finding pendiente sólo puede avanzar monotónicamente por estos estados:

`OPEN_OR_REOPENED -> OWNER_PROVEN -> SOURCE_FIXED -> SOURCE_PROVEN -> DEV_MATERIALIZED -> LIVE_E2E_PASS -> HUMAN_PASS -> GATE20_PASS -> GATE21_PASS -> I3_GO`.

Reglas:

1. Ningún run puede eliminar un pendiente porque no lo mencionó.
2. Ningún PASS está permitido sólo por presencia de texto/DOM cuando el contrato exige acción real.
3. Un finding cerrado sólo se reabre por drift reproducible exacto.
4. Toda modificación de producto registra owner, files, predecessor source, successor source, tests y readback.
5. La lista de 45 observaciones permanece por referencia/hash; no se renumera ni se sustituye por una lista resumida.
6. `VRM-260` no se consume salvo root cause verdaderamente nuevo; duplicados se anexan al finding existente.
7. Control/evidence puede avanzar sin cambiar product source; nunca se confunde HEAD de control con release source.
8. No se ofrecen más checkpoints manuales a Paula hasta que todos los P0 que afectan la revisión estén cerrados sobre el mismo artifact DEV.

## 7. Carril único de ejecución restante

### I3-A — COMPLETION LOCK

Este addendum + lock JSON + hashes + readback GitHub. **Control only; 0 producto.**

### I3-B — ONE CUMULATIVE PRODUCT SOURCE SUCCESSOR

Partir de `be4e54e...` y recuperar/corregir los ocho dominios no-MATCH en una sola source successor acumulativa. Para cada owner: `última autoridad aprobada + deltas posteriores P0_PROVEN`. No otra candidata, no wholesale revert, no overlay.

### I3-C — SOURCE PROOF

Antes de DEV:

- `MODULE_TRUTH_MATRIX` nueva con 21/21 `MATCH`;
- action inventory aprobado;
- visual markers aprobados;
- provider contracts/ACK;
- no regression de findings cerrados;
- load order sin autoridad superseded que sombree módulos;
- source/tree únicos.

### I3-D — ONE DEV MATERIALIZATION

Exactamente una materialización de la source successor aprobada:

- 1 build determinista;
- 1 runtime DEV deploy;
- 1 Hosting DEV deploy;
- 0 producción.

Registrar artifact/digest/runtime revision+digest/Hosting version+release/HR revision.

### I3-E — SAME-ARTIFACT LIVE E2E

En el mismo artifact ejecutar Admin + Shopper real, incluyendo identidad, perfil, país, banking autorizado, Agendar, check-in, certificaciones, Dashboard actions, Visitas detalle, Postulaciones/targets, Movimientos, CxP, CxC, pago individual, lote, soporte y conciliación. Cada write exige provider ACK/readback/reload/no duplicados.

### I3-F — ONE HUMAN VISUAL CHECKPOINT

Sólo después de I3-E PASS. Entregar un solo link DEV y ruta corta. Paula no debe volver a revisar candidatas parciales.

### I3-G — GATE20 + GATE21

Si Paula PASS:

- Gate20 visual/semántico sobre el mismo artifact;
- Gate21 deriva exclusivamente del manifest del mismo artifact;
- no rebuild, no redeploy, no punteros paralelos;
- I3=`GO` únicamente con todo Phase A `MATCH`.

### I4 — IMMUTABLE PRODUCTION REPLACEMENT

Requiere una sola autorización expresa de Paula. Publicar EXACTAMENTE el artifact certificado en `https://tya-plataforma.web.app/`, sin rebuild. Verificar Hosting/runtime/HR live/Admin/Shopper/postulación/asignación/KPIs/DOM/no duplicados y emitir nuevo `PRODUCTION_LOCK`.

## 8. Qué NO queda pendiente como trabajo general

No se reabren I0/I1/I2. No hay otra auditoría general. No hay otro plan estructural. No se reimportan datos. No se copia legacy. No se crea Firebase productivo nuevo como prerrequisito. No se vuelve a diseñar todo el frontend. No se reabre un PASS histórico sin drift.

Lo que falta para producción queda agotado por: **ocho dominios V7 no-MATCH + source proof + una materialización DEV + E2E same-artifact + un checkpoint humano + Gate20 + Gate21 + autorización I4 + deploy exacto + production lock**.

## 9. Siguiente acción exacta

`I3-B: construir la única source successor acumulativa, comenzando por el semantic owner-diff de los 3 APPROVED_NOT_COMPOSED y el readback exacto de identidad requerido para los TRUE_FUNCTIONAL_DEFECT, sin materializar DEV hasta que el source proof esté cerrado.`

## 10. Mutabilidad

Este archivo es `FROZEN`. No se edita. Cualquier supersession exige un addendum posterior con fecha, BEFORE/AFTER, causa, evidencia, efecto y SHA-256. La urgencia de go-live no autoriza omitir P0, Gate20, Gate21 ni la autorización I4.
