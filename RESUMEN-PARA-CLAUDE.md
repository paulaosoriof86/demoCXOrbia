# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37`

## Estado único vigente

`I4_PROTECTED_RUNTIME_CONVERGENCE_AND_REAL_PHASE_A_E2E` — **60% formal / 40% pendiente**. I1/I2/I3 y PASS I4 cerrados permanecen congelados. No generar nueva candidata, no reauditar y no reconstruir Auth, Shopper, Finanzas, multi-proyecto, documentos, reservas o Academia.

## Causa runtime localizada en backend, no en frontend

En `app/index-backend-dev.html` coexistían el watcher HR vivo y la composición protegida. El watcher podía reaccionar al Auth y aplicar HR source-safe sobre `CX.data` antes de que el bridge Auth + Firestore + HR terminara de establecer la autoridad canónica. El resultado podía ser una experiencia intermitentemente incompleta aunque los módulos ya existieran.

La corrección está en `app/adapters/tya-live-source-refresh-watch-v2.js`: en el carril humano autenticado el refresh HR queda bloqueado hasta que `CX_PROTECTED_AUTH_HR_AUTHORITY` esté aplicado; luego continúa sin degradar la fuente a `source_safe_preview`.

## Qué debe preservar Claude/prototipo

- `app/index-backend-dev.html` es el carril real de Phase A: Auth → claims/membership → identidad exacta → perfil protegido → HR viva → overlays canónicos → `CX.data` → módulos.
- `app/index.html` sigue siendo demo/artefacto, no prueba provider-backed.
- source-safe mantiene referencias protegidas por diseño y no debe usarse para juzgar ausencia de perfil Shopper.
- Finanzas no se reconstruye: Mayo 44/44; Junio 2/44, 42 pendientes y Q451; `liquidada != pagada`.
- Multi-proyecto/no-code permanece cerrado; Cinépolis configurable por `tenantId + projectId`.
- No tocar módulos UI para compensar una autoridad backend incompleta.

## Cuándo sí tocar frontend

Solo si el E2E de la misma build protegida, después del gate single-authority, produce una diferencia visible reproducible localizada por archivo/módulo y se demuestra que no proviene de Auth/datos/runtime. La brecha antigua de PDF/XLSX/PPTX en `modules/cliente-extra.js` sigue separada y no causa esta convergencia.

## Academia

No reconstruir. Alinear manuales, cursos, certificación, pagos y rutas por rol después del cierre I4 con comportamiento realmente probado.
