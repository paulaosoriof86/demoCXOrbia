# Claude package acumulado Phase A TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Este paquete consolida lo que Claude/prototipo debe recibir despues de los bloques de continuidad Phase A TyA, sin reiniciar pendientes, sin asumir runtime activo y sin pedir nuevamente HR/reglas/shoppers/certificaciones ya documentadas.

Este documento es puente para Claude. No autoriza tocar backend, contracts, tools, gates, Firestore/Auth/Storage, Make, Gemini, imports, pagos reales, HR real ni datos sensibles.

## Estado base que Claude debe respetar

- PR #7 sigue draft/open/no merge.
- No hay deploy ni produccion real.
- No hay runtime backend conectado.
- No hay adapter habilitado.
- No hay import real ejecutado.
- No hay Firestore/Auth/Storage writes.
- No hay HR writes.
- No hay Make/Gemini live.
- No hay pagos reales.
- No hay output local source-safe commiteado.
- Los gates y validadores son preparacion/preview/documentacion, no integracion real.

## Bloques backend recientes que NO debe reabrir como si fueran nuevos

1. Checkpoint no-reversion Level 0/1.
2. Checkpoint real-data preview sin reproceso.
3. Gate continuidad operacional Phase A.
4. Maquina de estados operacional Phase A.
5. Acciones administrativas auditables.
6. Colas operativas.
7. Readiness acumulado.
8. Gate solicitud GO runtime DEV.
9. Plan runtime DEV switch.
10. Contrato `CX.data` DEV adapter.
11. Source-safe domain mapping.
12. Real-data domain readiness pack.
13. Source-safe input builder contract.
14. Local builder execution control.
15. Future single-command pack.
16. Accumulated continuity checkpoint.
17. Continuity prompt and PR summary.
18. Este paquete acumulado para Claude/Pendientes/Academia.

## Foco Phase A que Claude debe mantener

Phase A TyA no debe convertirse en demo generica. Debe sostener operacion real controlada con datos reales/sanitizados:

- HR como fuente operacional.
- Import historico como control, no como datos crudos en repo.
- Shoppers historicos completos desde HR/source-safe.
- Certificaciones ya presentadas preservadas.
- Visitas hasta junio ejecutadas; junio pendiente es liquidaciones/pagos, no visitas.
- Multi-proyecto desde el inicio.
- Cinépolis como proyecto configurable de TyA, no logica global hardcoded.
- Cuestionario configurable por proyecto/visita: CXOrbia, TyAOnline, externa, link general o link HR por visita.
- Sync HR/plataforma con llaves estables y conflictos a revision humana.

## Pendientes criticos para Claude/prototipo

Claude debe priorizar pocos puntos de alto impacto, no una lista gigante superficial.

### P0 - Copy honesto y estados reales de gate

Todo modulo que muestre notificaciones, sincronizacion, correo, WhatsApp, pagos, import, HR, Make, Gemini, Storage o Firestore debe distinguir claramente:

- preparado;
- preview;
- pendiente backend;
- pendiente gate;
- pendiente revision humana;
- bloqueado por fuente real;
- ejecutado real solo cuando exista evidencia backend.

No usar copy como enviado, sincronizado, pagado, importado, publicado por IA o conectado si el gate sigue apagado.

### P0 - Academia profunda y administrable

Academia debe quedar como modulo operativo, no como texto superficial. Debe incluir, por rol y por modulo:

- rutas por rol;
- manuales paso a paso;
- checklists;
- glosario;
- errores frecuentes;
- validaciones esperadas;
- cambios/notificaciones de manual;
- administracion visible de cursos/manuales/checklists/glosario.

Acciones minimas visibles o documentadas: crear, editar, archivar/soft-delete, duplicar, versionar, cambiar estado, asignar rol/proyecto/modulo y registrar revision humana.

### P0 - Phase A real TyA visible sin promesas falsas

El prototipo debe poder representar que TyA/Cinépolis esta preparado como proyecto configurable, con HR fuente operacional, visitas historicas, shoppers, certificaciones y liquidaciones/pagos como dominios controlados. No debe representar que ya se importaron datos reales ni que ya esta conectado Firestore/HR/Make/Gemini.

### P1 - Readiness/dashboard reusable

Si Claude muestra readiness, debe hacerlo como panel de diagnostico con:

