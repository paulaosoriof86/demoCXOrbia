# ADDENDUM PREVALENTE — I3 VISUAL CHECKPOINT + PHASE A / FINANCE PRIORITY LOCK — 2026-10-03

**ID:** CXORBIA-RECOVERY-I3-VISUAL-PHASEA-PRIORITY-20261003  
**Estado:** FROZEN_PREVALENT_UNTIL_SUPERSEDED_BY_EXPLICIT_PAULA_DECISION_OR_PRODUCTION_LOCK  
**Iteración:** I3 FUNCTIONAL CLOSURE / PRE-I4  
**Producción:** DO_NOT_TOUCH  
**Repo:** paulaosoriof86/demoCXOrbia  
**Branch:** recovery/cxorbia-phase-a-20260831

## 1. Razón y precedencia

Este addendum congela una aclaración explícita de Paula del 2026-10-03 y corrige una desviación de prioridad/cadencia detectada en el current state.

No invalida gates PASS ni source proofs anteriores. No reconstruye módulos. No crea otra metodología, candidata, rama, repositorio, Firebase o I5.

Prevalece sobre cualquier continuidad anterior que:
- permitiera seguir acumulando módulos ya considerados solucionados sin materializarlos para revisión visual de Paula;
- pusiera P1 auxiliares (Soporte/Novedades/Marketing/Automatizaciones/Integraciones/Correo) por delante de P0/aceptaciones abiertas de Fase A, Finanzas, Certificaciones o administrabilidad;
- tratara un usuario focal como regla funcional del producto.

## 2. Nueva regla obligatoria de aceptación visual incremental

Desde este lock:

1. Cuando uno o varios módulos alcancen estado técnico que los haga candidatos a “ya deberían funcionar”, deben componerse en la **misma candidata canónica acumulativa** y materializarse una sola vez a DEV/preview.
2. Antes de comenzar otro paquete de **mutación de producto**, Paula debe poder visualizar esos módulos y aprobarlos explícitamente.
3. Source PASS no equivale a aprobación visual.
4. Aprobación visual no sustituye source/provider/readback gates.
5. Si Paula encuentra un defecto, se clasifica con la taxonomía Recovery, se corrige sólo por owner demostrado y se vuelve a materializar el sucesor acumulativo; no se abre metodología paralela.
6. Una vez aprobado un módulo, su source/blob/fingerprint + comportamiento + visual aceptado se registra como autoridad modular. Ningún cambio posterior puede regresarlo silenciosamente.
7. Gate 20 final sigue existiendo, pero no reemplaza estos checkpoints visuales incrementales.

**Efecto inmediato:** queda prohibida nueva mutación de producto para VRM-193 o cualquier otro finding hasta ejecutar el checkpoint visual acumulativo actual y obtener decisión humana de Paula.

## 3. Candidata acumulativa actual que debe visualizarse

La source técnica acumulativa vigente antes de este control es:

- productSourceSha: `a62d4e5b49fce4464987ca55112221604647933c`
- productTree: `6d3dd5abd351586d018be83c2b144ff49d4a94d3`
- VRM-188: source PASS Run 956
- VRM-189: source PASS Run 961
- VRM-190: source PASS Run 964
- VRM-191: source PASS Run 968
- VRM-192: source PASS Run 971

Estos PASS no autorizan producción y todavía requieren la materialización/visualización acumulativa correspondiente.

## 4. Prioridad de cierre después del checkpoint visual

Después de la aprobación visual del checkpoint actual, el orden de trabajo vuelve obligatoriamente a:

### A. Fase A operacional y shopper/Admin — primero
Cerrar/reprobar los P0 y acceptance blockers acumulativos ya registrados, sin reabrir los que estén PASS:
- Visitas / HR freshness / disponibilidad / asignación / reserva.
- Gestión de Postulaciones y Asignaciones.
- Shoppers: identidad, adjudicación/merge seguro, perfil, histórico, KPIs, login y autoadministración.
- Mi Día.
- Mis Visitas.
- Mis Beneficios.
- Reportes shopper.
- Dashboard operacional.
- Ficha/proyecto/periodo/configuración multiproyecto.

### B. Finanzas — prioridad P0 antes de módulos auxiliares
Debe cerrarse integralmente y en la misma candidata:
- Movimientos: prueba E2E de alta/edición/reconciliación/readback donde aplique.
- Dashboard financiero: debe derivar de la misma autoridad durable de movimientos/reconciliación.
- Liquidaciones.
- CxP/CxC o su lenguaje de negocio aprobado.
- Beneficios/pagos visibles al shopper.
- Reconciliación histórica durable e idempotente.
- País/moneda separados; nunca sumar GTQ y HNL.
- Lo ya pagado no puede permanecer como pendiente si la autoridad durable de pago lo confirma.
- El hecho operativo indicado por Paula de pagos de agosto y pagos parciales de septiembre debe validarse contra receipts/fuente durable; nunca hardcodearse ni inferirse desde memoria/chat.

Hallazgos relevantes conservados incluyen, entre otros, VRM-132, VRM-151, VRM-174, VRM-179 y los hallazgos financieros históricos no cerrados. VRM-183 permanece cerrado si su prueba durable sigue vigente.

### C. Certificaciones — antes de auxiliares P1
Debe quedar funcional tanto Admin como Shopper:
- Admin puede administrar certificaciones/curso/contenido según contrato durable aprobado.
- Shopper no queda amarrado a una sola certificación global.
- Selección/eligibilidad debe respetar tenant + projectId + certificationId + periodo/versión cuando aplique.
- Certificaciones previas/recertificación/carryover siguen su autoridad durable.
- No publicar silenciosamente menos preguntas de las solicitadas ni perder grounding.
- Conservar los hallazgos acumulativos VRM-111/112/119/126/148/171/172/173/181 según su estado real vivo.

