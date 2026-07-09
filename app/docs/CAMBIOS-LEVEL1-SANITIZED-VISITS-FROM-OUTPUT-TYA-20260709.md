# Cambios - Level 1 sanitized visits from output TyA

Fecha: 2026-07-09  
Bloque: generador Level 1 desde reporte HR source-safe/sanitizado  
Estado: documentado y seguro.

## Archivos creados

1. `tools/contracts/tya-level1-sanitized-visits-from-output.mjs`
   - Generador seguro de payload Level 1 con visitas sanitizadas.
   - No llama HR, no escribe Firestore, no importa, no despliega.
   - Acepta formatos flexibles de outputs locales.

2. `app/docs/LEVEL1-SANITIZED-VISITS-FROM-OUTPUT-TYA-20260709.md`
   - Documentacion funcional del generador.

3. `app/docs/CAMBIOS-LEVEL1-SANITIZED-VISITS-FROM-OUTPUT-TYA-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Permite generar el input que faltaba para pasar de Level 0 manifest-only a Level 1 visitas sanitizadas en DEV preview.

## Trabajo previo recuperado

- HR viva multi-tab.
- Full-flow local previo.
- Level 0 manifest-only.
- Contrato Level 1.
- Reglas HR/Q1/Q2.
- Bloqueantes de dry-run.
- Cinepolis como proyecto normal configurable.

## Claude/prototipo

Pendientes derivados:

- UI debe diferenciar Level 1 de import real.
- Level 1 puede mostrar visitas sanitizadas, pero no shoppers completos.
- Copy debe decir preview/staging.
- Academia debe explicar que Level 1 excluye PII y requiere revision antes de import.

## Bloqueos

- Falta ejecutar con output local sanitizado.
- Runtime switch sigue bloqueado.
- Produccion bloqueada.
- Shoppers completos, certificaciones mapeadas y liquidaciones reales quedan para Level 2.

## Siguiente bloque recomendado

Crear paquete local minimo para Paula cuando tenga computador: ejecutar locator, generar Level 0, generar Level 1 si encuentra output, validar payload, sin exponer PII y sin deploy.

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
