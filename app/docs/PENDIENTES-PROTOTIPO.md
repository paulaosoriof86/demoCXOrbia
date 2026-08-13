# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-13 05:21 -06:00  
**Estado:** `M8_PASS__PHASE_A_96__NEXT_M9`

## Pendiente vivo de continuidad

```text
M9 (3 puntos: provider pre-cutover + promoción productiva bajo gate explícito)
→ M10 (1 punto: smoke/freeze final)
→ Phase A 100%
```

No reabrir C6/M7/M8 ni repetir sus one-shots salvo drift reproducible.

## Cerrado y no reabrir

Exact Write V2/canonical readback; principal canónico `B=admin`; formulario único; membership/RBAC; handoff backend/HR/frontend; Auth340/SKIP13/MultiAuth; HR/M4; M7 Runtime 12; **M8 Human Validation + Rollback Ready**.

M8 PASS: run `31694998731`, job `94430661554`, artifact `9178957729`, digest `sha256:296a404470dc692d2b01679550d2e19b3429ca281f7c9333655ebf3bb8b1f85b`.

M8 demostró navegador real, Admin canónico, HR viva agosto 2026, 15 periodos/660 visitas, 197 perfiles protegidos/211 identity-map, cero duplicados, siete rutas PASS, dos reconciliaciones frescas estables y rollback readiness fail-closed. El gate de confidencialidad es esperado; QA no registró consentimiento ni browser-local writes.

## Pendiente inmediato — M9

Antes de cualquier promoción:
1. capturar read-only la release/version exacta actualmente productiva;
2. verificar una ruta de rollback soportada por el proveedor hacia esa release;
3. ligar cualquier request productivo a los bytes/source-lock exactos probados por M8;
4. STOP si release capture o rollback capability no pueden demostrarse.

La promoción productiva sigue requiriendo gate explícito independiente. No adivinar comandos de rollback ni reconstruir artefactos.

## Pendiente frontend heredado separado

`app/modules/cliente-extra.js`: PDF print, XLSX y PPTX. No bloqueó M7/M8 y no forma parte automáticamente de M9/M10 sin fuente canónica que lo establezca.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=3/3 | M9=0/3 | M10=0/1`

**96% certificado | 4% restante | delta certificado M8=+3 puntos.**

## Claude / Academia

Cero cambios a `/app/modules` o UI visual por M8. Academia puede documentar las siete rutas y el gate humano de confidencialidad; no incluir instrumentación interna QA.
