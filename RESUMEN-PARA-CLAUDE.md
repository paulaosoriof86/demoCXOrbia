# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-12 15:56 -06:00  
**Estado:** `C6_STAFF_ADMIN_SHELL_HEREDOC_ROOTCAUSE_FIXED__STOP_RETRY__PHASE_A_88`

## Estado vigente

C6 Staff Exact Write V2 permanece cerrado con PASS real en `cxorbia-backend-dev`.

El wiring source `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend` permanece implementado para Staff.

En el run autorizado `31644318836`, el selector Staff/admin ya produjo correctamente `PASS_C6_EXISTING_STAFF_ADMIN_E2E_CREDENTIAL_SELECTION_READONLY`, con cero Auth/password writes y sin exportar valores.

El proof no alcanzó Hosting ni runtime porque el shell del workflow tenía dos heredocs `NODE` anidados con cierre indentado dentro del `if/else`; Bash los interpretó como no cerrados y terminó en `syntax error: unexpected end of file`.

La corrección source quedó en `f8efd98e92448739b458aa838cd1f6f8c6efbc6e`:

- se sustituyeron los heredocs anidados por validaciones `node -e`;
- se agregó `gha-creds-*.json` al exclude local, porque el artifact del run mostró que el action de Google crea ese archivo temporal y habría hecho fallar el clean-worktree gate posterior aun con runtime correcto.

**Phase A certificado: 88% | restante: 12%.** No se suma porcentaje hasta certificar el runtime DEV remoto.

## Frontend / Claude

- No generar nueva candidata.
- No reabrir Login, Exact Write V2, D rebase, Auth340, SKIP13, MultiAuth, HR ni M4/static.
- No se modificó `app/modules` ni se hizo rediseño.
- PDF/XLSX/PPTX de `app/modules/cliente-extra.js` siguen como pendiente frontend heredado y separado de C6.
- Si el próximo runtime Staff produce una diferencia visual reproducible, corregirla por archivo/módulo; no reinterpretar reglas HR ni membresía.

## Siguiente acción exacta

Por `STOP_RETRY`, no rerunear `31644318836` ni reutilizar su request.

Con nueva autorización puntual: crear un nuevo request one-shot bound al HEAD vivo que incluya `f8efd98e92448739b458aa838cd1f6f8c6efbc6e` y ejecutar como máximo un Hosting DEV para:

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF → M7 → M8 → M9 → M10`.

Hosting DEV consumido: `0/1`.

## Academia

Sin cambio de contenido todavía. Al certificar runtime Staff, revisar manuales, cursos, rutas por rol, permisos, errores frecuentes y notificaciones de acceso/administración.
