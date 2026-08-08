# RESUMEN PARA CLAUDE — Addendum C6 DEV root entrypoint STOP_RETRY

**Fecha:** 2026-08-05  
**Clasificación:** Claude/prototipo · Sin delta frontend solicitado

## Hallazgo

La URL humana raíz de DEV servía `app/index.html`; las pruebas técnicas usaban `/index-backend-dev.html`. Por eso Paula podía ver el bloqueo genérico de fuente aunque el entrypoint explícito hubiera pasado los gates.

## Corrección preparada

`firebase.json` redirige exclusivamente:

```text
/ → /index-backend-dev.html
HTTP 302
```

No se alteraron módulos, componentes, estilos, Login, roles, navegación ni lógica de negocio.

## Para Claude

- No modificar `app/index.html` para convertirlo en backend.
- No duplicar scripts protegidos dentro del shell demo.
- No tocar `app/modules/*` por este incidente.
- No parchear la pantalla “Fuente de datos no disponible”.
- No reabrir el P0 anterior del Login.
- Mantener `index-backend-dev.html` como entrada humana canónica DEV.

## Gates

Source/static y paridad source del root: PASS.

El Hosting no se desplegó porque el workflow one-shot tuvo un error Bash de terminadores heredoc indentados antes de ejecutar Firebase.

```text
PRODUCT_CHANGE_REQUIRED=false
FRONTEND_CHANGE_REQUIRED=false
DEPLOY_EXECUTED=false
```

## Pendiente backend/QA

Corregir únicamente la indentación heredoc del workflow, repinarlo, ejecutar source/static y solicitar nueva autorización para un único Hosting DEV. Después deben ejecutarse los gates acumulativos desde `/`.

## Impacto frontend

Ninguno demostrado ni autorizado.
