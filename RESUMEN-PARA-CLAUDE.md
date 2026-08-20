# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37`

## Continuidad canónica 2026-08-19

Se corrigió el drift de continuidad que podía hacer que una conversación nueva volviera al checkpoint de julio. El estado único es `I4_PROTECTED_RUNTIME_CONVERGENCE_AND_REAL_PHASE_A_E2E`, con score formal **60% / 40%**. I1/I2/I3 y PASS I4 ya cerrados permanecen congelados.

**No generar nueva candidata, no reauditar y no reconstruir Auth, Shopper, Finanzas, multi-proyecto, documentos, reservas o Academia.** La siguiente validación nace exclusivamente del runtime protegido `app/index-backend-dev.html`.

## Qué debe preservar Claude/prototipo

- `app/index.html` es demo/artefacto y no demuestra autoridad provider-backed.
- source-safe/R18D mantiene referencias protegidas por diseño.
- `app/index-backend-dev.html` es el carril real de Phase A: Auth → claims/membership → identidad exacta → perfil protegido → HR viva → overlays canónicos → `CX.data` → módulos.
- Finanzas no se reconstruye: Mayo 44/44 pagadas; Junio 2/44, 42 pendientes y Q451; `liquidada != pagada`.
- Shopper UI no se reconstruye por ausencia de identidad en source-safe; primero se prueba composición protegida real.
- Multi-proyecto/no-code permanece cerrado y Cinépolis configurable por `tenantId + projectId`.

## Cuándo sí tocar frontend

Solo si el E2E de la misma build protegida produce una diferencia visible reproducible, localizada por archivo/módulo, y se demuestra que no es un problema de autoridad de datos/runtime. No hacer rediseño preventivo ni parchear datos desde UI.

La brecha antigua de export PDF/XLSX/PPTX en `modules/cliente-extra.js` se conserva como hallazgo a clasificar contra el alcance Phase A; no reabre backend ni bloquea por sí sola la convergencia I4.

## Academia

Academia ya existe. No abrir un bloque de reconstrucción. La alineación final de manuales, cursos, estados, certificación y pagos ocurre después de demostrar el runtime real para no documentar capacidades no probadas.
