# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G1-PRODUCTION-CUTOVER-EXECUTED-47`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**Score:** `98/100`

## Plan formal
I1–I4 PASS/FROZEN = 85. R1=PASS 2, R2=PASS 3, R3=PASS 3, R4=PASS 2, G1=PASS 3, **G2=ACTIVE 2**.

## G1 — PASS
`PRODUCTION_CUTOVER_EXECUTED`. Producción canónica: `https://cxorbia-backend-dev.web.app`, mismo source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`, sin rebuild, provider redeploy, merge ni business/data writes. `tya-plataforma` permanece intacto.

## G2 — ACTIVE · dos subgates dentro del mismo bloque
### G2-A — PRODUCTION_REMOTE_MULTIROLE_READONLY_SMOKE
Validación remota fresca, read-only, sobre la URL productiva real. Debe comprobar URL/entrypoint, Staff/Admin/Shopper/Cliente, HR viva e historia, shoppers/visitas, Finanzas, reload/new-tab, tenant/project/cross-tenant, no demo/stale fallback, sincronización HR/plataforma y observabilidad. No crea ni modifica datos.

### G2-B — LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE
Requisito de cierre solicitado por Paula. La prueba funcional integral se realizará **dentro de la misma plataforma productiva** `https://cxorbia-backend-dev.web.app`; no en un clon, emulador, otra plataforma ni ambiente paralelo. Paula podrá ingresar y observar el recorrido mientras se ejecutan pruebas con datos exclusivamente ficticios/sintéticos y registrar observaciones.

Cobertura obligatoria: hoja de ruta/navegación; acceso administrativo; acceso shopper; perfil, membership, crosswalk, histórico y certificaciones; visitas disponibles y propias; cliente; HR viva actual e histórica; ciclo de visita (postulación, reserva, asignación, agenda, reprogramación y cancelación); cuestionario/evidencias; financiero (liquidación y estados de pago, sin ejecutar pagos reales); persistencia reload/new-tab; aislamiento tenant/project/cross-tenant; deduplicación/conflictos HR↔plataforma; notificaciones/observabilidad.

Todo registro sintético deberá quedar identificado con prefijo `CXORBIA_E2E_SYNTH_`, tener cleanup obligatorio y readback posterior que pruebe que la plataforma quedó limpia. **G2-B está PENDING_NARROW_WRITE_AUTHORIZATION**: el pedido actual no autoriza business/data writes, HR externo, Auth create/reset, pagos reales, Make/Gemini, deploy, rebuild ni merge.

## Regla de cierre
No emitir `PRODUCTION_FROZEN_PASS_100` hasta que G2-A sea PASS y G2-B se ejecute en la misma plataforma con autorización estrecha de datos sintéticos, observación visible para Paula, cleanup y readback final. Esto no crea G3 ni un nuevo roadmap: son subgates del G2 ya existente.

## Continuidad
G1 y todos los PASS previos permanecen FROZEN_REUSE. Una pausa, timeout o nueva conversación no autoriza repetirlos. El continuity lock gobierna.
