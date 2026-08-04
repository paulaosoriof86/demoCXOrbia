# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-04  
**Estado:** `CLIENT_RUNTIME_ROUTE_WAIT_FAIL__ROLLBACK_EXACT__LIFECYCLE_ROOT_CAUSE_PROVEN__CLOUD_V6_NOT_AUDITED_LANE_BLOCKED__NO_PRODUCTION`

## 1. Carril vigente

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- baseline acumulativa única preservada;
- producción `tya-plataforma` intacta.

## 2. Autoridades preservadas

- 29 decisiones únicas cerradas y 0 restauraciones requeridas;
- source/static acumulativo 53/53 PASS;
- M1/Corte 1, Corte 2A/V174 y Corte 3/V182 preservados;
- autoridad HR viva conocida: 15 periodos, 660 visitas y 209 shoppers;
- Finanzas y Reservas canónicas preservadas;
- ningún cambio funcional en `app/` durante este bloque.

## 3. Reejecución runtime autorizada

Solicitud one-shot:

`c6-client-access-repair-runtime-20260804-routefix-01`.

- autorización commit `f95adea1073633e7e6d638183ff4ec04bedaf979`;
- evidencia commit `7924b1c83bc99e6fdf9a4d081e1bb6c11d24aefc`;
- estado `consumed_fail`;
- no reutilizable.

Resultado:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Etapa interna exacta:

`client_route_wait`.

Error:

`page.waitForFunction: Timeout 30000ms exceeded`.

La ejecución había superado snapshot, materialización temporal idempotente, readback, autoridad HR dinámica, paridad remota, runtime Staff/Shopper y runtime Cliente con tres recargas y nueva pestaña.

## 4. Rollback

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

- preestado restaurado: sí;
- membership temporal eliminado;
- claims finales sin cambio;
- usuarios creados: 0;
- cambios/resets de contraseña: 0;
- Firestore de negocio: 0;
- HR/Rules/Storage: 0;
- Hosting/Cloud Run: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción intacta.

## 5. Causa raíz vigente

El helper de login considera listo el acceso con Auth, HR y `#app.on`. Sin embargo, `CX.app.enter()` activa `#app.on` antes de `CX.router.mount()`, y el mount puede quedar diferido por el gate de confidencialidad.

El gate runtime después exige simultáneamente:

- `session.view === cli_dashboard`;
- `#nav-cli_dashboard` activo;
- `#view .ph`;
- texto renderizado.

El nav solo existe cuando el rail fue construido. Por tanto, el contrato de espera confunde **app visible** con **shell/router listo**. El source/static anterior comprobó marcadores, pero no este orden temporal.

Pendiente source-only:

- separar `AUTH_READY` de `SHELL_READY`;
- esperar router/rail antes de navegar;
- identificar confidencialidad pendiente;
- guardar snapshot booleano completo en timeout;
- validar ruta/render y highlight como capas separadas;
- ejecutar gate local/estático sin credenciales;
- detenerse antes de otro runtime.

## 6. Cloud V6

Recibido:

`Prototype development request V6.zip`.

SHA-256:

`0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`.

Estado:

`NOT_AUDITED__EXECUTION_LANE_NOT_READY`.

El ZIP está extraído, pero la sesión no tiene checkout autenticado de la rama viva: el entorno local no resuelve `github.com`. Conforme al lock prevalente, no se inició auditoría semántica, no se declaró GO/HOLD y no se aplicó un delta fragmentado mediante conectores.

La candidata deberá evaluarse como una única composición acumulativa contra el HEAD vivo; nunca como Login aislado ni por módulos sueltos.

## 7. Siguiente bloque exacto

```text
SOURCE-ONLY CLIENT SHELL READINESS ROOT FIX
→ PASS LOCAL/ESTÁTICO DE CICLO DE VIDA
→ OBTENER EXECUTION_LANE_READY CON CHECKOUT AUTENTICADO
→ AUDITORÍA FOCAL ACUMULATIVA CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO SI GO Y SIN P0
→ GATES
→ DEV ÚNICO SOLO SI CAMBIA app/
```

No corresponde un nuevo runtime ni un empalme antes de estos gates.

## 8. Clasificación

- **Reusable CXOrbia:** Auth ready ≠ shell ready; evidencia de timeout por capa.
- **Exclusivo cliente:** membership TyA/Cinépolis.
- **Cloud/prototipo:** V6 recibida y pendiente de carril.
- **Academia:** ciclo de vida de autenticación, shell, ruta y render.
- **Sin impacto frontend:** `app/` intacto.
