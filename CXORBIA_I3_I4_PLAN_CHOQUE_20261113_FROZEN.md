# CXOrbia Recovery — I3/I4 cierre por bloques, ejecución congelada 2026-11-13

**Autoridad:** Paula Andrea Osorio Franco, 2026-11-13: «congela el plan de choque y las decisiones, corrige lo que procede y arranca».
**Estado:** `FROZEN_EXECUTION_PRIORITY_WITHIN_APPROVED_V1_1`. **Iteración:** I3 HOLD. **Producción:** `DO_NOT_TOUCH` hasta I4/GO/autorización expresa del artefacto exacto.
**Repo/rama únicos:** `paulaosoriof86/demoCXOrbia` / `recovery/cxorbia-phase-a-20260831`.
**Parent control verificado antes de este alcance:** `23afddcdd8f83e090dd12ed7dc6854fd77822619` / tree `ddd490acff330a270f99aaaee6e0cf3bd1293a37`.

## 1. Precedencia y alcance

Esta es una congelación **aditiva de prioridades de ejecución**, no un plan estructural nuevo ni sustituto del paquete íntegro V1.1 de 82 tareas (63 I3, 7 I4, 6 estabilización, 6 evolución). Conserva los 274 VRM, 45 observaciones de octubre y todos los PASS con bytes equivalentes.

Se verificó la custodia del plan original:

- ZIP `CXORBIA_PLAN_FROZEN_2026-10-16_V1_1_COMPLETO.zip` SHA-256 `4ef4124040ba8a81f71f4291b5ddefbc2183ffffb24b52079b5137664e9cc44c`, archivo íntegro.
- Manifest interno SHA-256 `80685eba46cfb3492c43b43e6323c65d9b3c49f9c9f46d6e0b254a1eee07cd86`.
- Plan ejecutable `PLAN_TRAZABLE_I3_I4_FROZEN_V1_1.json` SHA-256 `83e8f2c0a6b190bab1d9dea32bf99158116f3164f419ae72e051fd791fd8576c`; es el mismo dentro del ZIP.

## 2. Línea base comprobada y regla anti-autocertificación

| Dimensión | Resultado vivo de referencia | Evidencia |
| --- | --- | --- |
| Producto DEV | source `e2458f449ee76d965ee39effdb5790d2e6d45d8c` / tree `4b331d8bda49fc8a4e0fd46d947cd629ff8000e1` | C3 RUN2482 |
| Hosting DEV | `sites/cxorbia-backend-dev/versions/8dea702589084bcf` | C3 RUN2482 |
| Runtime DEV | `cxorbia-live-hr-dev-00370-fl2` / digest `sha256:396cd23f895a98606fa9ca238132a5515065c07fec632cd73c00cc2e6d6c639e` | C3 RUN2482 |
| Acreditación C3 | 93/156 rutas; 7/21 dominios `sourceReady`; 5/21 `MATCH` estricto; 63 pendientes (11 procedencia + 52 owner + 0 mapeo) | RUN2482; HOLD no terminal |
| Control | descriptor, matriz V301, ledger V618, puntero compatibles | RUN2484 PASS |
| Gate20 / Gate21 | HOLD / HOLD | No hay certificado nuevo |
| Producción | Legacy intacta; I4 NO autorizada | `DO_NOT_TOUCH` |

Un PASS documental o técnico **no** aumenta `MATCH` sin prueba terminal, y un despliegue de reglas de Storage no equivale a publicación de producto Hosting.

## 3. Causa raíz P0: enlace de publicación de I4

**Clasificación:** `RELEASE_COMPOSITION_FAILURE`.

