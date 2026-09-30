# ADDENDUM PREVALENTE — PRE-I4 VISUAL REMEDIATION MICROBLOCK

**Fecha:** 2026-09-22  
**ID:** `CXORBIA-PRE-I4-VISUAL-REMEDIATION-MICROBLOCK-20260922`  
**Estado:** `FROZEN_ACTIVE_UNTIL_HUMAN_VISUAL_ACCEPTANCE`  
**Iteración estructural:** `I3 / PRE-I4 HUMAN VISUAL ACCEPTANCE`  
**Producción:** `DO_NOT_TOUCH`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Branch único:** `recovery/cxorbia-phase-a-20260831`  
**HEAD al congelar:** `b500c6e161ec3dec96948aeea01abc748cd090b9`

## 1. Decisión de método

Este documento NO crea una nueva iteración, NO crea I5, NO reabre I0/I1/I2/I3 global, NO crea otra candidata y NO autoriza producción.

Los hallazgos de revisión humana PRE-I4 se corrigen dentro de **un único microbloque focal acumulativo** de la misma candidata. El microbloque puede ejecutarse internamente por owners exactos y en orden de dependencia, pero debe cerrar con:

- una sola candidata canónica;
- un solo manifest acumulativo;
- un solo artefacto humano sucesor;
- un solo set de readbacks y pruebas focales;
- una sola decisión final `GO_FOR_HUMAN_VISUAL_REVIEW` o `HOLD`;
- cero rebuild/recomposición paralela;
- cero deploy a `tya-plataforma.web.app`.

Los hallazgos de este ledger son **aditivos y no se consideran resueltos por omisión**. Cada uno debe terminar en `FIXED+PROVEN`, `ALREADY_PROVEN_NO_DRIFT` o `NOT_APPLICABLE_WITH_EVIDENCE`. Ningún hallazgo puede desaparecer de la lista entre commits/runs.

## 2. Regla anti-pérdida / anti-bucle

En cada run del microbloque se debe emitir una matriz con todos los IDs de este documento y cuatro columnas mínimas: `findingId`, `owner`, `state`, `evidenceRef`.

Un PASS parcial de una pantalla NO cierra el microbloque. No se permite declarar cierre mientras exista un ID en `OPEN`, `FIXED_NOT_PROVEN` o `DRIFTED`.

Un hallazgo nuevo se agrega a este mismo ledger con la siguiente secuencia `VRM-###`; no abre otro plan, otra rama, otro overlay ni otra metodología.

## 3. Baseline viva que debe preservarse

- Focal successor humano congelado previamente: source `83429d21ee9f6d9dc5cd46fcbb9a3b598e07dcc4`.
- Artifact humano previo: SHA256 `0174cd95e8b7e4d92f39843b65bdcc78929101a3e8108784211a0673ff7638fc`.
- Branch control HEAD al congelar este addendum: `b500c6e161ec3dec96948aeea01abc748cd090b9`.
- HR viva SEP-2026 verificada durante revisión humana: 44 visitas, GT 34 / HN 10; disponibles GT 6 / HN 3; asignadas GT 28 / HN 7; agendadas GT 21 / HN 7; realizadas GT 16 / HN 6; cuestionario GT 16 / HN 6; submitidas GT 9 / HN 6; candidatas a liquidación GT 9 / HN 6; liquidaciones confirmadas 0; pagos confirmados 0.
- Producción legacy permanece intacta hasta I4 y autorización expresa.

## 4. Findings ledger congelado

### A. Contexto Proyecto / Periodo / Scope

**VRM-001 — P0 — selector lateral Proyecto vacío y `Sin periodos disponibles`.**  
Observed: módulos conectados conocen Cinépolis / SEP 2026, pero shell lateral no.  
Root cause probada: mezcla `projectId` raíz con `periodId`; `CX.permissions.ctx()` deriva `projectId` desde `data.period().id`, produciendo `cinepolis-2026-09` donde el scope de usuario es `cinepolis`.  
Owners: `app/core/permissions.js`, `app/core/data.js`, `app/core/router.js` y adapter/shell que construye contexto.  
Expected: `tenantId + projectId + periodId` separados y estables en Admin/Shopper; proyecto visible exactamente `Cinépolis`; periodo visible `SEP 2026`; refresh conserva ambos.

