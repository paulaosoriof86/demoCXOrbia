# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-29  
**Estado:** `PHASE_A_100__F10_P1_HR_KPI_FRESHNESS_AND_CANONICAL_BRIDGE_OPEN`

## Cerrado / no reprocesar

M1, M2/F0, M3, F3, F4, F5, F6 y F8 permanecen terminales. F7 permanece `GO_WITH_WARNINGS_NO_P0`; F8.5 y F9 permanecen cerrados. Phase A=`100/100`; estado histórico de Production Real Readiness=`100/100`; release=`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

F10 abrió un incidente nuevo P1. No reabrir gates terminales por rutina ni restaurar V182 completo.

## P1 activo — HR/KPIs no certificados como frescos

La conclusión anterior de que el run browser del 29/08 había confirmado los KPIs actuales de HR queda **supersedida**. El run `33257681796` probó autenticación/navegación Admin+Shopper y consistencia interna del snapshot, pero no una lectura independiente de Google Sheets en el mismo instante. El workflow global terminó HOLD/failure.

Discrepancias temporales observadas por Paula en la HR viva frente al snapshot que mostraba la plataforma: `Sin agendar` plataforma GT2/HN1 vs HR cruda GT4/HN1 (una GT ya realizada debe excluirse del bucket); `Realizadas` plataforma GT25/HN6 vs HR GT24/HN6; `Pendientes realizar` falta una en plataforma; `Cuestionario pendiente` plataforma 0 vs HR GT4; `Liquidadas` plataforma 0 pese a existencia de visitas con realizada+cuestionario+submitido y a que el mismo summary canónico reportó `liquidationCandidates=30`.

Estas cifras son **evidencia del momento**, no valores de negocio para copiar, persistir o hardcodear.

## Pendientes exactos F10

1. Ejecutar reconciliación provider read-only **forzada** (`fresh`) y fila a fila contra Google Sheets, capturando revision/sourceReadAt y los estados por GT/HN.
2. Corregir el mecanismo de QA para comparar la UI contra una autoridad provider independiente del snapshot de CX.data; prohibir self-parity como certificado de frescura.
3. Adjudicar el delta actual de `Realizadas`, `Pendientes realizar` y `Cuestionario pendiente` entre cache obsoleto y mapping de columnas/estados.
4. Corregir la pérdida semántica entre motor canónico R20 y CX.data: preservar submitted/canonicalFacets/liquidationCandidate y separar candidato a liquidación de liquidación/pago financiero confirmado.
5. Revalidar Dashboard, HR Source, Periodos, Histórico, Visitas, Postulaciones, Reservas/Asignación, Shoppers, Finanzas/Liquidaciones y superficies Shopper contra la **misma revisión fresca**.
6. Revalidar el login humano Shopper por credencial existente; el run actual usó token checkpoint-backed para la prueba funcional.
7. Diagnosticar separadamente Cliente, que continúa en timeout/HOLD.
8. Mantener el P1 visual `Cinépolis JUN` en Periodos/Histórico para corrección frontend focal, sin hardcodear meses.
9. Después de correcciones aprobadas, actualizar Academia/manuales solo si cambian definiciones visibles de estados/KPIs.

## Frontend / Claude

Archivos focales: `app/core/tya-phase-a-source-safe-preview.js`, `app/core/data.js`, `app/modules/dashboard.js`, `app/modules/periodos.js`, `app/modules/historico.js`. No hay autorización para parchearlos desde backend; documentar/aplicar únicamente por el carril frontend vigente. No nueva candidata por rutina.

## Producción operativa

No existe P0 destructivo demostrado y no se altera el release congelado. Sin embargo, **no considerar confiables para operación de septiembre los KPIs dependientes de HR hasta cerrar esta reconciliación P1**. La plataforma puede seguir accesible; lo que queda retenido es la aceptación de exactitud operacional dinámica en esos módulos.

## Seguridad

Provider/data/Auth/Firestore/HR/Storage/Rules/payment writes=0; Make/Gemini=0; deploy/rebuild/reimport/merge=0. Legacy DB sigue prohibida.

Evidencia: `app/docs/evidence/RC15-F10-HR-KPI-FRESHNESS-INCIDENT-20260829-01.json`.

**NEXT:** `F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE`.
