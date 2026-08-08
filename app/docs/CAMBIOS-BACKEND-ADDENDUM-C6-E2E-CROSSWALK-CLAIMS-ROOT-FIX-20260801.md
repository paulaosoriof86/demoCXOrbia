# CAMBIOS-BACKEND — Corte 6 · E2E real, autoridad HR y baseline acumulativa única

**Fecha:** 2026-08-01  
**Estado:** `C6_REAL_STAFF_SHOPPER_E2E_HOSTING_DEV_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Bloque ejecutado
Se trabajó únicamente sobre la rama viva `docs-tya-v6-v71-audit`, PR #7, mediante aplicación directa. No se creó rama, PR, candidata, proyecto Firebase, Hosting ni metodología nuevos.

Objetivo: demostrar con usuarios reales que el build acumulativo conserva simultáneamente entrada, HR, identidad Shopper, Dashboard, hoja de ruta, estados, histórico, Finanzas, Reportes y Reservas protegidas.

## 2. Cadena real de fallos y causas
### 2.1 Selector de credenciales
El primer gate no lograba resolver el `shopperId` de Auth hacia la identidad canónica porque exigía igualdad directa entre el claim y el documento canónico. Se corrigió para usar únicamente crosswalk y evidencia técnica exacta.

### 2.2 Métricas QA mezcladas
Un rerun comparó como iguales dos métricas con semánticas diferentes: peso agregado por referencia y conteo global de visitas cruzadas. La igualdad inválida se eliminó; ambas métricas siguen registradas de forma independiente y fail-closed.

### 2.3 Selector paralelo divergente
Se detectaron selectores experimentales que reconstruían identidad por carriles distintos. El wrapper canónico quedó apuntando a un único selector protegido que reproduce el mismo contrato del crosswalk oficial. No se utiliza nombre, correo, teléfono ni coincidencia visual.

### 2.4 P0 estructural después de Auth
El E2E real probó que el shopper autenticaba correctamente, pero Firestore devolvía una vista scoped de una visita y `backend-firebase.js` la dejaba actuar temporalmente como fuente operacional, reduciendo la plataforma de 616 visitas HR a 1 visita.

La causa estructural fue una frontera de ownership incorrecta:
`estado Firestore autenticado` estaba reemplazando `HR viva`, en vez de enriquecerla.

## 3. Root fix definitivo aplicado
### `app/adapters/tya-protected-auth-hr-authority-bridge-v1.js`
Nuevo bridge reusable que:
- captura el estado protegido autenticado;
- recupera y aplica la HR viva como baseline operacional inmutable;
- recompone identidad/perfil mediante el composer canónico v2 y llaves técnicas exactas;
- exige 616 visitas de salida;
- exige cero visitas protegidas anexadas, cero duplicados de visita y cero duplicados de shopper;
- conserva `identityMap`, perfil, certificación, finanzas e histórico exactos;
- expone diagnóstico source-safe `CX_PROTECTED_AUTH_HR_AUTHORITY`;
- no realiza writes.

### `app/index-backend-dev.html`
Carga el bridge inmediatamente después de Firebase y antes del read guard/aplicación, para que Auth y Firestore nunca degraden la autoridad HR.

### `tools/qa/tya-c6-dev-entry-auth-gate.mjs`
Ahora exige:
- bridge cargado en el orden correcto;
- contrato HR-authority + protected overlay;
- invariante 616;
- cero writes;
- login único Usuario + Contraseña y claims derivados.

### `tools/qa/tya-c6-dev-users-real-e2e.mjs`
Valida con navegador real:
- credenciales existentes;
- namespace, rol, tenant y proyecto por claims;
- elección de perfil solo después de autenticar para identidad realmente dual;
- 616 visitas HR para staff y shopper;
- histórico propio del shopper mediante identidad canónica;
- refresh y nueva pestaña;
- ausencia de selector de acceso, selector genérico, login técnico y panel diagnóstico;
- códigos de fallo source-safe sin credenciales, tokens ni PII.

### Selectores privados de credenciales
El wrapper `tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs` quedó alineado con el selector canónico más reciente y con el crosswalk oficial. Los carriles divergentes no constituyen fuente de verdad.

## 4. Gates acumulativos ejecutados
Antes del deploy pasaron:
- contrato estático de entrada y HR authority;
- dominio canónico;
- Finanzas/Liquidaciones;
- portal Shopper;
- Reservas fail-closed;
- credenciales/import readback protegido;
- HR viva row-level;
- navegador shell;
- E2E real local staff y shopper.

Después del único deploy pasaron:
- paridad remota y navegador shell;
- E2E real remoto staff y shopper;
- refresh y nueva pestaña;
- autoridad HR, identidad exacta e histórico propio.

## 5. Resultado E2E autoritativo
Decisión:
`PASS_C6_REAL_STAFF_SHOPPER_E2E_EXISTING_HOSTING_DEV`.

### Local predeploy
- staff real: rol `coordinador`, namespace `staff`, 616 visitas, 194 shoppers;
- shopper real: rol `shopper`, namespace `shopper`, 616 visitas, 208 shoppers, 1 visita propia;
- HR authority preservada;
- identidad exacta resuelta;
- refresh y nueva pestaña PASS.

### Remoto postdeploy
Se repitieron los mismos PASS en `cxorbia-backend-dev`.

Evidencia autoritativa:
`app/docs/evidence/CORTE6-REAL-USERS-E2E-HOSTING-LATEST.json`.

## 6. Deploy y autorización
- destino: Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`;
- deploy ejecutado: 1/1;
- autorización `chat-20260801-c6-real-users-e2e-hosting-01`: consumida con PASS;
- no se permite reutilizarla.

