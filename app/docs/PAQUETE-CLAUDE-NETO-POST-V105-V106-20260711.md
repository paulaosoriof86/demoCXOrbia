# Paquete Claude neto — post V105 / build interno V106

El paquete vigente reemplaza instrucciones ambiguas o demasiado amplias de rondas anteriores. Contiene únicamente:

- auditoría forense de la candidata recibida;
- matriz no reabrir/completar/rechazar;
- contrato explícito y profundo de Academia;
- instrucciones exactas por prioridad;
- prompt único;
- evidencia estructural y semántica.

## Regla

Claude trabaja sobre la candidata frontend recibida, no sobre R5/R6. Debe conservar puntos HECHO y corregir solo el pendiente neto.

## Academia

La definición está cerrada: scope opcional por tenant/proyecto/país/rol/módulo/paquete/nivel, vacío=global; y creator/reviewer/approver autenticados con separación configurable. Ambos son requeridos.

## Backend replicable

Se traduce a producto: modos de fuente, llaves estables, reviewQueue, liquidación≠pago, práctica≠certificación, dry-run≠materialización, outbox≠envío, permisos contextuales, soft-delete/auditoría y estados del plan R6.

No contiene código backend ni solicita conectar Firebase.
