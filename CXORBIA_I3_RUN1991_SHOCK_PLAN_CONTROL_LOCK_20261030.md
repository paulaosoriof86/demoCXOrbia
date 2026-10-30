# CXORBIA I3 — RUN1991 SHOCK PLAN CONTROL LOCK

**Fecha:** 2026-10-30  
**Estado de autoridad:** FROZEN / CONTROL-ONLY  
**Iteración:** I3 — Functional Closure  
**Estado:** HOLD  
**Producción:** DO_NOT_TOUCH  
**I4:** NO AUTORIZADO

## 1. Alcance y precedencia

Este lock congela la interpretación operativa del cierre de RUN1991 y el plan de choque para completar I3. No sustituye los contratos funcionales, el Plan Rector, los addenda prevalentes, los locks de integridad ni la política productiva. No declara `phaseAComplete=true`, no declara `allModulesMatch=true` y no autoriza producción.

La intervención que crea este lock es exclusivamente de control. No modifica código de producto, provider, configuración de runtime, reglas, datos, artifact, Hosting ni producción.

## 2. Identidad canónica congelada

- Repositorio: `paulaosoriof86/demoCXOrbia`
- Rama única: `recovery/cxorbia-phase-a-20260831`
- Control HEAD previo: `7d064f67a394d87c3cc1dc732f528c3c017fd279`
- Control tree previo: `137db5da74a047097153777d8dd841e13435df02`
- Source candidato canónico: `4190089d813bd23948ac7f4f75b772b6727f3923`
- Source tree: `c13f89de52ea483f4d58cbb8b015c94f2d2ab751`
- Source proof: RUN1981
- Materialización DEV: RUN1983 / `40998569643`
- Artifact ID: `12952712146`
- Artifact digest: `sha256:daaf0c5739ce2259049b613c47389a3c41358a315c9a98e2f1eb42d10da64963`
- Runtime revision: `cxorbia-live-hr-dev-00331-2xq`
- Runtime digest: `sha256:c93a55618bad2d96bc58907905a7690b446f14247e3bbdc5a439aa16b3756ee4`
- Hosting version: `sites/cxorbia-backend-dev/versions/0ae3451861e7800a`
- HR revision: `ad25faccc4e6149a5bcee149ee7c88264a9262146112fb4f44493c2650987f17`
- Ruleset: `projects/cxorbia-backend-dev/rulesets/b26deee9-b013-4836-809d-27e7ef78e90e`
- Prueba focal: RUN1991 / `41000990873`

Ninguna iteración posterior puede sustituir esta candidata, rama o artifact por conveniencia. Una sucesora sólo puede existir por defecto reproducible, owner probado, cambio mínimo, test focal, source proof y actualización atómica de autoridades.

## 3. Interpretación congelada de RUN1991

### D07 — PDF real Admin/Shopper

Estado técnico: `PASS_D07_ADMIN_SHOPPER_REAL_PDF_READ_ONLY_CLAUSE`.

Evidencia congelada:

- Admin y Shopper autenticados;
- HTTP 200;
- PDF real renderizado;
- 7 páginas;
- navegación 1 → 2 → 1;
- descarga de 162335 bytes;
- SHA-256 `3654d624896f3517c39136b29f6c37542d8a128f9d8d9d8a616693f039753454`;
- firma PDF válida;
- regreso al catálogo PASS;
- cero writes.

D07 no puede reabrirse sin drift reproducible en su owner o dependencia. Su resultado debe trasladarse por carry-forward a matriz, descriptor, puntero, ledger, recibo e índice de ejecución.

### C04/C05 — Finanzas

Resultados PASS preservados:

- identidad administrativa autorizada;
- alcance Global;
- GT/HN;
- monedas Q/L;
- período `2026-10`;
- cuatro comandos reales contra DEV;
- ACK remoto;
- readback durable;
- cuatro toasts visibles;
- dos replays idempotentes;
- cero provider writes en replay;
- cleanup final completo;
- cero residuos;
- cero mutaciones laterales en HR, Auth, membresía, banco o pagos externos.

Único HOLD observado por RUN1991:

`C04_VISIBLE_CURRENCY_OR_DOUBLE_REVENUE_MISMATCH`

El KPI visible `Ingresos oper.` por moneda no coincidió con el ledger canónico autorizado. El fallo se clasifica provisionalmente como `FUNCTIONAL_DEFECT` focal en el read model o su proyección visible. No autoriza modificar el provider de comandos, la persistencia, HR, Auth ni otros módulos sin evidencia causal.

