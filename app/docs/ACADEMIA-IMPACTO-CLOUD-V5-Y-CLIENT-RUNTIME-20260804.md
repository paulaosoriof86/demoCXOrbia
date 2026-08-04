# Impacto en Academia — Cloud V5 y acceso Cliente runtime

**Fecha:** 2026-08-04  
**Estado:** `DOCUMENTADO__FINAL_RUNTIME_RETRY_ROLLED_BACK__ACTUALIZACION_DEFINITIVA_POST_PASS`

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

## 3. Lección del gate final

La reejecución final terminó con rollback exacto porque el gate Cliente mezclaba en una sola aserción:

```text
clientModule && panorama && !blocked
```

Las capas de autenticación, HR, paridad y módulo ya habían pasado. El gate no navegaba explícitamente a `cli_dashboard` y dependía de copy incidental del Panorama.

Patrón reusable para Academia:

- navegar explícitamente antes de validar una pantalla;
- utilizar markers o selectores estables;
- registrar cada condición por separado;
- no usar un texto visible como única prueba de ruta;
- distinguir fallo de aplicación y fallo de test;
- conservar rollback exacto cuando una escritura temporal no alcanza PASS total.

## 4. Estado actual

- Cloud V5: no aprobado;
- Cloud V6: pendiente de entrega;
- acceso Cliente: preestado restaurado;
- membership temporal: eliminado;
- claims finales: sin cambio;
- gate de ruta Cliente: pendiente de root fix source-only;
- actualización definitiva de cursos/manuales: pendiente del PASS runtime y GO frontend.

## 5. Clasificación

- **Reusable CXOrbia:** white-label, responsive, claims/membership, navegación explícita y gates observables.
- **Exclusivo TyA:** ejemplos `tya/cinepolis`.
- **Cloud/prototipo:** capturas y componentes V6.
- **Academia:** actualizar después del PASS final.
- **Sin impacto proveedor:** este documento no ejecuta writes.
