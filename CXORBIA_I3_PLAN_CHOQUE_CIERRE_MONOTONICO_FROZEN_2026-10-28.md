# CXOrbia Recovery — PLAN DE CHOQUE I3 / cierre monotónico y anti-desincronización

**ID:** `CXORBIA-I3-SHOCK-MONOTONIC-CLOSURE-20261028`  
**Fecha:** 28 de octubre de 2026, America/Guatemala  
**Aprobación de alcance:** Paula solicita congelar este plan, corregir la continuidad documental y prevenir pérdida de aprobaciones, regresiones y bucles.  
**Estado:** `FROZEN`, `I3=HOLD`, `I4=NOT_AUTHORIZED`, producción `DO_NOT_TOUCH`.  
**Naturaleza:** adenda operativa aditiva, no metodología paralela ni nuevo backlog. Prevalece únicamente sobre la **priorización/punteros de ejecución** que aún centraban D07; no sustituye Plan Rector, plan V1.1, contratos, el ledger VRM ni los gates.

## 1. Hallazgo causal y BEFORE / AFTER

**BEFORE comprobado:** el descriptor y `CXORBIA_RECOVERY_EXECUTION_CURRENT.json` aún ordenaban diagnosticar D07 como acción siguiente exclusiva; la matriz V187 declara 5/21 `MATCH`, aunque conserva evidencia focal y aprobaciones previas. El resumen `progressByStage` contiene snapshots antiguos (por ejemplo D03/RUN1763) al lado de un PASS posterior D03/RUN1778, sin separación visible de autoridad. El guard existente comprobaba source/ledger, pero no exigía que descriptor, puntero, matriz y congelamiento de prioridad estuvieran alineados en cada ejecución.

**AFTER obligatorio:** descriptor y puntero muestran la **misma cola de cierre Phase A**, asociada a la matriz y source vivos; la clasificación se deriva mecánicamente del `modules[].classification` vigente, no se calcula desde texto conversacional ni indicadores históricos. D07 se limita a una sola prueba Admin/Shopper salvo defecto causal nuevo. Todo PASS se conserva por owner/dependencias/contrato/artefacto; sólo revalidar lo afectado por drift reproducible. Un guard fail-closed en el workflow existente detendrá nueva certificación si estos punteros o conteos divergen. La corrección de control no implica GO.

## 2. Baseline de entrada preservado

- Repo: `paulaosoriof86/demoCXOrbia`; rama: `recovery/cxorbia-phase-a-20260831`.
- Producto al congelar: `77fd283349ce46033a95235fd2fae632e856fe35`, tree `9e3c446c829edbcb7cc5d2f6ab179ddacb246248`.
- Matriz V187: 21 dominios; 5 `MATCH`; 16 no-MATCH (10 source corregido en distintos pasos, 2 compuesto/no desplegado, 3 defectos funcionales, 1 D07 pendiente de E2E). Esto no representa porcentaje de progreso ni invalida PASS anteriores.
- Históricos: V7 de 6-oct = 13 `MATCH`, 3 `APPROVED_NOT_COMPOSED`, 5 `TRUE_FUNCTIONAL_DEFECT`. Las dos matrices tienen clasificaciones distintas; no deducir retroceso funcional sólo de la cifra.
- RUN1704 probó HR/KPIs GT/HN sobre misma revisión externa; RUN1852 selló HR `d19eb12ad8c1c5140b5711ea390deaae50b0edd35ff4f982a69bfdcabbc86dd2` el 24-oct, detectó tres diferencias de campos operativos persistidos; revisión fresca del 28-oct `NOT_RECHECKED` (no equivale a HR desconectada).
- RUN1898 pasó 62 contratos QA focales; no fue certificación terminal de los 21 dominios. Los jobs de otros alcances fueron omitidos por su condición, no cuentan como PASS.
- Producción `https://tya-plataforma.web.app/` permanece oráculo legacy y no se toca.

## 3. Orden de choque y carriles concurrentes seguros

