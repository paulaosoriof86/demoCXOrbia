# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__PROVIDER_COMPARE_IDENTITY_PASS__P0_C5_CXDATA_PERIOD_MODEL__NO_PRODUCTION`

Este archivo registra pendientes frontend reales y dependencias backend que condicionan cuándo Claude debe intervenir.

## 1. No reabrir
- M1 / Corte 1 / Corte 2A: FROZEN/APROBADO.
- Corte 3: FROZEN sobre `CXORBIA-TYA-CORTE3-V182-20260729`.
- No crear V183/R33.
- No rehacer la materialización R17N.
- Finanzas mayo/junio congeladas salvo fuente nueva demostrable.

## 2. Arquitectura vigente
- `cxorbia-backend-dev` = backend DEV canónico.
- `tya-plataforma` = legacy a retirar + Hosting/URL pública final.
- sandbox C4 = no materializar.
- proyecto padre `cinepolis`; meses/periodos viven en su subcolección canónica.
- no nueva base Firebase.

## 3. Identidad shopper — backend PASS
- HR actual: 208 refs.
- Mapping exacto: 208/208 ready.
- 208 refs resuelven a 194 perfiles canónicos únicos esperados.
- Post-compare: 616/616 visitas con nombre real + target shopper válido.
- 194/194 perfiles referenciados con nombre real.
- 77/77 certificaciones con shopper existente.
- placeholders demo 0.

No usar nombre como llave de automerge. Hash/`Shopper protegido` solo corresponde a evidencia técnica cuando aplique, no a identidad final autorizada.

## 4. R17N FINAL — ejecutado
- 1,406 Firestore writes autorizados y materializados.
- readback 1,406/1,406; mismatch 0.
- provider post-compare 1,406/1,406 rutas presentes.
- payments/lots 0.
- tenant update1, existing updates22, legacy holds7, cert hold1, Agosto HN, deletes y demás exclusiones preservadas.

## 5. P0 actual — NO ES tarea frontend
`P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH`.

Archivo: `app/core/backend-firebase.js`.

El adapter convierte todos los project docs en periodos y no consume `tenants/tya/projects/cinepolis/periods`.

Resultado smoke:
- Firestore/no fallback/interfaz CX.data/616 visitas: PASS.
- 14 periodos existen correctamente en backend.
- CX.data observa 30 periodos y `currentPeriodId=cinepolis`: P0.

**Claude no debe corregir esto desde módulos UI.** Backend hará un fix focalizado solo después de autorización expresa de Paula y repetirá smoke read-only.

## 6. Próxima intervención Claude
Ninguna por rutina.

Después de resolver backend y validar operativamente Corte 5, verificar únicamente si aparece una diferencia frontend reproducible en:
1. selector proyecto/periodo;
2. Admin/Operativo con identidad real autorizada;
3. Shopper con perfil/historial permitido;
4. carryover de certificación en persona correcta;
5. ausencia de duplicados referencia HR/perfil.

Solo abrir candidata frontend ante P0 reproducible localizado. No nueva candidata por el P0 backend actual.

## 7. Backlog P1/P2 no bloqueante
- PDF: gráfica ausente al imprimir/exportar.
- Excel: formato básico.
- `reportKit`: consolidación transversal.
- copy de fuentes/readiness específico.

## 8. Academia/manuales
- fuente viva vs snapshot;
- identidad real vs sanitización técnica;
- 208 refs HR vs 194 perfiles canónicos únicos;
- proyecto padre vs periodo;
- stable-key/crosswalk antes de merge;
- conflicto a review;
- carryover evita recertificación innecesaria;
- readback correcto no garantiza consumo correcto del adapter: siempre smoke post-write.

## 9. Estado seguro
PR #7 draft/open/no merge. R17N previo 1,406 writes autorizados ya ejecutados. Post-compare actual: data/provider/Auth/Storage/HR/legacy writes=0; deploy=0; producción=false; pagos/lotes/Make/Gemini=0; PII cruda repo/artifact=0.