Un trigger duplicado en cola alcanzó el gate después del PASS y fue bloqueado porque la autorización ya estaba consumida. No hubo segundo deploy ni provider mutation. La evidencia de ese evento quedó reclasificada como:
`SUPERSEDED_DUPLICATE_TRIGGER_AFTER_CONSUMED_PASS`.

No es una falla del producto y no sustituye el PASS autoritativo.

## 7. Baseline acumulativa única desde este punto
La única baseline válida es el build publicado que contiene simultáneamente:
- login único y claims derivados;
- HR viva 14 periodos/616 visitas;
- máquina canónica de estados;
- Dashboard, fases, detalle e histórico coherentes;
- identidad Shopper y portal canónicos;
- Finanzas, Movimientos, Liquidaciones y Beneficios bajo el mismo periodo/facetas;
- Reportes preservados;
- Reservas fail-closed;
- refresh idempotente;
- bridge Auth/Firestore → overlay sobre HR.

Queda prohibido:
- reconstruir una sección desde una versión anterior;
- aprobar pantallas de manera aislada;
- crear otra plataforma, rama, candidata o modelo paralelo;
- permitir que Auth/Firestore reemplace HR;
- duplicar semántica en módulos UI;
- saltar el gate acumulativo completo.

## 8. Invariantes protegidos
- 14 periodos/616 visitas/208 shoppers;
- julio: 44 total, GT 34, HN 10;
- 40 realizadas;
- 38 cuestionarios;
- 33 submitidas;
- 1 fuera de rango accionable;
- 40 realizadas visibles en Liquidaciones;
- 33 submitidas no omitidas;
- identidad exacta y cero dedupe por PII;
- Reportes sin pérdida;
- cero mutaciones de Reservas sin fuente real.

## 9. Pendiente exacto
`HUMAN VISUAL ACUMULATIVA DEL BUILD PUBLICADO → APROBADO → FREEZE C6`.

La revisión humana cubre entrada, Dashboard/hoja de ruta, KPIs y detalle, histórico/comparativo, tres refresh, Shoppers/portal, Finanzas completas, Reportes y Reservas.

Después del freeze:
`FUENTE EXACTA AGOSTO → DISPONIBLES/POSTULACIONES → GATE → AUTORIZACIÓN DE CUTOVER → PRODUCCIÓN`.

## 10. Archivos creados/modificados en el bloque
- `app/adapters/tya-protected-auth-hr-authority-bridge-v1.js` — creado;
- `app/index-backend-dev.html` — modificado;
- `app/adapters/tya-dev-entry-auth-gate-v1.js` — corregido previamente en el mismo bloque C6;
- `tools/qa/tya-c6-dev-entry-auth-gate.mjs` — modificado;
- `tools/qa/tya-c6-dev-users-real-e2e.mjs` — modificado;
- `tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs` y selectores protegidos — normalizados;
- `backend/config/corte6-cumulative-human-visual-hosting-request.json` — consumido PASS;
- `backend/config/corte6-cumulative-human-visual-hosting-execute.json` — consumido PASS;
- `app/docs/evidence/CORTE6-REAL-USERS-E2E-HOSTING-LATEST.json` — creado;
- `app/docs/evidence/CORTE6-REAL-USERS-E2E-FAILURE-LATEST.json` — reclasificado como trigger duplicado supersedido;
- índice, checkpoint, resumen Claude, pendientes y documentación Academia — actualizados o requeridos por este cierre.

No se modificó `app/modules/*` ni `app/core/*`.

## 11. Clasificación
- **Reusable CXOrbia:** frontera de ownership HR/Auth/Firestore; overlay protegido; E2E con principal real; evidencia PASS prevalente sobre trigger duplicado; baseline acumulativa única.
- **Exclusivo TyA:** conteos, tenant/proyecto y fuente HR Cinépolis.
- **Claude/prototipo:** consumir contratos canónicos; no recrear semántica ni identidad en módulos.
- **Academia:** enseñar source ownership, identidad técnica, least privilege sin pérdida de dataset interno y pruebas E2E reales.
- **Sin impacto Claude:** credenciales privadas, runner, deploy Hosting y consumo one-shot.

## 12. Estado seguro
Hosting DEV deploy 1; usuarios creados 0; Auth writes 0; cambios/resets de contraseña 0; Firestore/Rules/Storage/HR/legacy/Make/Gemini/pagos/Reservas writes 0; Cloud Run deploys 0; nuevos Firebase/Hosting 0; credenciales/tokens exportados 0; merge=false; producción=false.