**Primera acción vinculante — G03 continuidad:** reconciliar 21 dominios por `owner + last-approved authority + source blob + dependencias + provider/config + artifact servido + E2E + aceptación`. Clasificar cada obligación como `CARRY_FORWARD_VALID`, `REPROOF_IMPACTED`, `P0_PROVEN`, `ENVIRONMENT_BLOCKED` o `HUMAN_PENDING`, preservando referencias históricas. No ejecutar otra auditoría general ni reiniciar I0–I2. Las aprobaciones no afectadas sobreviven a las sucesoras.

Los siguientes carriles pueden realizar **lecturas, QA y preparación de owner packages en paralelo**:

1. **HR/identidad/ACK** — fuente HR externa actual read-only y misma `sourceRevision` en DEV; identidad Admin/Shopper, disponibilidad/asignaciones y las tres visitas con discrepancia; no reconciliación escritora ni endpoint con side effects sin autorización específica.
2. **Operación** — visitas, postulaciones, reservas, Agendar, check-in, Shopper/mi perfil, targets/acciones y readback/reload/no duplicados.
3. **Finanzas** — liquidaciones, movimientos, CxP/CxC, pagos individuales/lotes, soportes y conciliación; no inferir confirmación bancaria desde estado histórico.
4. **Certificaciones/proyectos** — banco Cinépolis, pregunta/versión/revisor, vigencia, periodos y cuestionario externo autorizado.
5. **Visual/portal/reportes** — recuperar última autoridad visual aprobada, conservar avances posteriores, revisar por bloques servidos.
6. **D07/PDF** — una prueba acotada de vista integrada con Admin y Shopper (contenido/página/descarga) sobre DEV exacto. Sólo corrección de owner si se reproduce fallo causal; no más iteraciones exploratorias.

**Un solo escritor de código por intento; integración serial en una única candidata acumulativa; sin ramas, previews, overlays ni materializadores paralelos.**

## 4. Cierre y producción hoy

1. Para cada P0 real: owner demostrado, allowlist, expected parent, fix mínimo, readback y tests focales.
2. Source proof acumulativo con matriz íntegra, contratos proveedor/ACK y no regresiones, luego materialización DEV controlada con identidad exacta de source, runtime y Hosting.
3. E2E Admin+Shopper y revisión humana sólo de owners/dependencias afectados; conservar aprobaciones previas válidas.
4. Gate20 visual/semántico + Gate21 fingerprint del mismo artefacto. `I3=GO` únicamente con Phase A completa; la urgencia de hoy no permite falsos PASS.
5. Con autorización expresa de Paula para el hash/artifact exacto, I4 publica **sin rebuild**, verifica HR live, Admin, Shopper, postulaciones, asignaciones, pagos/KPIs y produce `PRODUCTION_LOCK` y controles de 24/72 horas, primer corte y siete días. Phase B y postproducción continúan después, sin perder capacidades existentes.

## 5. Regla de continuidad automática y anti-regresión

- El guard del workflow canónico debe fallar si descriptor y puntero no concuerdan en source, matriz/blob, prioridad congelada, siguiente acción o conteo derivado. No crea un workflow nuevo.
- `progressByStage` preexistente permanece como evidencia **histórica**, no autoridad para el avance actual. El avance vigente se deriva de matriz/ledger y recibos exactos. No borrar ni sobrescribir PASS históricos.
- Ningún cierre por presencia de DOM o test sintético cuando se exige acción real y ACK. Ningún `MATCH` se degrada sin evidencia de drift/impacto; ninguna aprobación humana se inventa.
- Cada nuevo source successor actualiza descriptor/puntero/matriz de forma atómica o el guard falla. Este freeze permanece inmutable; actualizar sólo los punteros y recibos de ejecución.
- Las diferencias detectadas detienen certificación y disparan corrección focal, no nueva metodología ni vuelta a I0.

**Límite de garantía:** ningún control puede impedir absolutamente todo defecto futuro. Este bloqueo automatizado previene las divergencias de identidad/cola/conteos detectadas aquí; continuidad funcional y ausencia de regresiones siguen requiriendo las pruebas de contrato y E2E correspondientes.
