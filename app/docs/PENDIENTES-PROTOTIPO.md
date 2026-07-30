# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `R17N_FINAL_DEV_MATERIALIZED_1406__CXDATA_TECH_PASS__EXISTING_HOSTING_VISUAL_AUTH_PREREQUISITE__DEPLOY0`

## 1. Cerrado / no reabrir
- M1 / Corte 1 / Corte 2A: FROZEN/APROBADO.
- Corte 3: `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- No V183/R33; no nueva candidata por rutina.
- HR actual hasta julio: 14 periodos /616 visitas /208 refs.
- Identidad shopper actual: 208/208 con target →194 perfiles canónicos únicos.
- R17N FINAL materialización DEV: 1,406 writes autorizados y 1,406/1,406 readback PASS.
- P0 CX.data periodo/proyecto: corregido y re-smoke PASS.

## 2. Backend materializado
- foundation 16;
- perfiles legacy 120;
- perfiles HR actuales 5;
- certificaciones 77;
- visitas 616;
- controles de liquidación 572.

## 3. Hosting DEV existente / visual Corte 5
- Hosting correcto ya existe: `cxorbia-backend-dev.web.app`, target `cxorbia-dev`.
- Nuevo Hosting/Firebase: no.
- Redeploy autorizado: máximo 1.
- Redeploy ejecutado: 0.
- Autorización consumida: no.

El preflight detuvo antes del deploy porque Firestore protegido exige Firebase Auth/claims y el login visible actual es selector de rol local, no autenticación provider. No se publican credenciales/tokens ni PII como workaround.

## 4. Pendiente inmediato
`CORTE6 AUTH/RBAC PREP READ-ONLY/OFFLINE → reconciliar Auth existente + claims + Rules + login seguro → autorización provider mínima → usar el MISMO Hosting DEV y el redeploy ya autorizado → validación visual real`.

No pedir otra autorización de Hosting mientras siga 0/1.

## 5. Pendiente frontend/Claude
No nueva candidata. Antes de producción el login debe autenticar Firebase realmente y traducir claims a sesión/rol/persona/scope. Sin principal/claims válidos → fail-closed.

## 6. HOLD preservado
Tenant update1, existing profile updates22, legacy holds7, cert hold1, Agosto HN, deletes, pagos/lotes, Make/Gemini/Storage reales.

## 7. Backlog P1/P2 no bloqueante
PDF/gráficas, Excel/formato, reportKit/copy y equivalencia de exportaciones.

## 8. Academia/manuales
Snapshot vs HR viva; perfil real vs referencia HR vs Auth; source-safe vs PII; autenticación vs selección de rol; stable keys; preflight fail-closed; materialización/readback; certificación carryover; liquidación/control ≠ pago.

## 9. Estado seguro
Firestore writes históricos: 1,406. Bloque actual: Hosting deploy=0; Auth/Storage/HR/legacy writes=0; Rules/Functions deploy=0; deletes=0; pagos/lotes=0; merge=false; producción=false; Make/Gemini=0.
