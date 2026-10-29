# CXOrbia Recovery · I3 · Checkpoint de plan de choque, 28-oct-2026 (GT, noche)

**Modalidad:** evidencia acumulativa, append-only. Este checkpoint NO sustituye ni edita las autoridades congeladas existentes.

## Autoridades y decisiones inalterables

- Repositorio único: `paulaosoriof86/demoCXOrbia`, rama `recovery/cxorbia-phase-a-20260831`.
- Política permanente congelada: `CXORBIA_I3_SHOPPER_IDENTITY_PERMANENT_POLICY_FREEZE_2026-10-28.md` (commit `fe162537d6902422d84040012d9adc62d4684ccc`).
- Aprobación humana: Excel de Paula de tres hojas; 139 parejas confirmadas para 83 grupos, 66 casos fuertes y 73 débiles. **La aprobación confirma la identidad, pero no autoriza saltar las precondiciones técnicas de una fusión destructiva.**
- Normalizar nombres para comparación con Unicode NFD, sin tildes, minúsculas y espacios internos colapsados. Preservar grafía visual original del nombre del shopper.
- Nunca fusionar por nombre único ni por fuzzy matching. Aislar por tenant/país y corroborar identidad de forma autorizada. Si hay duda, bloquear la nueva identidad técnica y pedir confirmación en Administración/Operaciones.
- No eliminar ni sobreescribir Auth, visitas, certificaciones, postulaciones, beneficios, datos financieros ni evidencia histórica. Lectura previa, provider protegido, idempotencia, readback posterior, trazabilidad y HOLD ante ambigüedad.
- La hoja de ruta HR de Google Sheets sigue siendo la fuente autorizada de visitas GT/HN. Ningún ajuste de identidad puede modificar HR para simular disponibilidad.
- La oferta de shopper se restringe a país autorizado, proyecto activo y período actual; una visita histórica o de otro país nunca se reactiva solo por figurar "disponible" en HR.
- Ambiente de mutación de fusiones: `cxorbia-backend-dev`, tenant `tya`, proyecto Cinépolis. Producción `tya-plataforma.web.app`: **sin cambios**.
- `I3 HOLD`, `Gate20 HOLD`, `Gate21 HOLD`; `I4` requiere aprobación explícita. El objetivo urgente de producción no permite declarar pruebas inexistentes.

## Evidencia verificable, sin PII

1. Primer canario F-001 y canario de historial F-048: proveedor protegido + readback de Auth/Firestore + navegador shopper en DEV, PASS.
2. Cinco canarios de cero referencias F-003/F-004/F-006/F-007/F-008: PASS 5/5, ejecución [40812539393](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40812539393).
3. Preflight completo de 139 aprobaciones antes del lote: [40813018115](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40813018115), PASS READ-ONLY, 7 grupos ya consolidados.
4. Prevención de nuevas altas técnicas duplicadas en provider: `backend/runtime/cxorbia-shopper-command-provider-v1.mjs`, commit `15d32c7a72e85c7f465304c453cc43607bfdae44`; pruebas commit `87ab030bce33e90cf64b9bc78014c650c4cde4ae`; prueba automatizada y guardia de fuente [40813234722](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40813234722), 51/51 PASS. **SOURCE-ONLY, NO SERVED/LIVE**.
5. Alerta de revisión para roles staff: `app/core/router.js` commit `4d771372752aea98f58ea3d27a79ec7fd5b86ca2`; normalizador de colisiones de lectura `app/adapters/tya-cumulative-read-model-v2.js` commit `d5ec59c25d6061f13127c344a8cdbdbb5989b31e`. **SOURCE-ONLY, NO SERVED/LIVE**.
6. Lote secuencial siguiente de 21 grupos aprobados con alias sin referencias de dominio: [40813627623](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40813627623), iniciado 21:42 GT y **EN CURSO al emitir este checkpoint**. Caso a caso: F-011, F-012, F-013, F-020, F-021, F-022, F-026, F-028, F-030, F-031, F-037, F-039, F-040, F-042, F-044, F-047, F-050, F-051, F-056, F-059 y F-063. Un resultado del job solo se declara PASS si completa la prueba de proveedor, idempotencia, Auth/Firestore, HR y UI shopper.
7. Conciliación intermedia READ-ONLY durante el lote: [40814395856](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40814395856), ambas jobs PASS; **21 grupos consolidados verificados** en ese instante. Distribución restante al instante: 13 keeper verificados sin consolidar, 37 alias con visitas u otro dominio en HOLD, 11 HR canónicos múltiples en HOLD, 1 keeper no verificado en HOLD. El corte puede cambiar cuando termine el lote.
8. Diagnóstico de disponibilidad: universo HR 748 filas y 17 períodos, solo 2 marcadas globalmente disponibles; no significa que sean postulables hoy por cualquier shopper. Corrección de texto y frontera activa en `app/modules/visitas.js`, commit `dd6ddca227b77e11eb53521375bc6af9c935364d`; prueba de composición de HR corregida en `tools/qa/cxorbia-i3-shopper-hr-composition-probe.mjs`, commit `a80398e71bca32300c68e8f5a8b779e722232707`; cuatro pruebas de regresión en `tools/qa/cxorbia-i3-available-visits-active-period-scope.test.mjs`, commit `a346986d6147a84c2ac957fd797bf6e03420a593`; read-only [40814395856](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40814395856) PASS. **SOURCE-ONLY, NO SERVED/LIVE**.

## Decisión de situación de producción

No confundir **consistencia de la cohorte** con aprobación global de Fase A. La última matriz material en el árbol auditado `RECOVERY-I3-MODULE-TRUTH-MATRIX-20261028-V190.json` mantiene `allModulesMatch=false`: 5/21 `MATCH`, 16 categorías no-`MATCH`, incluidos 3 defectos funcionales abiertos. El mismo artefacto final requiere E2E transversal, aceptación humana, Gate20/Gate21 y autorización de I4. Este documento no altera esos gates.

## Próximas acciones sin reinicio ni reproceso

1. Esperar al fin exacto de [40813627623](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40813627623), recoger `PASS/HOLD` por código sin datos personales, readback y artefacto.
2. Ejecutar de nuevo preflight de la cohorte 139/83 tras el lote; no volver a fusionar casos PASS ni reintentar un caso con resultado incierto.
3. Separar 37 casos con visitas del alias, 11 múltiples HR y 1 keeper dudoso en procedimientos protegidos especializados, con preflight y reversibilidad. Preguntar a Paula solo por la identidad humana que no esté ya resuelta en su Excel.
4. Materializar una única candidata DEV acumulada con normalización preventiva, aviso staff y explicación de oferta; validar sesiones Admin/Operaciones/Shopper, notificaciones, certificaciones, PDF recursos, historial y visitas disponibles con métricas de tiempos.
5. Reconciliar los 21 dominios de matriz, certificar mismo artefacto y después someter I3/20/21 e I4 a decisión. Nunca publicar LIVE con `HOLD` sin una decisión explícita de supersesión que documente riesgos y alcance.

**Nota:** No hay promesa de salida LIVE ni cierre de 83 grupos en este checkpoint. Conserva evidencia exacta y permite continuar sin repetir diagnósticos.
