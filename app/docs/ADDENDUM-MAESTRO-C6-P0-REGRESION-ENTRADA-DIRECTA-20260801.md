# ADDENDUM MAESTRO — C6 P0 · regresión de entrada directa por perfiles

**Fecha:** 2026-08-01  
**Estado:** `P0_TECHNICALLY_RESOLVED_IN_HOSTING_DEV__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Hallazgo autoritativo
La pantalla publicada con `Usuario + Contraseña` no correspondía al acceso funcional aprobado para la visualización CXOrbia/TyA.

El acceso aprobado es la entrada directa por perfiles visibles:
- Administración / Coordinación;
- Portal del Cliente;
- Shopper / Evaluador;
- roles adicionales configurados cuando corresponda.

No se solicita usuario ni contraseña en el carril humano de visualización DEV utilizado por Paula.

## 2. Causa raíz completa
`app/app.js` conservaba nativamente el contrato correcto:
- `Selecciona un perfil para entrar`;
- botones `.role-btn` para `admin`, `cliente` y `shopper`;
- selección directa mediante `CX.app.selectRole(...)`.

La regresión tuvo dos capas:
1. el adapter técnico eliminaba los botones e insertaba `cxDevEntryAuth`;
2. después de restaurar los botones, `backend-browser-auth.js` seguía interceptando `selectRole()` cuando backend/Auth preview estaban habilitados y abría un paso integrado de credenciales.

El problema era una confusión entre experiencia humana, autenticación y autorización, no una decisión funcional aprobada.

## 3. Root fix aplicado
Sin modificar `app/modules/*` ni `app/core/*`:
- `app.js` permanece como autoridad visual;
- el carril humano conserva Administración, Cliente y Shopper;
- backend Firebase/Auth integrada se deshabilitan solo para esa visualización antes de `DOMContentLoaded`;
- HR viva y adapters canónicos permanecen como fuente operacional;
- Usuario + Contraseña se limita al carril técnico explícito;
- el carril técnico reactiva Firebase Auth y mantiene claims, identidad, HR authority, refresh y nueva pestaña;
- smoke humano y E2E técnico son gates separados.

## 4. Evidencia de cierre técnico
Decisión:
`PASS_C6_HUMAN_DIRECT_ROLE_ENTRY_AND_ISOLATED_AUTH_EXISTING_HOSTING_DEV`.

Evidencia:
`app/docs/evidence/CORTE6-DIRECT-ROLE-ENTRY-HOSTING-LATEST.json`.

Resultado:
- admin visible: true;
- cliente visible: true;
- shopper visible: true;
- usuario/contraseña humana: false;
- browser humano local/remoto: PASS;
- Auth técnica staff/shopper local/remota: PASS;
- 616 visitas preservadas;
- shopper técnico con 1 visita propia;
- refresh y nueva pestaña preservados;
- un único deploy al Hosting DEV existente.

## 5. Seguridad y consumo
- autorización: `consumed_pass`;
- Hosting deploy executions: 1;
- usuarios creados: 0;
- Auth writes/cambios de contraseña: 0;
- Firestore/Rules/Cloud Run/HR writes: 0;
- nuevos proyectos Firebase/sitios Hosting: 0;
- merge=false;
- producción=false.

## 6. Prevención permanente
Todo gate de entrada debe probar dos contratos independientes:

### Human entry contract
- perfiles directos visibles;
- cero credenciales;
- clic directo activa el perfil;
- backend/Auth integrada no intercepta.

### Technical Auth contract
- cuentas reales únicamente en carril técnico oculto;
- claims y scope correctos;
- HR canónica preservada;
- refresh y nueva pestaña;
- cero exposición de credenciales.

Un PASS técnico no puede volver a sustituir ni redefinir la interfaz aprobada.

## 7. Gate pendiente
El cierre técnico no equivale al freeze. Falta:
`VALIDACIÓN HUMANA ACUMULATIVA DEL BUILD PUBLICADO → APROBADO C6 → FREEZE`.

Después:
`AGOSTO → DISPONIBLES → POSTULACIONES → GATE MULTIROL → CUTOVER → PRODUCCIÓN`.

## 8. Clasificación
- **Reusable CXOrbia:** separación UX/Auth/autorización y gates independientes.
- **Exclusivo TyA:** etiquetas y perfiles configurados para este tenant.
- **Claude/prototipo:** conservar `app.js`; no sustituir tarjetas por formulario.
- **Academia/manuales:** distinguir selector, autenticación, autorización y fuente operacional.
- **Sin impacto Claude:** credenciales privadas, service account y E2E técnico.

## 9. Estado seguro
El P0 está técnicamente resuelto en Hosting DEV. Producción permanece intacta. La autorización quedó consumida y no habilita nuevos deploys ni mutaciones.