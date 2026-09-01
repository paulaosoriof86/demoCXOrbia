# CAMBIOS BACKEND — C6 ENTRADA/USUARIOS P0

**Fecha:** 2026-08-01  
**Clasificación:** Reusable CXOrbia · Claude/prototipo · Academia · Sin impacto producción  
**Estado final autoritativo:** `PASS_C6_REAL_STAFF_SHOPPER_E2E_EXISTING_HOSTING_DEV`

## 1. Evidencia humana reproducible
Paula encontró tres regresiones sucesivas:
1. la ruta base mostró `Fuente de datos no disponible / Conectado · Bloqueado`;
2. la ruta protegida mostró `Selecciona un perfil` antes del login real;
3. la siguiente versión sustituyó los botones por `Tipo de acceso`, obligando todavía al usuario a declarar su rol y mostrando un panel técnico con Auth/proyecto pendientes y conteos0.

El PASS anterior era un falso positivo porque solo comprobaba el formulario visible. No ejecutaba credenciales reales, claims, hidratación, histórico ni persistencia.

## 2. Causa raíz completa
- La entrada base no activaba consistentemente el carril protegido.
- La primera corrección eliminó una segunda pantalla técnica, pero mantuvo el selector de rol.
- Ocultar controles no los retiraba realmente del flujo.
- El gate de navegador validaba carcasa, no autenticación end-to-end.
- Al ejecutar por primera vez un shopper real, Auth/claims sí pasaban, pero Firestore devolvía su estado scoped de una visita y `backend-firebase.js` reemplazaba `CX.data._visitas` con esa vista.
- La HR viva dejaba temporalmente de ser autoridad operacional después de Auth.

La causa transversal fue una violación de ownership:
`HR = operación completa` y `Auth/Firestore = principal + alcance + overlay protegido`.

## 3. Root fix aplicado
Sin tocar `app/modules/*` ni `app/core/*`:

### `app/index-backend-dev.html`
- bootstrap temprano de la ruta base;
- carril protegido y proyecto `cinepolis` normalizados;
- wiring del bridge de autoridad HR después de `backend-firebase.js`.

### `app/adapters/tya-dev-entry-auth-gate-v1.js`
- único formulario visible: Usuario + Contraseña;
- probes privados de namespaces `staff` y `shopper`;
- namespace, rol, tenant y proyecto derivados de claims;
- elección posterior solo para una identidad realmente dual;
- selector genérico, `Tipo de acceso`, login técnico paralelo y panel diagnóstico eliminados del flujo humano;
- no almacena ni expone credenciales, tokens o UIDs.

### `app/adapters/tya-protected-auth-hr-authority-bridge-v1.js`
- escucha `backend-ready` autenticado;
- captura el estado Firestore scoped antes de restaurar HR;
- vuelve a leer la HR viva de616 visitas;
- recompone con `tya-cumulative-read-model-v2.js` por `hrRowId`, `sourceTab+sourceRow`, `visitId/id` y relaciones técnicas exactas;
- prohíbe visitas protegidas anexadas, duplicados de visitas/shoppers y cualquier salida distinta de616;
- reinstala histórico Shopper sobre la identidad canónica;
- envuelve refresh futuros para preservar la autoridad HR.

## 4. Gates corregidos
- `tya-c6-dev-entry-auth-gate.mjs`: entrada, orden de scripts, ausencia de selector y contrato HR-authority.
- `tya-c6-dev-entry-browser-smoke.mjs`: carcasa humana sin controles técnicos.
- `cxorbia-c6-existing-users-e2e-credentials*.mjs`: selección privada de cuentas existentes, validación real por Identity Toolkit, cero valores publicados.
- `tya-c6-dev-users-real-e2e.mjs`: login real, claims, tenant/proyecto,616 visitas, histórico propio, refresh y nueva pestaña.
- El workflow no puede desplegar mientras staff y shopper reales no pasen localmente.

Durante el diagnóstico todos los fallos previos ocurrieron antes del deploy. El gate reveló progresivamente el bloqueo real, incluyendo `shopper Auth/claims PASS + APP PASS + Firestore scoped V1`, que permitió corregir la autoridad de fuentes.

## 5. Autorización ejecutada
Texto exacto:

`Autorizo root fix P0 de usuarios DEV, prueba end-to-end con cuentas DEV reales protegidas y un solo redeploy del Hosting DEV existente; sin crear usuarios, cambiar contraseñas, escribir datos, modificar Rules, Cloud Run, merge ni producción.`

Resultado:
- cuentas nuevas:0;
- cambios/resets de contraseña:0;
- writes Auth/Firestore/Rules/Storage/HR:0;
- Hosting DEV existente desplegado:1/1;
- autorización consumida con PASS;
- segundo trigger en cola bloqueado después del consumo, sin deploy adicional.

## 6. Evidencia E2E real
Decisión:
`PASS_C6_REAL_STAFF_SHOPPER_E2E_EXISTING_HOSTING_DEV`.

### Local antes del deploy
- staff `coordinador`, namespace `staff`,616 visitas,194 shoppers;
- shopper, namespace `shopper`,616 visitas,208 shoppers,1 visita propia;
- identidad exacta resuelta;
- refresh y nueva pestaña preservados.

### Remoto después del deploy
Se repitieron los mismos PASS sobre `cxorbia-backend-dev`.

Evidencia:
`app/docs/evidence/CORTE6-REAL-USERS-E2E-HOSTING-LATEST.json`.

El archivo `CORTE6-REAL-USERS-E2E-FAILURE-LATEST.json` ya no representa una falla del producto: clasifica exclusivamente un trigger duplicado posterior al PASS que fue detenido en autorización.

## 7. Reusable CXOrbia
- Todo login protegido debe probar principal real y datos hidratados, no solo formulario.
- Un read scoped por rol nunca puede reemplazar la fuente operacional completa.
- Auth/claims determinan identidad y alcance; no deben pedir al usuario declarar su rol.
- Refresh y nueva pestaña son parte del contrato E2E.
- Una autorización one-shot consumida debe convertir triggers duplicados en no-op seguro.

## 8. Claude/prototipo
Claude no debe:
- reinstalar selector de rol o `Tipo de acceso` antes de autenticar;
- crear segunda pantalla técnica;
- mostrar diagnóstico backend al usuario final;
- reemplazar HR por arrays Firestore scoped;
- deduplicar por nombre/teléfono/email;
- declarar PASS sin login real staff y shopper, claims,616 visitas, histórico y persistencia.

## 9. Academia/manuales
Documentar:
- rol/namespace derivado de claims;
- HR como autoridad operacional incluso después de Auth;
- Firestore como overlay protegido;
- diferencia entre smoke de interfaz y E2E real;
- persistencia por refresh y nueva pestaña;
- gates one-shot e idempotencia.

## 10. Pendiente real
La entrada queda cerrada técnicamente con E2E real. Corte6 permanece pendiente de validación humana acumulativa de entrada, Dashboard/fases, histórico, estabilidad, Shoppers, Finanzas, Reportes y Reservas.

## 11. Estado seguro
Hosting DEV deploy1; usuarios creados0; Auth writes0; cambios/resets de contraseña0; Firestore/Rules/Storage/HR/legacy/Make/Gemini/pagos/Reservas writes0; Cloud Run deploys0; nuevos Firebase/Hosting0; credenciales/tokens exportados0; merge=false; producción=false.
