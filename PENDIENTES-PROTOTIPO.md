# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37`

## Estado de porcentaje
**Score formal del plan: 60% / 40%.** No equivale a “60% funcional”. I4 vale 25 puntos indivisibles: I4 cerrado = **85%**; I5/go-live cerrado = **100%**.

## No reabrir
I1/I2/I3/I4-A/I4-B, Finance V2/historical, multi-proyecto/no-code, módulos Shopper, documentos, reservas y Academia no se reconstruyen por defecto. I4-C source readiness se preserva; Make runtime sigue diferido.

## Cerrado — I4-D Finanzas
`PASS_I4D_FINANCE_EXISTING_CXDATA_REUSE_CONFIRMED`.

No queda pendiente reconstruir ni volver a cablear Finanzas. Verdad vigente: Mayo 44/44 pagadas; Junio 2 pagadas / 42 pendientes sobre 44; Q451 confirmados; `liquidada != pagada`.

## Cerrado — I4-E Multi-proyecto/no-code
`PASS_I4E_MULTI_PROJECT_NO_CODE_REUSE_AND_CONTRACT_ALIGNMENT`.

Cinépolis continúa como proyecto configurable por `tenantId + projectId`.

## Pendiente activo único inmediato
`I4_PROTECTED_RUNTIME_CONVERGENCE_AND_REAL_PHASE_A_E2E`.

Pendientes reales para cerrar I4:

1. **Runtime único protegido:** validar exclusivamente `app/index-backend-dev.html` como carril real de Phase A y demostrar que no cae a demo/source-safe viejo.
2. **Shopper identidad completa:** con login real, componer exact identity + membership + perfil protegido + HR viva; verificar Mi Perfil, histórico, certificaciones presentadas, visitas, beneficios y pago. En Admin, mostrar identidad completa solo según autorización.
3. **Admin/RBAC/persistencia:** demostrar claims/membership correctos y que las acciones Phase A persistibles pasan por command/provider ACK. Ningún bypass ni mutación local como verdad.
4. **Finanzas visible real:** verificar en el runtime protegido Mayo 44/44, Junio 2/44, 42 pendientes y Q451; impedir que el overlay viejo `paidConfirmed:0` vuelva a ser autoridad.
5. **Gates sin conteos históricos hard-codeados:** el último run leyó 15 periodos / 659 visitas / 217 shoppers, mientras algunos gates todavía esperaban 616/216/44. Derivar expectativas de la fuente vigente o del inventario canónico correspondiente.
6. **Checkpoint/documentación:** corregir cualquier marker obsoleto; el gate `Phase A Live Execution Checkpoint` falló por `CURRENT_CHECKPOINT_MARKER_MISSING` y no debe confundirse con fallo del producto.
7. **Frontend/Claude focalizado:** el gate de `cliente-extra.js` reporta PDF/XLSX/PPTX ausentes. Confirmar si continúa dentro del Phase A vivo; si sí, corregir solo ese consumidor frontend, sin reabrir backend ni otros módulos.
8. **E2E visible misma build:** Admin + Shopper real y rutas Phase A críticas, sin errores de consola, sin datos demo, con persistencia/autorización correcta. Solo después congelar I4 y alinear Academia.

## I5 después de I4
Preproducción sobre la misma build protegida: regresión funcional transversal, roles/scopes, seguridad, datos reales limpios, rollback/checkpoint, validación visual final y autorización explícita de deploy/producción.

## Fuera del bloqueo inicial
Make/Gemini runtime y ejecución bancaria de pagos. El control/estado de pagos sí es Phase A; ejecutar pagos bancarios no.