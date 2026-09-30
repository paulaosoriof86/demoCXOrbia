# CAMBIOS BACKEND — ADDENDUM CORTE 6 · VISUAL FAIL SHOPPER / PERFIL COMPLETO

**Fecha:** 2026-07-31  
**Estado:** `C6_HUMAN_VISUAL_FAIL__P0_SHOPPER_IDENTITY_NULL__ADMIN_PROFILE_INCOMPLETE__NO_NEW_DEPLOY__NO_PRODUCTION`

## 1. Evidencia humana

La validación visual posterior al PASS técnico remoto NO cierra Corte 6.

Capturas de Paula muestran simultáneamente:

1. Admin / Shoppers carga nombres reales operativos y 208 shoppers en la ruta HR source-safe.
2. El perfil Admin muestra nombre/histórico parcial, pero `Usuario` y `Contraseña` aparecen vacíos y faltan WhatsApp/correo y otros campos que puedan existir en la plataforma vigente.
3. El historial visible de una shopper contiene solo una fracción de sus visitas históricas esperadas.
4. El acceso Shopper entra como `Evaluador (sin identidad)` y `shopperId=null`; Mi Perfil y Mis Visitas fallan cerrado.
5. La vista de KPI/listas no satisface el detalle operativo solicitado.

Por tanto, el gate humano `HUMAN_VISUAL_ADMIN_SHOPPER_NAMES_AND_SHOPPER_ROLE_MODULES` queda **FAIL** y Corte 6 NO se congela.

## 2. P0 reproducible — shopperId nulo en Hosting DEV

Causa raíz comprobada en `app/app.js`:

- El botón Shopper solo ejecuta `pickShopperDev()` cuando `_isDevAccess()` devuelve true.
- La allowlist DEV fija solo contiene `localhost`, `127.0.0.1` y `[::1]`, salvo flags/perfil inyectados.
- El host real `cxorbia-backend-dev.web.app` no entra por esa allowlist en la ruta humana source-safe.
- El click cae a `selectRole('shopper')` sin `shopperId`.
- Fuera de demo, `selectRole` deliberadamente no inventa `sh1`; crea sesión Shopper con `shopperId:null`.
- Los módulos privados fallan cerrado, exactamente como muestran las capturas.

Clasificación: **P0_PROVEN**, porque impide el ciclo Shopper de Phase A.

## 3. Segunda causa raíz — se validó una ruta source-safe para un requerimiento de datos protegidos completos

La ruta humana actual fue construida como `HR source-safe · validación visual`. Su alcance remoto fue deliberadamente `display_name_only`.

Eso permite validar nombres operativos sin fuga pública, pero no puede ser la ruta final para:

- teléfono/WhatsApp;
- correo;
- documento;
- datos de pago/banco cuando existan y el rol esté autorizado;
- credenciales/estado de credencial;
- campos agregados por el shopper en la plataforma vigente;
- identidad Shopper autenticada;
- histórico completo por `shopperId`.

La operación real debe usar el runtime protegido ya existente: Firebase Auth + claims + Firestore Rules + `backend-firebase.js`, con Admin/Superadmin leyendo perfiles autorizados y Shopper leyendo solo su propia identidad.

Esto no significa ocultar información a Superadmin. Significa que la información completa no puede exponerse en una URL pública/source-safe sin autenticación.

## 4. Datos que deben quedar disponibles para Superadmin

El perfil operativo completo debe consolidar, cuando la fuente real los entregue:

- nombre y apellidos;
- username TyA/CXOrbia;
- estado de credencial;
- WhatsApp/teléfono;
- correo;
- país/departamento/ciudad;
- edad/sexo cuando existan;
- documento/ID cuando corresponda;
- datos de pago/banco cuando corresponda;
- estado/certificación;
- datos adicionales completados por el shopper en la plataforma vigente;
- historial completo de visitas por proyecto/periodo;
- postulaciones, certificaciones, liquidaciones y pagos según scope.

No se copiarán campos sensibles a JS estático ni a repo. Se sirven únicamente desde backend protegido al rol autorizado.

## 5. Credenciales: regla funcional y seguridad

La regla histórica del producto es `usuario = nombre.apellido` y contraseña inicial tipo `Nombre123*`.

Debe preservarse como continuidad operativa. Sin embargo, Firebase Auth no permite leer de vuelta la contraseña actual de un usuario. Por eso:

- username sí debe estar disponible en perfil protegido;
- contraseña inicial/legacy solo puede mostrarse si existe evidencia segura y explícita de que sigue siendo la credencial vigente;
- no se guardará una contraseña en claro en Firestore público, JS estático ni repo;
- cuando no pueda comprobarse la contraseña actual, la operación correcta es estado de credencial + restablecimiento controlado al patrón autorizado, nunca inventar una contraseña visible.

Cualquier reset/import adicional de Auth requiere autorización específica; Auth91/91 no se repite.

## 6. Recuperación de información de la plataforma vigente

Existe export reciente de la plataforma actual con `tya_shoppers_extra` y campos operativos adicionales, incluyendo username, WhatsApp, correo y otros datos según cada perfil.

Se utilizará únicamente como **fuente de export/import**, nunca conectando la base vieja.

Reglas de conciliación:

- priorizar IDs estables/evidencia canónica;
- no deduplicar solo por nombre o teléfono;
- conflictos a revisión;
- conservar el dato más completo/actual solo con trazabilidad;
- no sobrescribir silenciosamente Firestore.

## 7. Histórico y KPI

El histórico del perfil debe salir de las 616 visitas canónicas del backend y enlazarse por `shopperId` estable, no por nombre de pantalla.

El detalle de KPI debe permitir drill real y usar semántica canónica de estados. La lógica actual de `shopperStats` es demasiado estrecha para estados históricos como `submitida` y no debe subcontar actividad ejecutada.

## 8. Qué NO se hace en este bloque

- no nuevo Cloud Run deploy;
- no nuevo Hosting deploy;
- no Firestore data writes;
- no Auth writes/reset/import;
- no Rules deploy;
- no HR writes;
- no Storage;
- no Make/Gemini;
- no pagos;
- no merge;
- no producción;
- no repetir R17N 1,406;
- no reimportar Auth91.

La autorización one-shot anterior ya fue consumida y no puede reutilizarse.

## 9. Clasificación obligatoria

- **Reusable CXOrbia:** separación entre preview source-safe y consola autenticada completa; perfil consolidado por fuente; credencial no recuperable; drill por estado canónico.
- **Exclusivo cliente:** patrón TyA `nombre.apellido` / contraseña inicial `Nombre123*`, fuentes históricas TyA y migración de perfiles actuales.
- **Claude/prototipo:** `app/modules/shoppers.js` debe mostrar el perfil completo autorizado y KPI drill consistente cuando el backend lo entregue; no inventar valores faltantes.
- **Academia:** actualizar login Shopper, recuperación/reset de credenciales, privacidad por rol y lectura de histórico/KPI.
- **Sin impacto Claude:** conciliación export→backend, provider read diagnostics y gates de integridad.

## 10. Siguiente bloque exacto

`NO FREEZE C6 → PROTECTED-RUNTIME READ-ONLY VALIDATION → PROFILE FIELD INVENTORY / LEGACY EXPORT RECONCILIATION → EXACT DELTA PLAN → AUTH/FIRESTORE WRITE GATES SEPARADOS SI HACEN FALTA → REDEPLOY DEV SOLO CON AUTORIZACIÓN NUEVA → HUMAN VISUAL → FREEZE`.
