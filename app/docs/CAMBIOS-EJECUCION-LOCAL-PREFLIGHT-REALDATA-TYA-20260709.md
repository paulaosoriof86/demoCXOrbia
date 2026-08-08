# Cambios - Ejecucion local preflight real-data TyA

Fecha: 2026-07-09  
Bloque: instruccion corta para ejecucion local cuando Paula tenga computador  
Estado: documentado y seguro.

## Archivos creados

1. `tools/contracts/tya-local-realdata-preview-preflight.ps1`
   - Helper PowerShell para ejecutar el preflight local.
   - No hace deploy, produccion, import, writes ni runtime switch.

2. `app/docs/EJECUCION-LOCAL-PREFLIGHT-REALDATA-TYA-20260709.md`
   - Instruccion corta de ejecucion local.
   - Incluye comando minimo, comando con input sanitizado y comando con inputs adicionales.

3. `app/docs/CAMBIOS-EJECUCION-LOCAL-PREFLIGHT-REALDATA-TYA-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Reduce pasos manuales para Paula y deja listo un flujo local sencillo para validar informacion real/sanitizada TyA antes de pedir GO para runtime DEV preview.

## Trabajo previo recuperado

- Preflight Level 0/1/2.
- GO/NO-GO runtime DEV preview.
- Bridge real-data preview.
- Runtime switch gate.
- Rollback/smoke.
- Reglas de no PII/no base vieja.

## Claude/prototipo

Pendientes derivados:

- UI debe diferenciar Level 0, Level 1, Level 2 y produccion.
- No prometer datos reales importados si solo hay preflight.
- Academia debe explicar el preflight local y sus limites.

## Bloqueos

- Falta ejecutar localmente con computador.
- Runtime switch sigue bloqueado.
- Produccion bloqueada.
- No copiar base vieja ni datos sensibles.

## Siguiente bloque recomendado

Abrir conversacion de continuidad antes de seguir con cambios, porque la conversacion actual esta larga y ya hay suficientes bloques documentados para retomar sin perder contexto.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin runtime switch.
- Sin modulos modificados.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
