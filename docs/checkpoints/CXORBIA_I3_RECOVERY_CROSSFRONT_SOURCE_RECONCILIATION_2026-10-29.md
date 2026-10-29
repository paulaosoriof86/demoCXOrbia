# CXOrbia Recovery — reconciliación transversal de fuente I3 · 2026-10-29

Estado: **I3 HOLD / Gate20 HOLD / Gate21 HOLD / I4 NO AUTORIZADO**.
Alcance: fuente de la rama única `recovery/cxorbia-phase-a-20260831`; sin producción, cambios de datos, Auth, Firestore, Storage, reglas, HR ni Cloud Run.

## Causa del reproceso

Recovery nació para recomponer acumulativamente los módulos Fase A aprobados. La matriz V193 sigue separando 5 dominios `MATCH`, 11 con fuente corregida pero sin cierre integral DEV/UAT/humano, 2 compuestos aún no servidos y 3 defectos funcionales. Un código fuente corregido o una prueba histórica PASS no equivale a un artefacto actualmente servido y certificado. También se detectó **deriva de pruebas antiguas**: los mocks/aserciones conservaban expectativas previas a A05 y al control de duplicados shopper, aunque la solución más reciente está presente.

## Intervención focal de producto

- P0 probado: en `app/modules/historico.js`, al elegir `GT`/`HN` el selector filtraba períodos, pero mantenía la suma global de los dos países. La actualización filtra el universo de visitas antes de calcular período, totales, ejecutadas, avance, score, pagos confirmados, detalle y exportaciones. El modo `all` conserva `data.periodStats` y la exclusión por defecto del período activo no cambia.
- Commit fuente publicado y leído: `236b5f64e3a2c3016f278333e1bc20902fd71e28` (parent `08bdca593a182b788ac82385a94d52e7ad65d669`, tree `c1decec9bf17a50f775c9e704476f5c2d7c4d459`). Sólo `app/modules/historico.js` y `tools/qa/cxorbia-i3-historico-country-totals-owner.test.mjs`.
- La preview aislada C8D2 (`40882198130`) corresponde a **fuente anterior**, no certifica este commit; no declarar DEV PASS ni elevar `historical` a cierre de artefacto.

## Evidencia transversal de fuente

- `node --test tools/qa/cxorbia-i3-*.test.mjs`: **63/64 archivos PASS**; uno no se ejecutó por ausencia de `@firebase/rules-unit-testing` en el entorno local. Clasificación: `ENVIRONMENT_FAILURE` de esa prueba, no defecto funcional demostrado ni certificación de reglas Firestore.
- `node --test backend/runtime/hr-live-service/test/cxorbia-{finance,shopper,period,hr-source}-*.test.mjs backend/runtime/hr-live-service/test/cxorbia-i3-*.test.mjs`: inicialmente 9/11 archivos PASS; dos pruebas históricas fallaron por expectativas/mock obsoletos, no por evidencia de fallo productivo. Tras reparación **únicamente de tests**, los casos `VRM-190 period lifecycle` (5/5) y `shopper-admin-repair` (5/5) pasan. No se cambió su proveedor productivo.
- Pruebas fuente cubren HR, identidad, país, visitas disponibles, postulaciones, comandos shopper, finanzas, certificaciones, recursos/PDF, reportes, histórico y períodos. No equivalen a UAT autenticada ni a readback externo.

## Bloqueos y siguiente recorrido sin reabrir aprobaciones

1. **Transporte**: certificar este mismo sucesor en **una** Preview Firebase DEV aislada, comprobando bytes y preservando LIVE/HR/Auth/reglas; no usar el preview C8D2 como prueba de bytes del sucesor.
2. **UAT autenticada**: la pestaña Chrome de Paula `i3-parity-c8d2` fue localizada pero su control remoto se detuvo antes de leer el DOM. No se cerró sesión; estado `NOT_TESTED`, no `AUTH_FAILURE` del producto. Reintentar con el mismo navegador cuando el control responda.
3. **HR/periodos**: reconciliar contra revisión viva, estados reales de cada ronda, visitas disponibles elegibles, identidades y asignaciones; jamás convertir todos los períodos a `cerrado` sin readback de autoridad.
4. **Shoppers**: preservar 139 pares `SÍ`/83 grupos y ACK históricos; teléfono no bloqueante, actualización solicitada en primer ingreso, no fusión por similitud; Stiven sólo con mapa exacto keeper/alias antes de mutar.
5. **Finanzas/certificaciones**: comparar sumas, reembolso/honorario, liquidaciones/soportes, certificados y PDF protegido con el mismo `sourceRevision`; no considerar preflight OPTIONS equivalente a GET autenticado.
6. **21 dominios**: los 11 recuperados son cierre pendiente de prueba/traslado, los 2 compuestos requieren servirlos, los 3 defectos requieren reparación focal. Conservar los 5 `MATCH` salvo regresión demostrada. La matriz V193 no se reetiqueta silenciosamente por estas pruebas.

La salida a producción sigue `NO_GO` hasta I3 GO, Gate20/21 y autorización expresa I4. La próxima acción no es rediseñar Fase A: es materializar y verificar la fuente exacta, resolver los defectos residuales con su owner, y cerrar gates por evidencia del mismo artefacto.
