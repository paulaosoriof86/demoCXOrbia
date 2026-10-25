# REGISTRO — CORRECCIÓN DEL CARRIL ATÓMICO DE EMPALME

Fecha: 2026-07-17

## Corrección autorizada

Paula autorizó corregir el addendum y `AGENTS.md` para permitir operaciones Git nativas internas exclusivamente dentro de `APPLY_DELTA_DIRECTLY`.

## Diagnóstico cerrado

La prohibición absoluta de blobs/trees confundía:

- transporte manual o fragmentado, que sigue prohibido;
- objetos internos de un commit Git atómico, que quedan permitidos bajo controles estrictos.

## Regla vigente

Se permiten blobs, tree, commit y ref solo cuando parten del HEAD vivo, forman un único commit, no crean rama/PR/workflow, actualizan por fast-forward sin force y verifican diff/HEAD posterior.

## Estado V159

V159 fue empalmada en el commit `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`. La corrección metodológica posterior no reabre la auditoría ni repite el empalme.

## Estado seguro

Sin merge, deploy, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
