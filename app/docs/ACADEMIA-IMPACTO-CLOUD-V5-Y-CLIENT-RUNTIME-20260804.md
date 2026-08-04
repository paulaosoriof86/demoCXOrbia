# Impacto en Academia — Cloud V6 y ciclo de vida del acceso Cliente

**Fecha:** 2026-08-04  
**Estado:** `DOCUMENTADO__CLIENT_RUNTIME_ROUTE_WAIT_ROLLED_BACK__CLOUD_V6_NOT_AUDITED`

## 1. Login y white-label

Después del GO real de Cloud V6, Academia debe explicar:

- diferencia entre marca producto y marca tenant;
- países del tenant como información visual, no como permisos;
- composición responsive en desktop, tablet y móvil;
- accesibilidad mediante teclado, foco y reducción de movimiento;
- evidencia real por viewport y manifest de hashes;
- composición acumulativa: una candidata completa, no módulos o pantallas fragmentadas.

Cloud V6 fue recibida, pero todavía no existe auditoría ni GO porque falta `EXECUTION_LANE_READY` con checkout autenticado. No actualizar capturas de cursos o manuales como definitivas.

## 2. Capas del acceso Cliente

Los materiales técnicos deben separar:

1. identidad existente en Firebase Auth;
2. claims de rol, tenant y proyecto;
3. membership canónica;
4. sign-in válido;
5. aplicación visible;
6. shell/router montado;
7. rail construido;
8. ruta funcional activa;
9. módulo renderizado;
10. highlight de navegación;
11. datos autorizados.

`#app.on` no prueba por sí solo que el router y el rail estén listos.

## 3. Lección nueva del runtime

La reejecución posterior al route fix terminó:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Etapa interna:

`client_route_wait`.

El código demuestra que:

- `openAndLogin()` espera Auth, HR y `#app.on`;
- `CX.app.enter()` activa `#app.on` antes de `CX.router.mount()`;
- el mount puede quedar diferido detrás del gate de confidencialidad;
- el gate esperaba simultáneamente ruta, nav activa, encabezado y texto.

Patrón reusable:

- separar `AUTH_READY` y `SHELL_READY`;
- no convertir un estado visual temprano en señal de readiness total;
- no usar condiciones compuestas en esperas críticas;
- capturar cada booleano al producirse un timeout;
- tratar ruta/render y highlight como pruebas distintas;
- conservar rollback exacto y la etapa original del fallo.

## 4. Rollback y seguridad

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

- membership temporal eliminado;
- claims finales sin cambio;
- usuarios y password changes: 0;
- Firestore de negocio/HR/Rules/Storage: 0;
- deploy/merge/producción: 0.

## 5. Cloud V6

Archivo recibido:

`Prototype development request V6.zip`.

SHA-256:

`0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`.

Estado:

`NOT_AUDITED__EXECUTION_LANE_NOT_READY`.

Academia no debe usar todavía sus capturas, componentes ni nomenclatura como autoridad.

## 6. Clasificación

- **Reusable CXOrbia:** Auth ready, shell ready, ruta, render y navegación como capas independientes.
- **Exclusivo TyA:** membership y alcance `tya/cinepolis`.
- **Cloud/prototipo:** V6 recibida, no auditada.
- **Academia:** patrón de ciclo de vida y trazabilidad de rollback.
- **Sin impacto frontend:** el runtime no modificó `app/`.