## 4. Por qué la matriz todavía muestra 5/21

`5/21` es el conteo estricto `MATCH` del snapshot V200 anterior a la serialización de RUN1991. No significa que dieciséis dominios estén sin desarrollar.

Métricas congeladas para seguimiento, sin sustituir los gates:

- Cierre formal vigente en V200: `5/21 = 23.81%`.
- Cierre técnico elegible después del PASS D07, pendiente de serialización atómica: `6/21 = 28.57%`.
- Dominios con trabajo o evidencia preservada en la reconciliación previa: `18/21 = 85.71%`.
- Dominios todavía no formalizados como MATCH en V200: `16/21 = 76.19%`; la mayoría requiere carry-forward, prueba pendiente o aceptación, no reconstrucción.

Los porcentajes son indicadores de seguimiento. La autoridad continúa siendo la evidencia por dominio y los estados `GO`, `HOLD` o `NO_GO`.

## 5. Reglas anti-reincidencia obligatorias

1. Una sola rama, una sola candidata, un solo escritor técnico y un solo camino de deploy.
2. No abrir overlays, ramas paralelas, candidatas paralelas, repositorios, Firebase productivos, materializadores ni workflows transportadores.
3. No reabrir un PASS sin drift reproducible.
4. No modificar código sin clasificación del fallo y owner exacto demostrado.
5. Una falla focal sólo permite tocar el owner y los tests afectados.
6. Los cambios de control no autorizan rematerialización.
7. Una sucesora funcional se consolida antes del source proof; no habrá una cadena de microiteraciones por cada observación.
8. Descriptor, puntero, matriz, ledger, recibo, source/tree, artifact, Hosting, runtime, reglas y HR deben quedar sincronizados; cualquier divergencia mantiene HOLD.
9. Artifact certificado = artifact desplegado; no habrá rebuild entre certificación y producción.
10. Producción permanece intacta hasta I3 GO, Gate20 PASS, Gate21 PASS y autorización expresa de Paula para I4.
11. Las pruebas posteriores se limitan al dominio afectado y al carry-forward de dependencias; no se repiten auditorías generales.
12. Si una sola lectura causal no adjudica owner, se documenta la evidencia faltante y se mantiene HOLD; no se inicia otro bucle exploratorio.
13. Cada iteración debe reportar: evidencia nueva, estado, cambios/no cambios, P0, porcentaje formal, porcentaje técnico elegible, avance del plan, siguiente acción y autorización.

## 6. Plan de choque congelado — 8 bloques

1. **Control freeze y recibo RUN1991.** Crear este lock y verificar su readback.
2. **Adjudicación causal del KPI.** Comparar ledger, read model, adaptador, proyección y DOM; demostrar owner.
3. **Corrección mínima.** Un solo cambio acumulativo en el owner probado y su test focal.
4. **Source proof.** Una ejecución sobre la sucesora exacta.
5. **Materialización DEV.** Una sola materialización con readback de identidades.
6. **E2E afectado y reconciliación de 21 dominios.** Repetir C04/C05; transportar PASS preservados; cerrar sólo las superficies pendientes.
7. **Gate20 y Gate21.** Validación funcional/visual y fingerprint del mismo artifact.
8. **I4.** Con autorización expresa, desplegar exactamente el artifact certificado y crear `PRODUCTION_LOCK`.

El avance del plan de ocho bloques se reporta aparte del cierre de dominios. Completar un bloque no equivale a aprobar un gate.

## 7. Siguiente acción exacta

Después del readback de este lock:

1. actualizar atómicamente las autoridades de control con el PASS D07 y el HOLD focal C04;
2. ejecutar una adjudicación read-only del KPI `Ingresos oper.`;
3. no escribir código de producto hasta demostrar el owner;
4. no rematerializar DEV durante el trabajo de control o diagnóstico.

## 8. Autorizaciones

- Control y diagnóstico read-only en DEV: autorización vigente.
- Corrección mínima en I3: permitida sólo después de owner probado, dentro del Plan Rector.
- Producción/I4: requiere autorización expresa futura de Paula para el artifact exacto certificado.

## 9. Estado al congelar

- Iteración: I3.
- Estado: HOLD.
- Cambios de producto: ninguno.
- Cambios de producción: ninguno.
- P0 activo: discrepancia visible del KPI financiero por moneda.
- Cierre formal: 23.81%.
- Cierre técnico elegible: 28.57%.
- Trabajo/evidencia preservada: 85.71%.
- Avance del plan congelado al crear y verificar este lock: bloque 1 de 8, `12.50%`.