### D. Administrabilidad integral
VRM-194 (P0) queda antes de VRM-193:
- branding/tenant;
- plan/módulos;
- configuración legal/administrativa;
- configuración de proyecto;
- todo write con provider ACK/readback o explícitamente immutable/not applicable.

### E. Módulos auxiliares P1
VRM-193 (Soporte, Novedades, Marketing, Automatizaciones, Integraciones, Correo) se trabaja sólo después de A–D y de los checkpoints visuales correspondientes, salvo que se demuestre que uno de ellos bloquea directamente un P0 de Fase A.

## 5. Gestión de Postulaciones y Asignaciones — criterio congelado

La superficie actualmente denominada **Gestión de Postulaciones** debe evolucionar a **Gestión de Postulaciones y Asignaciones** o una denominación funcional equivalente aprobada visualmente por Paula.

Debe representar de forma coherente y sin duplicados:
- postulaciones iniciadas desde la plataforma;
- postulaciones/solicitudes que deban persistir en Gestión;
- asignaciones provenientes de la HR/Hoja de Ruta;
- asignaciones hechas en plataforma;
- estado exacto de aprobación/rechazo/standby/reprogramación/reasignación/cancelación;
- origen de asignación;
- ACK/sync cuando corresponda;
- eliminación/cancelación válida que no reaparece.

No se permite que “sólo lo originado en plataforma” o “sólo lo originado en HR” defina la vista completa.

## 6. Regla transversal de shoppers

Ninguna solución puede estar codificada para `paula.osorio`, Milton, Patricia, Daniel ni cualquier otra identidad focal.

Los usuarios focales son **fixtures/evidencia**, no arquitectura.

El contrato aplica a **todo shopper canónico del tenant y del proyecto**:
- identidad exacta/crosswalk/adjudicación;
- login;
- perfil;
- histórico;
- KPIs;
- visitas disponibles/asignadas;
- postulaciones/reservas;
- certificaciones;
- beneficios/reportes.

La prueba debe ser data-driven y demostrar invariantes de población cuando sea viable, además de focales representativos GT/HN. No se aceptan ifs, aliases o excepciones de código por persona.

## 7. Multiproyecto y Cinépolis

CXOrbia sigue siendo multiproyecto.

Cualquier regla específica de Cinépolis —HR/Hoja de Ruta, links, tabs, periodicidad mensual, quincenas, moneda/país, cuestionarios, certificaciones, honorarios, escenarios, documentos, instrucciones, mapping, source revision o reglas operativas— debe residir en configuración/documentos/refs del **proyecto Cinépolis**, nunca como autoridad global del código.

La ficha de administración del proyecto debe ser suficiente para asociar y administrar:
- fuente/Hoja de Ruta y provider binding;
- mapping;
- links;
- documentos/recursos;
- periodos/cortes;
- reglas;
- países/moneda;
- cuestionarios/certificaciones;
- parámetros financieros;
- demás configuración operativa necesaria.

El segundo proyecto debe reutilizar los mismos contratos sin copiar Cinépolis ni abrir otra rama/producto.

## 8. Visual y jerarquía — criterios que no deben perderse

Se preservan todos los findings visuales anteriores. En particular:
- Mi Día debe priorizar la acción actual y no fabricar progreso.
- Mi Perfil debe tener jerarquía clara entre identidad, datos personales/pago, desempeño e histórico.
- Mis Visitas debe ser coherente, legible y con acciones realmente funcionales.
- Mis Beneficios debe distinguir periodo actual/histórico y pago confirmado/pendiente sin tokens técnicos.
- Certificaciones/Academia deben evitar presentación excesivamente plana; conservar jerarquía, tarjetas/estados claros y uso de acentos/colores sólidos coherentes con la identidad aprobada, sin sacrificar legibilidad.
- Finanzas no expone IDs/enums/abreviaturas técnicas en UI normal.
- Botones visibles deben funcionar o estar explícitamente deshabilitados/pendientes; no “botones pintados” sin acción real.

## 9. Anti-regresión y artifact único

Se mantiene:
- una sola candidata canónica;
- cambios incrementales y acumulativos;
- un solo build determinista por checkpoint;
- un solo artifact certificado por checkpoint;
- no rebuild entre certificación y deploy;
- module truth matrix exhaustiva;
- último módulo aprobado + deltas aprobados como autoridad;
- producción `tya-plataforma.web.app` DO_NOT_TOUCH hasta I4 y autorización expresa.

Un módulo aprobado visualmente sólo puede cambiar por:
1. defecto nuevo reproducible en ese módulo;
2. dependencia transversal probada;
3. decisión funcional nueva explícita de Paula.

Todo cambio debe conservar el resto de fingerprints aprobados o fallar cerrado.

## 10. Acción exacta inmediata

**NO continuar VRM-193 todavía.**

Siguiente acción:
1. revalidar source/tree y acumulación del product source actual;
2. ejecutar los source/reproof pendientes estrictamente necesarios para no presentar como “solucionado” algo no probado;
3. producir **una única materialización DEV acumulativa** de la candidata;
4. ejecutar readback vivo Admin + Shopper + HR + Finance focal sobre el mismo artifact;
5. entregar a Paula el link DEV y una ruta corta de revisión por módulos;
6. esperar **aprobación visual explícita de Paula** antes de cualquier siguiente mutación de producto;
7. si aprueba, continuar por la prioridad A–D anterior; si rechaza algo, corregir sólo ese owner y repetir el checkpoint.

No requiere autorización para preparar/materializar DEV. Sí requiere decisión humana de Paula para cerrar el checkpoint visual. Producción sigue protegida.
