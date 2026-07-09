# Cambios - Generator minimal sanitized input from manifest TyA

Fecha: 2026-07-09  
Bloque: generador de input minimo desde manifest/source-safe  
Estado: documentado y seguro.

## Archivos creados

1. `tools/contracts/tya-minimal-sanitized-input-from-manifest.mjs`
   - Genera payload Level 0 manifest-only desde contratos/manifest source-safe.
   - No llama HR, no escribe Firestore, no importa, no despliega.
   - Produce projectConfig, periods e issues bloqueantes.

2. `app/docs/GENERATOR-MINIMAL-SANITIZED-INPUT-FROM-MANIFEST-TYA-20260709.md`
   - Documentacion funcional del generador.

3. `app/docs/CAMBIOS-GENERATOR-MINIMAL-SANITIZED-INPUT-FROM-MANIFEST-TYA-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Produce el primer input validable para bridge real-data preview -> CX.data, usando estructura HR real/documentada sin PII.

## Trabajo previo recuperado

- HR viva multi-tab.
- 28 tabs operativos.
- Dashboards excluidos.
- Proyecto Cinepolis normal configurable.
- Issues del dry-run: DPI, questionnaire duplicate, shopper canonical mismatch, JUNIO 26 HN y liquidaciones.

## Claude/prototipo

Pendientes derivados:

- UI debe distinguir Level 0 manifest-only de visitas reales.
- No debe mostrar visitas reales si solo hay Level 0.
- Proyecto puede mostrarse como configurado/preview, no importado.
- Academia debe explicar niveles de preview.

## Bloqueos

- Level 0 no visualiza visitas reales.
- Falta Level 1 con visitas sanitizadas.
- Runtime switch no autorizado.
- Produccion bloqueada.

## Siguiente bloque recomendado

Buscar/ubicar outputs locales o documentados que permitan generar Level 1 visitas sanitizadas sin pedir HR de nuevo. Si no existen, preparar instrucciones minimas para ejecutar generador local seguro cuando Paula tenga computador, sin exponer PII.

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
