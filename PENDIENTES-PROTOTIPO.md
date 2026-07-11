# PENDIENTES-PROTOTIPO.md

Pendientes reales del prototipo/frontend para Claude. No incluir tareas de backend, reglas Firestore, Auth DEV, loaders, seeds, helpers locales, smoke tests, Hosting, Make real, correo real, WhatsApp real, Gemini backend ni Storage real.

## Addendum R4 — importadores source-safe — 2026-07-11

- Agregar vista de dry-run separada para pagos y certificaciones.
- Mostrar archivo, formato, fuente, aceptados, duplicados, conflictos y blockers.
- No mostrar fila cruda ni campos protegidos.
- Materialización desactivada mientras el gate esté HOLD.
- Finanzas debe usar `paymentState`; `liquidada` no equivale a `pagada`.
- Certificación solo habilita visitas con `confirmed/published` o carryover materializado.
- Dry-run ejecutado no significa datos importados.
- Mantener pendientes acumulados V103 y smoke visual por rol sobre source-safe R4.

Fuente detallada: `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-SOURCE-SAFE-IMPORTERS-R4-20260711.md`.

## Paquete acumulado Phase A TyA - 2026-07-09

Fuente puente: `app/docs/CLAUDE-PACKAGE-ACCUMULATED-PHASE-A-TYA-20260709.md`.

### P0 - Copy honesto de gates e integraciones

- Revisar modulos visibles que mencionen envio, sync, HR, Make, Gemini, correo, WhatsApp, pago, import, Storage, Firestore o produccion.
- Reemplazar promesas de accion real por estados honestos: preparado, preview, pendiente backend, pendiente gate, pendiente fuente real, pendiente revision humana o bloqueado.
- No mostrar como enviado/sincronizado/pagado/importado/publicado por IA/conectado si no hay evidencia backend y gate real activo.

### P0 - Academia profunda, editable y accionable

- Academia debe tener profundidad por rol y por modulo: manuales paso a paso, checklists, glosario, errores frecuentes, validaciones esperadas, estados y consecuencias operativas.
- Debe existir administracion visible o pendiente exacto para cursos/manuales/checklists/glosario: crear, editar, archivar/soft-delete, duplicar, versionar, cambiar estado, asociar rol/proyecto/modulo, revision humana y auditoria.
- No aceptar Academia como textos superficiales o solo descripcion.

### P0 - Phase A real TyA sin promesas falsas

- La UI debe representar que TyA/Cinépolis esta preparado como proyecto configurable y multi-proyecto, con HR fuente operacional y dominios de visitas/shoppers/certificaciones/liquidaciones documentados.
- No debe mostrar que datos reales ya fueron importados, que Firestore ya esta conectado, que HR ya sincroniza o que Make/Gemini ya estan activos.
- Junio debe verse como control de liquidaciones/pagos, no como visitas pendientes por ejecutar.

### P1 - Readiness/dashboard source-safe

- Si existe dashboard o panel de readiness, debe mostrar area, validator/contrato, estado, sourceRef opaca, warnings/blockers, pendiente fuente real, pendiente gate real y revision humana.
- No debe mostrar readiness como produccion lista, import real, sync real, envio real, pago real, provider activo, Storage activo, Firestore conectado, HR sincronizada ni deploy.

### P1 - Proyecto configurable, no hardcode Cinépolis

- Cinépolis debe ser primer proyecto TyA, no logica global.
- La UI debe poder sostener pais, moneda, HR, cuestionario, documentos, certificacion, agendamiento, reprogramacion/cancelacion, pagos e integraciones por tenant/proyecto.

### P1 - Mis beneficios / liquidaciones / pagos

- Mostrar separacion de honorario, boleto, combo/reembolso, total, moneda, estado, lote y movimientos individuales cuando aplique.
- No marcar pago real ejecutado si solo esta preparado/controlado.
- Debe permitir entender junio como corte inicial de pagos/liquidaciones.

### P1 - Postulaciones/asignaciones/conflictos

- Representar asignacion desde plataforma, asignacion desde HR, sync preparada, pendiente sync, conflicto y revision humana.
- No resolver visualmente por nombre ni ocultar conflictos.
- No duplicar por coincidencia visual simple.

### P2 - Consolidacion post-RC

- Consolidar patches visuales recientes en sus modulos fuente solo si mejora mantenibilidad y no rompe gates.
- Mantener `CX.data` como contrato estable.
- No llamar proveedores reales desde modulos UI.

