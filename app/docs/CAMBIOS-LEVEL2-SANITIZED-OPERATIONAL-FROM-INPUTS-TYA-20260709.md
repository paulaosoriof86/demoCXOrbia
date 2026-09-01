# Cambios - Level 2 sanitized operational from inputs TyA

Fecha: 2026-07-09  
Bloque: generador Level 2 desde Level 1 + outputs sanitizados  
Estado: documentado y seguro.

## Archivos creados

1. `tools/contracts/tya-level2-sanitized-operational-from-inputs.mjs`
   - Generador seguro de payload Level 2 operacional.
   - Combina Level 1 con shoppers/certificaciones/liquidaciones sanitizadas opcionales.
   - No llama HR, no conecta base vieja, no escribe, no importa, no despliega.

2. `app/docs/LEVEL2-SANITIZED-OPERATIONAL-FROM-INPUTS-TYA-20260709.md`
   - Documentacion funcional del generador.

3. `app/docs/CAMBIOS-LEVEL2-SANITIZED-OPERATIONAL-FROM-INPUTS-TYA-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Permite preparar una vista operacional DEV preview con visitas, shoppers opacos/sanitizados, certificaciones preservadas y liquidaciones como control de pago.

## Trabajo previo recuperado

- Level 1 visitas sanitizadas.
- Shoppers historicos como referencias, no PII.
- Certificaciones ya presentadas como preservacion.
- Liquidaciones de junio como control de pago.
- Plataforma actual/legacy como trazabilidad, no base a copiar.

## Claude/prototipo

Pendientes derivados:

- UI debe mostrar Level 2 como preview operacional, no import real.
- Shoppers opacos deben mostrarse claramente como pendientes de revision si aplica.
- Certificaciones preservadas no deben pedirse de nuevo salvo regla.
- Liquidaciones deben mostrarse como control, no pagado final.
- Academia debe explicar sanitizacion y mapeo de certificaciones/pagos.

## Bloqueos

- Falta ejecutar localmente con Level 1 real/sanitizado.
- Falta actualizar preflight local para incluir Level 2 automatico.
- Runtime switch sigue bloqueado.
- Produccion bloqueada.

## Siguiente bloque recomendado

Actualizar `tools/contracts/tya-local-realdata-preview-preflight.mjs` para generar y validar Level 2 cuando Level 1 exista.

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
