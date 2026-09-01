# Cambios - Conflict Review Queue + Import Readiness Contract CXOrbia

Fecha: 2026-07-08  
Bloque: conflict review queue + import readiness report preview-only  
Estado: documentado y seguro.

## Archivos creados

1. `tools/contracts/cxorbia-conflict-review-import-readiness-contract.mjs`
   - Tipo: nuevo.
   - Proposito: contrato/validador preview-only para cola de conflictos y readiness de importacion.
   - Que valida: fuentes source-safe, conflictos por entidad, llaves estables, sourceRefs opacas, severidad, estado de cola, bloqueo de import, readiness por area, auditRef y revision humana.
   - Que bloquea: import real, escrituras reales, HR writes, Storage, proveedores activos, Make/Gemini real, pagos reales, notificaciones reales, base vieja, dump viejo, auto-merge de conflictos, dedupe visual/nombre, datos sensibles y secretos.

2. `app/docs/CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md`
   - Tipo: nuevo.
   - Proposito: documento tecnico y funcional del contrato.
   - Contiene: objetivo, alcance, fuentes permitidas, conflictos soportados, readiness por area, bloqueos duros, impacto Phase A, impacto Claude, impacto Academia, clasificacion y estado seguro.

3. `app/docs/CAMBIOS-CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md`
   - Tipo: nuevo.
   - Proposito: bitacora puntual de este bloque.

## Cambios aplicados

- Se agrego una estructura reusable para cola de conflictos antes de cualquier import real.
- Se agrego readiness por area para proyectos, visitas, shoppers, asignaciones, certificaciones, liquidaciones, pagos y rutas de cuestionario.
- Se reforzo que conflictos blocker detienen import hasta revision/resolucion humana.
- Se prohibio dedupe visual o por nombre para shoppers/asignaciones.
- Se reforzo que sourceRefs deben ser opacas y no payloads crudos.
- Se mantuvo Phase A segura: preview-only, sin import, sin escrituras, sin proveedores reales y sin datos sensibles.

## Impacto frontend / Claude

Claude debe reflejar:

- bandeja de conflictos;
- estados abierto/en revision/resuelto/rechazado/archivado;
- severidad info/warning/blocker;
- entidad afectada;
- source refs opacas;
- razon obligatoria para resolucion/rechazo;
- readiness por area;
- bloqueo visual de import si hay blockers;
- copy honesto: preview/listo para revision/pendiente gate, no importado.

No debe decir importado, sincronizado, pagado, notificado, conectado o aplicado si solo existe preview.

## Impacto Academia

Academia debe profundizar:

- export limpio vs preview vs import real;
- cola de conflictos;
- severidades;
- blockers;
- llaves estables;
- prohibicion de dedupe visual;
- revision humana;
- resolved preview vs aplicado real;
- datos sensibles excluidos.

## Clasificacion

- Reusable CXOrbia: si. Patron de cola de conflictos, readiness por area, llaves estables y bloqueo de import hasta resolucion.
- Exclusivo cliente: no. No hardcodea TyA/Cinepolis.
- Claude/prototipo: si. Requiere UI de conflictos/readiness y copy honesto futuro.
- Academia: si. Requiere cursos/manuales sobre import, conflictos, llaves estables y revision humana.
- Sin impacto Claude: parcialmente. El contrato no toca UI, pero genera pendientes claros para Claude.

## Estado seguro

- Sin cambios en `/app/modules`.
- Sin cambios en `/app/core`.
- Sin deploy.
- Sin produccion.
- Sin runtime real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes reales.
- Sin Make/Gemini real.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles en repo.
