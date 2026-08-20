# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37`

**Avance formal del plan:** **60% / 40%**. I4 vale 25 puntos indivisibles y I5 vale 15. Cierre real de I4 → **85%**; cierre de I5/go-live → **100%**.

## 2026-08-19 — PROTECTED_RUNTIME_SINGLE_AUTHORITY — SOURCE FIX

### Defecto runtime localizado
`app/index-backend-dev.html` carga la autoridad protegida y también el watcher HR vivo. En el carril humano autenticado, `tya-live-source-refresh-watch-v2.js` podía recibir `backend-auth-ready` y aplicar el snapshot HR source-safe directamente a `CX.data` antes de que `tya-protected-auth-hr-authority-bridge-v2.js` terminara de capturar/componer el estado Firestore protegido. Eso creaba una carrera de dos escritores sobre la misma autoridad en memoria y explica por qué una build con módulos existentes podía mostrar identidad Shopper/perfil/finanzas incompletos de forma intermitente.

### Corrección aplicada en source
`app/adapters/tya-live-source-refresh-watch-v2.js` queda en v4 con un lock de arranque:
- en `authenticated-human-canonical` no puede aplicar HR in-place hasta que `CX_PROTECTED_AUTH_HR_AUTHORITY.applied === true` y `CX.data.sourceMode` confirme composición canónica;
- el watcher conserva polling HR solo después de que la autoridad Auth + Firestore + HR fue establecida;
- el estado `CX.dataSource` permanece `connected` en el carril humano protegido y no vuelve a rotularse como `source_safe_preview`;
- se emite `CX_TYA_LIVE_SOURCE_AUTHORITY_LOCK` para poder gatear la secuencia;
- no se toca ningún módulo UI ni la interfaz pública de `CX.data`.

### Estado del bloque
`SOURCE_PATCHED_PENDING_RUNTIME_GATE`. No se declara todavía `PASS_I4` ni se incrementa el 60%: falta ejecutar el gate runtime/E2E sobre la misma build protegida.

### Seguridad
0 provider writes, 0 deploy, 0 merge, 0 producción, 0 Make/Gemini, 0 pagos.

### Clasificación
- **Reusable CXOrbia:** single-authority boot lock y prevención de carreras entre fuente operacional y overlay protegido.
- **Exclusivo TyA:** endpoint HR Cinépolis y composición de su fuente viva.
- **Claude/prototipo:** sin cambio frontend; no generar candidata.
- **Academia:** sin impacto hasta cerrar I4.
- **Sin impacto Claude:** adapter/gate backend.

---

## 2026-08-19 — CANONICAL_CONTINUITY_RECONCILIATION

### Causa raíz metodológica cerrada
El índice vivo ya estaba en I4/epoch 37, pero `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` seguía congelado en julio (`CORTE_0B_R20...`) y faltaban tres documentos de autoridad: `EXECUTION-STATE`, `SOURCE-LOCK` y plan operativo unificado. Dado que cada nueva conversación debe releer esas fuentes, la contradicción podía hacerla retroceder a un corte antiguo, reabrir diagnóstico y consumir la sesión sin mover la frontera.

### Archivos de continuidad reconciliados
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
- `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`
- `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`
- `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`
- `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`

### Frontera vigente
`I4_PROTECTED_RUNTIME_CONVERGENCE_AND_REAL_PHASE_A_E2E`.

### Evidencia preservada
- I4-C source readiness preservado; Make runtime diferido.
- I4-D `PASS_I4D_FINANCE_EXISTING_CXDATA_REUSE_CONFIRMED`.
- I4-E `PASS_I4E_MULTI_PROJECT_NO_CODE_REUSE_AND_CONTRACT_ALIGNMENT`.
- Finanzas canónicas: Mayo 44/44 pagadas; Junio 2/44, 42 pendientes y Q451; `liquidada != pagada`.
- Última lectura HR documentada: 15 periodos, 659 visitas y 217 shoppers; expectativas 616/216/44 se consideran drift de gate hasta demostrar regresión.