**VRM-002 — P0 — permisos de acciones administrativas bloqueados por falso `fuera de tu proyecto asignado`.**  
Observed: editar/eliminar recursos dispara el gate aunque la administradora está en el proyecto correcto.  
Root cause: mismo mismatch `cinepolis` vs `cinepolis-2026-09`.  
Owner primario: `app/core/permissions.js`.  
Expected: gate usa `projectId` raíz; `periodId` se valida aparte cuando aplique.

### B. Shopper — conservar diagnóstico transversal previo

**VRM-003 — P0 — identidad/scope shopper debe mantenerse atómica y sin regresión.**  
No reabrir la reparación de identidad ya probada: HR `shopper_gt_1440137b73` ↔ autenticada `s3` ↔ histórica `shp-cdbf95dccaa6` quedó adjudicada por enlace exacto, sin fuzzy matching, y Run 299 probó histórico=7 / KPI total=7.  
Este microbloque solo verifica que cambios de contexto no rompan esa adjudicación.

**VRM-004 — P0 — fuentes y periodo deben ser coherentes en todas las superficies Shopper.**  
Hallazgo previo: Mi Perfil podía leer HR viva mientras Mi Día/Mis Visitas/Shell mostraban source/periodo transitorio, `Periodo sin etiqueta`, `Periodos HR: pendiente`, proyecto tratado como periodo o periodId tratado como projectId.  
Expected: una sola verdad `tenant/project/period/sourceRevision` para Mi Perfil, Mi Día, Mis Visitas, Visitas Disponibles, Beneficios, Postulaciones y Certificación.

**VRM-005 — P0 — KPIs/histórico/Mis Visitas deben reconciliar el mismo universo.**  
Hallazgo previo: `Activas 7`/histórico visible podía coexistir con Mis Visitas 0; postulaciones persistidas podían no aparecer en `misvisitas.js`.  
Expected: histórico, KPIs, activas, asignadas, postuladas y liquidadas se derivan del mismo shopperId canónico y periodo/proyecto correcto; cero duplicados.

**VRM-006 — P0 — scope país GT/HN no puede quedar abierto o ambiguo.**  
Hallazgo previo: `scopePaises` no siempre se propagaba a todos los renders/acciones.  
Expected: Shopper ve únicamente países/proyectos autorizados; Admin multipaís conserva GT/HN separados; no asumir `countries[0]`.

**VRM-007 — P0 — lenguaje técnico y estados transitorios no deben filtrarse al Shopper.**  
Eliminar de superficies humanas: códigos técnicos de proyecto/periodo, fingerprints, PASS/BLOCKED, `AUTH_READY`, `CLAIMS_READY`, source internals y mensajes de laboratorio.

**VRM-008 — funcional/visual — navegación móvil y rolebar.**  
Hallazgos previos: botón Atrás no siempre usa history correctamente; rolebar/identidad visible puede faltar o hidratar tarde. Verificar desktop/móvil sin reabrir Auth ya certificado.

**VRM-009 — P0 contractual — Certificación no puede depender de localStorage como verdad.**  
`app/modules/cert.js` usa `localStorage` para banco; carryover source-safe activo conserva `certifications: []` aunque existe evidencia histórica read-only.  
Expected: adjudicar primero la última fuente aprobada por identidad exacta; persistencia canónica/durable; sin inventar scores; sin fuzzy matching; sin reimport general.

### C. Admin — Dashboard Operativo / Postulaciones / Shoppers

**VRM-010 — P0 — Dashboard Operativo debe corresponder a HR viva en la misma sourceRevision.**  
Preservar conteos correctos: 44 total, GT/HN separados y fases según HR. Cualquier KPI/alerta/listado debe abrir filas que sumen exactamente el total mostrado y conservar `sourceRevision`.

**VRM-011 — P0 — `Top shoppers` no puede mostrar solo un shopper por una fuente/score incompleta.**  
Observed: solo Paula aparece.  
Expected: si ranking real no tiene fuente suficiente, mostrar estado `Pendiente de fuente` o ranking completo basado en fuente aprobada; nunca convertir ausencia de score en exclusión silenciosa de los demás shoppers.

