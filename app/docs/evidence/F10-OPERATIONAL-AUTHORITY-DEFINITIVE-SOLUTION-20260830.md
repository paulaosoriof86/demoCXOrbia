# F10 — Solución definitiva de autoridad operacional y sincronización

Fecha: 2026-08-30
Estado: SOURCE_APPLIED_PENDING_PROVIDER_GATE_AND_UI_CALLSITE_HANDOFF

## Problema demostrado

La arquitectura aprobada desde el inicio fue degradada por dos atajos heredados que no debieron llegar al runtime final: (1) `tya-live-source-inplace-apply.js` deriva registros visuales `hr-post-*` desde visitas HR y los coloca en `CX.data._posts`, confundiendo visita/asignación observada con postulación real; (2) varios call-sites del prototipo continúan mutando memoria y mostrando éxito antes de un ACK durable.

Esto no invalida la arquitectura maestra. Demuestra una desviación de implementación respecto del contrato ya vigente: HR debía ser autoridad de periodos/visitas; la plataforma debía ser autoridad de postulaciones/decisiones/usuarios; y toda escritura debía cruzar contrato/adaptador/provider con ACK.

## Lock definitivo

1. HR viva es autoridad de periodos, visitas y evidencia operacional observada.
2. Firestore/plataforma es autoridad de postulaciones, decisiones, usuarios, perfiles, certificaciones y overlays protegidos.
3. Una visita disponible nunca crea por sí misma una postulación.
4. `hr-post-*` queda prohibido como dato operacional canónico.
5. Postular, aprobar, rechazar, standby y asignar son comandos durables; éxito UI requiere `ok=true`, `status=committed`, `providerAck=true` y refresh posterior.
6. Asignación plataforma→HR se marca `assignmentSource=platform`, `assignmentSyncStatus=pending_hr`; cuando HR refleja el mismo shopper pasa a `synced`.
7. Asignación HR→plataforma se resuelve por llaves técnicas y se refleja sin duplicar.
8. Conflicto de shopper/llave estable pasa a revisión humana; nunca sobrescritura silenciosa ni dedupe por nombre.
9. Shopper ausente solo puede aprovisionarse con identidad técnica exacta y perfil/crosswalk protegido verificable; nombre visible por sí solo nunca autoriza creación o fusión.
10. `periodStats.done` significa realización soportada por evidencia operacional HR, no pertenencia a una lista legacy de strings.
11. Septiembre y periodos futuros entran por autodetección de HR, no por código mensual especial.
12. Cinépolis sigue siendo proyecto normal configurable; el patrón es reutilizable para otros proyectos/tenants.

## Implementación source aplicada

Se añadió `app/adapters/tya-phase-a-operational-sync-v1.js` con:
- purga de postulaciones sintéticas HR;
- wrapper del compositor canónico para impedir que `hr-post-*` entre al resultado;
- `periodStats()` por evidencia operacional directa;
- fachada durable `CX.data.createApplication()`, `CX.data.updateApplicationStatus()` y `CX.data.assignVisitDurable()`;
- refresh de backend obligatorio después del ACK;
- reconciliación estable por tenant/proyecto/visita/hrRow/shopper;
- lock diagnóstico `CX_TYA_OPERATIONAL_AUTHORITY_LOCK`.

## Estado de gates

El source NO activa por sí mismo Firestore writes, HR writes, Make, Gemini, pagos, deploy ni producción. La fachada queda fail-closed mientras `CX.commandAdapter`/transport/provider no estén habilitados por gate. Los call-sites visuales actuales deben migrarse posteriormente a estas funciones sin rediseñar los módulos.

## Clasificación

- Reusable CXOrbia: authority matrix, ACK-before-success, stable-key reconciliation, conflict review, no synthetic applications.
- Exclusivo cliente: mapeo TyA/Cinépolis y HR concreta.
- Claude/prototipo: sustituir únicamente call-sites locales de Postular/Aprobar/Rechazar/Standby/Asignar/Reprogramar/Cancelar por la fachada durable ya preparada; conservar diseño.
- Academia: actualizar manuales/rutas de rol para distinguir postulación, asignación pendiente de sync, sync confirmada y conflicto.
- Sin impacto Claude: gates/provider credentials/deploy.

## Siguiente bloque exacto

1. Cargar el adapter en el runtime canónico.
2. Ejecutar gates estructurales/read-only: cero `hr-post-*` canónicos, `periodStats` coherente con F10, compositor idempotente, cero mutación local de la fachada.
3. Con autorización específica, conectar/deplegar provider de comandos y validar un caso sintético controlado antes de cualquier escritura real.
4. Solo después preparar el paquete focal para Claude Code con call-sites exactos y pruebas.
