# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2A-PRODUCTION-READONLY-PASS-48`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**Score:** `98/100`

## Plan formal
I1–I4 PASS/FROZEN = 85. R1=PASS 2, R2=PASS 3, R3=PASS 3, R4=PASS 2, G1=PASS 3, G2=ACTIVE 2.

## G2-A — PASS
`PRODUCTION_REMOTE_READONLY_SMOKE_PASS_WITH_FROZEN_SHOPPER_REUSE`. Staff/Admin fresh run `32411160766`; Client fresh run `32411411249` y `PASS_CLIENT_SINGLE_LOGIN_AND_ROUTE_RENDER`; Shopper exact identity/profile/membership/crosswalk/history/historyE2E permanece FROZEN_REUSE. El combined multirole hold fue deuda de credencial histórica del harness y no P0 del producto. No reset de password, no writes, no deploy, no rebuild, no merge.

## G2-B — ÚNICO FRENTE RESTANTE
`LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE`. La prueba funcional integral se realizará **dentro de la misma plataforma productiva** `https://cxorbia-backend-dev.web.app`; no en clon, emulador, otra plataforma ni ambiente paralelo. Paula podrá ingresar y observar el recorrido mientras se ejecutan datos exclusivamente ficticios/sintéticos y registrar observaciones.

Cobertura obligatoria: hoja de ruta/navegación; acceso administrativo; acceso shopper; perfil, membership, crosswalk, histórico y certificaciones; visitas disponibles y propias; cliente; HR viva actual e histórica; ciclo de visita (postulación, reserva, asignación, agenda, reprogramación, cancelación); cuestionario/evidencias; financiero (liquidación y estados de pago, sin pagos reales); reload/new-tab; aislamiento tenant/project/cross-tenant; deduplicación/conflictos HR↔plataforma; notificaciones/observabilidad.

Todo registro sintético debe usar prefijo `CXORBIA_E2E_SYNTH_`, cleanup obligatorio y readback posterior. **G2-B está PENDING_NARROW_WRITE_AUTHORIZATION**: todavía no autoriza business/data writes, HR externo, Auth create/reset, pagos reales, Make/Gemini, deploy, rebuild ni merge.

## Regla de cierre
No emitir `PRODUCTION_FROZEN_PASS_100` hasta ejecutar G2-B y completar observación visible, cleanup y readback. No crear G3 ni nueva metodología.
