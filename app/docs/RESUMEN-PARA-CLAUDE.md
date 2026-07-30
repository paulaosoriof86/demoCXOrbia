# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_IDENTITY_PROTECTED_PASS__AUG_GT34_TECH_READY__HN_SOURCE_MISMATCH__NO_UNASSIGNED_VISITS__NO_PRODUCTION`

## 1. No reabrir
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL1,406/1,406; no repetir.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas,currentPeriod=`2026-07`,source=firestore/fallback=false PASS.
- Auth legacy import/readback91/91 PASS; claims5/5 + Rules PASS.

## 2. Login/identidad — estado correcto
Los P0 de login fueron corregidos y el auto-entry Admin funciona en el preview humano. `Shopper protegido` solo pertenece al source-safe público/read-only; no copiar PII allí.

Firestore protegido está sano:
- shoppers340/340 con nombre real; placeholder0;
- visitas616/616 con nombre real; placeholder0;
- perfiles canónicos referenciados194/194 con nombre real;
- Rules/adapter protegidos PASS.

Claude no debe crear candidata ni tocar `app/modules/*` por este tema. Runtime autenticado futuro debe usar Firestore protegido y mostrar identidad según rol.

## 3. Agosto — hallazgo de fuente, no de frontend
Refresh HR actual:
- `AGOSTO 26` GT=34 filas, país correcto;
- `AGOSTO 26 HN`=34 filas pero las34 están marcadas GT → HOLD;
- GT delta técnico:34 nuevas; mappings shopper28/28; perfiles target28/28 existentes;
- periodo2026-08 todavía no existe.

Pero las34 GT de la fuente actual están assigned34/unassigned0/scheduled34/realized34;27 submitidas y7 en cuestionario. Por tanto **no son un lote de visitas disponibles publicable**.

No corregir desde UI, no forzar `disponible`, no convertir por frontend filas GT en HN y no construir agosto manualmente copiando julio.

## 4. Dependencia operativa externa
La HR de agosto debe actualizarse/corregirse para reflejar el lote real a publicar: contrato GT34/HN10 y estados operativos correctos. Backend repetirá luego el refresh/delta de forma automática.

## 5. Próximo backend
`HR AGOSTO CORREGIDA → REFRESH READ-ONLY → DELTA PLAN EXACTO → AUTORIZACIÓN WRITE SOLO DELTA → READBACK/SMOKE → PREPROD PROTEGIDA → CUTOVER`.

P1/P2 preservados: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy.

## 6. Academia/manuales
Separar preview source-safe, identidad protegida y fuente operacional. Documentar que conflictos de país/estado pasan a HOLD; nunca se corrigen por inferencia visual.

## 7. Estado seguro
Últimos bloques: solo lecturas HR/Firestore y repo/docs. HR/Firestore/Auth/Rules/Hosting/Storage/legacy/payments/Functions/Make/Gemini writes0; merge=false; producción=false; PII exportada0.