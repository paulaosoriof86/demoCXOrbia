# Matriz de ejecución — Laboratorio Admin/Operaciones + Shopper

**Fecha:** 2026-08-04  
**Estado:** `SOURCE_ONLY_PREPARED__RUNTIME_NOT_EXECUTED__AWAITING_FINAL_VISUAL_CANDIDATE_AND_SINGLE_DEV_DEPLOY`

## 1. Objetivo

Dejar definido el recorrido exacto que se ejecutará dentro de la plataforma después de:

1. recibir la corrección frontend estrecha;
2. obtener auditoría GO sin P0;
3. completar el empalme aprobado;
4. cerrar source/static sobre el HEAD final;
5. realizar el único deploy DEV autorizado.

Este documento no autoriza escrituras ni ejecución.

## 2. Identidad del run

Cada ejecución usará un único identificador:

`AUDIT-TYA-<YYYYMMDD>-<RUN>`

Toda entidad temporal creada por el laboratorio deberá comenzar exactamente con ese prefijo y registrar:

- `tenantId=tya`;
- `projectId` exacto;
- `periodId` exacto;
- `createdByScenarioRunId`;
- `createdAt`;
- tipo de entidad;
- ID padre cuando exista;
- fuente de asignación;
- estado de sincronización.

No se permitirá deduplicación por nombre.

## 3. Preflight obligatorio

Antes de cualquier escritura temporal:

| Etapa | Condición |
|---|---|
| AUTH_READY | identidad existente autenticada |
| CLAIMS_READY | rol, namespace, tenant y proyecto exactos |
| MEMBERSHIP_READY | membership vigente cuando aplique |
| DATA_READY | HR viva y arrays canónicos disponibles |
| SHELL_READY | router, rail, view y confidencialidad resuelta |
| ROUTE_READY | ruta exacta activa |
| VIEW_READY | vista renderizada y no bloqueada |
| DOMAIN_READY | proyecto, periodo y autoridad de datos consistentes |
| SCENARIO_READY | fingerprint inicial y snapshot guardados |

Si una etapa falla, no se crea ninguna entidad `AUDIT-*`.

## 4. Fingerprint inicial

El fingerprint debe incluir, como mínimo:

- tenant, proyecto y periodo;
- revisión de fuente;
- conteos de visitas;
- conteos de shoppers;
- conteos de postulaciones;
- conteos de asignaciones;
- conteos de reservas;
- conteos de liquidaciones;
- IDs `AUDIT-*` preexistentes;
- duplicados de `visitId/hrRowId`;
- duplicados de `shopperId`;
- hash SHA-256 del objeto normalizado.

Cualquier entidad `AUDIT-*` preexistente bloquea el inicio hasta clasificación y limpieza segura.

## 5. CORE_OPERATIONS_ADMIN

| Paso | Ruta/módulo | Acción visible | Resultado esperado |
|---|---|---|---|
| A1 | Dashboard | Abrir periodo activo | mismo periodo y revisión de fuente que HR viva |
| A2 | Histórico | Abrir periodos anteriores | histórico completo y sin conteos congelados |
| A3 | Visitas | Buscar visita temporal `AUDIT-*` | inicialmente ausente |
| A4 | Flujo autorizado de alta/publicación | Crear visita sintética | una sola visita con identidad técnica estable |
| A5 | Visitas Disponibles | Verificar publicación | visita visible una vez, sin duplicados |
| A6 | Postulaciones | Ver lista | postulación temporal inicialmente ausente |
| A7 | Flujo de postulación | Crear postulación sintética | visible en lista y ficha |
| A8 | Ficha de postulación | Abrir detalle | shopper, visita, proyecto y estado coinciden |
| A9 | Aprobar/asignar | Ejecutar acción normal | visita sale de Disponibles y queda asignada |
| A10 | Dashboard/Hoja de Ruta | Verificar cambio | KPI y estado coinciden con Visitas |
| A11 | Shoppers | Abrir ficha temporal | histórico, certificación y asignación coherentes |
| A12 | Reservas | Verificar agenda/reserva | sin duplicar la asignación |
| A13 | Finanzas | Verificar visibilidad | sin inventar ingresos, regalías o pagos |
| A14 | Exportaciones | PDF/XLSX visibles | filas, filtros, periodo y fuente coinciden |

Las acciones A4, A7 y A9 solo se habilitarán cuando exista autorización explícita de escrituras temporales DEV y snapshot de proveedor.

## 6. SHOPPER_FULL_CYCLE

