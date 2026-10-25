# RESUMEN PARA CLAUDE — C6 DEV root desplegado y gates funcionales PASS

**Fecha:** 2026-08-05  
**Clasificación:** Claude/prototipo · Sin ajuste frontend requerido

## Estado del producto

La URL raíz DEV ya abre la entrada humana canónica:

```text
https://cxorbia-backend-dev.web.app/
→ HTTP 302
→ /index-backend-dev.html
```

La paridad remota entre `/` y `/index-backend-dev.html` es exacta.

## Gates funcionales PASS desde `/`

- Staff: autenticación, recargas y nueva pestaña;
- Shopper: identidad exacta, histórico, certificación, tres recargas y nueva pestaña;
- Cliente y Portal Cliente: autenticación, ruta `cli_dashboard` y panorama visible;
- Portal Shopper: PASS;
- Finanzas: modelo delegado, regalías `0`, valores inventados `false`;
- Reservas: fuente protegida, localStorage no es fuente y mutaciones deshabilitadas.

## No modificar en frontend

- no tocar módulos;
- no rediseñar Login;
- no duplicar Auth;
- no cambiar rutas para compensar el antiguo entrypoint;
- no ocultar estados de fuente;
- no convertir `app/index.html` en entrada backend;
- no agregar otro redirect desde JavaScript.

El P0 se resolvió exclusivamente en Hosting mediante `firebase.json`.

## HOLD no funcional

El workflow terminó HOLD porque su aserción de repositorio limpio observó un archivo efímero `gha-creds-*.json` generado por la acción de autenticación antes de que la propia acción lo eliminara.

```text
PRODUCT_RUNTIME_FAILURE=false
FRONTEND_CHANGE_REQUIRED=false
REMOTE_ROOT_FAILURE=false
QA_WORKFLOW_HYGIENE_ONLY=true
SECOND_DEPLOY_REQUIRED=false
```

## Para la siguiente candidata frontend

Conservar la entrada `index-backend-dev.html`, los adapters protegidos y el Login acumulativo actual. Este hallazgo no abre deuda para Claude ni autoriza cambios visuales.
