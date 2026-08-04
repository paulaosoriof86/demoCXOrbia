# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `FORENSIC_CONTROL_PLANE_SOURCE_STATIC_PASS_LOCAL__CORE_OPERATIONS_SHOPPER_RELEASE_SLICE_DEFINED__CLOUD_V6_NOT_AUDITED__NO_PRODUCTION`

## 1. Control plane

Cerrado source-only:

- una máquina de estados única;
- una sola autoridad browser futura;
- acceso/membership separado del runtime read-only;
- checkout detached por SHA exacto;
- snapshots y clasificación por etapa;
- gates históricos preservados fuera del camino activo.

PASS local determinista:

```text
PASS_FORENSIC_CONTROL_PLANE_STABILIZATION
PASS_C6_CLIENT_ROUTE_SOURCE_STATIC
```

No existe todavía PASS runtime sobre el nuevo control plane.

## 2. Pendiente de telemetría remota

La solicitud `forensic-control-plane-stabilization-20260804-01` fue registrada con runtime y provider reads deshabilitados. El conector no expuso un run/job/status verificable. No se declara PASS remoto.

Esto no invalida el PASS local source-only, pero debe quedar resuelto antes de usar el runner como evidencia de release.

## 3. Cloud V6

- archivo `Prototype development request V6.zip`;
- SHA-256 `0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`;
- estado `NOT_AUDITED__EXECUTION_LANE_NOT_READY`;
- no existe GO/HOLD;
- delta aplicado: 0.

Pendiente:

1. obtener ZIP extraído + checkout autenticado + rama viva en la misma sesión;
2. auditar composición completa;
3. separar delta nuevo, heredado, pendiente resuelto, regresión y redundancia;
4. aplicar únicamente con GO sin P0;
5. mantener una sola candidata acumulativa.

## 4. Primer release slice

Prioridad operativa:

`ADMIN/OPERACIONES + SHOPPER`.

Pendientes de validación final:

- Hoja de Ruta viva;
- Dashboard Operativo;
- Visitas;
- Visitas Disponibles;
- Postulaciones y ficha;
- Shoppers;
- Reservas/asignación;
- Finanzas Phase A;
- Mi Perfil, Mis Visitas, certificaciones, histórico y pagos Shopper.

Portal Cliente queda en carril paralelo y no bloquea el primer cutover.

## 5. Laboratorio dentro de la plataforma

Pendiente de implementación y ejecución con autorización propia:

- `CORE_OPERATIONS_ADMIN`;
- `SHOPPER_FULL_CYCLE`;
- `CROSS_MODULE_CONSISTENCY`;
- `RELOAD_NEW_TAB_STABILITY`;
- `EXPORTS_AND_VISIBLE_EVIDENCE`.

Requisitos:

- datos `AUDIT-*` sintéticos;
- UI y contratos normales;
- PASS/FAIL/BLOCKED por etapa;
- screenshots y timeline;
- fingerprints antes/después;
- cleanup exacto;
- `baselineRestoredAfterCleanup=true`.

## 6. P1/P2 vivos

- overlay A+B superseded aún cargado;
- PDF puede omitir gráficas;
- Excel mantiene formato básico;
- responsive parcial;
- Cloud V6 no auditada.

Estos hallazgos no bloquean por sí solos el primer release slice, salvo que impidan un flujo esencial.

## 7. Siguiente secuencia

```text
EXECUTION_LANE_READY
→ AUDITORÍA ACUMULATIVA CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO SI GO SIN P0
→ SOURCE/STATIC
→ DEV ÚNICO SI CAMBIA app/
→ LABORATORIO ADMIN/OPERACIONES + SHOPPER
→ CLEANUP EXACTO
→ CHECKPOINT VISUAL
→ CUTOVER AUTORIZADO DEL SLICE
```

## 8. Estado seguro

- cambios funcionales `app/`: 0;
- runtime/credenciales: 0;
- provider reads/writes: 0;
- Auth/Firestore/membership writes: 0;
- Hosting/Cloud Run: 0;
- HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción intacta.
