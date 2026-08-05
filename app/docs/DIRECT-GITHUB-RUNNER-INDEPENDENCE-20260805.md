# Carril directo GitHub — independencia de Codex

## Hallazgo corregido

La dependencia de Codex era una lectura desactualizada. El repositorio ya dispone de:

- `CXORBIA_ATOMIC_APPLY_RUNNER`;
- `CXORBIA_READONLY_POST_GATES_RUNNER`;
- contratos y gates fail-closed;
- commit/push directo sobre la rama viva;
- evidencia y estado observable.

Codex queda como herramienta opcional. No es requisito para auditoría, aplicación, gates o continuidad.

## Uso obligatorio

ChatGPT prepara y audita el delta. El runner controlado ejecuta el commit/push atómico. Los gates se ejecutan por el runner read-only. Paula no usa terminal, PowerShell ni paquetes manuales.

## Seguridad

Los runners no autorizan deploy, merge, producción, datos, pagos, Make o Gemini. Toda ampliación de alcance requiere contrato, gate y autorización expresa.
