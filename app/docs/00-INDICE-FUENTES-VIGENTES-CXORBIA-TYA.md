# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-01  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_DIRECT_ROLE_ENTRY_HOSTING_DEV_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: intacta; no tocar sin gate y autorización específicos.

## 2. Fuentes obligatorias vigentes
1. maestros y addenda activos;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
4. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`;
5. `ADDENDUM-MAESTRO-C6-BASELINE-CANONICA-UNICA-Y-CUTOVER-20260801.md`;
6. `ADDENDUM-MAESTRO-C6-P0-REGRESION-ENTRADA-DIRECTA-20260801.md` como antecedente y prevención;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-DIRECT-ROLE-ENTRY-ROOT-FIX-EXECUTION-20260801.md`;
8. `evidence/CORTE6-DIRECT-ROLE-ENTRY-HOSTING-LATEST.json` como evidencia autoritativa vigente;
9. evidencia C6 de HR, dominio, Finanzas, Shopper, Reservas y Auth real;
10. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR #7 y HEAD vivo.

## 3. Baseline protegida que no se reabre
- Corte 3 FROZEN; R17N 1,406/1,406.
- Corte 5: 14 periodos/616 visitas PASS.
- HR viva, histórico, shoppers, identidad, Finanzas/Liquidaciones, portal Shopper, Reportes y Reservas fail-closed preservados.
- Conteos canónicos: julio 44 = GT 34 + HN 10; realizadas 40; cuestionario 38; submitidas 33; fuera de rango accionable 1.

## 4. Entrada humana — root fix publicado y PASS
El carril humano vuelve a utilizar el contrato aprobado del prototipo:
- Administración / Coordinación;
- Portal del Cliente;
- Shopper / Evaluador;
- perfiles adicionales configurados cuando corresponda;
- cero Usuario + Contraseña en la entrada de visualización.

`app/app.js` permanece como autoridad visual. El adapter evita que Auth integrada intercepte los botones únicamente en el carril humano. Firebase Auth real permanece aislado en el carril técnico E2E.

Decisión autoritativa:
`PASS_C6_HUMAN_DIRECT_ROLE_ENTRY_AND_ISOLATED_AUTH_EXISTING_HOSTING_DEV`.

## 5. Evidencia acumulativa
- Smoke humano local y remoto: PASS.
- Administración, Cliente y Shopper visibles: PASS.
- Usuario/Contraseña humana: ausente.
- Auth técnica staff y shopper local/remota: PASS.
- Staff: 616 visitas, refresh y nueva pestaña preservados.
- Shopper: 616 visitas, 1 visita propia, refresh y nueva pestaña preservados.
- Hosting DEV: exactamente 1 deploy.
- Autorización: consumida con PASS.
- Cero usuarios creados, Auth writes, cambios de contraseña, Firestore writes, Rules, Cloud Run, HR writes, proyectos Firebase o sitios Hosting nuevos.
- Merge=false; producción=false.

## 6. Gate vivo
`VALIDACIÓN HUMANA ACUMULATIVA DEL MISMO BUILD PUBLICADO → APROBADO → FREEZE C6`.

Revisar en una sola sesión:
1. entrada directa por perfiles;
2. Dashboard y hoja de ruta 44/40/38/33/1;
3. histórico/comparativo;
4. tres refresh/focus sin crecimiento, reducción ni saltos;
5. Shoppers, perfil, certificación e histórico;
6. Portal Cliente y Portal Shopper;
7. Finanzas, Movimientos, Liquidaciones y Beneficios;
8. Reportes;
9. Reservas read-only/fuente pendiente.

## 7. Después del freeze — prioridad del 1 de agosto
`FUENTE EXACTA AGOSTO → RECONCILIACIÓN HR/PLATAFORMA → VISITAS DISPONIBLES → POSTULACIONES → GATE MULTIROL → AUTORIZACIÓN ESPECÍFICA DE WRITES/CUTOVER → READBACK → PRODUCCIÓN`.

No copiar julio ni inventar visitas. La autorización consumida cubrió únicamente el redeploy DEV ya ejecutado.

## 8. Seguridad
Hosting DEV actualizado una vez. Producción permanece intacta. No existe autorización vigente para merge, producción, writes operativos, Make, Gemini, pagos o Reservas.