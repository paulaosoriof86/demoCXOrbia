# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-30  
**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-OPERATIONAL-AUTHORITY-REPAIR-15`  
**Estado:** `F10_OPERATIONAL_AUTHORITY_REPAIR_SOURCE_APPLIED__PROVIDER_GATE_PENDING__NO_DEPLOY`  
**NEXT:** `F10_VALIDATE_AUTHORITY_REPAIR_READONLY_THEN_PROVIDER_GATE`

El PASS anterior de F10 sobre lectura HR/KPIs se conserva como evidencia válida de lectura y semántica operacional. No se invalida el deploy `33289344796` ni el row-content PASS `33297814889`.

Después de ese PASS se demostró un defecto transversal diferente: `tya-live-source-inplace-apply.js` fabrica registros visuales `hr-post-*` a partir de visitas HR y varios call-sites del prototipo aún pueden mutar memoria antes de un ACK durable. Esto viola la arquitectura aprobada desde el inicio: HR = autoridad de periodos/visitas/evidencia observada; plataforma/Firestore = autoridad de postulaciones/decisiones/usuarios/perfiles/certificaciones.

Se aplicó source repair sin deploy ni provider writes:
- `app/adapters/tya-phase-a-operational-sync-v1.js`: prohíbe `hr-post-*` como postulación canónica, envuelve el compositor para excluirlos, redefine `periodStats()` con evidencia operacional directa, instala fachada durable `CX.data.createApplication()`, `CX.data.updateApplicationStatus()`, `CX.data.assignVisitDurable()` y reconciliación por llaves técnicas.
- `app/core/backend-v57-extra-config.js`: carga ordenadamente el adapter y el HTTP command transport en preview protegido; no habilita writes ni configura por sí solo un provider live.
- `backend/runtime/cxorbia-operational-command-provider-v1.mjs`: provider reusable source-only, fail-closed por policy, con Auth/membership/scope/idempotencia/versionado/ACK; no ejecuta HR/Make/Gemini/Storage/pagos.
- `app/docs/evidence/F10-OPERATIONAL-AUTHORITY-DEFINITIVE-SOLUTION-20260830.md`: lock arquitectónico y criterios permanentes.

No se modificaron `app/modules/*`, no hubo deploy/rebuild/reimport, no hubo Firestore/Auth/HR/Storage/Rules/pagos writes, Make/Gemini ni producción. Los call-sites visuales se entregarán a Claude Code solo después de cerrar los gates del backend y preparar el paquete focal completo.
