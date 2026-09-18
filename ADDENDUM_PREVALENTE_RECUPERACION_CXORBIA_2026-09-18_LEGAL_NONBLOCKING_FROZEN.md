# ADDENDUM PREVALENTE — LEGAL / CONSENTIMIENTO NO BLOQUEANTE

**Fecha:** 2026-09-18  
**ID:** `CXORBIA-RECOVERY-LEGAL-NONBLOCKING-20260918`  
**Estado:** `FROZEN_PREVALENT`  
**Iteración:** I3 — Functional Closure  
**Producción:** `DO_NOT_TOUCH_UNTIL_I4_AUTHORIZATION`

## Decisión explícita de Paula
La cláusula legal, términos de uso, confidencialidad o consentimiento legal **NO pueden bloquear**:
- login;
- navegación;
- pruebas live/human;
- cierre I3;
- elegibilidad I4;
- operación productiva después del go-live.

## Regla técnica
El estado legal permanece **observable y registrable**, pero no es un access gate.
- La plataforma puede leer la versión legal y el receipt del proveedor.
- La aceptación humana puede registrarse cuando corresponda.
- Nunca se autoacepta ni se fabrica un receipt.
- La ausencia, desactualización o error del receipt no impide entrar ni usar la plataforma.
- Fallos del proveedor legal se registran como observabilidad, no como bloqueo funcional/productivo.
- No se usa localStorage/sessionStorage como autoridad legal.

## Cambio P0 focal autorizado
Owners:
- `app/app.js`
- `app/adapters/cxorbia-legal-runtime-http-v1.js`

`CX.app.enter()` deja de consultar legal como condición de entrada. El runtime legal queda en modo `accessBlocking=false`; su preload es no bloqueante.

## Efecto sobre aceptación I3
Las pruebas Admin/Shopper/Cliente no pueden seleccionar fixtures según receipt legal ni detenerse por modal legal. Deben probar autenticación, identidad, HR, perfil, KPIs, histórico, flujos y visualización independientemente del estado legal.

## Precedencia
Este addendum sustituye exclusivamente cualquier regla anterior que convirtiera aceptación legal en gate de acceso, de prueba o de promoción. No altera contratos de autenticación, identidad, HR, persistencia, ACK remoto, idempotencia ni exactitud del artifact.

## Producción
Esta decisión **no autoriza I4 ni toca producción**. Garantiza que, cuando I4 sea autorizado después del cierre funcional/visual, el consentimiento legal no sea condición bloqueante.
