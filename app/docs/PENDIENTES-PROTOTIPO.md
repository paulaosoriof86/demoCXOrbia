# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `V6_EMPALMED__SOURCE_GATE_ROOT_FIX_MATERIALIZED__VISUAL_HOLD__CLOUD_V7_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 1. Cloud V6 empalmada

- commit funcional: `f961253f18c388ae04619bb5175269015c8349c3`;
- SHA-256 candidata: `0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`;
- una sola baseline acumulativa preservada;
- deploy: 0.

## 2. Bloqueante visual vigente

`HOLD_FRONTEND_VISUAL`.

Problemas de la pantalla de escritorio:

- composición tipo demo en lugar de login corporativo;
- jerarquía distinta de Emergent;
- campos de acceso fuera de la primera composición;
- accesos de validación y pie técnico visibles;
- órbita pesada y rígida;
- tarjetas sobredimensionadas;
- evidencia insuficiente para declarar equivalencia visual.

Pendiente Cloud V7, exclusivamente visual, principalmente sobre:

- `app/app.js`;
- `app/styles/layout.css`.

## 3. Source gate posterior al empalme

FAIL original:

- blobs históricos de cinco archivos modificados por V6;
- `app/core/backend-dev-auth.local.js` ausente;
- falso positivo de secreto sobre el código del scanner.

Correctivos materializados:

- overlay V6 sobre manifest base;
- placeholder Auth local fail-closed sin secretos;
- scanner diferenciado para definiciones de patrones;
- gate rebasado a manifest base + overlay.

Pendiente ejecutar y comprobar el gate actualizado. No se declara PASS todavía.

## 4. Laboratorio DEV

El shell recibido marcaba escenarios y cleanup como ejecutados sin haber realizado operaciones reales.

Corregido:

- no inventa PASS;
- estado `BLOCKED_AWAITING_CONTROLLED_RUNNER`;
- contrato de evidencia por `CX.devScenarioLab.ingest(report)`;
- fingerprints y cleanup obligatorios.

Pendiente bajo ChatGPT:

- runner real por UI/contratos normales;
- `CORE_OPERATIONS_ADMIN`;
- `SHOPPER_FULL_CYCLE`;
- `CROSS_MODULE_CONSISTENCY`;
- tres recargas y nueva pestaña;
- exportaciones/evidencia;
- cleanup exacto.

## 5. Primer release slice

`ADMIN/OPERACIONES + SHOPPER`.

Validar:

- Hoja de Ruta e histórico;
- Dashboard;
- Visitas/Disponibles;
- Postulaciones y ficha;
- Shoppers;
- Reservas/asignación;
- Finanzas Phase A;
- Mi Perfil, certificaciones, Mis Visitas, histórico y pagos Shopper.

Portal Cliente continúa en carril paralelo.

## 6. P1/P2 vivos

- overlay A+B superseded cargado;
- PDF puede omitir gráficas;
- Excel básico;
- responsive no crítico pendiente de visual V7.

No bloquean por sí solos el primer corte salvo que impidan un flujo esencial.

## 7. Secuencia exacta

```text
CLOUD V7
→ AUDITORÍA VISUAL CHATGPT
→ CODEX SOLO EMPALME
→ ACTUALIZAR OVERLAY
→ SOURCE/STATIC PASS
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL ADMIN/OPERACIONES + SHOPPER
→ CLEANUP EXACTO
→ CHECKPOINT VISUAL HUMANO
→ CUTOVER AUTORIZADO
```

## 8. Estado seguro

- Hosting/Cloud Run: 0;
- provider writes: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0;
- producción intacta.
