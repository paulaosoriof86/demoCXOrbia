# CAMBIOS-BACKEND — addendum Corte 6 · acceso automático del prototipo

**Fecha:** 2026-07-30  
**Estado:** `C6_P0_PROTOTYPE_AUTOENTRY_FIX_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH__NO_PRODUCTION`

## Hallazgo reproducible
La validación humana del build DEV mostró que, aunque se había eliminado el gate separado `Acceso seguro`, el backend seguía interceptando la selección de rol y agregaba `Usuario + Contraseña` dentro de la tarjeta. Eso continúa siendo una regresión contra el comportamiento aprobado del prototipo: seleccionar el rol entra automáticamente al shell correspondiente.

Además, el formulario quedaba por debajo del viewport y la pantalla no permitía un recorrido usable. No se requiere otra prueba de ese build ni credenciales de Paula.

## Causa raíz
- `app/app.js` conserva el contrato original: botón de rol → `selectRole(...)` → guardar sesión → `enter()`.
- `app/core/backend-browser-auth.js` solo alteraba ese contrato cuando `CX.BACKEND.enabled=true` y `devPreviewAuth.enabled=true`, sustituyendo `selectRole` por `showCredentialStep(role)`.
- `backend-cxdata-readonly-corte4.js` además vaciaba `CX.data` mientras esperaba Auth protegido, por eso el diagnóstico podía quedar en 0.

## Corrección aplicada en rama viva
1. `app/core/backend-config-preview-dev.js`
   - para la ruta **humana** DEV: `CX.BACKEND.enabled=false`;
   - `humanVisualSourceSafe=true`;
   - `devPreviewAuth.enabled=false` y `humanCredentialPrompt=false`;
   - la fuente visible se declara explícitamente `hr-source-safe`, no Firestore autenticado;
   - Auth/RBAC permanece validado por gates/provider separados.
2. `app/core/backend-cxdata-readonly-corte4.js`
   - preserva el snapshot HR source-safe en la ruta humana;
   - bloquea todas las mutaciones directas/operativas;
   - no cae a demo ni vacía el dataset aprobado.
3. `app/core/backend-preview-status.js`
   - rotula `HR source-safe · validación visual` y `Auth: validado por gate separado`;
   - muestra proyecto/conteos/periodo sin afirmar una sesión Firebase humana inexistente.
4. Gates de Hosting/preflight actualizados para exigir el acceso automático y baseline source-safe exacta.

## Evidencia Git
- `054e4d8726f898800f1043d932e661e5d543f4b2` — config human visual auto-entry.
- `b462203f68186404ddfa5898a35b0eabc7607841` — readonly source-safe preservado.
- `f8d658a9b787287523cfccef8deb4d84fdbc2c5e` — diagnóstico honesto.
- `1f8be10d107583d76aeae95c13e3ae95d7042dde` — preflight.
- `e9f0ab243ac75b52babfc2f617489133f151213a` — gates/remote smoke.
- `29b7f9404a9c2f144145fe24d5cf048f753c1e75` — revalidación estática sin provider write.

Gate GitHub: `success · PREPARED_C6_PROTOTYPE_AUTO_ENTRY_NO_EXECUTE`.

La validación estática confirmó `cinepolis`, **14 periodos**, **616 visitas**, source-safe=true, sintaxis y ausencia del prompt Auth humano. La autorización anterior de Hosting continúa consumida, por lo que este gate no desplegó nada.

## Qué se preserva
- R17N 1,406/1,406; no repetir.
- Corte3 FROZEN.
- Corte5 Firestore/CX.data PASS.
- Auth import/readback 91/91; no repetir ni resetear.
- claims/Rules ya validados.
- 21 shopper credentials sin vínculo exacto, demo1 y ambiguos18/77 siguen HOLD.

## Clasificación
- **Reusable CXOrbia:** separar validación humana UX de gates provider; no convertir Auth en una UI técnica; fuente visual explícita y honesta.
- **Exclusivo cliente:** snapshot HR TyA/Cinépolis y credenciales legacy TyA.
- **Claude/prototipo:** no requiere nueva candidata; conservar el auto-entry aprobado y no reintroducir formularios técnicos en el login.
- **Academia:** manuales deben enseñar el flujo operativo aprobado; Auth/provider es infraestructura, no un paso de validación DEV para usuarios.
- **Sin impacto Claude:** import Auth91, Rules, requests, evidencia provider y gates.

## Estado seguro y siguiente gate
Desde este hallazgo: Auth writes0; Firestore data writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/Functions/Make/Gemini0; merge=false; producción=false.

Siguiente gate único: `AUTORIZACIÓN FRESCA DE UN ÚNICO REDEPLOY DEL MISMO HOSTING DEV → PRECHECK → DEPLOY1 → SMOKE REMOTO AUTO-ENTRY/SOURCE-SAFE → VISUAL PAULA → FREEZE CORTE6`.
