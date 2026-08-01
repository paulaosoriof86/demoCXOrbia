# CAMBIOS BACKEND — Corte 6 human visual P0 y root fix de dominio canónico

**Fecha:** 2026-07-31  
**Estado:** `C6_HUMAN_VISUAL_P0_PROVEN__CANONICAL_DOMAIN_FIX_CODE_PASS__LIVE_HR_ROW_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. Veredicto humano
La validación visual posterior al Hosting DEV anterior es **FAIL P0**. Corte 6 no se congela y agosto no se inicia todavía.

Las capturas comprobaron simultáneamente:
- Dashboard superior JUL correcto: 44 visitas, GT34/HN10, 40 realizadas, 38 con cuestionario, 33 submitidas y 1 fuera de rango operativo;
- flujo por fases incompatible con esos KPIs: solo 5 GT + 2 HN como realizadas;
- comparativo MAY/JUN sin fuente a pesar de existir histórico canónico de 14 periodos;
- salto visible de contenido y sidebar durante refresh;
- 210 shoppers en la fuente, pero 219 filas operativas y personas repartidas en dos identidades visuales;
- perfiles marcados completos sin username, contraseña, WhatsApp ni histórico unificado;
- certificación no visible para Admin;
- portal Shopper con Activas1/Historial0 y Beneficios vacío, aunque Admin mostraba seis visitas para la misma persona;
- periodo visual MAY mientras zonas financieras/liquidaciones seguían mostrando JUL;
- Dashboard Financiero con histórico, pero Movimientos vacío y Liquidaciones incompletas.

Evidencia: `app/docs/evidence/CORTE6-HUMAN-CUMULATIVE-VISUAL-P0-LATEST.json`.

## 2. Causas raíz probadas
1. **Máquinas de estado duplicadas:** Dashboard, flujo por fases, Visitas, Liquidaciones y portal Shopper interpretaron literales antiguos en vez de una sola autoridad `canonicalFacets`.
2. **Composición de identidad incompleta:** el composer previo evitó duplicar IDs, pero anexó perfiles protegidos sin crosswalk exacto al listado operacional HR; así una persona podía quedar dividida en dos filas con IDs distintos.
3. **Gate remoto insuficiente:** el smoke anterior verificó paridad de assets e idempotencia sintética, no igualdad semántica entre módulos ni navegación humana.
4. **Watcher con dos estados de periodo:** restauraba valores DOM de selects aparte de `CX.data.currentPeriodId`, permitiendo que sidebar y contenido divergieran.
5. **Scroll equivocado:** preservaba `window` pero la aplicación desplaza `.content` y `#rail`; por eso la actualización se veía subir y bajar.
6. **Perfil completo falso:** se respetaba un flag heredado sin verificar los mínimos reales: nombre, contacto, usuario y contraseña.
7. **Portal Shopper parcial:** `Mis Visitas` elegía como máximo una visita por estado literal y solo consideraba histórico lo liquidado/cancelado.
8. **Finanzas fragmentadas:** snapshots, pagos históricos, movimientos, liquidaciones y beneficios no se proyectaban mediante el mismo periodo e identidad canónicos.

## 3. Root fix aplicado en la rama viva
### Composer de dominio canónico
Nuevo `app/adapters/tya-cumulative-read-model-v2.js`:
- HR continúa siendo autoridad de periodos, visitas y estado operativo;
- matching únicamente por `hrRowId`, `sourceTab+sourceRow`, `visitId` o alias técnicos explícitos;
- perfiles protegidos sin crosswalk exacto ya no se anexan al listado operacional: pasan a revisión;
- no dedupe por nombre, teléfono o email;
- certificaciones y perfil se proyectan sobre la identidad canónica exacta;
- perfil completo se calcula con campos reales;
- histórico/KPIs nacen de una sola función de facetas.

### Semántica fuera de rango
Nuevo `app/adapters/tya-canonical-state-semantics-v2.js`:
- conserva 7 evidencias históricas de fuera de rango en julio;
- cuenta solo 1 caso actualmente no resuelto como `fuera de rango` operativo;
- una visita que luego avanzó a realizada/cuestionario/submitida no permanece en el KPI accionable de fuera de rango.

### Refresh estable
Nuevo `app/adapters/tya-live-source-refresh-watch-v2.js`:
- firma de contenido sin timestamps volátiles;
- misma información = cero apply, cero compose y cero rerender;
- cambio real = un apply + una composición + un render;
- preserva `.content`, `#rail`, periodo, proyecto y vista;
- no restaura selects DOM por separado del modelo;
- preload del perfil acumulativo no produce doble render.

