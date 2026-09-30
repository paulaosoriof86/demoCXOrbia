# Conflict Review Queue + Import Readiness Contract CXOrbia

Fecha: 2026-07-08  
Bloque: conflict review queue + import readiness report preview-only  
Archivo tecnico: `tools/contracts/cxorbia-conflict-review-import-readiness-contract.mjs`  
Estado: seguro, contractual/documental, sin runtime real.

## 1. Objetivo

Este bloque prepara una cola de revision de conflictos y un reporte de readiness de importacion para Phase A, sin ejecutar import real ni escribir en ninguna fuente.

El objetivo es que el import historico limpio, HR, plataforma, shoppers, certificaciones, rutas de cuestionario, liquidaciones y pagos puedan validarse antes de cualquier escritura real, con conflictos enviados a revision humana y sin sobrescribir silenciosamente.

## 2. Alcance

El contrato valida:

- fuentes limpias o sanitizadas;
- conflictos por entidad;
- llaves estables;
- referencias opacas a fuentes;
- severidad;
- estado de cola;
- bloqueo de import si hay conflictos blocker;
- readiness por area;
- auditRef;
- revision humana obligatoria.

Entidades cubiertas:

- proyectos;
- visitas;
- shoppers;
- asignaciones;
- certificaciones;
- liquidaciones;
- pagos;
- rutas de cuestionario;
- documentos;
- evidencias;
- postulaciones.

## 3. Fuentes permitidas

El contrato solo acepta fuentes preview/source-safe:

- `hr_export_clean`;
- `hr_preview`;
- `platform_preview`;
- `manual_clean_csv`;
- `controlled_fixture`;
- `redacted_reference`;
- `synthetic_preview`.

No acepta base vieja conectada, dump viejo, payload crudo, fila cruda, URL privada cruda, sample row sensible ni datos reales sin sanitizar.

## 4. Conflictos soportados

Tipos de conflicto:

- `duplicate_stable_key`;
- `missing_stable_key`;
- `hr_platform_mismatch`;
- `assignment_source_conflict`;
- `shopper_identity_ambiguous`;
- `certification_status_conflict`;
- `visit_status_conflict`;
- `questionnaire_route_conflict`;
- `settlement_eligibility_conflict`;
- `payment_status_conflict`;
- `currency_or_country_conflict`;
- `sensitive_data_detected`;
- `source_not_clean`;
- `requires_manual_mapping`.

Severidades:

- `info`;
- `warning`;
- `blocker`.

Estados de cola:

- `open`;
- `in_review`;
- `resolved`;
- `rejected`;
- `archived`.

Si un conflicto tiene severidad `blocker`, debe establecer `blockImport=true` y el readiness global debe quedar `blocked` mientras no se resuelva.

## 5. Llaves estables y no dedupe visual

Cada conflicto debe traer `tenantId`, `projectId` y una llave estable por entidad.

Para asignaciones y visitas, el contrato espera referencias como:

- `visitId`;
- `hrRowId`;
- `shopperId`;
- `assignmentSource` cuando aplique;
- `assignmentSyncStatus` cuando aplique.

Regla central: no deduplicar por coincidencia visual simple. Si falta llave estable suficiente, pasa a revision humana.

## 6. Readiness de importacion

El reporte de readiness se separa por areas:

- `projects`;
- `visits`;
- `shoppers`;
- `assignments`;
- `certifications`;
- `settlements`;
- `payments`;
- `questionnaire_routes`.

Estados permitidos:

- `ready_preview`;
- `needs_review`;
- `blocked`;
- `not_applicable`.

Cada area debe declarar conteos limpios/rechazados/conflictos y `auditRef`.

`ready_preview` no significa importado. Solo significa que esa area esta lista para revision/gate futuro en modo preview.

## 7. Bloqueos duros

El contrato bloquea:

- `execute`;
- `importNow`;
- `writeToDatabase`;
- `writeToFirestore`;
- `writeToHr`;
- `writeToStorage`;
- `connectOldDatabase`;
- `oldDatabaseDump`;
- `notifyReal`;
- `sendRealEmail`;
- `sendRealWhatsapp`;
- `makeActive`;
- `geminiActive`;
- `payNow`;
- `autoMergeConflicts`;
- `autoResolveConflicts`;
- `dedupeByNameOnly`;
- `overwriteWithoutReview`;
- DPI;
- banco;
- NDA firmado;
- secretos/tokens/webhooks/API keys;
- adjuntos/base64/cuerpos crudos.

## 8. Impacto Phase A

Este bloque avanza Phase A porque prepara control previo para:

- import historico limpio;
- shoppers historicos desde HR;
- certificaciones ya presentadas;
- asignaciones HR/plataforma sin duplicar;
- rutas de cuestionario por proyecto/visita;
- liquidaciones/pagos de junio;
- conflictos que deben resolverse antes de cualquier import o escritura real.

Mantiene junio como corte de liquidaciones/pagos, no como visitas pendientes.

## 9. Impacto Claude/prototipo

Claude debe reflejar en UI futura:

- bandeja de conflictos;
- severidad por conflicto;
- entidad afectada;
- fuente opaca HR/plataforma/import;
- estado: abierto, en revision, resuelto, rechazado, archivado;
- bloqueo de import si hay blockers;
- razon obligatoria para resolver/rechazar;
- readiness por area;
- copy honesto: preview/listo para revision/pendiente gate, no importado.

No debe mostrar que se importo, sincronizo, pago, notifico o escribio si el gate esta apagado.

## 10. Impacto Academia

Academia debe explicar por rol:

- export limpio vs preview vs import real;
- que es una cola de conflictos;
- severidades info/warning/blocker;
- por que un blocker detiene import;
- llaves estables;
- por que esta prohibido deduplicar visualmente;
- como resolver un conflicto con razon y auditoria;
- diferencia entre resolved preview y aplicado real;
- datos sensibles excluidos.

## 11. Clasificacion obligatoria del bloque

- Reusable CXOrbia: cola de conflictos source-safe, readiness por area, llaves estables, revision humana y bloqueo de import hasta resolver blockers.
- Exclusivo cliente: TyA/Cinepolis no queda hardcodeado; solo seria data de manifest externo.
- Claude/prototipo: necesita bandeja de conflictos y readiness dashboard con copy honesto.
- Academia: requiere lecciones/manuales sobre conflictos, import preview, llaves estables y revision humana.
- Sin impacto Claude: el contrato no toca UI/runtime.

## 12. Estado seguro

Sin cambios en `/app/modules`.  
Sin cambios en `/app/core`.  
Sin runtime real.  
Sin deploy.  
Sin produccion.  
Sin Firestore/Auth/Storage real.  
Sin HR writes reales.  
Sin Make/Gemini real.  
Sin correos/WhatsApp reales.  
Sin pagos reales.  
Sin import real.  
Sin datos sensibles en repo.
