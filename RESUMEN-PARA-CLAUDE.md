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

## Recovery vigente — VRM-328 / Hosting DEV RUN2437 (11-nov-2026)

No usar el contexto I4/2026-08 de arriba como verdad viva. Rama única `recovery/cxorbia-phase-a-20260831`, source `e2458f449ee76d965ee39effdb5790d2e6d45d8c`, control actual en `CXORBIA_RECOVERY_EXECUTION_CURRENT.json` y ledger acumulativo V610.

El owner Shopper `app/adapters/tya-canonical-shopper-portal-v2.js` corrige Activas cuando una visita fue submitida pero no pagada. Firebase Hosting DEV publicó la fuente mediante RUN2437 y verificó 15 assets byte-idénticos; Cloud Run `00370-fl2` no cambió. Faltan el hash servido del owner y el E2E Shopper de Mi Perfil versus Mis Visitas: NO afirmar PASS B2/B3 ni 21/21 módulos. Mantener B4/B5/B6/B7 humanos PASS anteriores, B8 financiero sin inferir pagos, B9 Gate20/21 HOLD y producción DO_NOT_TOUCH.

Academia: este deploy no altera bancos, cursos, certificados ni autoriza recertificación; conservar lo aprobado y esperar pruebas funcionales para corregir textos y recursos. Proyecto ROLA debe ser administración por proyecto/país/periodo, sin nuevas reglas hardcodeadas ni cambio de fuente HR Cinépolis.