### Consistencia transversal DEV
Nuevo `app/adapters/tya-c6-domain-consistency-bridge.js`:
- una sola fachada de estado/KPIs para Dashboard y drill-down;
- histórico completo del shopper;
- certificación visible para Admin;
- credenciales derivables con el patrón configurable existente solo cuando existe identidad canónica exacta;
- periodo financiero atado a `CX.data`;
- proyección read-only de pagos/movimientos históricos y CxP canónica;
- no modifica archivos de `/app/modules/*` ni `/app/core/*`.

### Wiring DEV
`app/index-backend-dev.html` carga el nuevo composer, semántica, watcher y bridge. El Hosting DEV aún no los sirve; no hubo autorización de deploy en este bloque.

## 4. Gates
### Gate local de dominio
`tools/qa/tya-c6-domain-consistency-regression-gate.mjs` cubre:
- 44 visitas julio;
- 40 realizadas, 38 cuestionarios, 33 submitidas;
- 1 fuera de rango accionable y evidencia histórica preservada;
- identidad por alias técnico exacto;
- perfil protegido sin crosswalk fuera del listado operacional;
- cero duplicados de IDs;
- perfil incompleto no marcado como completo;
- scroll/periodo canónico y portal Shopper con histórico completo.

### Auditoría read-only sobre las 616 visitas HR vivas
`PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`:
- periodos14;
- visitas616;
- shoppers HR208;
- julio44 = GT34 + HN10;
- realizadas40;
- cuestionario38;
- submitidas33;
- fuera de rango accionable1;
- evidencia histórica fuera de rango7;
- duplicate visit keys0;
- duplicate shopper IDs0.

Evidencia: `app/docs/evidence/CORTE6-LIVE-HR-DOMAIN-READONLY-AUDIT-LATEST.json`.

## 5. Datos y credenciales
Este bloque no crea ni complementa registros reales. El patrón de usuario/contraseña puede derivarse para una identidad exacta en la vista DEV, pero materializar perfiles, WhatsApp, Auth o Firestore requiere un write plan y autorización futura específica.

WhatsApp no se fabrica: debe provenir de HR/perfil protegido. Identidades sin vínculo técnico permanecen en revisión; nunca se fusionan por similitud visual.

## 6. Archivos creados/tocados
Creados:
- `app/adapters/tya-cumulative-read-model-v2.js`;
- `app/adapters/tya-canonical-state-semantics-v2.js`;
- `app/adapters/tya-live-source-refresh-watch-v2.js`;
- `app/adapters/tya-c6-domain-consistency-bridge.js`;
- `tools/qa/tya-c6-domain-consistency-regression-gate.mjs`;
- `.github/workflows/cxorbia-c6-live-domain-readonly-audit.yml`;
- `backend/config/corte6-live-domain-readonly-audit-request.json`;
- evidencias P0, gate local y auditoría HR viva.

Tocado:
- `app/index-backend-dev.html`.

Bloqueados/no tocados:
- `/app/modules/*`;
- `/app/core/*`;
- Cloud Run;
- proveedores/datos reales;
- producción.

## 7. Phase A
El bloque recupera lo ya aprobado y convierte la regresión en contratos verificables. Todavía no declara solución visual: el código está en GitHub, no desplegado.

Siguiente secuencia exacta:
`GATES ESTÁTICOS FINALES → AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE SMOKE SEMÁNTICO → VALIDACIÓN HUMANA ACUMULATIVA → FREEZE C6 → AGOSTO`.

## 8. Clasificación
- **Reusable CXOrbia:** read model canónico, semántica evidencia vs estado accionable, identity review queue, content-signature watcher y gate semántico transversal.
- **Exclusivo cliente:** cifras HR TyA/Cinépolis y revisión de identidades sin crosswalk.
- **Claude/prototipo:** incorporar una autoridad única de estado, perfil completo real, historial completo, certificación visible y periodo canónico; no replicar el bridge como parche de UI.
- **Academia:** explicar ownership, progresión de estados, evidencia histórica frente a estado accionable, identidad exacta y lectura financiera coherente.
- **Sin impacto Claude:** workflow read-only, evidencia y control de autorización.

## 9. Estado seguro
En este bloque: Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes0; merge=false; producción=false.
