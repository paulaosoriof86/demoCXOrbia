# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-01  
**Estado:** `P0_PROVEN__DIRECT_ROLE_ENTRY_REPLACED_BY_TECHNICAL_AUTH_FORM__DEV_BLOCKED__NO_PRODUCTION`

## 1. Estado protegido
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406 no repetir.
- Corte 5: 14 periodos/616 visitas PASS.
- HR viva, histórico, shoppers, identidad, Finanzas/Liquidaciones, portal Shopper y Reservas fail-closed preservados.
- Producción `tya-plataforma` intacta.

## 2. P0 humano vigente
La captura de Paula reproduce que el Hosting DEV abre un formulario Usuario + Contraseña.

Ese comportamiento contradice el acceso funcional aprobado y utilizado durante el desarrollo: entrada directa por perfiles visibles de Administración / Coordinación, Portal del Cliente y Shopper / Evaluador.

## 3. Causa raíz verificada
`app/app.js` conserva el contrato correcto:
- `Selecciona un perfil para entrar`;
- `.role-btn` para `admin`, `cliente` y `shopper`;
- entrada directa mediante `CX.app.selectRole(...)`.

`app/adapters/tya-dev-entry-auth-gate-v1.js` introdujo la regresión:
- `removeGenericRolePicker(card)`;
- eliminación de `.role-btn,#goReg`;
- inserción del formulario `cxDevEntryAuth`.

Se confundió el carril humano de visualización con el carril técnico de Firebase Auth.

## 4. Reinterpretación del PASS anterior
`PASS_C6_REAL_STAFF_SHOPPER_E2E_EXISTING_HOSTING_DEV` sigue demostrando:
- cuentas Firebase DEV existentes válidas;
- claims, namespace, tenant y proyecto;
- HR 616 preservada después de Auth;
- refresh y nueva pestaña;
- cero exposición de credenciales.

No demuestra que la interfaz humana de entrada sea correcta. Por tanto no habilita el freeze visual de Corte 6.

## 5. Baseline canónica preservada
No se reabren:
- julio 44 = GT 34 + HN 10;
- realizadas 40;
- cuestionario 38;
- submitidas 33;
- fuera de rango accionable 1;
- histórico 14 periodos/616 visitas;
- identidad Shopper y portal;
- Finanzas/Movimientos/Liquidaciones/Beneficios;
- Reportes;
- Reservas fail-closed.

El P0 está focalizado en el mecanismo visible de entrada y en el gate que lo validó incorrectamente.

## 6. Root fix exacto
Sin tocar `app/modules/*` ni `app/core/*`:
1. restaurar el selector directo nativo para el carril humano;
2. mantener Usuario + Contraseña únicamente detrás de un parámetro técnico E2E explícito;
3. separar smoke humano y E2E Auth;
4. hacer fallar el smoke humano si aparece `cxDevEntryAuth` o faltan Administración, Cliente o Shopper;
5. repetir gates acumulativos;
6. solicitar una nueva autorización exacta únicamente para el redeploy DEV;
7. repetir validación humana y congelar C6 solo con aprobación.

## 7. Siguiente secuencia
`RESTORE DIRECT ROLE ENTRY → LOCAL HUMAN SMOKE → ISOLATED TECHNICAL AUTH E2E → GOLDEN ACCUMULATIVE GATES → NEW DEV DEPLOY AUTHORIZATION → HUMAN VISUAL → FREEZE C6 → AGOSTO/POSTULACIONES`.

## 8. Seguridad
Diagnóstico y documentación sin provider writes, sin merge y sin producción. El Hosting DEV actual continúa bloqueado por este P0 visible.