# Cambios - Level 1 sanitized visits output locator TyA

Fecha: 2026-07-09  
Bloque: buscar/ubicar outputs locales para Level 1 visitas sanitizadas  
Estado: documentado y seguro.

## Archivos creados

1. `backend/contracts/tya-level1-sanitized-visits-phase-a-v1.json`
   - Contrato de visitas sanitizadas Level 1 para DEV preview.
   - Define campos obligatorios, estados permitidos, reglas HR -> status y GO/NO-GO.

2. `tools/contracts/tya-level1-sanitized-visit-output-locator.mjs`
   - Locator seguro de outputs locales/documentados.
   - No llama HR, no escribe Firestore, no importa, no despliega.
   - Busca JSONs candidatos y detecta marcadores PII/secrets.

3. `app/docs/LEVEL1-SANITIZED-VISITS-OUTPUT-LOCATOR-TYA-20260709.md`
   - Documentacion funcional del locator.

4. `app/docs/CAMBIOS-LEVEL1-SANITIZED-VISITS-OUTPUT-LOCATOR-TYA-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Prepara el paso de Level 0 manifest-only a Level 1 visitas sanitizadas, sin pedir HR de nuevo.

## Trabajo previo recuperado

- HR viva ya documentada.
- Full-flow privado local previo.
- Staging canonico source-safe.
- Minimal sanitized input Level 0.
- Bridge real-data preview.
- Runtime switch gate.
- Bloqueos de dry-run.

## Claude/prototipo

Pendientes derivados:

- UI debe distinguir Level 0 y Level 1.
- Level 1 puede mostrar visitas sanitizadas, no shoppers reales completos.
- Copy debe decir preview/staging, no importado/produccion.
- Academia debe explicar por que Level 1 no incluye PII.

## Bloqueos

- Si no existe output local, falta generar Level 1 con herramienta local segura.
- Runtime switch no autorizado.
- Produccion bloqueada.

## Siguiente bloque recomendado

Crear generador Level 1 desde reporte HR source-safe/sanitizado si se encuentra, o preparar instruccion minima local para generarlo sin exponer PII.

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
