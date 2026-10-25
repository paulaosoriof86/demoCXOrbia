# CAMBIOS-BACKEND — addendum Corte 6 · identidad real protegida

**Fecha:** 2026-07-30  
**Estado:** `C6_AUTOENTRY_VISUAL_OBSERVED_PASS__PROTECTED_IDENTITY_READONLY_PASS__SOURCE_SAFE_MASKING_EXPECTED_ONLY_IN_PUBLIC_PREVIEW__NO_PRODUCTION`

## Hallazgo visual
La validación humana DEV confirmó que el acceso automático del prototipo ya funciona y que el preview source-safe carga Cinépolis/Julio 2026. En Shoppers sigue apareciendo `Shopper protegido` porque esa ruta humana usa deliberadamente el snapshot HR source-safe estático y público, donde la PII debe permanecer enmascarada.

Ese placeholder no debe trasladarse a la operación protegida. Admin/Operativo autenticado debe leer la identidad real desde Firestore protegido; un shopper autenticado solo debe acceder a su propio perfil según Rules.

## Verificación de causa raíz — read-only
Se agregó `tools/qa/cxorbia-corte6-protected-shopper-identity-readonly.mjs` y se integró al workflow existente de Corte 6 sin crear rama/PR/workflow transportador nuevo.

Resultado final: `PASS_C6_PROTECTED_IDENTITY_READONLY_RUNTIME_READY`.

Conteos comprobados directamente en `cxorbia-backend-dev`, sin exportar nombres ni IDs:
- perfiles shopper protegidos: 340;
- perfiles con nombre real visible: 340;
- perfiles con placeholder `Shopper protegido`: 0;
- perfiles sin nombre visible: 0;
- visitas canónicas: 616;
- visitas con nombre real: 616;
- visitas con placeholder: 0;
- visitas sin nombre/shopperId: 0;
- shopperIds canónicos distintos referenciados por las visitas: 194;
- perfiles referenciados existentes: 194/194;
- perfiles referenciados con nombre real: 194/194;
- placeholders/missing entre perfiles referenciados: 0.

Gates estáticos también PASS:
- Rules de shoppers: operador o shopper propio;
- deny-by-default activo;
- `backend-firebase.js` carga colección protegida y usa campos reales de nombre;
- source-safe público permanece enmascarado;
- Rules desplegadas verificadas y hash local coincide con evidencia desplegada.

## Desvíos encontrados durante el gate y corrección
Un primer intento del gate read-only quedó contaminado por pasos heredados del workflow consumido de Auth/Rules: el dry-run de claims ya no aplicaba después del import91 y un dry-run de Rules sustituía temporalmente el artefacto `LATEST` dentro del workspace. Ambos se aislaron para que solo corran cuando el request one-shot de Auth está realmente habilitado. No hubo provider mutation durante estos intentos.

El estado final GitHub es `PASS_C6_PROTECTED_IDENTITY_READONLY`.

## Solución de raíz
No copiar nombres reales al JS source-safe ni al Hosting público. La solución correcta es mantener dos capas:
1. preview humano source-safe: enmascarado, read-only, sin PII;
2. runtime autenticado protegido de preproducción/producción: Firestore + Auth/RBAC/Rules, donde Admin/Operativo recibe identidad real y shopper recibe solo su identidad autorizada.

El siguiente smoke protegido debe fallar si el runtime autenticado usa `hr-source-safe` como fuente de identidad o si renderiza `Shopper protegido` para un shopper canónico que sí tiene perfil real.

## Qué se preserva
- Corte3 FROZEN;
- R17N 1,406/1,406, sin repetir;
- Corte5 CX.data Firestore PASS;
- Auth import/readback91/91, sin repetir/resetear;
- claims5/5 + Rules PASS;
- 21 credenciales shopper sin vínculo exacto, demo1 y ambiguos18/77 continúan HOLD; no resolver por nombre/coincidencia visual.

## Clasificación
- **Reusable CXOrbia:** separación source-safe público vs identidad protegida; release gate que verifica identidad real sin exportarla.
- **Exclusivo cliente:** perfiles TyA/Cinépolis y mapeos de shoppers.
- **Claude/prototipo:** sin cambio de módulos; no reemplazar identidad real por placeholders en runtime protegido.
- **Academia:** privacidad por capa, mínimo privilegio, identidad protegida y gates anti-fuga/anti-placeholder.
- **Sin impacto Claude:** lectura Admin SDK agregada, conteos sanitizados y verificación de Rules/adapters.

## Estado seguro / siguiente bloque
Este bloque hizo únicamente lecturas provider y cambios de repo/docs/workflow. Auth writes0; Firestore data writes0; Rules deploy0; Hosting0; Storage/HR/legacy/payments/Functions/Make/Gemini0; merge=false; producción=false; PII exportada0.

Siguiente bloque operativo permitido sin nueva autorización de writes: `REFRESH HR READ-ONLY → RESOLVER/CLASIFICAR AGOSTO HN → PREPARAR DELTA-ONLY WRITE PLAN`. La materialización de agosto requiere autorización explícita posterior.