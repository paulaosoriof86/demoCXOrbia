# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_HUMAN_VISUAL_FAIL__P0_SHOPPER_IDENTITY_NULL__ADMIN_PROFILE_INCOMPLETE__NO_NEW_DEPLOY__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN.
- R17N FINAL 1,406/1,406; no repetir.
- Corte5 `CX.data`: cinepolis /14 periodos /616 visitas /current2026-07 PASS.
- Auth import/readback91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- HR live auto-month remote PASS.
- One-shot Cloud Run + Hosting DEV anterior consumido; no reutilizar.

## 2. P0 PROVEN — acceso Shopper sin identidad
Visual real: el portal entra como `Evaluador (sin identidad)` y `shopperId=null`; Mi Perfil y Mis Visitas quedan bloqueados.

Causa en `app/app.js`: la ruta humana alojada en `cxorbia-backend-dev.web.app` no entra a `_isDevAccess()` y por tanto no ejecuta el selector DEV; cae a `selectRole('shopper')` sin identidad.

Reglas:
- no fallback `sh1`;
- no dedupe/match por nombre;
- identidad real = Auth/claims + shopperId estable;
- mantener fail-closed si falta identidad.

## 3. P0 operativo — perfil Admin no está listo para producción
La visual actual usa HR source-safe `display_name_only`. Admin ve nombres, pero faltan campos necesarios para operación: username/credencial, WhatsApp/teléfono, correo y datos adicionales completados por shopper. El histórico individual visible es parcial.

La validación final debe hacerse sobre runtime protegido Firestore/Auth/Rules, no sobre una ruta pública source-safe.

Superadmin debe poder ver los datos operativos completos autorizados. La separación source-safe no es una restricción al Superadmin: evita exponer PII a una URL pública.

## 4. Credenciales
Regla TyA vigente: `nombre.apellido` + contraseña inicial tipo `Nombre123*`.

Pendiente de producto:
- mostrar username en perfil protegido;
- mostrar estado de credencial;
- solo mostrar contraseña inicial/legacy si existe evidencia segura de que es la vigente;
- si no, ofrecer reset controlado al patrón (requiere Auth write autorizado);
- nunca guardar passwords en JS/repo/Firestore público.

## 5. Fuente de datos adicionales del shopper
Existe export reciente de la plataforma vigente con `tya_shoppers_extra`. Recuperar por export/import, sin conexión a la base vieja.

Incluir únicamente datos reales útiles con trazabilidad: contacto, ubicación, documento, perfil, datos de pago y demás campos efectivamente guardados por el shopper. Conflictos/duplicados → review, nunca overwrite silencioso.

## 6. Histórico completo
El perfil debe cruzar con las 616 visitas canónicas por shopperId. No construir el histórico por nombre visual.

Validar:
- todas las visitas históricas del shopper;
- proyecto/periodo correctos;
- realizada/cuestionario/submitida/liquidada/pagada según semántica canónica;
- postulaciones y asignaciones vinculadas sin duplicar.

## 7. KPI shoppers
Los KPI superiores y del perfil deben abrir detalle útil y consistente. El detalle actual depende de `shopperStats` y filtros de estado demasiado estrechos para parte del histórico.

Pendiente focalizado:
- consolidar facetas canónicas de visita para KPI;
- drill con filas completas;
- no contar `submitida` como inexistente por un filtro legacy;
- perfiles completos/incompletos basados en backend protegido, no en overlay display-only.

## 8. P1/P2 no bloqueante
- PDF sin gráfica final;
- Excel sin formato final;
- reportKit/exportaciones transversales;
- copy de fuentes/readiness.

## 9. Julio/agosto
No iniciar delta agosto hasta cerrar este P0 y recuperar/conectar source-of-truth exacto platform-origin. No copiar julio ni repetir histórico.

## 10. Academia/manuales
Actualizar:
- login Shopper real y resolución de identidad;
- username/contraseña inicial y reset;
- diferencia entre source-safe y consola protegida;
- permisos Superadmin vs Shopper;
- lectura de KPI e histórico.

## 11. Siguiente bloque exacto
`PROTECTED-RUNTIME READ-ONLY VALIDATION → PROFILE FIELD INVENTORY + LEGACY EXPORT RECONCILIATION → DELTA PLAN → AUTH/FIRESTORE GATES → REDEPLOY DEV CON AUTORIZACIÓN NUEVA → VISUAL`.

Producción/merge siguen bloqueados.