| Paso | Ruta/módulo | Acción visible | Resultado esperado |
|---|---|---|---|
| S1 | Login Shopper | Ingresar con identidad existente autorizada | shopperId exacto, no resolución por nombre |
| S2 | Mi Perfil | Abrir perfil | identidad y campos protegidos correctos |
| S3 | Certificaciones | Abrir presentadas | certificaciones históricas visibles |
| S4 | Visitas Disponibles | Buscar visita `AUDIT-*` | visible antes de postular/asignar |
| S5 | Postularse | Acción normal de UI | postulación visible en Admin y Shopper |
| S6 | Mis Visitas | Verificar antes de aprobar | no asignada todavía |
| S7 | Después de aprobación Admin | Recargar | visita aparece una sola vez en Mis Visitas |
| S8 | Reservas/agenda | Abrir flujo habilitado | misma visita y misma identidad técnica |
| S9 | Histórico | Verificar continuidad | visitas previas preservadas |
| S10 | Reportes/pagos | Verificar estado | liquidación/pago visible solo si existe fuente |

## 7. CROSS_MODULE_CONSISTENCY

Deben cumplirse simultáneamente:

1. una visita publicada aparece en Disponibles;
2. una postulación aparece en lista y ficha;
3. aprobar/asignar retira la visita de Disponibles;
4. la visita aparece en Mis Visitas del shopper exacto;
5. Dashboard, Hoja de Ruta y Visitas muestran el mismo estado;
6. HR y plataforma no duplican la asignación;
7. `assignmentSource`, `assignmentSyncStatus` y `lastSyncedAt` quedan coherentes cuando el flujo los exponga;
8. Finanzas no convierte honorarios en ingresos ni inventa regalías;
9. ningún módulo muestra otro tenant, proyecto o periodo.

## 8. RELOAD_NEW_TAB_STABILITY

Para Admin/Operaciones y Shopper:

- tres recargas completas;
- una pestaña nueva;
- mismo tenant;
- mismo proyecto;
- mismo periodo;
- mismo rol;
- mismo shopperId cuando aplique;
- misma entidad `AUDIT-*`;
- mismos conteos funcionales;
- cero credenciales, tokens o PII en evidencia.

## 9. EXPORTS_AND_VISIBLE_EVIDENCE

Capturas mínimas:

- Dashboard/Hoja de Ruta;
- Visitas;
- Disponibles;
- Postulaciones;
- ficha de postulación;
- ficha Shopper;
- Finanzas;
- Mi Perfil Shopper;
- Mis Visitas;
- resultado visible del Laboratorio;
- cleanup final.

Cada archivo debe registrar:

- path;
- bytes;
- SHA-256;
- perfil;
- ruta;
- viewport;
- etapa del escenario.

## 10. Cleanup exacto

El cleanup solo puede actuar sobre IDs creados por el mismo `runId`.

Orden:

1. retirar asignación/reserva temporal;
2. retirar postulación temporal;
3. retirar visita temporal;
4. retirar shopper temporal, si se creó;
5. retirar marcador financiero temporal, si existió;
6. buscar huérfanos;
7. recalcular fingerprint;
8. comparar baseline inicial y final.

PASS únicamente cuando:

```text
createdAuditIds == deletedAuditIds
missingDeletes == []
unexpectedDeletes == []
orphans == []
preexistingEntitiesMutated == []
baselineRestoredAfterCleanup == true
```

Un fallo de cleanup es P0 y prohíbe reintento automático.

## 11. Decisiones posibles

- `PASS_CORE_OPERATIONS_SHOPPER_SCENARIO_LAB`;
- `FAIL_CORE_OPERATIONS_SHOPPER_SCENARIO_LAB_CLEANED`;
- `P0_CORE_OPERATIONS_SHOPPER_SCENARIO_LAB_CLEANUP_FAILED`.

## 12. Estado seguro actual

- ejecución de navegador: 0;
- runtime: 0;
- provider reads: 0;
- provider writes: 0;
- datos `AUDIT-*` creados: 0;
- deploy: 0;
- merge: 0;
- producción: 0.

## 13. Clasificación

- **Reusable CXOrbia:** estados, fingerprints, evidence schema y cleanup.
- **Exclusivo TyA:** rutas y consistencia HR/plataforma.
- **Cloud/prototipo:** sin cambios; Claude continúa solo con Login responsive.
- **Academia:** flujo visible de prueba y diagnóstico.
- **Sin impacto producción:** preparación source-only.
