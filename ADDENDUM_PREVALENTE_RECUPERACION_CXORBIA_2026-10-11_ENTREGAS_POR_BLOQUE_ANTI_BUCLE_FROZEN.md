# ADDENDUM PREVALENTE — ENTREGA GUIADA POR BLOQUES Y ANTI-BUCLE CXORBIA

**Fecha:** 2026-10-11. **ID:** CXORBIA-I3-DELIVERY-20261011. **Estado:** FROZEN_CONTROL_ONLY. **Producción:** DO_NOT_TOUCH.

## BEFORE (evidencia)
La fuente actual `aa435fa9e0bfee37c118747637a266581b853fe8` difiere del DEV acreditado #1454 `f2a50044...`. El workflow #1463 reportó PASS del guard canónico pero no ejecutó los 29 jobs restantes. La matriz V57 registra 21 dominios: 10 MATCH y 11 sin cierre integral. El 08-10 Paula dio PASS **visual** a Mi Día; el resto conserva acuerdos y hallazgos, no PASS funcional de bloque. Una tarjeta grande no autoriza reabrir desarrollos aprobados.

## AFTER — tres correcciones obligatorias de ejecución
1. **Preservación monotónica:** conservar Mi Día visual PASS, Academia, dirección aprobada de Mi Perfil y Mis Visitas, acciones primarias del Dashboard y Finanzas. Recuperar sólo deltas aprobados y arreglos P0 con owner probado. No recrear, revertir globalmente, ni rediseñar un módulo aprobado por fallo menor.
2. **PASS real por bloque:** source proof → mismo artifact DEV identificado → E2E exacto Admin/Shopper/Client pertinente con provider ACK, readback, reload y no duplicado → entrega de UNA ruta/rol/checklist → aprobación visual de Paula → lock de bloque. No declarar pass de módulo por job verde de autoridad/código solamente.
3. **Revisión guiada e incremental:** aceptar/fijar bloques completos y avanzar. Hallazgos pequeños quedan con owner, evidencia y corrección focal en la misma candidata y pueden resolverse en paralelo con pruebas de bloques independientes. No perder hallazgos entre runs. El cierre final exige una sola certificación acumulativa Gate20/Gate21 sobre el mismo artifact.

**Precedencia limitada:** este documento sustituye únicamente la prohibición de checkpoints humanos parciales del lock 06-10, por decisión nueva expresa de Paula. NO sustituye I0–I4, candidata única, anti-overlays, anti-rebuild, P0, fase A de 21 dominios, Gate20/Gate21, producción I4 ni autorización expresa. No se despliegan distintas candidatas por bloque.

## Bloques de aceptación
- **B1 Autenticación real y Mi Día** (VISUAL_MIDIA_PASS_AUTH_HOLD): Contraseña humana sin reload: tiempo Auth, claims, Firestore, HR, Mi Día; GT/HN y Admin.
- **B2 Mi Perfil, Shoppers e identidad** (HOLD): Edición de identidad display-only, fuente HR inmutable, country, banca por RBAC, provider ACK, readback/reload y adjudicaciones exactas.
- **B3 Mis Visitas, agendar, cancelar y check-in** (HOLD): Quincena/franja, cancelación con motivo, pending visible, cámara/GPS/timestamp/visitId/Storage ACK; ajustar sólo altura tarjeta.
- **B4 Academia, Certificaciones, Recursos, Cuestionarios** (MATCH_SUBSET_REVALIDATE): Preservar banco/diseño aprobado, crear y aprobar con provider, exact question count, recertificación, evidencia/descargas E2E.
- **B5 Mis Beneficios y pagos históricos** (HOLD): Corte financiero histórico y paridad con Finance/Profile; KPIs, drill, tabla newest first, acciones por fila.
- **B6 Soporte, Novedades, Mis Reportes, Histórico** (MATCH_SUBSET_REVALIDATE): Persistencia y no reaparición/cross-shopper leakage; informes por proyecto/country/revision.
- **B7 Postulaciones, asignaciones HR, Reservas y Dashboard Operativo** (SOURCE_PROVEN_PENDING_LIVE): Postulaciones web + asignaciones HR en gestión, estados y origen separados, acciones/modales contextuales Dashboard, agendar/cuestionario/reprog/cancel/assign, provider ACK/idempotencia.
- **B8 Finanzas Admin, Movimientos, Liquidaciones, Lotes, CxP/CxC** (SOURCE_PROVEN_PENDING_FINAL_E2E): Pagos individuales y lote parcial, soporte Storage, fecha/referencia, conciliación; misma verdad durable en Beneficios.
- **B9 Proyectos, configuración transversal y Portal Cliente** (HOLD_FINAL): Tenant/proyecto/periodo/country/currency/routing, aislamiento, 21 dominios MATCH, mismo artifact, Gate20 y Gate21.

## Gestión de Postulaciones / Dashboard — contrato innegociable
Postulaciones creadas dentro de CXOrbia deben persistir y aparecer en Gestión de Postulaciones, sobrevivir reload y no reaparecer tras eliminación válida. Asignaciones creadas en la HR deben mostrarse con identidad/origen exactos y acciones separadas, no mezclarse como postulaciones ficticias. Administración debe poder solicitar agendamiento, cuestionario, aprobar/rechazar/standby, reasignar, revisar reprogramación y cancelar; el Dashboard Operativo ofrece los modales de acción directamente según estado. Toda escritura requiere provider ACK/idempotencia, vista Shopper actualizada, no duplicados, notificación durable y control HR externa. Sin esto, B7 = HOLD.

## Alcance original y anti-pérdida
Mantenidos: 45 hallazgos humanos 06-10; 18 del 08-10; ledger V366 completo (274 VRM sin renumerar); Module Truth V57. Las aprobaciones por bloque se congelan con fingerprint específico y no se reabren salvo drift reproducible. El alta efectiva de otro proyecto es P1 post-GO-LIVE salvo dependencia contractual P0; conservar arquitectura multiproyecto configurable sin globales Cinépolis.

## Acción inmediata exacta y límite temporal
B7: comparar READ-ONLY la visita real rechazada por HTTP 409 contra **la misma revisión HR externa** y documento de Firestore por `tenantId/projectId/periodId/visitId/hrRowId`, `periodKey/disponibleDesde/availableFrom`, `reservationWindowMode/timeZone`, comprobando ACK=FALSE antes de modificar. Source B7 focal #1462 ya PASS; no está desplegada en DEV. Si falla acceso Firestore, ENVIRONMENT_FAILURE y correr el **runner I3 autorizado existente**, no inventar resultado ni generar workflow. B1 sigue pendiente login con contraseña humana y carga sin recarga. B2 pendiente provider ACK.

**Objetivo solicitado:** lunes 12-10-2026, sujeto a I3=GO probado. Nunca tocar https://tya-plataforma.web.app/ sin autorización productiva I4. Desde producción se desplegará exactamente artifact certificado sin rebuild. Cualquier supersession requiere addendum posterior con BEFORE/AFTER, causa, evidencia, fecha y hash.

Registro mecánico congelado: `CXORBIA_I3_ENTREGAS_BLOQUES_Y_P0_2026-10-11.json`.
