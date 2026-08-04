# Impacto en Academia — Control plane, Cloud V6 y pruebas dentro de la plataforma

**Fecha:** 2026-08-04  
**Estado:** `DOCUMENTADO__CONTROL_PLANE_SOURCE_STATIC_PASS_LOCAL__CLOUD_V6_NOT_AUDITED__LABORATORIO_PENDIENTE`

## 1. Login y white-label

Después del GO real de Cloud V6, Academia debe explicar:

- diferencia entre marca producto y marca tenant;
- países del tenant como información visual, no como permisos;
- responsive desktop/tablet/móvil;
- teclado, foco y reducción de movimiento;
- evidencia real por viewport y manifest;
- candidata acumulativa única.

Cloud V6 sigue sin auditoría ni GO. No actualizar capturas definitivas.

## 2. Máquina de estados reusable

La validación técnica ya no debe explicar el acceso como un único estado. La secuencia vigente es:

```text
AUTH_READY
→ CLAIMS_READY
→ MEMBERSHIP_READY
→ DATA_READY
→ SHELL_READY
→ ROUTE_READY
→ VIEW_READY
→ DOMAIN_READY
```

Cada estado tiene una condición, snapshot, timeout y error específico.

El highlight del menú es evidencia visual, pero no reemplaza la autoridad de ruta y render.

## 3. Transacciones separadas

Academia debe diferenciar:

### Acceso

```text
snapshot → apply si hace falta → idempotencia → readback → rollback dry-run → PASS_ACCESS
```

### Runtime read-only

```text
HR viva → paridad → único browser gate multirol
```

Un fallo de Finanzas, Reservas o navegación posterior no debe deshacer automáticamente un acceso que ya pasó su propia prueba.

## 4. Pruebas dentro de la plataforma

Se incorpora como patrón reusable, tomado del proyecto Finanzas sin copiar su dominio:

- escenarios realistas `AUDIT-*`;
- ejecución visible en DEV;
- PASS, FAIL o BLOCKED por etapa;
- actividad observable en los módulos;
- sincronización entre módulos;
- tres recargas y nueva pestaña;
- screenshots y timeline;
- fingerprints antes/después;
- cleanup exacto;
- `baselineRestoredAfterCleanup=true`.

Lección central:

> una prueba de archivos o DOM no sustituye la demostración de que una operación real puede atravesar el producto y reflejarse correctamente en sus módulos relacionados.

## 5. Primer release slice

La primera salida operativa prioriza:

`ADMIN/OPERACIONES + SHOPPER`.

El Portal Cliente queda en un corte paralelo. Academia debe señalarlo de manera honesta: no bloquea el primer cutover, pero tampoco se considera terminado.

## 6. Gates source-only

Resultados de la sesión:

```text
PASS_FORENSIC_CONTROL_PLANE_STABILIZATION
PASS_C6_CLIENT_ROUTE_SOURCE_STATIC
```

- blockers: 0;
- warnings: 0;
- sin credenciales;
- sin navegador/runtime;
- sin provider reads/writes;
- sin deploy.

No existe telemetría remota verificable del runner; no se presenta como PASS de Actions.

## 7. Seguridad y rollback

El runtime previo terminó con rollback exacto y producción intacta. El nuevo diseño exige:

- SHA fuente inmutable;
- requestId estable;
- evidencia sanitizada;
- transacciones separadas;
- cleanup exacto para datos de auditoría;
- falla de cleanup clasificada como P0 del laboratorio.

## 8. Clasificación

- **Reusable CXOrbia:** state machine, control plane único, laboratorio, fingerprints y cleanup.
- **Exclusivo TyA:** rutas de Admin/Operaciones y Shopper y ejemplos `tya/cinepolis`.
- **Cloud/prototipo:** V6 pendiente de auditoría acumulativa.
- **Academia:** materiales actualizados conceptualmente; capturas definitivas pendientes.
- **Sin impacto frontend:** ningún archivo funcional `app/` cambió en este macrobloque.
