# Auth RBAC Phase A Contract v1

Fecha: 2026-07-08  
Bloque: contrato Auth/RBAC Phase A  
Estado: creado, no conectado, seguro.

## 1. Objetivo

Avanzar la base del backend real sin esperar la visualizacion, definiendo roles, permisos, rutas y gates para Auth.

Este bloque no activa Firebase Auth, no escribe claims, no conecta frontend y no toca produccion.

## 2. Archivos creados

- `backend/contracts/auth-rbac-phase-a-v1.json`
- `tools/release/tya-auth-rbac-contract-validate.mjs`
- `app/docs/AUTH-RBAC-PHASE-A-CONTRACT-V1-20260708.md`

## 3. Roles Phase A

- tenantAdmin;
- projectAdmin;
- financeAdmin;
- certificationAdmin;
- shopper.

`superAdmin` queda reservado para SaaS posterior y `clientViewer` queda fuera de Phase A inicial.

## 4. Rutas cubiertas

- dashboard;
- postulaciones;
- reservas;
- automatizaciones;
- cuestionarioShopper;
- finanzas;
- academia;
- diagnostico;
- administrabilidad.

## 5. Gates definidos

- devAuthConfig: pendiente.
- devClaimsWrite: bloqueado.
- stagingAuth: bloqueado.
- productionAuthCutover: bloqueado.

## 6. Datos prohibidos en repo

- password;
- idDocumentRaw;
- bankAccountRaw;
- signedNdaRaw;
- providerToken;
- refreshToken;
- privateWebhookUrl.

## 7. Auditoria obligatoria

- Todo cambio de rol requiere actorId, motivo, timestamp y source.
- Acciones admin criticas requieren motivo.
- Cambios de pago requieren auditRef.
- Conflictos no se sobreescriben silenciosamente.
- Providers quedan como preparados hasta gate activo.

## 8. Clasificacion obligatoria

- Reusable CXOrbia: si. Matriz base reusable para otros clientes.
- Exclusivo cliente: parcial. Incluye rutas Phase A TyA, pero reusable por tenant/proyecto.
- Claude/prototipo: si. Claude debe respetar rutas/roles y no simular Auth real.
- Academia: si. certificationAdmin y shopper impactan rutas y permisos de Academia.
- Sin impacto Claude: no.

## 9. Estado final del bloque

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin Auth real.
- Sin claims reales.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