- **BEFORE:** workflow I4 con disparador `push`, `AUTHORIZATION` definida dentro del mismo YAML y SHA/árbol/source/Gate21/Hosting/runtime fijos correspondientes a un release histórico. Podía aparentar prueba de mismo artefacto sin descargar el manifest actual. Su guard de parent antiguo detendría la ejecución actual, pero no resuelve el contrato de continuidad.
- **AFTER exigido:** solo `workflow_dispatch` con autorización explícita de Paula **para el run y dos huellas concretas**; descargar ambos artefactos de la ejecución Gate21 real; verificar GitHub RUN exitoso, fuente/árbol, manifest y TAR SHA256, 21/21 `MATCH`, Gate20/21 y ausencia de product drift; derivar Hosting/runtime del manifest certificado, nunca de valores copiados; no rebuild; rollback ante fallo incluso después de escribir.
- **Límite:** la paridad de artefacto y el smoke raíz/health no sustituyen los E2E autenticados de HR/Admin/Shopper, postulación, asignación, KPIs y no duplicados. Por eso el recibo de promoción no puede declararse `PRODUCTION_LOCK` operativo hasta esas pruebas.

El owner autorizado es exclusivamente `.github/workflows/cxorbia-recovery-i4-immutable-production-replacement.yml`; no crear otro workflow de transporte.

## 4. Ejecución serial y publicación inmediata en DEV

| Orden | Bloque | Salida verificable |
| --- | --- | --- |
| 0 | I4-P0 handoff | Guard enfocado probado con autoridad de la fuente, aprobación exacta, huellas iguales y rechazo del drift. Ningún write productivo. |
| 1 | I3-Q2, acreditación de 11 procedencias + 52 owners | C3 `21/21 sourceReady`, 0 rutas pendientes. Nunca autocertificar módulo por texto. |
| 2 | I3-Q3, B1–B3 Admin/Shopper/HR | Login, identidad, disponibilidad, postulación, asignación, histórico, `sourceRevision` y ACK/remoto/reload/idempotencia, GT/HN. |
| 3 | I3-Q4, B8 Finanzas | Corte julio/agosto/septiembre protegido, lote/individual/soporte/conciliación y no falso pagado. |
| 4 | I3-Q5, B9/21 dominios | Rutas/roles/visual y E2E de todos los dominios; preservar B4–B7 PASS si no hubo drift. |
| 5 | I3-Q6, Gate20→Gate21 | 21/21 MATCH, artifact TAR/manifest único, checksum fuente + DEV, I3 GO. |
| 6 | I4, sustitución productiva | Autorización específica de Paula para manifest/SHA/RUN; promover sin rebuild; readback, E2E, rollback y `PRODUCTION_LOCK`. |

**Regla estricta de cada reparación:** identificar P0 y owner → parche acotado → prueba funcional → promoción serial inmediata a la **única DEV** → versión/digest/readback → actualización del contador afectado → siguiente owner. Si un bloque solo genera evidencia sobre bytes ya publicados, se registra `SOURCE_PROVEN` sin deploy redundante. Nunca se acumulan reparaciones funcionales aprobadas fuera de DEV.

Ninguna respuesta podrá llamar «publicado» a una fuente `source-only`, un control JSON o un workflow exitoso.

## 5. Invariantes no negociables

- No I5, nuevo producto/repo/Firebase productivo, branch paralela, overlays, materializadores ni reimportación.
- Un escritor; un source sucesor; un build final determinista; un certificado final; cero rebuild entre Gate21 e I4.
- `tya-plataforma.web.app` permanece LEGACY_ORACLE y **no se modifica antes de I4 GO y autorización específica**.
- P0 nuevos se clasifican exclusivamente dentro de los códigos de Recovery, con owner exacto; repetir solo gate afectado.
- Por iteración de trabajo: iteración, BEFORE/AFTER, prueba, Hosting/version, P0, pendientes, porcentajes verificables por denominador, siguiente acción y permiso.
- Aprobaciones visuales históricas se conservan por hash/dependencia salvo drift demostrado.

## 6. Criterio de siguiente acción

Cerrar el P0 de composición I4 con prueba focal y readback GitHub; después ejecutar I3-Q2 sin una nueva auditoría general. No solicitar autorización para DEV ya concedida. Pedir autorización I4 **solo tras presentar Gate20/21 GO y el artefacto exacto**.
