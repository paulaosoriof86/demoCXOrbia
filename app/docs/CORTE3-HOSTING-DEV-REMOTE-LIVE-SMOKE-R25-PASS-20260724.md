# CXOrbia TyA — Corte 3 Hosting DEV y remote live smoke R25 PASS

**Fecha:** 2026-07-24  
**Estado:** `HOSTING_DEV_REMOTE_LIVE_SMOKE_PASS_PENDING_PAULA_VISUAL`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. Decisión

El mismo build de Corte 3 quedó publicado en Hosting DEV y su verificación remota live terminó en **PASS**.

URL para validación visual:

`https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible&fresh=1`

Corte 3 no queda congelado todavía: falta la revisión visual de Paula y la inspección de los archivos PDF/Excel reales.

## 2. Evidencia de Hosting DEV

Deploy ejecutado en:

- run `30098823043`;
- job `89499452079`;
- artifact `8598747476`;
- digest `sha256:88d201f834ce1237384de5c916f8cce65442e4255a710e58a9ade64e3707b016`.

Resultado del carril:

- gate de preservación V174 R24: PASS;
- endpoint HR live previo: PASS;
- overlay R22 live HR: PASS;
- overlay financiero canónico R24: PASS;
- `Deploy Hosting DEV only`: success;
- build-lock remoto: coincide;
- endpoint HR remoto: source-safe, 14 periodos, 616 visitas;
- Cloud Run deploy: 0;
- Firestore/Auth/Storage/HR writes: 0;
- imports, lotes y pagos: 0.

## 3. Evidencia de smoke remoto R25

La validación final se ejecutó sin redesplegar Hosting:

- request commit: `cf86e115dde490fbb8c1d407482413411c9079e8`;
- run `30099476156`;
- job `89501621499`;
- artifact `8598990578`;
- digest `sha256:09c69c975a0933368b346d27218386b28421616adc039f3a37caf16ca8bbba12`;
- contexto observable `cxorbia/corte3-hosting-dev-visual = success`;
- decisión `PASS_CORTE3_HOSTING_DEV_AND_REMOTE_LIVE_SMOKE`;
- `executionMode=remote_smoke_only`;
- `hostingRedeployed=false`.

## 4. Comprobaciones remotas aprobadas

### Runtime y fuentes

- `visibleReady=true`;
- `financeReady=true`;
- un único script HR live;
- un único adapter live R18A;
- un único snapshot financiero final;
- un único adapter financiero;
- 14 periodos;
- 616 visitas;
- 0 errores de página relevantes;
- 0 requests fallidas relevantes.

### Mayo 2026

- visitas HR: 44;
- filas financieras exactas: 42;
- filas operativas no exactas en revisión fail-closed: 2;
- filas GT exactas: 32;
- filas HN exactas: 10;
- diferencias de montos: 0;
- pagos: 0;
- lotes: 0.

Las dos filas no exactas cumplen simultáneamente:

- `estado=pendiente_fuente_financiera`;
- `liquidationState=pending_financial_source`;
- `paymentState=pending_source_confirmation`;
- `financialSourceStatus=pending_or_review`;
- `reviewRequired=true`;
- `paymentConfirmed=false`.

No son filas canónicas, no se marcan pagadas y no pueden entrar a lote.

### Finanzas y exportación

- dashboard financiero visible;
- exportación visible;
- 42 filas exactas consumidas por Finanzas;
- 32 GT y 10 HN;
- reporte capturado;
- 2 filas de país;
- 8 columnas;
- 2 puntos de gráfica;
- nombre PDF válido;
- `visitContract()` conserva `paymentState=pending_source_confirmation`.

### Beneficios

- KPI honorarios;
- KPI reembolsos;
- KPI por cobrar;
- KPI pagado;
- detalle visible;
- shopper controlado con 3 liquidaciones;
- shopper controlado con 0 pagadas.

## 5. Causas raíz cerradas durante el bloque

1. `STALE_FULL_APP_HASH_INCLUDED_MUTABLE_DOCS_AND_APPROVED_DEV_ENTRY`  
   El verificador V174 antiguo mezclaba runtime protegido con documentación viva y entry DEV. Se reemplazó por gate R24 sin debilitar los hashes funcionales.

2. `FROZEN_SNAPSHOT_GATE_CONFLATED_EXACT_CANONICAL_ROWS_WITH_LIVE_FAIL_CLOSED_REVIEW_ROWS`  
   El gate R23 esperaba 42/42 sobre snapshot congelado, mientras el runtime live expone honestamente 42 exactas + 2 revisiones fail-closed. Se creó gate R25 específico para runtime live.

No hubo reintentos ciegos ni segundo deploy innecesario.

## 6. Pendientes visuales reales

Paula debe revisar en Hosting DEV:

1. Admin → Finanzas → Dashboard Financiero.
2. Periodo mayo 2026.
3. Conteos y separación de GT/HN.
4. Estados de las dos filas pendientes de fuente financiera.
5. Exportación PDF real, incluida la gráfica.
6. Exportación Excel real y formato operativo.
7. Shopper → Beneficios, detalle y pagado en cero.
8. Responsive y copy visible de fuente.

Los pendientes P1/P2 no se declaran resueltos por el smoke técnico.

## 7. Impacto Phase A

Corte 3 avanza a:

`HOSTING DEV PUBLICADO + REMOTE LIVE SMOKE PASS + VALIDACIÓN VISUAL PENDIENTE`.

No iniciar Corte 4 antes del freeze de Corte 3.

## 8. Clasificación

- **Reusable CXOrbia:** gate de preservación de runtime, overlay canónico, modo smoke-only y validación de revisiones fail-closed.
- **Exclusivo cliente:** conteos TyA/Cinépolis.
- **Claude/prototipo:** sin cambio de módulos; P1/P2 visuales siguen pendientes.
- **Academia:** distinguir inventario HR, vínculo exacto, revisión fail-closed, liquidación, pago y validación DEV.
- **Sin impacto Claude:** workflow, gates, request y artifacts.

## 9. Estado seguro

Sin producción, merge, Cloud Run deploy, imports, pagos, Firestore/Auth/Storage/HR writes, Make ni Gemini.
