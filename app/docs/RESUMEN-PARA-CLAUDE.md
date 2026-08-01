# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_DIRECT_ROLE_ENTRY_HOSTING_DEV_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. No reabrir
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406 no repetir.
- Corte 5: 14 periodos/616 visitas/current 2026-07 PASS.
- HR viva, histórico, shoppers, identidad, Finanzas/Liquidaciones, portal Shopper, Reportes y Reservas fail-closed preservados.
- Producción `tya-plataforma` intacta.

## 2. Contrato de entrada que Claude debe preservar
El carril humano de visualización utiliza directamente:
- Administración / Coordinación;
- Portal del Cliente;
- Shopper / Evaluador;
- perfiles adicionales configurados.

No muestra Usuario + Contraseña. `app/app.js` continúa siendo la autoridad de esta experiencia.

El carril técnico Firebase Auth es independiente y oculto:
- usa cuentas DEV reales;
- valida claims, namespace, tenant, proyecto y shopperId;
- conserva HR 616 después de Auth;
- valida refresh y nueva pestaña;
- nunca reemplaza la entrada humana.

## 3. Causa raíz y prevención
La regresión tuvo dos capas:
1. el adapter técnico eliminaba `.role-btn` e insertaba credenciales;
2. después de restaurar los botones, `backend-browser-auth.js` todavía interceptaba `selectRole()` y mostraba su paso integrado de Auth.

Solución reusable:
- el carril humano deshabilita backend Firebase/Auth integrada antes de `DOMContentLoaded`;
- HR viva y los adapters canónicos siguen como fuente operacional;
- el carril técnico explícito reactiva Firebase y ejecuta E2E real;
- gates separados impiden que un PASS técnico redefina la UX humana.

## 4. Decisión autoritativa
`PASS_C6_HUMAN_DIRECT_ROLE_ENTRY_AND_ISOLATED_AUTH_EXISTING_HOSTING_DEV`.

- Entrada humana local/remota: PASS.
- Administración, Cliente y Shopper: visibles.
- Credenciales humanas: ausentes.
- Staff técnico: 616 visitas, refresh/nueva pestaña PASS.
- Shopper técnico: 616 visitas, 1 visita propia, refresh/nueva pestaña PASS.
- Hosting DEV: 1 deploy.
- Cero writes de Auth, contraseña, Firestore, Rules, Cloud Run o HR.
- Merge=false; producción=false.

## 5. Contratos canónicos preservados
- HR manda periodos, visitas y estado operativo.
- Auth/Firestore aportan principal, claims, alcance y overlay técnico; no sustituyen HR.
- Una faceta alimenta Dashboard, fases, detalle, histórico, portal y Finanzas.
- Identidad Shopper solo por llaves técnicas exactas.
- Toda realizada entra a Liquidaciones; sin cruce exacto no hay lote/pago.
- Reservas queda fail-closed hasta fuente real.

Baseline: 14 periodos/616 visitas/208 shoppers; julio 44=GT34+HN10; realizadas 40; cuestionario 38; submitidas 33; fuera de rango accionable 1.

## 6. Regla frontend
Claude no debe:
- sustituir el selector de perfiles por credenciales;
- insertar Auth visible dentro de módulos;
- reconstruir semántica de HR, identidad, Finanzas o estados;
- tocar adapters/gates backend protegidos.

Debe conservar `app.js` y consumir los contratos canónicos existentes.

## 7. Validación humana pendiente
Sobre el build ya publicado:
- entrada directa por perfiles;
- Dashboard/hoja de ruta 44/40/38/33/1;
- histórico y comparativo;
- tres refresh/focus estables;
- Shoppers, perfil, certificación e histórico;
- Portal Cliente y Portal Shopper;
- Finanzas, Movimientos, Liquidaciones y Beneficios;
- Reportes;
- Reservas read-only.

Solo `APROBADO C6` congela Corte 6.

## 8. Academia/manuales
Actualizar contenido para diferenciar:
- selección de perfil para visualización;
- autenticación real;
- autorización por claims;
- fuente operacional;
- smoke humano vs E2E técnico.

## 9. Después del freeze
Fuente exacta de agosto → disponibles → postulaciones → gate multirol → autorización de writes/cutover → producción.

## 10. Estado seguro
DEV técnicamente PASS; producción intacta; autorización de redeploy consumida; sin autorización vigente para nuevos deploys, writes, merge o producción.