# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

Fecha: 2026-07-18  
Estado: `HOLD_VISUAL_SEMANTIC_P0_PROVEN_NO_APPROBADO`

## Estado operativo

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR: `#7`, draft/open/no merge
- V159 auditada GO y empalmada.
- Commit de empalme: `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`.
- Hosting DEV y smoke remoto técnico: PASS.
- Validación visual de Paula: `NO APROBADO`.
- P0 visual/semántico demostrado: sí.
- V159 no es `ACTIVE_BASELINE`.
- No se reabre empalme ni auditoría estructural; se abre corrección focalizada Corte 0B.

## URL de evidencia NO APROBADA

`https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`

La URL se conserva como evidencia del build que falló visualmente. No debe presentarse como baseline aprobada.

## P0 reproducibles

1. Mayo y junio: cuestionario pendiente y sin submitir no coinciden con HR histórica.
2. KPI superiores, fases y listados inferiores no coinciden para el mismo periodo.
3. Liquidaciones hereda `Pend. cuestionario` desde una clasificación incorrecta.
4. Julio: asignadas/sin asignar/disponibles no refleja la operación real; Shopper no ve visitas elegibles.
5. Shopper y Cliente unen proyecto+periodo y no ofrecen selectores separados por scope.
6. Cliente no ve Academia aunque existen contenidos de rol Cliente.
7. Comparativo trimestral no expone histórico mayo/junio.
8. Manuales se muestran como cursos breves y no como documentos/instructivos profundos.

## Causa raíz localizada

- `app/core/data.js` contiene facets/buckets canónicos.
- `app/modules/dashboard.js` conserva cálculos duplicados directos por `v.estado` en flujo por fases y listados.
- `app/core/liquidacion.js` deriva estados desde `v.estado`/`v.submit`, por lo que un mapping HR incorrecto contamina Finanzas.
- La fuente actual es source-safe preview, no HR runtime live.
- Tenant/login todavía usa configuración fragmentada/local y botones de rol hardcodeados.

Fuente completa:

`app/docs/VALIDACION-VISUAL-V159-NO-APROBADO-20260718.md`

## Responsabilidad

### ChatGPT/Codex/backend

- mapping HR exacto;
- motor canónico de estados;
- estados explícitos de asignación, agenda, ejecución, cuestionario, submitido, liquidación y pago;
- reconciliación KPI/fases/listados/Finanzas;
- contrato tenant/login/roles/países/proyectos activos;
- gates semánticos por visita.

### Claude/prototipo

- consumir el contrato sin recalcular negocio;
- selectores proyecto/periodo por rol;
- login con roles visibles configurables;
- Academia Cliente;
- manuales documentales profundos.

## Corrección metodológica vigente

Ante el P0 reproducible y autorización expresa de Paula, las futuras candidatas que toquen módulos críticos Phase A pasan por:

`AUDITORÍA → COMPOSITE TEMPORAL CON OVERLAYS → GATES SEMÁNTICOS → VISUALIZACIÓN PRE-EMPALME → APROBACIÓN → APPLY_DELTA_DIRECTLY DEL MISMO HASH → POST-GATES → FREEZE`

No se crea rama/PR nuevo, no se usa `main`, no se transporta ZIP archivo por archivo y no se pide acción técnica manual a Paula.

## Siguiente bloque exacto

`CORTE 0B — MOTOR CANÓNICO DE ESTADOS + CONFIGURACIÓN TENANT/LOGIN`

1. Tabla de verdad HR mayo/junio/julio.
2. Mapping source-safe por campos explícitos.
3. Facets canónicos únicos consumidos por todos los módulos.
4. Corrección de liquidaciones/pagos.
5. Contrato tenant/login/roles/países/proyectos activos.
6. Gates de reconciliación cruzada.
7. Hosting DEV corregido y nueva validación visual.

## Documentación creada

- `app/docs/VALIDACION-VISUAL-V159-NO-APROBADO-20260718.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-V159-VISUAL-NO-APROBADO-20260718.md`
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V159-VISUAL-NO-APROBADO-20260718.md`
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V159-VISUAL-NO-APROBADO-20260718.md`

## Clasificación

- Reusable CXOrbia: motor canónico, tenant/login configurable, proyectos activos, gate visual pre-empalme.
- Exclusivo TyA/Cinépolis: mapping HR y verdad mayo/junio/julio.
- Claude/prototipo: render, selectores, login, Academia y manuales.
- Academia: rutas por rol y manuales documentales profundos.
- Sin impacto Claude: adapters, contratos, gates y validadores.

## Estado seguro

Hosting DEV conservado como evidencia. Sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos. Sin base vieja conectada ni datos sensibles crudos nuevos.
