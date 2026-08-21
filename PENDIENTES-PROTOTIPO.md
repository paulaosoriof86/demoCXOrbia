# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Pendiente real actual

No corresponde reintentar G2-B ni ejecutar synthetic stage.

Primero debe cerrar F0 RC15: auditoría exhaustiva de todas las superficies que pueden cambiar proveedor, producto, fuente o estado canónico. La matriz vigente contiene **68 hallazgos**, pero todavía no declara cobertura exhaustiva.

Hay **18 HOLD** confirmados para tratamiento conjunto después del cierre de F0:
1. `CP-005` bootstrap Corte4 write-capable histórico.
2. `CP-011` protected smoke Corte4 con Auth writes históricos aún activables.
3. `CP-014` G2-B synthetic preflight con snapshot histórico no terminalizado.
4. `CP-017` creación Firebase DEV Corte4 aún materialmente activable.
5. `CP-025` postdeploy read-only recheck repetible que reescribe estado/evidence.
6. `CP-028` deterministic-suffix source-only con autoridad vieja capaz de mutar fuente/producto.
7. `CP-029` postdeploy read-only revalidation con provider-read + state/evidence writer.
8. `CP-030` canonical-plan-refresh-offline repetible sin terminalización uniforme.
9. `CP-031` live-HR current reconcile con request histórico activo y source binding antiguo.
10. `CP-045` C6 hold-profile: request activo declara máximo 0 provider reads, pero workflow podría leer provider y escribir evidence.
11. `CP-055` remaining-shopper identity: conexión directa histórica al RTDB `tya-plataforma` + writer de evidence.
12. `CP-056` visit identity crosswalk: request activo sin consumo; provider-read + writer de evidence.
13. `CP-058` live-HR provider capability preflight: provider-read + writer de evidence sin enforcement real del request/continuity lock.
14. `CP-059` legacy shoppers/certifications refresh: conexión directa al RTDB legacy + writer de evidence.
15. `CP-063` profile-extra: bundle cifrado puede activar provider-read + consumo de request + commit de evidence.
16. `CP-066` canonical backend anomaly probe: request activo; provider-read + writer de evidence.
17. `CP-067` canonical backend Phase A gap: writer repetible de estado/evidence con request activo.
18. `CP-068` canonical backend readonly inventory: provider-read + writer de evidence con request activo.

### Regla de legacy reforzada

Los hallazgos `CP-055` y `CP-059` demuestran rutas históricas que todavía leen directamente la base vieja `tya-plataforma`. No deben reutilizarse. El contrato vigente permanece: **legacy solo mediante export/import controlado de datos reales, limpios y útiles; nunca conexión directa ni copia de la base vieja**.

No inertizar aisladamente durante F0. F1 debe cerrar todas las superficies históricas residuales de una sola vez. F2 debe vincular todo ejecutor retenido a una única autoridad canónica fail-closed y bloquear antes de provider/legacy access o repository-state mutation si master plan, continuity lock y consumed ledger no coinciden.

## Secuencia congelada

F0 auditoría sistémica → F1 inertización histórica → F2 autoridad/control-plane → F3 revalidación G2-B → F4 recovery one-shot autorizado → F5 aceptación sintética → F6 release 100 congelado → F7 readiness integral → F8 cutover → F9 postproducción → F10 operación permanente.

No crear otro plan, G3, candidata, branch, PR, workflow, PREPROD ni metodología paralela. Un cambio del plan requiere `PLAN_CHANGE_REQUEST`.

## Frontend/Academia

Sin P0 visual nuevo demostrado. Sin cambio funcional de Academia en este bloque.
