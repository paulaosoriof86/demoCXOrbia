# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-27  
**Estado:** `PHASE_A_100_FROZEN__PROD_READINESS_90__F7_INTEGRAL_READINESS_PENDING`

## Cerrado / no reprocesar

- M1 `CLOSED_PASS`.
- M2/F0 `CLOSED_PASS_4_OF_4`.
- M3 `CLOSED_PASS_30_OF_30_ZERO_RESIDUAL_DIRECT_REMOTE_READBACK`.
- F3 `CLOSED_PASS_PROVIDER_PROMOTION_MECHANISM_V1_G2B_RECOVERY_LANE_PASS`.
- F4 `CLOSED_PASS_RECOVERY_PASS_FULL_READONLY_RECERTIFIED`.
- F5 `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`.
- F6 `CLOSED_PASS_IMMUTABLE` / `F6_PHASE_A_RELEASE_100_FROZEN`.

Phase A = `100/100`.
Production Real Readiness = `90/100`.

Release congelado: `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

No reabrir F5/F6, no repetir synthetic lifecycle, no rebuild/redeploy del release congelado por inferencia y no reimportar datos.

## Pendiente exacto actual — F7

`F7_INTEGRAL_READINESS` debe cerrar integralmente, sobre el release exacto:

1. seguridad/IAM/Rules/secrets;
2. aislamiento tenant y project scope;
3. migración y reconciliación de datos limpios;
4. Auth/RBAC;
5. HR viva e histórica;
6. shoppers;
7. postulaciones;
8. certificaciones presentadas;
9. visitas y lifecycle operativo;
10. liquidaciones/pagos y sus estados;
11. multi-proyecto y configuración por tenant/proyecto;
12. sincronización HR↔plataforma, deduplicación estable y conflictos a revisión;
13. E2E/regresión sobre el release exacto;
14. carga, cuotas y límites;
15. failure injection e idempotencia;
16. backup/restore y rollback verificable;
17. observabilidad, alertas y runbooks;
18. consistencia Claude/prototipo;
19. consistencia Academia/manuales/rutas por rol/notificaciones.

Salida válida de F7:

- `GO`, o
- `GO_WITH_WARNINGS` sin P0,
- `HOLD/NO_GO` solo con evidencia reproducible.

F7 cerrado GO/GO_WITH_WARNINGS lleva `90 → 95` en `PRODUCTION_REAL_READINESS`.

## Pendientes posteriores congelados

- F8 — cutover exacto: requiere autorización específica; objetivo `95 → 98`.
- F9 — aceptación postproducción: objetivo `98 → 100`.
- F10 — operación permanente: incidentes, patches, observabilidad, backups/restores, revalidaciones y mejoras futuras.

No adelantar F8/F9 por inferencia.

## Hallazgo de mecanismo abierto

`MECHANISM_P1_NON_BLOCKING` — run `33085991102`.

Causa: predeploy local read-only arrancó sin instalar `firebase-admin`.

Pendiente: reparación focal del mecanismo antes de reutilizar ese carril. No requiere reabrir producto ni F5/F6. No autoriza deploy ni provider write.

## Incidente de proceso contenido en sincronización documental

Durante la sincronización F6 hubo una operación equivocada de herramienta que produjo commits transitorios sin cambio funcional. La rama fue restaurada al commit F6 exacto `1af96b170d54917ec1ebd188a9deb0534f7eb7df`, tree `f0f3428693e251f1d4baf236728e58a2cd5314f2`, antes de continuar con los mirrors canónicos.

Clasificación: `MECHANISM_P1_PROCESS_DEVIATION_CONTAINED`.

No hubo cambio de frontend, runtime, provider ni datos. Regla reforzada: no usar force/ref rewrite como carril operativo; resolver mediante writes versionados normales y readback remoto.

## Reglas de producto que siguen vigentes

- prototipo manda;
- backend no rediseña `/app/modules` ni `/app/core`;
- base nueva y limpia; legacy solo export/import útil;
- multi-tenant por `tenantId` + `projectId`;
- Cinépolis es proyecto configurable, no lógica global;
- conflictos HR/identidad no se sobrescriben silenciosamente;
- estados honestos para funciones no activas;
- Make/Gemini/pagos solo con gate real;
- datos sensibles fuera del repo y protegidos;
- UTF-8 sin BOM;
- toda mejora frontend futura debe indicar impacto en Academia y documentación por rol.

## Acción actual

`F7_INTEGRAL_READINESS`.
