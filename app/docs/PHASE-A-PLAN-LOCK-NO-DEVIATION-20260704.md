# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_IDENTITY_PROTECTED_PASS__AUG_GT34_TECH_READY__HN_SOURCE_MISMATCH__NO_UNASSIGNED_VISITS__NO_PRODUCTION`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers reales, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

Arquitectura fija: `tya-plataforma`=Hosting público final; `cxorbia-backend-dev`=DEV canónico; proyecto padre `cinepolis`; meses=periodos; no crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA → INVENTARIO/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE → WRITE PLAN → DRY-RUN/IDEMPOTENCIA → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN VISUAL → FREEZE/CUTOVER`.

Una fuente conflictiva no puede ser “corregida” por inferencia backend/frontend.

## 3. Cortes protegidos — no reabrir
- Corte1/2A/3 FROZEN/APROBADO.
- Histórico hasta julio14 periodos/616 visitas.
- R17N1,406/1,406 PASS; no repetir.
- Corte5 CX.data Firestore PASS.
- Auth legacy91/91, claims5/5 y Rules PASS.

## 4. Corte6 — UX e identidad
- Auto-entry del preview humano restaurado y observado funcionando.
- Source-safe público mantiene PII enmascarada; `Shopper protegido` solo es válido allí.
- Firestore protegido: shoppers340/340 con nombre real, visitas616/616 con nombre real, placeholders0; perfiles referenciados194/194; Rules/adapter PASS.
- Preprod/producción autenticada debe usar Firestore protegido y aplicar visibilidad por rol.

## 5. Agosto — refresh fuente viva actual
Read-only cache-busted:
- `AGOSTO 26` GT=34 filas y país correcto;
- `AGOSTO 26 HN`=34 filas pero34/34 marcadas GT → `HOLD_COUNTRY_TAB_MISMATCH`;
- Firestore aún616 visitas y no tiene periodo2026-08;
- delta GT técnico=34 nuevas;
- identity mapping28/28 y perfiles target28/28 existentes.

## 6. Gate operacional de publicación
Las34 GT actuales están:
- assigned34;
- unassigned0;
- scheduled34;
- realized34;
- submitted27;
- questionnaire7.

`releaseReadiness=NO_UNASSIGNED_VISITS_IN_ACCEPTED_SOURCE`.

Por tanto no existe en la fuente actual un lote validado de visitas disponibles de agosto. Está prohibido forzar `disponible`, copiar julio o relabelar las34 GT de la pestaña HN como HN.

## 7. Gate vivo obligatorio
`CORREGIR/ACTUALIZAR HR AGOSTO → REFRESH READ-ONLY → EXPECT GT34/HN10 + ESTADOS PUBLICABLES → DELTA WRITE PLAN EXACTO`.

Solo entonces solicitar autorización específica para Firestore data writes del delta agosto.

## 8. Después del write autorizado
`WRITE SOLO DELTA → READBACK → SMOKE → PREPROD PROTEGIDA AUTENTICADA → VALIDACIÓN IDENTIDAD REAL/OPERACIÓN → CUTOVER tya-plataforma`.

No repetir1,406 históricos.

## 9. Corte7 — sincronización/evidencias
HR↔plataforma con stable keys, assignmentSource/syncStatus, no duplicación y conflictos a review. Make/Gemini solo con gate y revisión humana.

## 10. Corte8 — preproducción/cutover
Requiere fuente agosto válida, delta materializado/readback, runtime protegido, rollback, smoke integral y autorización específica de producción. URL final `tya-plataforma`.

## 11. Claude/prototipo
- No nueva candidata ni `app/modules/*`.
- No inventar estados/países/identidades para compensar fuente.
- Preservar auto-entry del preview humano y separación source-safe/protected runtime.
- P1/P2: PDF/gráficas, Excel/formato, reportKit/exportaciones, copy.

## 12. Academia
Documentar separación UX/source-safe/protected runtime/fuente operacional y fail-closed ante contradicción de país o estado.

## 13. Estado seguro
Últimos bloques: lecturas HR/Firestore y cambios de repo/docs únicamente. HR/Firestore/Auth/Rules/Hosting/Storage/legacy/payments/Functions/Make/Gemini writes0; merge=false; producción=false; PII exportada0.