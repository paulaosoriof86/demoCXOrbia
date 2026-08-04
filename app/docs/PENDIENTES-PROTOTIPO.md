# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `CLIENT_RUNTIME_ROUTE_WAIT_FAIL__ROLLBACK_EXACT__LIFECYCLE_ROOT_CAUSE_PROVEN__CLOUD_V6_NOT_AUDITED_LANE_BLOCKED__NO_PRODUCTION`

## 1. Bloqueante backend vigente

La solicitud one-shot `c6-client-access-repair-runtime-20260804-routefix-01` fue consumida exactamente una vez.

Resultado:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Etapa interna:

`client_route_wait`.

Error:

`page.waitForFunction: Timeout 30000ms exceeded`.

Rollback:

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

El preestado quedó restaurado: membership temporal eliminado, claims sin cambio, usuarios/password changes en cero y producción intacta.

## 2. Causa raíz identificada

El helper de login considera listo el acceso cuando Auth, HR y `#app.on` están activos. Sin embargo:

- `CX.app.enter()` activa `#app.on` antes de `CX.router.mount()`;
- `router.mount()` puede quedar diferido por confidencialidad;
- el gate exige inmediatamente `session.view`, nav activa, encabezado y texto;
- el nav solo existe después de construir el rail.

Por tanto, el gate confundía **app visible** con **shell/router listo**. El PASS source/static anterior validó marcadores, no el orden temporal real.

## 3. Pendiente source-only inmediato

1. separar `AUTH_READY` de `SHELL_READY`;
2. esperar router y rail antes de navegar;
3. hacer observable `confidentialityPending`;
4. capturar en timeout `sessionRole`, `sessionView`, `routerAvailable`, `railBuilt`, `navItemPresent`, `navActive`, `pageHeader` y `viewRendered`;
5. validar ruta/render y highlight como capas separadas;
6. ejecutar sintaxis y gate local/estático;
7. detenerse antes de otro runtime.

No corresponde reintentar con la autorización consumida.

## 4. Cloud V6 recibida

Archivo:

`Prototype development request V6.zip`.

SHA-256:

`0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`.

Estado:

`NOT_AUDITED__EXECUTION_LANE_NOT_READY`.

El ZIP está extraído, pero falta checkout autenticado de la rama viva en la misma sesión. El entorno local no resuelve `github.com`; el conector no sustituye el checkout exigido ni permite un empalme fragmentado archivo por archivo.

No se declaró GO/HOLD y no se aplicó ningún delta.

## 5. Regla de composición V6

La candidata se auditará contra el HEAD vivo como una sola composición acumulativa. Debe preservar todo lo aprobado y separar:

- delta nuevo V6;
- mejoras válidas heredadas de V5;
- pendientes P1/P2 realmente atendidos;
- regresiones;
- archivos redundantes o parciales;
- elementos que no correspondan al frontend.

Nunca se empalmará únicamente el Login ni una colección de módulos sueltos.

## 6. Warnings P1/P2 vivos

- overlay A+B superseded aún cargado;
- PDF puede omitir gráficas;
- Excel mantiene formato básico;
- responsive parcial en superficies densas;
- Cloud V6 todavía no auditada.

## 7. Secuencia exacta

```text
SOURCE-ONLY CLIENT SHELL READINESS ROOT FIX
→ PASS LOCAL/ESTÁTICO
→ EXECUTION_LANE_READY
→ AUDITORÍA FOCAL ACUMULATIVA CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO SI GO Y SIN P0
→ GATES
→ DEV ÚNICO SI CAMBIA app/
```

## 8. Estado seguro

- cambios funcionales `app/`: 0;
- estado proveedor restaurado: sí;
- Firestore de negocio/HR/Rules/Storage: 0;
- Hosting/Cloud Run: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
