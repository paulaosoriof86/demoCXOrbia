# CAMBIOS-BACKEND — Addendum C6 Login humano e identidad Shopper

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia · Backend/Auth · Sin cambio de módulos

## P0 demostrado

La pantalla humana presentaba un formulario principal visible pero inerte y, después de seleccionar el rol, agregaba un segundo formulario `#cxIntegratedAuthStep`.

```text
CODE=HUMAN_LOGIN_SINGLE_FORM_CONTRACT_BROKEN
```

## Cambio source-only

Se modificó únicamente `app/core/backend-browser-auth.js` para:

- reutilizar `#loginForm`, `#lgUser`, `#lgPass` y `#lgSubmit`;
- exigir selección de perfil;
- validar la correspondencia entre perfil elegido y rol real;
- eliminar cualquier overlay legado si otro wrapper intenta conservarlo;
- mantener sesión Firebase, claims y namespaces `staff/shopper`;
- no persistir contraseñas, tokens, correos internos o UID.

No se modificaron `app/modules`, estilos, `CX.data`, reglas de negocio ni proveedores.

## QA creado

- `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`;
- `.github/workflows/cxorbia-c6-human-login-shopper-identity-audit.yml`;
- `backend/config/corte6-human-login-shopper-identity-audit.json`;
- evidencia source-safe consolidada.

## Source/static

```text
run=31041288528
artifact=8944661204
PASS_READONLY_POST_GATES
```

## Auditoría read-only

```text
run=31041406837
artifact=8944714638
PASS_C6_HUMAN_LOGIN_SHOPPER_IDENTITY_AUDIT_WITH_FINDINGS
```

Hallazgos principales: 109 credenciales Shopper únicas; 88 identidades Auth/claims/proyecto válidas; 85 sign-ins compatibles; 79 cumplen `nombre.apellido`; 81 cumplen `Nombre123*`; 21 no tienen Auth; 252 perfiles no tienen mapeo de credencial; no existen memberships Shopper en `tenants/tya/users`.

Paula presenta una candidata Staff y una Shopper; solo una tiene Auth/claims válidos y ninguna está full-ready bajo el contrato auditado.

## Seguridad

Cero deploy, Cloud Run, Firestore/Auth/Rules/Storage/HR writes, cambios o resets de contraseña, Make, Gemini, pagos, merge o producción.

## Pendiente

Definir el contrato canónico de identidad Shopper y preparar un dry-run idempotente antes de solicitar cualquier write.
