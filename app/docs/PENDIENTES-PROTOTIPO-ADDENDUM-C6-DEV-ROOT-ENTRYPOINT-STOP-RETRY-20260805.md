# PENDIENTES PROTOTIPO — Addendum C6 DEV root entrypoint STOP_RETRY

**Fecha:** 2026-08-05

## P0 activo — URL raíz DEV no canónica

La URL humana `https://cxorbia-backend-dev.web.app/` todavía sirve remotamente el shell anterior. El correctivo source existe y pasó source/static, pero no fue desplegado.

```text
P0=DEV_ROOT_ENTRYPOINT_CANONICAL_RUNTIME_MISMATCH
SOURCE_FIX_APPLIED=true
SOURCE_STATIC_PASS=true
REMOTE_FIX_LIVE=false
```

## Bloqueo de ejecución

El workflow one-shot se detuvo antes del deploy porque los terminadores `NODE` de dos heredocs estaban indentados dentro del subshell Bash.

```text
OWNER=BACKEND_QA_WORKFLOW
CODE=BASH_HEREDOC_TERMINATOR_INDENTATION_INVALID
DEPLOY_ATTEMPTED=false
HOSTING_DEPLOYS_THIS_BLOCK=0
STOP_RETRY=true
```

## Acción pendiente exacta

- corregir solo la indentación de los terminadores heredoc;
- no cambiar la lógica del workflow;
- repinar únicamente el blob del workflow;
- ejecutar source/static;
- obtener nueva autorización expresa antes de Hosting;
- ejecutar como máximo un deploy;
- validar desde `/` Staff, Shopper, Cliente, Portal Cliente, Portal Shopper, Finanzas y Reservas;
- detenerse para validación humana.

## No pendientes frontend derivados

- no modificar módulos;
- no modificar estilos;
- no modificar Login/Auth;
- no ocultar el bloqueo de fuente;
- no convertir el shell demo en la entrada backend.

## Deuda no bloqueante preservada

- PDF: algunas rutas todavía pueden omitir gráficas;
- Excel: formato visual básico.

El freeze y producción continúan bloqueados hasta que el root remoto y sus gates obtengan PASS.
