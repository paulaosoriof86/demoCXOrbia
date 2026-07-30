# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `C6_AUTOENTRY_VISUAL_OBSERVED_PASS__PROTECTED_IDENTITY_READONLY_PASS__AUGUST_REFRESH_READONLY_NEXT__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción futura `tya-plataforma`: no tocada.

## 2. No reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- R17N1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones.
- Corte5 CX.data: Firestore,project `cinepolis`,14 periodos,616 visitas,currentPeriod `2026-07`,fallback=false PASS.
- Auth import/readback91/91: shopper88 + super1 + coordinador2; Auth17→108; resets/deletes/overwrite0.
- claims5/5 + Rules PASS.

## 3. Visual Corte6
Build1 rechazado: `Acceso seguro` paralelo.

Build2 rechazado: al seleccionar Administración/Coordinación aparecía `Usuario + Contraseña`, además fuera del viewport.

Build3 actual: la evidencia humana muestra que el perfil Administración/Coordinación entra automáticamente al shell, carga Cinépolis/JUL2026 y mantiene el preview source-safe. No pedir password, PowerShell ni volver a probar builds rechazados.

`Shopper protegido` en esa visual no es pérdida de datos: es el placeholder del snapshot source-safe público y read-only. No debe convertirse en la identidad final del runtime autenticado.

## 4. Identidad protegida — gate read-only PASS
Se verificó directamente Firestore DEV sin exportar valores personales.

`PASS_C6_PROTECTED_IDENTITY_READONLY_RUNTIME_READY`:
- `tenants/tya/shoppers`:340 docs;
- perfiles con nombre real340;
- perfiles con `Shopper protegido`0;
- perfiles sin nombre visible0;
- visitas canónicas616;
- visitas con nombre real616;
- visitas placeholder0;
- shopperId/nombre faltante0;
- shopperIds canónicos referenciados194;
- perfiles referenciados194/194 existentes y194/194 con nombre real;
- Rules protegidas + deny-by-default PASS;
- adapter Firestore de shoppers/nombre real PASS;
- Rules desplegadas verificadas/hash consistente PASS;
- source-safe público continúa enmascarado PASS.

GitHub status final: `PASS_C6_PROTECTED_IDENTITY_READONLY`.

## 5. Corrección metodológica incorporada
La ruta humana source-safe y la ruta autenticada protegida son capas distintas:
- preview público: source-safe, PII enmascarada, lectura visual;
- runtime protegido: Auth/RBAC/Rules + Firestore; Admin/Operativo ve identidad real, shopper solo la propia.

Está prohibido solucionar la visual source-safe insertando nombres reales en archivos estáticos/Hosting público.

## 6. Estado seguro del bloque
Gate de identidad: provider reads únicamente. Auth writes0; Firestore data writes0; Rules deploy0; Hosting0; Storage0; HR0; legacy0; pagos0; Functions0; Make/Gemini0; merge=false; producción=false; PII/IDs/secrets exportados0.

## 7. Gate vivo actual
No se congela todavía una identidad final basada en el preview enmascarado. El próximo bloque operativo, permitido sin autorización de writes, es:

`REFRESH HR READ-ONLY → RESOLVER/CLASIFICAR AGOSTO HN → VALIDAR PERIODO/VISITAS → PREPARAR DELTA-ONLY WRITE PLAN`.

La siguiente autorización requerida será únicamente si el delta de agosto queda exacto y listo para Firestore data writes.

## 8. Después de agosto delta
`MATERIALIZAR SOLO DELTA AGOSTO AUTORIZADO → READBACK/SMOKE → PREPROD PROTEGIDA AUTENTICADA CON IDENTIDAD REAL → CUTOVER tya-plataforma`.

No rematerializar histórico.

## 9. Claude / Academia
- Claude: no nueva candidata, no `app/modules/*`; preservar auto-entry; source-safe no sustituye identidad protegida.
- Academia: separar privacidad del artefacto público y visibilidad autorizada del runtime; documentar mínimo privilegio, scopes y gate anti-placeholder.