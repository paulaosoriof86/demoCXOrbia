# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_AUTOENTRY_VISUAL_OBSERVED_PASS__PROTECTED_IDENTITY_READONLY_PASS__AUGUST_REFRESH_READONLY_NEXT__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN/APROBADO; Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL:1,406/1,406; no repetir.
- Corte5 Firestore/CX.data: `cinepolis`,14 periodos,616 visitas,currentPeriod `2026-07`,fallback=false PASS.
- Auth legacy import/readback91/91 PASS; no repetir/resetear.
- claims5/5 + Rules PASS.
- No nueva candidata/base/Hosting/rama/PR.

## 2. P0 visuales de acceso — corregidos
Build1: `Acceso seguro` paralelo → rechazado.

Build2: formulario `Usuario + Contraseña` inyectado al elegir perfil y fuera del viewport → rechazado.

Build actual: auto-entry restaurado y observado funcionando en la captura humana del shell Admin.

## 3. `Shopper protegido` en el preview — clasificación definitiva
No corregirlo desde frontend ni insertar nombres reales en archivos source-safe. El preview humano está diseñado para ser público/read-only y PII-masked.

La capa protegida real quedó verificada por read-only gate:
- 340/340 perfiles shopper protegidos tienen nombre real;
- placeholder en Firestore protegido0;
- 616/616 visitas canónicas tienen nombre real;
- placeholder en visitas0;
- 194/194 perfiles canónicos referenciados existen y tienen nombre real;
- Rules y adapter protegidos PASS.

Estado: `PASS_C6_PROTECTED_IDENTITY_READONLY_RUNTIME_READY` / GitHub `PASS_C6_PROTECTED_IDENTITY_READONLY`.

Por tanto el pendiente no es “recuperar nombres”; el pendiente de release es que la **preproducción autenticada protegida** consuma Firestore real y no la capa source-safe como identidad.

## 4. Regla de no regresión
- Preview/source-safe: enmascarado, sin PII.
- Runtime protegido: Admin/Operativo ve identidad real autorizada; shopper solo su perfil.
- Si un runtime autenticado muestra `Shopper protegido` para un perfil canónico existente, es P0.
- No tocar `app/modules/*` por esta separación.

## 5. P1/P2 no bloqueante
- PDF sin gráfica final.
- Excel sin formato final.
- reportKit/exportaciones transversales.
- copy de fuentes/readiness.

## 6. HOLD preservado
- 21 shopper credentials sin match canónico exacto;
- demo1;
- ambiguos18/77;
- Agosto HN hasta refresh/reconciliación actual.

No resolver identidades por nombre/coincidencia visual.

## 7. Agosto — bloque vivo
`REFRESH HR READ-ONLY → RESOLVER/CLASIFICAR HOLD AGOSTO HN → VALIDAR PERIODO/VISITAS → PREPARAR DELTA-ONLY WRITE PLAN`.

La materialización requiere autorización explícita posterior; no rematerializar histórico.

## 8. Después de agosto
`WRITE DELTA AUTORIZADO → READBACK/SMOKE → PREPROD PROTEGIDA CON IDENTIDAD REAL → VALIDACIÓN → CUTOVER`.

## 9. Academia/manuales
Distinguir source-safe/anonimización de artefactos vs visibilidad autorizada en plataforma protegida; documentar Auth/RBAC, mínimo privilegio, recuperación, scopes y troubleshooting.

## 10. Estado seguro
Gate identidad actual: provider reads; Auth writes0; Firestore data writes0; Rules0; Hosting0; Storage/HR/legacy/payments/Functions/Make/Gemini0; merge=false; producción=false; PII exportada0.