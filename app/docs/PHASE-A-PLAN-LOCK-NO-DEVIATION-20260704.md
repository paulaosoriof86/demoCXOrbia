# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_IDENTITY_PROTECTED_PASS__AUGUST_PROVIDER_TABS_MISSING__GVIZ_PHANTOM_FIXED__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis como tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev`=DEV canónico; `tya-plataforma`=Hosting final. No crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA → EXISTENCIA/FRESCURA DE TABS → MAPPING/IDENTIDAD → PROVIDER COMPARE → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN → CUTOVER`.

**Nueva regla de raíz:** en fallback GViz, una respuesta con datos no demuestra que el tab solicitado exista. La existencia del tab debe validarse contra metadata provider/registry antes de interpretar contenido.

## 3. Cortes protegidos
- Corte1/2A/3 FROZEN.
- Histórico14 periodos/616 visitas hasta julio.
- R17N1,406/1,406; no repetir.
- Corte5 CX.data PASS.
- Auth91/91, claims5/5 y Rules PASS.

## 4. Corte6 UX/identidad
- Auto-entry Admin restaurado y observado.
- Preview source-safe mantiene PII enmascarada.
- Firestore protegido: shoppers340/340 y visitas616/616 con identidad real, placeholders0; Rules/adapter PASS.
- Identidad real se valida en runtime autenticado, no publicando PII en source-safe.

## 5. Agosto — diagnóstico real vigente
Metadata provider del Google Sheet confirma tabs mensuales solo hasta `JULIO 26`/`JULIO 26 HN`. **No existen `AGOSTO 26` ni `AGOSTO 26 HN`.**

El supuesto agosto GT34/HN34 fue un phantom causado por GViz al consultar nombres inexistentes y queda superseded.

Fix de raíz:
- `tya-live-hr-tab-registry.source-safe.json` desde metadata provider;
- enforcement de registry sobre output GViz;
- planner valida tab existence antes de país/estado/mapping.

Re-read:14 periodos,28 tabs,616 visitas,agosto0; Firestore periodo2026-08 inexistente; delta0.

Decisión `HOLD_AUGUST_REQUIRED_PROVIDER_TABS_MISSING`.

## 6. Gate vivo
`FUENTE AUTORIZADA AGOSTO DISPONIBLE EN HR → REFRESH METADATA + SOURCE-SAFE → VALIDAR GT/HN/ESTADOS → DELTA PLAN EXACTO`.

Solo entonces solicitar autorización para Firestore data writes del delta real.

## 7. Después del write
`WRITE SOLO DELTA → READBACK → SMOKE → PREPROD PROTEGIDA AUTENTICADA → VALIDAR IDENTIDAD/OPERACIÓN → CUTOVER tya-plataforma`.

No copiar julio para fabricar agosto ni repetir histórico.

## 8. Claude/prototipo
No nueva candidata ni `app/modules/*`. No compensar fuente inexistente desde UI/backend. Source-safe no es identidad final. P1/P2 preservados: PDF/gráficas, Excel/formato, reportKit/exportaciones, copy.

## 9. Academia
Documentar tab-existence gate, GViz fallback risk, source-safe vs protected runtime, scopes y fail-closed.

## 10. Estado seguro
Últimos bloques: provider reads y repo/docs. HR/Firestore/Auth/Rules/Hosting/Storage/legacy/payments/Functions/Make/Gemini writes0; merge=false; producción=false; PII exportada0.