## Hallazgo visual Academia - acciones administrativas faltantes - 2026-07-08

- Captura compartida por Paula: en Academia se observan Manuales, selector de rol, Crear con IA, Cargar recurso y + Categoria, pero no se ve opcion visible para borrar, archivar, duplicar o versionar cursos.
- Claude debe auditar `app/modules/academia.js` y datos/manuales relacionados para implementar o documentar administracion completa de cursos/manuales/checklists/glosario.
- Acciones esperadas: crear, editar, borrar controlado o archivar, duplicar, versionar, cambiar estado borrador/en revision/publicado/archivado, asignar rol/proyecto/modulo, y registrar revision humana.
- Borrar no debe eliminar contenido historico critico sin confirmacion; preferir archivar/bloquear/soft-delete con auditRef, motivo y permisos.
- Si no puede implementarse sin tocar backend, Claude debe dejar UI pendiente honesta y documentarlo, no simular que el borrado real existe.
- Academia debe explicar en manuales como administrar cursos y que diferencias hay entre borrar, archivar, duplicar y versionar.

## Addendum readiness dashboard bridge runner - 2026-07-08

- Backend agrego `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs` y documentos `app/docs/READINESS-DASHBOARD-BRIDGE-RUNNER-CXORBIA-20260708.md` / `app/docs/CAMBIOS-READINESS-DASHBOARD-BRIDGE-RUNNER-CXORBIA-20260708.md`.
- Claude debe usar este patron si agrega dashboard/panel de readiness: convertir resultados de validadores en filas visuales con area, estado honesto, sourceRef opaca, gate apagado, revision humana y motivo.
- El bridge no significa runtime real: no mostrar produccion lista, import real, sync real, envio real, pago real, provider activo, Firestore conectado, HR sincronizada, Make/Gemini activo o deploy.
- Academia debe explicar como un reporte de validadores se convierte en dashboard, source-safe, fixture sintetico, input sanitizado, gates apagados, warnings/fails/blockers y revision humana.

## Addendum readiness dashboard source-safe - 2026-07-08

- Backend agrego `tools/contracts/cxorbia-readiness-dashboard-source-safe-contract.mjs` y documentos `app/docs/READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md` / `app/docs/CAMBIOS-READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md`.
- Claude debe usar este patron si agrega dashboard/panel de readiness: area, estado preview, sourceRef opaca, gate apagado, revision humana, motivo y blocker/warning si aplica.
- Estados permitidos: preview listo, diagnostico ejecutado, fixture sintetico, input sanitizado, warning, fail, pendiente fuente real, pendiente gate real, pendiente revision humana, produccion no autorizada, proveedor no activo, bloqueado por datos sensibles, bloqueado por conflicto, solo documental.
- No mostrar readiness como produccion lista, import real, sync real, envio real, pago real, provider activo, Storage activo, Firestore conectado, HR sincronizada, Make/Gemini activo o deploy realizado.
- Academia debe tener manuales/cursos sobre readiness dashboard, preview vs real, fixture sintetico, input sanitizado, source-safe report, gates apagados, errores, warnings, blockers y revision humana.

## Addendum synthetic input pack expanded coverage - 2026-07-08

- Backend actualizo `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs` y agrego `app/docs/SYNTHETIC-INPUT-PACK-EXPANDED-COVERAGE-CXORBIA-20260708.md` / `app/docs/CAMBIOS-SYNTHETIC-INPUT-PACK-EXPANDED-COVERAGE-CXORBIA-20260708.md`.
- Claude debe mostrar la cobertura expandida solo como diagnostico preview si se refleja en UI: area, validator, fixture sintetico/sanitizado, pass/fail/warning y gate real apagado.
- Areas agregadas al diagnostico: assignment sync conflict, notification outbox, project/tenant rule versioning, rule change changelog notification y release readiness snapshot.
- No mostrar esto como produccion lista ni como import real, sync real, envio real, pago real, provider activo, Storage activo o deploy.
- Readiness/dashboard debe separar: contrato probado, fixture sintetico validado, preview listo, warning, fail, pendiente gate real, pendiente fuente real, pendiente revision humana y produccion no autorizada.
- Academia debe tener manuales/cursos sobre coverage del runner, fixtures sinteticos, inputs sanitizados, preflight contractual, pass/fail/warnings, gates apagados y revision humana.
