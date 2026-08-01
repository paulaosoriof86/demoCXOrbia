# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-01  
**Estado:** `C6_DIRECT_ROLE_ENTRY_HOSTING_DEV_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Estado protegido
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406 no repetir.
- Corte 5: 14 periodos/616 visitas PASS.
- HR viva, histórico, shoppers, identidad, Finanzas/Liquidaciones, portal Shopper, Reportes y Reservas fail-closed preservados.
- Producción `tya-plataforma` intacta.

## 2. P0 humano cerrado técnicamente
El Hosting DEV ya no presenta Usuario + Contraseña en el carril humano. La entrada aprobada fue restaurada:
- Administración / Coordinación;
- Portal del Cliente;
- Shopper / Evaluador;
- perfiles adicionales configurados.

La causa raíz final fue doble:
1. un adapter sustituyó inicialmente los botones por un formulario técnico;
2. al restaurar los botones, `backend-browser-auth.js` todavía interceptaba `selectRole()` y abría el paso integrado de credenciales.

El root fix focal deshabilita backend Firebase/Auth integrada únicamente en el carril humano antes de `DOMContentLoaded`. El carril técnico explícito conserva Firebase Auth, claims, HR authority y E2E real.

## 3. Resultado autoritativo
`PASS_C6_HUMAN_DIRECT_ROLE_ENTRY_AND_ISOLATED_AUTH_EXISTING_HOSTING_DEV`.

Evidencia:
`app/docs/evidence/CORTE6-DIRECT-ROLE-ENTRY-HOSTING-LATEST.json`.

### Entrada humana
- Administración visible: PASS.
- Cliente visible: PASS.
- Shopper visible: PASS.
- Usuario + Contraseña: ausente.
- Smoke local: PASS.
- Smoke remoto: PASS.

### Auth técnica aislada
- Staff real local/remoto: PASS.
- Shopper real local/remoto: PASS.
- Staff: 616 visitas; refresh y nueva pestaña preservados.
- Shopper: 616 visitas; 1 visita propia; refresh y nueva pestaña preservados.

## 4. Baseline canónica preservada
- 14 periodos/616 visitas.
- Julio: 44 total = GT 34 + HN 10.
- Realizadas: 40.
- Cuestionario: 38.
- Submitidas: 33.
- Fuera de rango accionable: 1.
- Dominio, Finanzas/Liquidaciones, portal Shopper y Reservas fail-closed: PASS.
- No se modificaron `app/modules/*` ni `app/core/*`.

## 5. Deploy y autorización
- Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`.
- Deploy: exactamente 1.
- Autorización: `consumed_pass`.
- Usuarios creados: 0.
- Auth writes/cambios de contraseña: 0.
- Firestore/Rules/Cloud Run/HR writes: 0.
- Proyectos Firebase/sitios Hosting nuevos: 0.
- Merge=false; producción=false.

## 6. Gate pendiente para congelar Corte 6
Paula debe validar acumulativamente el mismo build publicado:
1. entrada directa por perfiles;
2. Dashboard y hoja de ruta 44/40/38/33/1;
3. comparativo histórico;
4. tres refresh/focus sin crecimiento, reducción, cambio de periodo o salto;
5. Shoppers, perfil, certificación e histórico;
6. Portal Cliente y Portal Shopper;
7. Finanzas, Movimientos, Liquidaciones y Beneficios;
8. Reportes;
9. Reservas read-only/fuente pendiente.

Solo con `APROBADO C6` se congela la baseline.

## 7. Siguiente bloque después del freeze
`FUENTE EXACTA AGOSTO → RECONCILIACIÓN HR/PLATAFORMA → DISPONIBLES → POSTULACIONES → GATE MULTIROL → AUTORIZACIÓN DE WRITES/CUTOVER → READBACK → PRODUCCIÓN`.

## 8. Estado seguro
DEV técnicamente PASS y pendiente de validación humana acumulativa. Producción intacta. La autorización DEV ya fue consumida y no habilita nuevas mutaciones.