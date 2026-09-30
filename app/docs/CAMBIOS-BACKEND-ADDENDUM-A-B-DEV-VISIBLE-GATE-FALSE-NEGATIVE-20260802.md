# CAMBIOS BACKEND — A+B VISIBLE EN DEV Y FALSE NEGATIVE DEL GATE SEMÁNTICO

**Fecha:** 2026-08-02  
**Estado:** `A_PLUS_B_VISIBLE_ON_SINGLE_DEV__SOURCE_AND_REMOTE_CORE_PASS__SEMANTIC_GATE_FALSE_NEGATIVE_FIXED_SOURCE_ONLY__VISUAL_REVIEW_OPEN`

## 1. Resultado del macro-bloque autorizado

La candidata acumulativa única fue publicada exactamente una vez en el Hosting DEV existente:

- proyecto: `cxorbia-backend-dev`;
- site/target: `cxorbia-backend-dev` / `cxorbia-dev`;
- URL exacta de entrada: `https://cxorbia-backend-dev.web.app/index-backend-dev.html`;
- archivos publicados: 2320;
- segundo deploy: 0;
- producción: intacta.

## 2. Gates que pasaron antes y después del deploy

### Predeploy

- manifest y 23 Git blobs A+B;
- orden de carga;
- sintaxis;
- unit gate de composición: 23/23;
- ausencia de provider calls en el adapter;
- C6 static cumulative;
- Shopper new-tab root fix static.

### Remotos

- paridad exacta de activos críticos;
- endpoint HR vivo;
- Staff: 14 periodos, 616 visitas, recargas y nueva pestaña estables;
- Shopper: 14 periodos, 616 visitas, 208 shoppers, identidad exacta, `ownVisits=1`, recargas y nueva pestaña estables;
- Cliente: autenticado, tenant `tya`, proyecto `cinepolis`, 14 periodos y 616 visitas;
- Finanzas: delegado, `localBilling=false`, regalía 0, Q60 GT/L200 HN, 14 proyectos delegados y cero violaciones.

## 3. Fallo final y causa raíz demostrada

El workflow cerró con:

`FAIL_C6_REMOTE_GATES_AFTER_SINGLE_DEV_HOSTING_DEPLOY_STOP_RETRY`

El stage fue:

`remote_domain_finance_portals_reservations`

La evidencia quedó con `semantic:null` porque el script abortaba antes de persistir el error exacto.

La causa reproducible localizada es un error del gate, no una ausencia del módulo financiero en la candidata:

- el módulo real se registra como `CX.module('financiero', ...)`;
- el gate buscaba `CX.modules.finanzas`;
- por tanto, la aserción agregada `CANONICAL_MODULE_MISSING` podía fallar aunque `financiero` estuviera correctamente cargado.

## 4. Root fix source-only aplicado

Archivo:

`tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs`

Commit:

`68f1b49b3c03d53e0d9c74d15d0f55e286653a0e`

Cambios:

- usa el ID canónico `financiero`;
- conserva `cliente`, `miperfil` y `reservas`;
- registra `stage`, `errorCode` y snapshots parciales sanitizados ante cualquier fallo;
- siempre persiste evidencia antes de terminar;
- cero cambios en `app/`;
- cero deploy adicional.

## 5. Dictamen operativo

La candidata A+B está físicamente disponible y con paridad exacta para revisión humana. No se presenta todavía como frozen ni como lista para producción porque:

- falta la validación visual de Paula;
- el gate semántico corregido todavía debe revalidarse read-only sobre el mismo build, sin redeploy;
- `build-lock.js` no debe congelarse hasta cerrar esa revisión.

El false negative del gate no exige reconstruir ni volver a publicar la candidata.

## 6. Checkpoint Visual 1

Revisar sobre la misma URL y build:

- login y shell;
- tenant/proyecto/periodo/fuente;
- navegación;
- CRM Ops Leads;
- Dashboard y drilldowns;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing.

No crear otra candidata para corregir observaciones. Todo ajuste continúa sobre la rama viva y el mismo linaje acumulativo.

## 7. Estado seguro

- Hosting DEV deploys de este macro: 1;
- segundo deploy: 0;
- Cloud Run deploys: 0;
- Firestore/Auth/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: false.

## 8. Clasificación

- **Reusable CXOrbia:** validación por ID canónico y persistencia de error exacto.
- **Exclusivo cliente:** URL DEV y configuración TyA/Cinépolis.
- **Claude/prototipo:** revisión visual de A+B; módulos preservados.
- **Academia:** actualización posterior a aprobación visual.
- **Sin impacto Claude:** QA, evidencia, hashes y STOP_RETRY.
