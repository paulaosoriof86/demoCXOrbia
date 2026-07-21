## 2026-07-21 - V171b acumulada auditada; HOLD por identidad Shopper fail-open

- Candidata: `Prototype development request CXOrbiaV171b.zip`.
- SHA-256: `e655ea88950c8485a497b52b3870c9b18ebef98181e1662993ef496efc17d4e2`.
- V171b preserva reportKit, reportes multiformato, branding, gráficas, multiproyecto, Panorama, add-ons, Novedades y corrige estáticamente los siete P0 principales de V170.
- No fue aplicada a `docs-tya-v6-v71-audit`.
- Decisión: `HOLD_P0_PROVEN_SHOPPER_IDENTITY_FAIL_OPEN`.

### P0 reproducible

- `app/modules/misvisitas.js` mantiene `shopperId || 'sh1'`.
- Sin `visitsForShopper`, puede caer a `data.visitas()` y mostrar todas las visitas.
- `app/modules/reservas.js` conserva fallback `sh1`.
- `app/modules/midia.js` amplía visitas privadas por estado y puede incluir visitas de otro shopper.
- `app/app.js` mantiene `sh1` sin guard explícito de modo demo.
- Una prueba con el archivo real confirmó que una sesión Shopper sin identidad renderiza una visita ajena de `sh1`.

### Instrucción vigente para Claude

Leer y cumplir:

- `app/docs/AUDITORIA-CANDIDATA-V171B-CORTE1B-20260721.md`;
- `app/docs/PAQUETE-CORRECCION-CLAUDE-V171B-CORTE1B-20260721.md`;
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V171B-HOLD-20260721.md`.

Corregir exactamente sobre V171b, no volver a V164. Alcance mínimo: `app.js`, `misvisitas.js`, `reservas.js` y `midia.js`. Sin identidad Shopper, toda vista privada debe fallar cerrada con cero filas y cero acciones. Cualquier seed `sh1` debe quedar exclusivamente bajo modo demo explícito.

### Gates

- Shopper A ve solo A; Shopper B ve solo B; sesión sin ID ve cero datos privados.
- Una visita agendada de B no aparece en Mi Día de A.
- Sin `visitsForShopper`, Mis Visitas queda vacío.
- Cero `sh1` ejecutable en live/real.
- Las siete correcciones V170 y todas las mejoras V171b permanecen.

### Flujo posterior

`CANDIDATA V171B CORREGIDA → EXECUTION_LANE_READY → AUDITORÍA FOCALIZADA → GO/APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 1`

---

## 2026-07-20 - Corte 1A HR viva confirmada; estabilidad y reportes live redeploy PASS

- V164 y Corte 1A continúan integrados en `docs-tya-v6-v71-audit`.
- Paula confirmó con cambios reales que la HR se lee en vivo: fecha de cuestionario actualiza KPI y asignación HR retira la visita disponible del shopper.
- No reabrir empalme, estados canónicos, multi-proyecto, Finanzas, shoppers o histórico.
- Run `29794082358`: PASS completo; source HEAD `42f1c1f9c9f142c34ee92224af425712c7c1e396`.

### Backend/adapters ya aplicados — no reabrir desde frontend

- `backend/runtime/hr-live-service/server.mjs`: revisión estable, bootstrap rápido y actualización controlada.
- `app/adapters/tya-live-source-refresh-watch.js`: recarga solo ante cambio real y evita bucles.
- `app/adapters/tya-corte1-report-projection-live.js`: cuatro reportes operativos desde el snapshot live.
- `tools/release/tya-source-safe-live-binding-build-r22.mjs`: carga la proyección live antes del watcher.

### Pendientes visuales preservados dentro de V171b

- Reportes por rol y administración.
- Diseño reusable white-label.
- Panorama por periodo.
- Estados honestos sin métricas inventadas.
- Validación visual final PDF/XLSX/PPTX.

### Academia

Actualizar después de la corrección visual: lectura viva, revisión, periodos, diferencia HR/resultados, exportación por rol, identidad Shopper y separación entre oportunidades y visitas privadas.

### Estado

- HR viva real: CONFIRMADA.
- Estabilidad y proyección live: DEV PASS.
- Producción, imports, pagos e integraciones externas: HOLD.
- Corte 1: no congelado.
- Corte 2: bloqueado.

---

## Historial protegido

- V156/V155: gates comerciales y de lenguaje técnico preservados.
- V145/V131: separación proyecto-periodo, Finanzas y baseline histórica preservadas.
- No reabrir sin evidencia nueva reproducible.
