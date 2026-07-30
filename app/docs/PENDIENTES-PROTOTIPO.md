# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_IDENTITY_PROTECTED_PASS__AUG_GT34_TECH_READY__HN_SOURCE_MISMATCH__NO_UNASSIGNED_VISITS__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN/APROBADO; Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL1,406/1,406; no repetir.
- Corte5 Firestore/CX.data: `cinepolis`,14 periodos,616 visitas,currentPeriod `2026-07`,fallback=false PASS.
- Auth legacy import/readback91/91 PASS; claims5/5 + Rules PASS.

## 2. Acceso/identidad
- P0 `Acceso seguro` y P0 formulario Usuario+Contraseña: corregidos.
- Auto-entry Admin observado funcionando.
- `Shopper protegido` es correcto únicamente en preview source-safe; Firestore protegido tiene340/340 nombres reales, placeholder0; visitas616/616 reales, placeholder0.
- Preprod autenticada debe consumir identidad protegida; no meter PII en source-safe.

## 3. Bloqueante vivo — fuente HR Agosto
Refresh actual:
- GT `AGOSTO 26`:34 filas con país GT, técnicamente identificables como delta;
- HN `AGOSTO 26 HN`:34 filas pero34/34 marcadas GT → HOLD;
- GT identity mapping28/28 y perfiles target28/28 PASS;
- periodo2026-08 no existe, visitas GT nuevas34.

Sin embargo esas34 GT están assigned34, unassigned0, scheduled34, realized34;27 submitidas y7 cuestionario. No representan visitas nuevas disponibles.

## 4. Prohibiciones de corrección falsa
- No cambiar GT→HN por nombre de pestaña.
- No cambiar asignadas/realizadas→disponibles desde backend/frontend.
- No copiar julio para fabricar agosto.
- No crear nueva candidata ni tocar `app/modules/*`.

## 5. Acción operativa requerida
La HR de agosto debe contener el lote real que se quiere publicar: contrato GT34/HN10 y estados correctos. Después el refresh/delta se recalcula automáticamente.

## 6. P1/P2 no bloqueante
- PDF sin gráfica final.
- Excel sin formato final.
- reportKit/exportaciones transversales.
- copy de fuentes/readiness.

## 7. Otros HOLD preservados
-21 shopper credentials sin match canónico exacto;
- demo1;
- ambiguos18/77.

No resolver por nombre/coincidencia visual.

## 8. Siguiente gate
`HR AGOSTO CORREGIDA → REFRESH READ-ONLY → DELTA EXACTO → AUTORIZACIÓN WRITE SOLO DELTA → READBACK/SMOKE → PREPROD PROTEGIDA → CUTOVER`.

## 9. Academia/manuales
Separar source-safe, identidad protegida y fuente operacional; conflictos de país/estado siempre a HOLD.

## 10. Estado seguro
Últimos bloques fueron read-only. HR/Firestore/Auth/Rules/Hosting/Storage/legacy/payments/Functions/Make/Gemini writes0; merge=false; producción=false; PII exportada0.