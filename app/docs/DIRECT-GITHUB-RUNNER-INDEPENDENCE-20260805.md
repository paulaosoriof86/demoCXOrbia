# Carril directo GitHub — independencia de Codex

## Hallazgo corregido

La dependencia de Codex era una lectura desactualizada. El repositorio ya dispone de:

- `CXORBIA_ATOMIC_APPLY_RUNNER`;
- `CXORBIA_READONLY_POST_GATES_RUNNER`;
- contratos y gates fail-closed;
- commit/push directo sobre la rama viva;
- evidence artifacts y estados observables.

Codex queda como herramienta opcional. No es requisito para auditoría, aplicación, gates o continuidad.

## Prueba ejecutada

El bloque V7.2-P0F1 fue completado sin Codex:

- corrección de `AGENTS.md`: `39098a97aac2ee1c064026adda743b759bad5103`;
- causa raíz transitoria `.tmp/` corregida: `ff55c4d1c2c4d1676d0e53a2ce1a73d762df1664`;
- aplicación atómica: run `31009497155`;
- commit funcional: `fb8d8897bb24f2f634bc5594dca4e8d610daf910`;
- gates read-only: run `31009570981`;
- resultado: `PASS_READONLY_POST_GATES`.

## Uso obligatorio

ChatGPT prepara y audita el delta. El runner controlado ejecuta el commit/push atómico. Los gates se ejecutan por el runner read-only. Paula no usa terminal, PowerShell ni paquetes manuales.

## Seguridad

Los runners no autorizan deploy, merge, producción, datos, pagos, Make o Gemini. Toda ampliación de alcance requiere contrato, gate y autorización expresa.