**VRM-012 — P0 — fichas Shopper desde Admin/Postulaciones deben usar identidad, histórico y KPIs reales.**  
Observed: ficha puede mostrar visitas/KPIs/certificación/contacto que no corresponden a la realidad o que provienen de una proyección incompleta.  
Expected: misma identidad canónica y misma revisión externa HR que el resto del Admin; opcionales ausentes no convierten perfil en inexistente; no exigir contraseña almacenada.

**VRM-013 — P0 — Postulaciones deben permitir gestión válida y persistente.**  
Observed: postulación visible pero no se pudo editar/reasignar.  
Expected: aprobar/rechazar/standby/reasignar según contrato y rol, con ACK remoto, idempotencia, refresh persistente y cero duplicados; una eliminación válida no reaparece.

### D. Finanzas / Liquidaciones

**VRM-014 — P0 — separar obligación operacional, conciliación financiera y pago confirmado.**  
Observed: Liquidaciones presenta 22 realizadas (16 GT/6 HN), pero Dashboard Financiero muestra todo en cero porque `finanzas-core` excluye filas `pending_or_review` antes de métricas.  
Expected: honorarios/reembolsos operacionales conocidos siguen visibles como obligación/flujo; conciliado y pagado continúan en 0 hasta ACK/fuente externa; no confundir pendiente de conciliación con valor cero.

**VRM-015 — P0 — cifras de Liquidaciones actuales que deben preservarse como evidencia operacional.**  
GT: 16 visitas, honorarios Q960 (16×Q60), reembolsos Q2,390, total operacional Q3,350.  
HN: 6 visitas, honorarios L1,200 (6×L200), reembolsos conocidos L1,778, con una visita de reembolso incompleto; por tanto el total HN debe rotularse parcial/pendiente de fuente, no como total cerrado.  
Liquidaciones confirmadas=0; pagos confirmados=0.

**VRM-016 — P0/UX — Dashboard Financiero no debe mostrar `0% margen` si el ingreso/comisión no tiene fuente confirmada.**  
Expected: `Pendiente de fuente/configuración` para margen/ingreso que no puede calcularse; nunca inferir rentabilidad cero.

**VRM-017 — visual/UX — ocultar enums e IDs técnicos de la vista normal.**  
Observed: `VISITID`, `HRROWID`, `FINANCIALSOURCESTATUS`, `pending_or_review`.  
Expected: lenguaje humano (`Pendiente de conciliación financiera`, `Datos incompletos`, `Pago no confirmado`); IDs solo en trazabilidad técnica expandible.

**VRM-018 — P0 — distinguir `revisión por fuente` de `campos faltantes`.**  
Observed: filas pueden mostrar `Revisión requerida por fuente` aunque campos faltantes sea `—`.  
Expected: estado operacional completo + conciliación pendiente es distinto de fuente incompleta; filtros y badges deben reflejar causa exacta.

### E. Recursos del proyecto / Documentos

**VRM-019 — P0 — recursos visibles actuales son seeds estáticos, no recursos vivos del proyecto.**  
`app/modules/documentos.js::CX.docStore.seed()` crea siempre Instructivo general, Escenario, Video de inducción y Checklist.  
Expected: lane conectada no presenta seeds como recursos reales; debe leer metadata/recursos del proyecto autorizado o mostrar `Pendiente de fuente`.

**VRM-020 — P0 — create/edit/delete de recursos no puede ser memory/DataURL/local-only.**  
Observed en source: edición muta `CX.docStore._d`; upload usa `FileReader`/Data URL; reload no garantiza persistencia. Existe `app/core/backend-resources.js`, pero el módulo Documentos no lo consume como autoridad completa.  
Expected: metadata durable con ACK remoto/idempotencia; archivo binario solo mediante Storage autorizado/reglas validadas; si Storage aún no está autorizado/configurado, metadata/texto debe fallar cerrado y archivos no deben fingirse persistentes.

**VRM-021 — P0 — permiso Recursos debe usar projectId raíz y entidad real.**  
Mismo owner transversal de VRM-001/002; corregir una sola vez y probar editar/eliminar/subir dentro del alcance y bloqueo fuera del alcance.

### F. Certificación / Recursos históricos

