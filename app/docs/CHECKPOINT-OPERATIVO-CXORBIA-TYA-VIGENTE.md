# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `C6_IDENTITY_PROTECTED_PASS__AUG_GT34_TECH_READY__HN_SOURCE_MISMATCH__NO_UNASSIGNED_VISITS__NO_PRODUCTION`

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

## 3. Corte6 visual/identidad
- P0 login1 y2 corregidos.
- Captura humana actual confirma auto-entry al shell Admin.
- `Shopper protegido` en el preview pertenece únicamente al source-safe público/read-only.
- Firestore protegido:340/340 shoppers con nombre real, placeholders0;616/616 visitas con nombre real, placeholders0;194/194 perfiles canónicos referenciados existentes/con nombre real.
- Rules/adapter protegidos PASS.
- GitHub `PASS_C6_PROTECTED_IDENTITY_READONLY`.

No publicar PII dentro del preview source-safe. La visual de identidad real se hará en preprod autenticada protegida.

## 4. Refresh HR vivo de agosto — ejecutado
Fuente cache-busted actual:
-15 periodos;
- histórico hasta julio=616 visitas;
- agosto aparente=68 filas;
- `AGOSTO 26` GT=34;
- `AGOSTO 26 HN`=34 aparentes.

Gate país/pestaña:
- GT34/34 marcadas GT, mismatch0;
- HN tab34/34 marcadas GT, mismatch34;
- decisión `HOLD_COUNTRY_TAB_MISMATCH` para HN.

## 5. Delta-only técnico — GT PASS parcial
`PASS_AUGUST_GT34_DELTA_TECH_READY__HN_HOLD_SOURCE_COUNTRY_MISMATCH`.

- Firestore actual616 visitas;
- periodo2026-08 no existe;
- GT candidatos34, nuevos34, existing0;
- source shopper refs28;
- mapping canónico28/28;
- perfiles target existentes28/28;
- identity blockers0;
- histórico1,406 no se toca.

## 6. Bloqueo operacional de publicación
Las34 filas GT aceptables técnicamente no son visitas disponibles en la fuente actual:
- assigned34;
- unassigned0;
- scheduled34;
- realized34;
- submitted27;
- questionnaire7.

`releaseReadiness=NO_UNASSIGNED_VISITS_IN_ACCEPTED_SOURCE`.

No corresponde forzar estados a `disponible` ni inventar 10 HN. La fuente HR de agosto debe ser corregida/actualizada para representar el lote real que se desea publicar.

## 7. Estado seguro
Todo el refresh/delta plan fue read-only. HR/Firestore/Auth/Rules/Hosting/Storage/legacy/payments/Functions/Make/Gemini writes0; merge=false; producción=false; PII exportada0.

## 8. Gate vivo exacto
`CORREGIR/ACTUALIZAR FUENTE HR AGOSTO → REFRESH READ-ONLY → EXPECT GT34/HN10 Y ESTADOS PUBLICABLES → REGENERAR DELTA → AUTORIZACIÓN FIRESTORE WRITE SOLO DELTA`.

Después:
`READBACK/SMOKE → PREPROD PROTEGIDA AUTENTICADA CON IDENTIDAD REAL → CUTOVER tya-plataforma`.

No rematerializar histórico ni reabrir Auth91.