- area;
- validator/contrato;
- estado;
- sourceRef opaca;
- warnings/blockers;
- pendiente fuente real;
- pendiente gate real;
- requiere revision humana.

No mostrar readiness como produccion lista.

### P1 - Proyecto configurable, no hardcode Cinépolis

Cinépolis debe ser primer proyecto TyA, pero la UI no debe convertirlo en logica unica. Todo patron reusable debe permitir otros proyectos/tenants con pais, moneda, reglas, HR, cuestionario, documentos, certificacion, pagos e integraciones configurables.

### P1 - Mis beneficios / liquidaciones / pagos

El shopper debe ver control historico y estado de liquidacion/pago, especialmente junio como corte inicial. La UI debe separar honorario, boleto, combo/reembolso, moneda, estado, lote y movimientos individuales, sin representar pago real ejecutado si solo esta preparado.

### P1 - Postulaciones/asignaciones y conflictos

Claude debe representar conflictos como revision humana, no sobrescritura silenciosa. No deduplicar por nombre. Visualmente debe poder distinguir asignacion desde plataforma, desde HR, pendiente sync, sync preparada, conflicto y revision.

### P2 - Limpieza y consolidacion post-RC

Cuando haya capacidad, consolidar patches visuales recientes en sus modulos fuente solo si mejora mantenibilidad y no rompe gates. Mantener `CX.data` como contrato y no llamar proveedores reales desde UI.

## Academia - cobertura obligatoria derivada de este paquete

Academia debe explicar al menos estos temas:

1. Que es Phase A y que no es produccion final.
2. Diferencia entre preview, dry-run, gate, runtime, import y produccion.
3. Por que no se comparten datos privados por chat.
4. Por que `.tmp` no se commitea ni se usa como fuente original.
5. Como opera HR como fuente operacional.
6. Como se preservan shoppers historicos y certificaciones ya presentadas.
7. Como se manejan postulaciones/asignaciones y conflictos.
8. Como se separan visitas ejecutadas de liquidaciones/pagos.
9. Como se administra Academia: crear, editar, duplicar, versionar, archivar, publicar y revisar.
10. Que significa Gemini como borrador/revision humana, no publicacion automatica.
11. Que significa Make/HR sync preparado, no HR sincronizada real.
12. Como leer un readiness dashboard sin confundirlo con produccion lista.

## Clasificacion por impacto

- Reusable CXOrbia: gates, readiness, source-safe, `CX.data`, multi-tenant, proyecto configurable, outbox/sync, review humana, copy honesto, Academia transversal.
- Exclusivo TyA: HR TyA/Cinépolis, reglas Q1/Q2, junio como liquidacion/pago, boleto/combo, certificaciones ya presentadas de ese proyecto.
- Claude/prototipo: copy, vistas, badges, estados, administrabilidad Academia, readiness visual, Mis beneficios/liquidaciones, conflictos.
- Academia: rutas por rol, manuales, glosario, checklists, notificaciones, cursos operativos y administrativos.
- Sin impacto Claude: validadores internos, contratos backend, docs de gates, scripts locales no conectados.

## Lista NO TOCAR para Claude salvo instruccion explicita

- `tools/`
- `tools/migration/`
- `tools/contracts/`
- `backend/contracts/`
- `.github/workflows/`
- reglas Firestore/Auth/Storage reales
- secrets/webhooks/API keys
- archivos con datos reales/sensibles
- `.tmp/`
- cualquier integracion real

## Validacion esperada cuando Claude entregue correccion

Claude debe reportar:

1. Que archivos UI toco.
2. Que copy quedo como preview/pendiente y no como real.
3. Que no activo proveedores reales.
4. Que no hardcodeo Cinépolis como global.
5. Que Academia quedo profunda, editable y por rol, o que queda pendiente exacto.
6. Que no toco backend/contracts/tools/gates.
7. Que no introdujo datos sensibles.
8. Que la navegacion base y consola no tienen errores criticos.

## Estado seguro

Documento de puente solamente. No cambia UI, no toca `/app/modules`, no toca `/app/core`, no activa runtime, no ejecuta builder, no importa datos, no escribe Firestore/Auth/Storage/HR, no activa Make/Gemini, no hace deploy, no produce pagos reales y no agrega datos sensibles.