**VRM-022 — P0 — carryover histórico de certificaciones debe adjudicarse, no perderse ni inventarse.**  
Existe evidencia read-only histórica con 78 records útiles, matches determinísticos y casos pendientes de revisión. El envelope activo conserva `pending_certification_source` y `certifications: []`.  
Expected: MODULE_TRUTH decide `APPROVED_NOT_COMPOSED` vs `TRUE_FUNCTIONAL_DEFECT` por identidad exacta; solo incorporar deltas aprobados demostrados; casos ambiguos quedan pendientes, no se fusionan por nombre.

### G. Visual / branding / laboratorio

**VRM-023 — visual — logo tenant y entrypoint humano.**  
Preservar fix ya probado: logo oficial T&A cargado; no regresar a login sin logo.

**VRM-024 — visual/P0 de aceptación humana — no mostrar laboratorio/debug en lane humana.**  
No exponer `CXORBIA DEV · LABORATORIO DE ESCENARIOS`, PASS/BLOCKED, fingerprints, counts de harness, `Fuente de datos no disponible` si HR viva está disponible, ni estados de adapter backend como texto para usuario.

## 5. Orden interno obligatorio del único microbloque

Este orden NO crea subiteraciones; solo respeta dependencias para evitar corregir síntomas antes de la autoridad:

1. **Context Contract Fix** — VRM-001/002/004/006/021. Unificar `tenantId + projectId + periodId` y scope en un único contrato.
2. **Read-model Reconciliation** — VRM-003/005/010/011/012/013/014/015/016/018/022. Reconciliar Shopper/Admin/Finanzas/Certificación contra mismas autoridades.
3. **Durability & Resources** — VRM-009/019/020. Eliminar local/memory como verdad; usar backend durable autorizado o fail-closed explícito.
4. **Human UI Cleanup** — VRM-007/008/017/023/024. Retirar lenguaje técnico y confirmar responsive/branding.
5. **Focal Proof** — Admin + Shopper + Finanzas + Postulaciones + Recursos + Certificación, desktop/móvil, refresh, misma HR revision y artifact fingerprint.

## 6. Gates de salida del microbloque

Debe probarse, como mínimo:

- selector Proyecto y Periodo funcional y persistente;
- Admin y Shopper comparten proyecto/periodo/sourceRevision;
- HR viva exacta GT/HN;
- perfil Shopper Paula conserva identidad exacta, histórico 7 y KPIs correspondientes sin regresión;
- Mis Visitas / activas / histórico / postulaciones coherentes;
- Postulaciones editables/reasignables cuando el contrato lo autoriza, con ACK y reload;
- Dashboard Operativo y Top shoppers no silencian población por falta de score;
- Dashboard Financiero muestra obligaciones operacionales sin convertir pendientes en cero y mantiene 0 conciliadas/0 pagadas mientras no exista fuente externa;
- Liquidaciones GT/HN corresponden a HR y rotulan parciales correctamente;
- Recursos no presentan seeds como reales y create/edit/delete son durables o fallan cerrados;
- Certificación no usa localStorage como verdad y conserva carryover adjudicado;
- cero etiquetas/enums/IDs técnicos en UI humana normal;
- desktop/mobile PASS;
- artifact desplegado en DEV = artifact certificado; production deploy count=0.

## 7. Política de cambios

- `P0_PROVEN` únicamente por owner exacto.
- Un solo escritor técnico conforme al Plan Rector; no pedir “arreglar todo CXOrbia”.
- No reimportar datos.
- No reconstruir módulos ya aprobados.
- No reabrir identity/auth/membership que ya estén `ALREADY_PROVEN_NO_DRIFT`.
- No introducir Firebase productivo nuevo.
- No tocar HR, Auth, provider ni producción salvo que un contrato explícito del microbloque lo requiera y exista autorización correspondiente.
- No usar localStorage/memory como verdad operacional.

## 8. Estado al congelar

`HOLD_PRE_I4_VISUAL_REMEDIATION_MICROBLOCK_ACTIVE`

Siguiente acción exacta: ejecutar el paquete focal empezando por **Context Contract Fix** sobre la candidata única, actualizar el ledger después de cada readback y no emitir nueva candidata humana hasta que todos los VRM estén cerrados con evidencia.
