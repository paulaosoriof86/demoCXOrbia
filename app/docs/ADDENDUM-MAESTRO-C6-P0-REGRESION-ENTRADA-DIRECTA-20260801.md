# ADDENDUM MAESTRO — C6 P0 · regresión de entrada directa por perfiles

**Fecha:** 2026-08-01  
**Estado:** `P0_PROVEN__TECHNICAL_AUTH_FORM_REPLACED_APPROVED_DIRECT_ROLE_ENTRY__DEV_NOT_APPROVED__NO_PRODUCTION`

## 1. Hallazgo autoritativo
La pantalla publicada con `Usuario + Contraseña` NO corresponde al acceso funcional aprobado para la visualización CXOrbia/TyA.

El acceso aprobado y utilizado durante la construcción del prototipo es la entrada directa por perfiles visibles:
- Administración / Coordinación;
- Portal del Cliente;
- Shopper / Evaluador;
- roles adicionales configurados cuando corresponda.

No se debe pedir usuario ni contraseña para entrar al carril humano de visualización DEV utilizado por Paula.

## 2. Evidencia reproducible en el código vivo
`app/app.js` conserva nativamente el contrato correcto:
- copy `Selecciona un perfil para entrar`;
- botones `.role-btn` para `admin`, `cliente` y `shopper`;
- selección directa mediante `CX.app.selectRole(...)` y el flujo visible ya aprobado.

`app/adapters/tya-dev-entry-auth-gate-v1.js` introdujo la regresión:
- ejecuta `removeGenericRolePicker(card)`;
- elimina `.role-btn` y `#goReg`;
- cambia el copy;
- inserta el formulario `cxDevEntryAuth` con Usuario + Contraseña.

Por tanto, el backend/adaptador sustituyó indebidamente el acceso del prototipo. No fue una decisión funcional nueva aprobada.

## 3. Error metodológico
Se confundieron dos carriles distintos:
1. **Carril humano de visualización:** debe conservar la entrada directa por Administración, Cliente, Shopper y demás perfiles configurados.
2. **Carril técnico de autenticación real:** puede probar cuentas Firebase existentes, claims, namespace, refresh y nueva pestaña, pero debe estar oculto detrás de un gate técnico explícito y nunca reemplazar la interfaz humana del producto.

El PASS `PASS_C6_REAL_STAFF_SHOPPER_E2E_EXISTING_HOSTING_DEV` sigue siendo evidencia válida del carril técnico Auth, pero NO valida la entrada humana aprobada ni autoriza el freeze visual de Corte 6.

## 4. Efecto sobre el estado vigente
- La captura humana demuestra un P0 reproducible en Hosting DEV.
- Corte 6 vuelve a `BLOCKED_PENDING_DIRECT_ROLE_ENTRY_RESTORE_AND_HUMAN_VISUAL`.
- El freeze C6 anterior queda invalidado/no alcanzado.
- Producción continúa intacta y no fue modificada.
- No se pierde HR, histórico, shoppers, Finanzas, Reportes ni el trabajo acumulativo; el defecto está localizado en el mecanismo visible de entrada y en la metodología de validación.

## 5. Root fix obligatorio
Sin tocar `app/modules/*` ni `app/core/*`:
- restaurar el `showLogin()` nativo del prototipo para el carril humano;
- mantener visibles Administración / Coordinación, Cliente y Shopper según `tenantProfile.visibleLoginRoles`;
- impedir que el adapter técnico elimine `.role-btn` en la entrada humana;
- activar Usuario + Contraseña únicamente con un parámetro/gate técnico E2E explícito;
- separar smoke humano y E2E Auth;
- el smoke humano debe fallar si aparece `cxDevEntryAuth` o si faltan los perfiles aprobados;
- el E2E técnico debe seguir validando cuentas reales sin aparecer en la experiencia de Paula.

## 6. Secuencia exacta
`RESTORE NATIVE DIRECT ROLE ENTRY → STATIC CONTRACT → LOCAL HUMAN BROWSER SMOKE → TECHNICAL AUTH E2E ISOLATED → GOLDEN ACCUMULATIVE GATES → 1x HOSTING DEV WITH NEW EXPLICIT AUTHORIZATION → HUMAN VISUAL → FREEZE C6`.

No crear proyecto, Hosting, rama, PR, candidata ni plataforma nuevos. No pedir a Paula ejecutar PowerShell.

## 7. Prevención permanente
Todo gate de entrada debe probar ambos contratos por separado:
- **Human entry contract:** perfiles directos visibles y cero credenciales solicitadas.
- **Technical Auth contract:** credenciales reales únicamente en el carril técnico oculto.

Un PASS técnico no puede volver a sustituir ni redefinir la interfaz aprobada.

## 8. Clasificación
- **Reusable CXOrbia:** separación entre UX de entrada y autenticación técnica; prevención de falsos PASS por confusión de carriles.
- **Exclusivo TyA:** etiquetas y perfiles visibles configurados para este tenant.
- **Claude/prototipo:** conservar `app.js` como autoridad visual; no reemplazar tarjetas de rol por formulario.
- **Academia/manuales:** distinguir autenticación, autorización, selector de rol de demo y experiencia final.
- **Sin impacto Claude:** credenciales privadas, service account y E2E técnico.

## 9. Estado seguro
Hosting DEV contiene el P0 visible; producción intacta. No hubo writes nuevos, merge ni producción en este diagnóstico.