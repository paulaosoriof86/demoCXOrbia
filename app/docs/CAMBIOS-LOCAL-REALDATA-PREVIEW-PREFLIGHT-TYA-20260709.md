# Cambios - Local real-data preview preflight TyA

Fecha: 2026-07-09  
Bloque: paquete local minimo para Paula cuando tenga computador  
Estado: documentado y seguro.

## Archivos creados

1. `tools/contracts/tya-local-realdata-preview-preflight.mjs`
   - Orquestador seguro local.
   - Ejecuta locator, Level 0, validaciones, Level 1 si hay input, bridge, runtime switch gate y rollback/smoke.
   - No llama HR, no escribe, no importa, no despliega, no cambia runtime.

2. `app/docs/LOCAL-REALDATA-PREVIEW-PREFLIGHT-TYA-20260709.md`
   - Documentacion funcional del preflight.

3. `app/docs/CAMBIOS-LOCAL-REALDATA-PREVIEW-PREFLIGHT-TYA-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Reduce el trabajo manual futuro y deja una ruta rapida para validar Level 0/Level 1 con outputs reales/sanitizados de TyA, sin reiniciar ni pedir HR de nuevo.

## Trabajo previo recuperado

- HR viva multi-tab.
- Full-flow local previo.
- Level 0 manifest-only.
- Locator Level 1.
- Generador Level 1.
- Bridge real-data preview.
- Runtime switch gate.
- Rollback/smoke checklist.
- Bloqueos de dry-run.

## Claude/prototipo

Pendientes derivados:

- UI debe diferenciar Level 0, Level 1, staging, importado y produccion.
- Level 1 no debe mostrarse como import real.
- Cinepolis debe seguir como proyecto normal configurable.
- Academia debe explicar preflight, niveles y revision.

## Bloqueos

- Falta ejecutar localmente cuando Paula tenga computador.
- Si no aparece output sanitizado local, falta generarlo con herramienta segura.
- Runtime switch sigue bloqueado.
- Produccion bloqueada.

## Siguiente bloque recomendado

Preparar el prompt/comando unico para Paula/Codex local cuando tenga computador, o seguir adelantando Level 2 documental: shoppers/certificaciones/liquidaciones sanitizadas.

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
