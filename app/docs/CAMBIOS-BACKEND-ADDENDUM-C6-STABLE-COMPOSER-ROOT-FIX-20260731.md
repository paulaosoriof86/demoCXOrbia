# CAMBIOS-BACKEND — Corte 6 · root fix estable de composición acumulativa

**Fecha:** 2026-07-31  
**Estado:** `C6_STABLE_COMPOSER_CODE_PASS__LOCAL_REGRESSION_3X_PASS__PENDING_ONE_HOSTING_DEV_AUTH__NO_PRODUCTION`

## 1. Problema reproducido
La validación humana posterior al deploy acumulativo mostró una regresión real:
- primer render de JUL con 88 visitas y posterior estabilización en 44;
- badge de diagnóstico llegó a 1,232 visitas y 546 shoppers;
- el polling movía la pantalla/scroll;
- shoppers repetidos y aliases reaparecían;
- perfil, credenciales e histórico quedaban repartidos entre identidades;
- comparativo histórico incompleto;
- estados podían variar entre render inicial y refresh.

La HR canónica fue revalidada read-only y mantiene 30 tabs/28 mensuales, sin agosto 2026, con julio 2026 = 34 GT + 10 HN. Por tanto 88/1,232 no eran verdad de fuente.

## 2. Causa raíz
`app/adapters/tya-dev-full-visual-bridge.js` reutilizaba `CX.data.shoppers`, `CX.data._visitas` y `CX.data._posts` ya compuestos como base de una siguiente reaplicación. Además anexaba visitas protegidas no emparejadas por id aunque pudieran ser la misma visita HR con otro identificador.

El watcher emitía `visit-flow` durante refresh; el router central re-renderizaba la vista activa, lo que podía resetear scroll/controles/modal.

## 3. Archivos creados
### `app/adapters/tya-cumulative-read-model.js`
Nuevo composer puro y reusable:
- HR es dueño de periodos y estado operativo;
- Firestore protegido solo enriquece identidad/perfil y facetas financieras exactas;
- matching de visita por `hrRowId`, `sourceTab+sourceRow` o `visitId` exacto;
- nunca agrega una visita protegida adicional sobre la base HR;
- crosswalk Shopper se deriva solo de evidencia técnica exacta;
- no usa nombre/teléfono/email para dedupe;
- normaliza username/password tanto top-level como en estructuras anidadas conocidas;
- output de visitas conserva exactamente el tamaño HR.

### `tools/qa/tya-cumulative-read-model-regression-gate.mjs`
Gate determinístico de no-regresión:
- baseline 14 periodos/616 visitas/208 shoppers;
- 616 visitas protegidas con IDs diferentes pero misma evidencia HR;
- 120 perfiles protegidos;
- tres composiciones consecutivas;
- verifica conteos/IDs estables, cero append, cero duplicados, estado HR preservado y perfil protegido visible.

### `app/docs/evidence/CORTE6-STABLE-COMPOSER-REGRESSION-GATE-LATEST.json`
Evidencia source-safe del gate local y del read-only live-source check.

## 4. Archivos modificados
### `app/adapters/tya-dev-full-visual-bridge.js`
Se reemplazó la composición acumulativa anterior por una versión estable:
- primero fuerza/checkea HR viva;
- captura una baseline HR inmutable por `sourceRevision`;
- compone siempre desde esa baseline;
- no trabaja sobre arrays previamente enriquecidos;
- no agrega protected visits como nuevas visitas;
- conserva periodos/currentPeriod/histórico HR;
- instala stats de shopper sobre la identidad canónica resultante;
- expone diagnósticos de estabilidad.

El engine reusable se carga dinámicamente desde el mismo adapter; no fue necesario tocar `index-backend-dev.html` ni módulos.

### `app/adapters/tya-live-source-refresh-watch.js`
El watcher ahora:
- si la revisión HR es igual, no aplica snapshot, no reaplica overlay y no hace rerender funcional;
- si cambia, aplica HR una sola vez y recompone el overlay una sola vez;
- intercepta el `visit-flow` emitido por el adapter para evitar rerender intermedio;
- captura y restaura scroll, filtros/selects y foco;
- si hay modal/formulario activo, difiere el rerender hasta que la interacción termine;
- nunca recarga el documento.

## 5. Gate ejecutado antes de deploy
Ejecución local sobre los mismos sources escritos en GitHub:
- `node --check` en composer, bridge, watcher y gate: PASS;
- `PASS_C6_STABLE_COMPOSER_3X_IDEMPOTENCE`;
- reapply1: 616 visitas/208 shoppers;
- reapply2: 616 visitas/208 shoppers;
- reapply3: 616 visitas/208 shoppers;
- duplicateVisitKeys=0;
- duplicateShopperIds=0;
- protectedVisitsAppended=0;
- IDs de visitas estables después de 3 reaplicaciones;
- IDs Shopper estables después de 3 reaplicaciones;
- estado operacional HR preservado;
- overlay de perfil protegido visible.

No existe CI automático asociado al commit; por eso la evidencia lo declara explícitamente como validación local de los mismos sources, no como workflow CI.

## 6. Lo que NO se ejecutó
- Hosting deploys: 0;
- Cloud Run deploys: 0;
- Firestore writes: 0;
- Auth writes/resets: 0;
- Rules deploys: 0;
- Storage writes: 0;
- HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: false.

La autorización anterior de Hosting ya fue consumida y NO se reutiliza.

## 7. Impacto Phase A
El root fix corrige la causa que hacía retroceder etapas ya aprobadas. Corte 6 sigue abierto hasta remote smoke + human visual real. No se inicia agosto todavía.

## 8. Reusable CXOrbia
- read model por ownership de fuente;
- composición idempotente;
- crosswalk técnico por evidencia exacta;
- no append de overlays sobre una fuente autoritativa;
- refresh con revision gate;
- rerender diferido/preservación de estado UI;
- regression gate 3x antes de release.

## 9. Exclusivo TyA
- HR Cinépolis de 14 periodos/616 visitas;
- crosswalk actual de identidades TyA;
- 31 perfiles que continúan en HOLD si no tienen vínculo técnico reproducible.

## 10. Claude/prototipo
No se tocó `/app/modules/*` ni `/app/core/*` por esta corrección. Claude debe conservar el contrato del read model y no reimplementar HR/identidad/finanzas en módulos.

## 11. Academia
Se mantiene el lock de no-regresión y se debe enseñar que una actualización de fuente no cambia pantalla/contexto del usuario ni duplica registros.

## 12. Siguiente gate exacto
Se requiere autorización fresca únicamente para:
`1x redeploy del Hosting DEV existente cxorbia-backend-dev/cxorbia-dev`.

No requiere Cloud Run redeploy porque el cambio es únicamente Hosting/assets frontend adapters ya servidos por el mismo backend.

Después del único deploy: remote smoke + human visual acumulativa con Dashboard/HR, 3 refresh, Shoppers/perfil/credenciales/histórico, comparativo, Beneficios y Finanzas. Solo un PASS completo permite freeze C6 y pasar a agosto.
