# Phase A block progress tracker TyA

Fecha: 2026-07-04

## Estado general

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama: `docs-tya-v6-v71-audit`
- PR: #7 draft/open/no merge
- Source lock actual: V82 como baseline viva
- Estado: documentacion, contratos y validadores seguros
- Sin deploy
- Sin produccion
- Sin Firestore writes reales
- Sin HR writes reales
- Sin pagos reales
- Sin correo real conectado
- Sin Make real

## Bloques completados o documentados

### Base / continuidad

- Documento maestro y continuidad.
- V82 source lock.
- Auditorias V80/V81/V82.
- Regla de no reiniciar por cada ZIP.
- Addenda de cambios, Claude y pendientes.

### Backend foundation

- HR Source / preview seguro.
- CX.data backend adapter contract.
- DEV preview schema manifest.
- Data source selector.
- Auth claims readiness.
- Admin review contract.
- Submitido HR-driven configurable.
- Project wizard Phase A.

### Academia

- Academia role-based learning contract.
- Academia deep interactive addendum.
- Academia module sync gate.
- Academia backfill backend blocks.
- Academia coverage audit backend to date.
- Academia implementation backlog.
- Academia impact de liquidaciones/Cinepolis source-safe preview.

### Operacion Phase A

- Postulaciones y asignaciones sync HR/plataforma.
- Visit lifecycle.
- Reservas, franja, rango y quincena.
- Restricciones de proyecto y ficha de postulacion.
- Ficha de postulacion dinamica.
- Login externo configurable por tenant.
- Gestion estrategica de postulaciones.
- Notification outbox / WhatsApp Web fallback.
- Email traceability.
- Email real futuro por usuario.
- Email provider-agnostic por usuario.
- CRM, OneDrive, documentos y pipeline.
- Shopper communication history.
- Liquidaciones y pagos.
- Cinepolis Boleto/Combo, lotes y movimientos individuales.
- Preview validator/source-safe mapping para liquidaciones/corte junio y Cinepolis Boleto/Combo.

## Bloques agregados durante revision

Estos bloques no estaban suficientemente explicitados al inicio y se agregaron por hallazgos de Paula:

1. Reservas y control de franja/quincena.
2. Restricciones configurables por proyecto.
3. Ficha de postulacion dinamica y shopper-visible.
4. Opciones externas de login por tenant.
5. Gestion de postulaciones por sucursal/shopper.
6. Notification outbox y WhatsApp Web fallback.
7. Correo por usuario y provider-agnostic.
8. CRM/OneDrive/documentos/pipeline.
9. Shopper communication history ampliado.
10. Reembolsos Cinepolis Boleto/Combo.
11. Movimientos individuales asociados a lotes.
12. Tracker de avance por bloque.
13. Source-safe preview para corte junio/liquidaciones antes de fuentes reales.

## Bloque recien completado

### Liquidaciones/Cinepolis source-safe preview validator

Archivos:

- `app/contracts/liquidation-cinepolis-source-safe-preview-phase-a.tya.contract.json`
- `tools/migration/tya-liquidation-cinepolis-source-safe-preview-validator.mjs`
- `app/docs/LIQUIDATIONS-CINEPOLIS-SOURCE-SAFE-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-LIQUIDACIONES-CINEPOLIS-SOURCE-SAFE-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md`
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md`
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md`

Estado:

- Solo contrato, docs y validador seguro.
- No lee fuentes reales si no se le pasa input.
- El input permitido debe ser sintetico/sanitizado y traer `sourceSafe=true`.
- No escribe archivos por defecto.
- No activa runtime, produccion, Firestore, HR, pagos, Make, Gemini ni correo real.

## Pendientes backend inmediatos

1. Preview validator de assignment sync/conflicts.
2. Preview validator de visit lifecycle/reservas.
3. Preview validator de ficha postulacion dinamica.
4. Preview validator de notification outbox.
5. Preview validator de email/user mailbox sin conexion real.
6. Preview validator de CRM external folder refs.
7. Preview validator de shopper communication history.
8. Ejecutar validator de liquidaciones/corte junio contra input local sintetico/sanitizado cuando exista fuente segura.
9. Contrato ranking/scoring shopper.
10. Politica de datos sensibles: banco, DPI, NDA, correo, adjuntos.
11. Make payloads futuros sin activar.

## Pendientes prototipo / Claude

1. Login externo por tenant.
2. Ficha de postulacion frontal/dorso dinamica.
3. Bandeja postulaciones por sucursal/shopper.
4. Acciones ajuste fecha/confirmacion/reprogramacion.
5. Estados honestos de notificaciones.
6. WhatsApp Web fallback con confirmacion manual.
7. Email por usuario/provider agnostic.
8. CRM con carpeta externa/documentos/pipeline.
9. Shopper history completo.
10. Mis beneficios con honorario/reembolso/estado.
11. Lotes y movimientos individuales.
12. Academia interactiva profunda con backfill completo.
13. Liquidaciones/Cinepolis: Mis beneficios debe separar honorario, Boleto, Combo, reembolso total, total y estado.
14. Admin/Liquidaciones debe mostrar revision manual/conflicto si faltan llaves estables o referencias de pago.
15. Movimientos debe conservar pago individual aunque venga de lote.

## Pendientes Academia

1. Matriz curso/manual por rol y modulo.
2. Glosario consolidado.
3. Checklists interactivos.
4. Rutas obligatorias por rol.
5. Notificaciones de cursos/manuales.
6. Contenido retroactivo de todos los bloques backend.
7. Profundizar liquidaciones/pagos.
8. Profundizar correo/CRM/Shopper history.
9. Profundizar liquidaciones/Cinepolis source-safe preview, Boleto/Combo, corte junio, revision manual, lotes y movimientos individuales.

## Siguiente bloque recomendado

Crear politica consolidada de datos sensibles para banco, DPI, NDA, correo y adjuntos antes de cualquier lectura local de fuentes reales. Si Paula prioriza operacion, alternativa inmediata: preview validator de assignment sync/conflicts.

## Regla de cierre por bloque

Cada cierre debe mostrar:

- avance del plan;
- bloque completado;
- pendientes agregados;
- bloque siguiente;
- gates apagados;
- si se requiere insumo de Paula.
