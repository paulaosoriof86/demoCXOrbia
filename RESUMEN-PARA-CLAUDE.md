# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37`

I1/I2/I3/I4-A/I4-B PASS/frozen. I4-C source/readiness suficiente para Phase A inicial; Make/HR runtime diferido. I4-D Finanzas e I4-E multi-proyecto/no-code cerrados por reutilización. **No reconstruir módulos ya trabajados.**

## Porcentaje
Score formal del plan: **60% / 40%**; no usarlo como sinónimo de readiness de producción. I4 vale 25 puntos indivisibles: cuando el runtime real + validación visible cierren I4, el score pasa a **85%**. I5 lleva a **100%**.

## Hallazgo que explica la regresión visual
El artefacto sí tenía los módulos y contratos, pero se mezclaron carriles de validación:

- `app/index.html` = demo/artefacto; no prueba identidad ni Auth provider-backed.
- source-safe/R18D = datos sanitizados; los Shoppers quedan como referencias protegidas y no deben mostrar identidad completa.
- `app/index-backend-dev.html` = runtime canónico protegido que debe probar Phase A real.

Por eso no corresponde corregir la UI por ausencia de datos que en realidad pertenecen a una autoridad protegida no compuesta todavía en ese carril.

## Finanzas — preservar
No modificar/reconstruir `modules/finanzas.js`, `core/backend-cxdata-finance-read.js`, `adapters/tya-financial-canonical-source-safe-adapter.js` ni `adapters/tya-canonical-finance-read-model-v2.js` desde backend.

Verdad obligatoria visible en el runtime protegido:
- Mayo 2026: 44/44 pagadas.
- Junio 2026: 2/44 pagadas; 42 pendientes.
- Junio confirmado: Q451.
- `liquidada != pagada`.

Un carril viejo que muestre `paidConfirmed:0` no es autoridad vigente.

## Shoppers — preservar UI, verificar composición real
El código de identidad exacta/composición ya existe. La brecha que debe probarse no es “crear Shoppers de nuevo”, sino que, tras login real, el runtime protegido entregue a los módulos el perfil autorizado exacto, histórico, certificaciones y beneficios/pagos correspondientes. No matching por nombre/email visual.

## Multi-proyecto/no-code — cerrado por reutilización
Wizard, configuración, certificación, documentos, reservas/agendamiento y contratos por `tenantId + projectId` ya existen. Cinépolis continúa como proyecto configurable, no regla global.

## Brecha frontend concreta observada por gate
`modules/cliente-extra.js` tiene un gate antiguo que actualmente no encuentra exportaciones PDF/XLSX/PPTX. Clasificar contra el alcance Phase A y corregir solo si sigue siendo requisito vivo. No usar ese fallo para reabrir HR, Shoppers, Finanzas o multi-proyecto.

## Frontera activa
`I4_PROTECTED_RUNTIME_CONVERGENCE_AND_REAL_PHASE_A_E2E`.

Claude/prototipo debe esperar hallazgos visibles exactos de ese runtime; no iniciar rediseño ni reconstrucción preventiva.

## Academia
Academia ya existe. Alinear contenido/rutas solo después de demostrar el runtime real; reflejar estados reales de identidad, certificación, liquidación/pago y capacidades efectivamente activas.