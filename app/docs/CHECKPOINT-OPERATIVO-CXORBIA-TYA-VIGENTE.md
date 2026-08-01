# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-01  
**Estado:** `P0_DATOS_DIRECT_ROLE_ROOT_FIX_APPLIED_PENDING_CUMULATIVE_GATES_AND_SINGLE_DEV_REDEPLOY__NO_PRODUCTION`

## 1. Estado protegido
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406 no repetir.
- Baseline histórica protegida: 14 periodos/616 visitas/208 shoppers.
- Producción `tya-plataforma` intacta.

## 2. P0 demostrado
La entrada directa del build anterior sí activaba Administración, pero el runtime quedaba vacío. La pantalla humana mostró cero proyectos y cero periodos. Esto invalida el PASS anterior y bloquea Corte 6.

Causa raíz acumulativa:
1. la entrada humana fue normalizada como runtime protegido;
2. el watcher HR se desactivó por presencia de `cxProtectedRuntime`;
3. el bridge full-visual rechazó la mezcla de carriles;
4. el guard read-only ejecutó el estado vacío de espera protegida;
5. el smoke no verificaba 14/616/208 después del clic.

## 3. Corrección aplicada
- Human lane: `source-safe-human-visual`, sin protected runtime.
- Technical lane: `protected-technical-e2e`, solo con token E2E explícito.
- `humanVisualSourceSafe=true` y backend Firebase desactivado solo en la visual humana.
- Watcher HR activo en humano.
- Overlay protegido con fallback seguro a HR 14/616/208; nunca bloquea ni borra la baseline válida.
- Gate browser exige entrada directa, 14/616/208, proyecto/periodo, datasource listo, ausencia de shell vacío y tres recargas estables.

## 4. Archivos focales
- `app/index-backend-dev.html`.
- `app/adapters/tya-dev-entry-auth-gate-v1.js`.
- `app/adapters/tya-live-source-refresh-watch-v2.js`.
- `app/adapters/tya-dev-full-visual-bridge.js`.
- `tools/qa/tya-c6-dev-entry-auth-gate.mjs`.
- `tools/qa/tya-c6-dev-entry-browser-smoke.mjs`.
- documentación obligatoria y workflow/config one-shot.

No se tocaron módulos UI ni producción.

## 5. Autorización
Autorización exacta recibida para aplicar el root fix, ejecutar gates acumulativos y, solo con PASS local 14/616/208, realizar un único redeploy del Hosting DEV existente. Sin writes de datos/Auth/Rules/Cloud Run, sin merge y sin producción.

## 6. Gate inmediato
1. sintaxis y separación estática de carriles;
2. dominio/finanzas/shopper/reservas acumulativos;
3. browser humano local 14/616/208 + 3 recargas;
4. E2E técnico staff/shopper local;
5. preflight proveedor read-only;
6. un deploy Hosting DEV;
7. paridad y browser remoto 14/616/208 + 3 recargas;
8. E2E técnico remoto;
9. evidencia y consumo one-shot.

Cualquier falla antes del deploy conserva autorización no consumida. Una falla después del deploy consume la autorización y se registra fail-closed.

## 7. Estado seguro
No hay merge, producción, writes de Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos/Reservas ni proyectos/sitios nuevos.
