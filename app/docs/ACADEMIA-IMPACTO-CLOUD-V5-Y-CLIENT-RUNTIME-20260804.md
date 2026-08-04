# Impacto en Academia — Cloud V5 y acceso Cliente runtime

**Fecha:** 2026-08-04  
**Estado:** `DOCUMENTADO__CLIENT_ROUTE_SOURCE_STATIC_PASS__ACTUALIZACION_DEFINITIVA_POST_RUNTIME_PASS`

## 1. Login y white-label

Después del GO de Cloud V6, Academia debe explicar:

- diferencia entre marca producto y marca tenant;
- países del tenant como información visual, no como permisos;
- composición responsive en desktop, tablet y móvil;
- accesibilidad mediante teclado, foco y reducción de movimiento;
- evidencia real por viewport y manifest de hashes.

Mientras V5 permanezca HOLD, no actualizar capturas de cursos o manuales como definitivas.

## 2. Auth Cliente

Los materiales técnicos deben separar:

1. identidad existente en Firebase Auth;
2. claims de rol, tenant y proyecto;
3. membership canónica en `tenants/{tenantId}/users/{uid}`;
4. sign-in válido;
5. navegación explícita a la ruta funcional;
6. render del módulo esperado;
7. copy visible de la pantalla;
8. autorización efectiva de datos.

Un usuario autenticado no equivale por sí solo a una membership válida. Una membership válida tampoco prueba que el navegador esté situado en la ruta correcta.

## 3. Patrón reusable del gate Cliente

La aserción anterior mezclaba:

```text
clientModule && panorama && !blocked
```

El correctivo source-only quedó validado:

- navegación explícita a `cli_dashboard`;
- espera de `CX.session.view === 'cli_dashboard'`;
- navegación activa `#nav-cli_dashboard`;
- marker estable `#view .ph`;
- evidencia separada de `clientModule`, `route`, `panorama` y `blocked`;
- errores específicos por capa;
- etapa original preservada antes de ejecutar rollback.

Gate:

- run `30936681878`;
- job `92084479259`;
- decisión `PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`;
- gate interno `PASS_C6_CLIENT_ROUTE_SOURCE_STATIC`;
- blockers 0;
- warnings 0;
- provider reads y writes 0.

## 4. Lecciones para cursos y manuales

- navegar explícitamente antes de validar una pantalla;
- usar markers o selectores estables;
- registrar cada condición por separado;
- no usar copy visible como única prueba de ruta;
- distinguir módulo registrado, ruta activa, render y contenido;
- distinguir fallo de aplicación y fallo de test;
- capturar la etapa original antes del rollback;
- conservar rollback exacto cuando una escritura temporal no alcanza PASS total.

## 5. Estado actual

- Cloud V5: no aprobado;
- Cloud V6: pendiente de entrega;
- acceso Cliente: preestado restaurado tras la última ejecución;
- membership temporal: eliminado;
- claims finales: sin cambio;
- gate de ruta Cliente: source/static PASS;
- runtime con gate corregido: pendiente de nueva autorización;
- actualización definitiva de cursos/manuales: pendiente del PASS runtime y GO frontend.

## 6. Clasificación

- **Reusable CXOrbia:** white-label, responsive, claims/membership, navegación explícita, markers estables y gates observables.
- **Exclusivo TyA:** ejemplos `tya/cinepolis`.
- **Cloud/prototipo:** capturas y componentes V6.
- **Academia:** contenido técnico documentado; capturas definitivas después del PASS final.
- **Sin impacto proveedor:** este bloque no ejecutó provider reads ni writes.
