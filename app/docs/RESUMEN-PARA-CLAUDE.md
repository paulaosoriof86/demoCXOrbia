# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-12 16:40 -06:00  
**Estado:** `C6_STAFF_ACTION_METADATA_SUFFIX_ROOTCAUSE_PROVEN__STOP_RETRY__PHASE_A_88`

## Estado vigente

C6 Staff Exact Write V2 permanece cerrado con PASS real en `cxorbia-backend-dev`.

El wiring source `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend` sigue implementado. El repair QA Staff `5c9663dd6b1174cf8d59186484eb09e83316e862` sigue vigente y alinea el smoke con el formulario único real `#loginForm/#lgUser/#lgPass/#lgSubmit`.

El one-shot 05, run `31647758560`, **no llegó a probar ese repair ni a Hosting**. Falló antes, en la resolución de action del request.

## Causa raíz sin impacto frontend

El workflow considera Staff-only únicamente si `authorizationSource` termina exactamente en `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

El request 05 dejó un sufijo adicional `_single_visible_login_form`; por eso la action resultó vacía y el workflow entró en la rama genérica Staff+Shopper. Esa rama encontró el HOLD Shopper histórico y se detuvo antes de deploy.

No corregir frontend, no reintroducir overlays y no reabrir HR/Auth/membership por este fallo. Clasificación: `REQUEST_ACTION_METADATA_SUFFIX_DRIFT`.

## Frontend / Claude

- No generar nueva candidata.
- No modificar `app/modules` por este hallazgo.
- Mantener el formulario único visible de `app/core/backend-browser-auth.js`.
- No reabrir Login, Exact Write V2, D rebase, Auth340, SKIP13, MultiAuth, HR ni M4/static.
- PDF/XLSX/PPTX de `app/modules/cliente-extra.js` continúan como pendiente frontend heredado separado de C6.

## Seguridad del último intento

Run `31647758560`:

- Hosting intentado=false;
- Hosting de la autorización 05 físicamente consumido=`0/1`;
- runtime no ejecutado;
- nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0;
- segundo Exact Write=0;
- segundo intento=0;
- merge=false;
- producción=false.

`STOP_RETRY` aplicado.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A certificado: 88% | restante: 12% | delta certificado: +0%.**

## Siguiente acción exacta

No rerunear `31647758560` ni reutilizar request 05. El próximo request debe quedar bound al HEAD vivo y su `authorizationSource` debe terminar exactamente en `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`, sin sufijo posterior; verificar action resuelta antes de permitir selector/deploy.

Por `STOP_RETRY`, esa ejecución requiere nueva autorización explícita. Con PASS real continuar `M7 → M8 → M9 → M10`.

## Academia

Sin cambio de contenido todavía. Al certificar runtime Staff, actualizar manuales/cursos sobre formulario único, rutas por rol, permisos, errores de acceso y notificaciones. No documentar el overlay legado.
