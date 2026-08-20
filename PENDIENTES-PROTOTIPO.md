# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37`

## Estado de porcentaje

**Score formal del plan: 60% / 40%.** No equivale a “60% funcional”. I4 cerrado = **85%**; I5/go-live cerrado = **100%**.

## Continuidad sincronizada — no reabrir

El checkpoint obsoleto de julio fue reemplazado y `EXECUTION-STATE`, `SOURCE-LOCK` y plan unificado ya forman la autoridad vigente. No queda pendiente documental que justifique volver a auditar I1/I2/I3/I4-A/I4-B, Auth, Shopper, Finance V2/historical, multi-proyecto/no-code, documentos, reservas o Academia.

## Cerrados/protegidos

- I4-C: source readiness suficiente para Phase A inicial; Make runtime diferido.
- I4-D: `PASS_I4D_FINANCE_EXISTING_CXDATA_REUSE_CONFIRMED`.
- I4-E: `PASS_I4E_MULTI_PROJECT_NO_CODE_REUSE_AND_CONTRACT_ALIGNMENT`.
- Finanzas: Mayo 44/44 pagadas; Junio 2/44 pagadas, 42 pendientes, Q451; `liquidada != pagada`.
- Cinépolis: proyecto configurable por `tenantId + projectId`.

## Pendiente activo único inmediato

`I4_PROTECTED_RUNTIME_CONVERGENCE_AND_REAL_PHASE_A_E2E`.

1. **Runtime único protegido:** usar `app/index-backend-dev.html` como único carril real y probar ausencia de fallback demo/source-safe viejo.
2. **Shopper identidad completa:** login real → exact identity + membership + perfil protegido + HR viva; validar Mi Perfil, histórico, certificaciones, visitas, beneficios y pago.
3. **Admin/RBAC/persistencia:** claims/membership correctos; acciones persistibles únicamente por command/provider ACK; ningún bypass/local mutation como verdad.
4. **Finanzas visible real:** Mayo 44/44; Junio 2/44, 42 pendientes, Q451; overlay viejo `paidConfirmed:0` no puede prevalecer.
5. **Gates actuales:** derivar conteos de la fuente vigente; no usar 616/216/44 históricos como autoridad si la fuente actual produjo 15 periodos/659 visitas/217 shoppers.
6. **E2E misma build:** Admin + Shopper real, rutas Phase A críticas, sin datos demo ni errores que rompan operación.
7. **Frontend/Claude solo focalizado:** si el E2E demuestra una brecha real, localizar archivo/módulo. La brecha antigua de `cliente-extra.js` PDF/XLSX/PPTX se clasifica contra alcance vivo antes de tocarla.
8. **Academia:** alinear al cierre I4; no reconstruir por anticipado.

## I5 después de I4

Preproducción sobre la misma build protegida: regresión funcional transversal, roles/scopes, seguridad, datos reales limpios, rollback/checkpoint, validación visual final y autorización explícita de deploy/producción.

## Fuera del bloqueo inicial

Make/Gemini runtime y ejecución bancaria de pagos. El control/estado de pagos sí permanece dentro de Phase A.

## Seguridad

0 deploy, 0 merge, 0 producción y 0 provider writes por esta reconciliación documental.
