# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-01  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `P0_PROVEN__DIRECT_ROLE_ENTRY_REPLACED_BY_TECHNICAL_AUTH_FORM__DEV_BLOCKED__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: intacta; no tocar sin gate explícito.

## 2. Fuentes obligatorias vigentes
1. maestros y addenda activos;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
4. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`;
5. `ADDENDUM-MAESTRO-C6-BASELINE-CANONICA-UNICA-Y-CUTOVER-20260801.md`;
6. `ADDENDUM-MAESTRO-C6-P0-REGRESION-ENTRADA-DIRECTA-20260801.md`, prevalente para la entrada visible;
7. `app/app.js` como autoridad visual del selector directo por perfiles;
8. `app/adapters/tya-dev-entry-auth-gate-v1.js` como evidencia de la regresión que eliminó los perfiles e insertó credenciales;
9. evidencia C6 de HR, dominio, Finanzas, Shopper y Auth real;
10. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, CAMBIOS-BACKEND, PR #7 y HEAD vivo.

## 3. Baseline protegida que no se reabre
- Corte 3 FROZEN; R17N 1,406/1,406.
- Corte 5: 14 periodos/616 visitas PASS.
- HR viva, histórico, shoppers, identidad, Finanzas/Liquidaciones, portal Shopper y Reservas fail-closed preservados.
- Conteos canónicos: julio 44 = GT 34 + HN 10; realizadas 40; cuestionario 38; submitidas 33; fuera de rango accionable 1.

## 4. P0 vigente — entrada humana incorrecta
La visualización publicada muestra Usuario + Contraseña. Eso contradice el contrato funcional aprobado y usado durante el desarrollo:
- Administración / Coordinación;
- Portal del Cliente;
- Shopper / Evaluador;
- perfiles adicionales configurados cuando corresponda.

`app/app.js` conserva ese selector directo. El adapter técnico lo elimina mediante `removeGenericRolePicker(card)` y reemplaza la experiencia por `cxDevEntryAuth`.

## 5. Prevalencia de evidencia
- El PASS con staff/shopper reales demuestra que el carril técnico de Firebase Auth funciona.
- Ese PASS NO valida la experiencia humana de entrada.
- La captura de Paula demuestra un P0 visual reproducible en DEV.
- Corte 6 no puede congelarse hasta restaurar los perfiles directos y repetir la validación humana acumulativa.

## 6. Root fix obligatorio
`RESTORE DIRECT ROLE ENTRY FOR HUMAN VISUAL → ISOLATE USER/PASSWORD TO EXPLICIT TECHNICAL E2E → LOCAL HUMAN SMOKE → TECHNICAL AUTH E2E → GOLDEN ACCUMULATIVE GATES → NEW EXPLICIT HOSTING DEV AUTHORIZATION → HUMAN VISUAL → FREEZE C6`.

No crear nueva plataforma, rama, PR, proyecto Firebase, Hosting, candidata ni metodología. No tocar `app/modules/*` ni `app/core/*` para este fix.

## 7. Después del freeze
Fuente exacta de agosto → visitas disponibles → postulaciones → gate multirol → autorización específica de writes/cutover → readback → producción.

## 8. Seguridad
Diagnóstico y documentación sin writes de proveedor, sin merge y sin producción. El Hosting DEV actual contiene el P0 visible; producción permanece intacta.