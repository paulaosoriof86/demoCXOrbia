# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `P0_PROVEN__DIRECT_ROLE_ENTRY_REPLACED_BY_TECHNICAL_AUTH_FORM__DEV_BLOCKED__NO_PRODUCTION`

## 1. No reabrir
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406 no repetir.
- Corte 5: 14 periodos/616 visitas/current 2026-07 PASS.
- HR viva, histórico, shoppers, identidad, Finanzas/Liquidaciones, portal Shopper y Reservas fail-closed preservados.
- Producción `tya-plataforma` intacta.

## 2. P0 vigente que Claude no debe reintroducir
El acceso funcional aprobado para la visualización no usa Usuario + Contraseña. Debe entrar directamente mediante perfiles visibles:
- Administración / Coordinación;
- Portal del Cliente;
- Shopper / Evaluador;
- roles adicionales configurados cuando corresponda.

`app/app.js` conserva este contrato nativo con `Selecciona un perfil para entrar` y `.role-btn` por rol.

El adapter `app/adapters/tya-dev-entry-auth-gate-v1.js` reemplazó indebidamente esa interfaz:
- elimina `.role-btn,#goReg`;
- inserta `cxDevEntryAuth`;
- pide Usuario + Contraseña.

No repetir ni consolidar este reemplazo.

## 3. Distinción obligatoria de carriles
### Carril humano de visualización
- entrada directa por perfiles;
- cero usuario/contraseña;
- usa la UX nativa del prototipo;
- permite revisar Administración, Cliente y Shopper.

### Carril técnico Firebase Auth
- cuentas DEV reales;
- claims, namespace, tenant, proyecto y shopperId;
- HR 616 preservada después de Auth;
- refresh y nueva pestaña;
- oculto detrás de un gate/parámetro técnico explícito;
- nunca reemplaza la interfaz humana.

El PASS `PASS_C6_REAL_STAFF_SHOPPER_E2E_EXISTING_HOSTING_DEV` es válido únicamente para el carril técnico.

## 4. Contratos canónicos preservados
- HR manda periodos, visitas y estado operativo.
- Auth/Firestore aportan principal, claims, alcance y overlay; nunca sustituyen HR.
- Una sola faceta alimenta Dashboard, fases, detalle, histórico, portal y Finanzas.
- Identidad Shopper solo por llaves técnicas exactas.
- Conflictos sin match exacto pasan a review queue.
- Portal Shopper muestra las visitas de la identidad canónica.
- Toda realizada entra a Liquidaciones; sin cruce exacto no hay lote/pago.
- Reservas queda fail-closed hasta fuente real.

Baseline: 14 periodos/616 visitas/208 shoppers; julio 44=GT34+HN10; realizadas 40; cuestionario 38; submitidas 33; fuera de rango accionable 1.

## 5. Root fix requerido
Sin modificar `app/modules/*` ni `app/core/*`:
- preservar `app.js` como autoridad visual;
- impedir que el adapter técnico remueva los perfiles en el carril humano;
- activar el formulario técnico solo mediante parámetro E2E explícito;
- crear gates separados de entrada humana y Auth técnico;
- el gate humano debe fallar si aparece `cxDevEntryAuth` o faltan admin/cliente/shopper.

## 6. Validación humana pendiente
Después del redeploy corregido:
- selector directo visible;
- Dashboard/hoja de ruta 44/40/38/33/1;
- comparativo histórico;
- tres refresh/focus sin crecimiento, reducción ni salto;
- Shoppers, perfil, certificación e histórico;
- Portal Cliente y Portal Shopper;
- Finanzas, Movimientos, Liquidaciones y Beneficios;
- Reportes;
- Reservas read-only.

Solo con `APROBADO` se congela Corte 6.

## 7. Regla frontend
Claude debe conservar el selector de perfiles de `app.js`. No debe insertar autenticación visible desde módulos ni duplicar semántica de HR, identidad, Finanzas o estados.

## 8. Academia/manuales
Documentar la diferencia entre:
- selector de perfil para visualización/experiencia;
- autenticación real;
- autorización por claims;
- alcance de datos y fuente operacional.

Un PASS de autenticación no valida automáticamente la UX de entrada.

## 9. Después del freeze
Fuente exacta de agosto → disponibles → postulaciones → gate multirol → autorización de writes/cutover → producción.

## 10. Estado seguro
Hosting DEV actual bloqueado por el P0 visible; producción intacta; sin provider writes nuevos, merge ni producción.