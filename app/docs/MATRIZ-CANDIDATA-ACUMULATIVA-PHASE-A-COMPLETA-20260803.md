# MATRIZ DE CANDIDATA ACUMULATIVA — PHASE A COMPLETA

**Fecha:** 2026-08-03  
**Estado:** `PHASE_A_COMPLETE_MATRIX_ACTIVE__APPROVAL_SHA_RECOVERY_IN_PROGRESS__NO_VISUAL_REQUEST_YET`

## 1. Propósito

Esta matriz sustituye el alcance A+B de 23 archivos. Registra la composición mínima que debe estar demostrada antes de solicitar una nueva validación visual.

La columna `SHA vivo` es el Git blob actual de `docs-tya-v6-v71-audit`. No equivale automáticamente al SHA aprobado. La siguiente operación recupera y compara el SHA aprobado por linaje.

## 2. Base transversal

| Área | Archivo | SHA vivo | Autoridad histórica | Estado actual | Próxima decisión |
|---|---|---|---|---|---|
| entrada/shell | `app/app.js` | `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36` | V182 + C6 entrada por perfiles | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | preservar |
| entrada DEV | `app/index-backend-dev.html` | `b9a4aaf063d97305c3f4f53eba8f02b526d61761` | C6 canonical runtime | `RECONCILE_COMPLETE_PHASE_A_LOAD_ORDER` | ampliar gate |
| navegación/roles | `app/core/config.js` | `0bf7b6c1daded062806d90e03ba2c5d67ac1fe63` | M1/Corte 1 + reportes Shopper | `FROZEN_LINEAGE_PRESENT_REQUIRES_COMPOSITION_PROOF` | validar todas las rutas por rol |
| router | `app/core/router.js` | `fdd3c91c1428d49413fb305ed464dffdc6ea3e13` | M1 | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | preservar |
| datos | `app/core/data.js` | `3a679020205617e44126ec586e0022edc70b0512` | contrato `CX.data` | `APPROVED_INTERFACE_PRESENT` | preservar interfaz exacta |
| cliente data | `app/core/cliente-data.js` | `3e2ac5716d711a7a883886085399ca04c614de77` | Corte 1/Portal Cliente | `RECONCILE_APPROVED_FUNCTIONAL_OUTCOME` | probar cero datos fabricados |

## 3. Operación administrativa

| Módulo | Archivo | SHA vivo | Autoridad histórica | Estado actual | Gate requerido |
|---|---|---|---|---|---|
| Dashboard Operativo | `app/modules/dashboard.js` | `e879fc3f1dd5a7486762b197346cadd086e1d99d` | M1/Corte 1 aprobado | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | KPIs, fases y drilldowns con misma fuente |
| Mi Día/hoja de ruta | `app/modules/midia.js` | `98d901850a437b029abac2ba3e569dc3a9543940` | V172/C6 | `FROZEN_LINEAGE_PRESENT_REQUIRES_COMPOSITION_PROOF` | periodo y HR canónicos |
| Histórico | `app/modules/historico.js` | `bf259b28e871bc6cea991f14ce5560323ef55f9e` | Phase A/C6 | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | 14 periodos, activo separado, refresh estable |
| Visitas | `app/modules/visitas.js` | `d7c65650e4972d438f2641cbcaaff25486fb7f01` | V161C GO + Corte 2A frozen | `FROZEN_LINEAGE_PRESENT_REQUIRES_COMPOSITION_PROOF` | facets canónicas, admin y marketplace |
| Ficha de visita | `app/modules/visita-detalle.js` | `ad819a540ae92a076902185d75878ea7e716bc8c` | Phase A | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | postulación/estado/evidencia |
| Revisión Admin | `app/modules/revision-admin.js` | `41fcea495c1e23e7ecee43a637b45002124ea3c9` | V89 restaurado + smoke visual PASS | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | cuestionario/revisión/submitido/liquidación separados |
| Postulaciones | `app/modules/postulaciones.js` | `f38593885c245841710934971dd335ee5eddf1da` | Phase A visual smoke + Corte 2A | `FROZEN_LINEAGE_PRESENT_REQUIRES_COMPOSITION_PROOF` | export/reasignación/auditoría |
| Reservas | `app/modules/reservas.js` | `ddc54bad9dfc7b242b06d39daf872c9f9b327c80` | Phase A visual smoke + C6 preserve | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | admin/shopper, no localStorage authority |
| Shoppers Admin | `app/modules/shoppers.js` | `df8dbfadabbc7f9a808da83d2a78225b7c5e6055` | Phase A/C6 | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | identidad, histórico y perfil |
| Novedades | `app/modules/novedades.js` | `3a8a4ac11fe3dfe5bff11c4840f355742bc93375` | Corte 2A | `FROZEN_LINEAGE_PRESENT_REQUIRES_COMPOSITION_PROOF` | estados y alcance por rol |
| Tablón/notificaciones | `app/modules/tablon.js` | `d2eb7784d4b695f863d330f42a6ee6575a87a3f6` | Phase A | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | no notificaciones reales sin gate |

## 4. Experiencia Shopper y transversal por perfiles

| Módulo | Archivo | SHA vivo | Autoridad histórica | Estado actual | Gate requerido |
|---|---|---|---|---|---|
| Mis Visitas | `app/modules/misvisitas.js` | `418da18fa2c6c30780719e2fc1d9c72e84fd5d20` | V172 + C6 | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | identidad exacta, histórico propio |
| Mi Perfil + reportes Shopper | `app/modules/operacion-extra.js` | `896d1e97af7761209955a0df2cad1dca68820801` | Corte 1/Corte 2A | `RECONCILE_APPROVED_FUNCTIONAL_OUTCOME` | perfil, `mireportes`, PDF/XLSX/PPTX, cero fabricados |
| Certificación | `app/modules/cert.js` | `5532109dec5c942c2fa6d520ad0a7e0b7b104034` | Phase A smoke + carryover | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | presentada/histórica/no pedir de nuevo |
| Cuestionario Shopper | `app/modules/cuestionario-shopper.js` | `a9801776eda4b52d447abaf20c28e2bf4290930d` | Phase A visual smoke | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | interno/externo/link por visita |
| Beneficios | `app/modules/beneficios.js` | `73e200e57530479637792c89c644fcfdf78b6799` | V182/Corte 3 | `FROZEN_LINEAGE_PRESENT_REQUIRES_COMPOSITION_PROOF` | identidad exacta, honorario/reembolso separados |
| Documentos | `app/modules/documentos.js` | `28c302761f22807ed5ebcb1f04cd1d12827652dd` | Phase A | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | lectura/subida gateada y datos sensibles protegidos |

## 5. Finanzas completa

| Área | Archivo | SHA vivo | Autoridad histórica | Estado actual | Gate requerido |
|---|---|---|---|---|---|
| motor financiero | `app/core/finanzas-core.js` | `6d3f46f003f3319f96cfd759b8b5ed52afc6a125` | Corte 3 + root fix C6 | `FROZEN_ACTIVE_BASELINE_REQUIRES_COMPOSITION_PROOF` | delegado, multi-moneda, cero inventados |
| liquidación | `app/core/liquidacion.js` | `dde322890eb8821b822215905b82a22102d73d2c` | Phase A/Corte 3 | `FROZEN_ACTIVE_BASELINE_REQUIRES_COMPOSITION_PROOF` | review/conciliada/pago separados |
| costos | `app/core/costos.js` | `7f0c4547a68b8bafebae0652b8de5c8e27114a0c` | Phase A | `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE` | país/moneda/proyecto |
| UI financiera completa | `app/modules/finanzas.js` | `623fab9ba1e06c39f83beda610bb771e23910a07` | Corte 3 visual + fixes focales + C6 remote | `FROZEN_ACTIVE_BASELINE_REQUIRES_COMPOSITION_PROOF` | Dashboard, Movimientos, Liquidaciones, Lotes, Costos, exportaciones |

Facts obligatorios preservados:

- modelo delegado;
- localBilling false;
- regalía 0;
- Q60 GT / L200 HN;
- 14 proyectos/periodos delegados y 0 violaciones;
- 0 pagos/lotes confirmados si no existe fuente;
- `paymentState` no abre revisión financiera;
- CxP excluye reviews;
- PDF/Excel sin gráficas/formato permanecen P1/P2 documentados, no se convierten en P0.

## 6. Portales y reportes

| Módulo | Archivo | SHA vivo | Autoridad histórica | Estado actual | Gate requerido |
|---|---|---|---|---|---|
| Portal Cliente | `app/modules/cliente.js` | `4e5981081bdd01de368c4f412ed476244426634e` | Corte 1/C6 | `RECONCILE_APPROVED_FUNCTIONAL_OUTCOME` | Panorama por periodo y fuente, cero NPS fabricado |
| Reportes Cliente | `app/modules/cliente-extra.js` | `ca3d2d6b356b3d942ebbb2076625ce0b000e4b64` | V172/Corte 2A | `RECONCILE_APPROVED_FUNCTIONAL_OUTCOME` | PDF/XLSX/PPTX, branding, alcance y filas |
| Insights Cliente | `app/modules/cliente-insights.js` | `87d0a9d0bd06895c937f9d8ee1e0c985248d1b2e` | posterior/pendiente fuente | `PRESENT_BUT_NOT_PHASE_A_APPROVAL_AUTHORITY` | no benchmark/NPS sin fuente |
| Reportes Shopper | `app/modules/operacion-extra.js` | `896d1e97af7761209955a0df2cad1dca68820801` | V172/Corte 2A | `RECONCILE_APPROVED_FUNCTIONAL_OUTCOME` | `mireportes` visible y export real |
| Reportes Admin | Dashboard/Finanzas/Operación | varios | Corte 1/Corte 3 | `RECONCILE_CROSS_MODULE_SOURCE_REVISION` | mismo periodo, fuente y filas |

## 7. Módulos posteriores preservados pero fuera del gate Phase A

- `app/modules/crm.js`;
- `app/modules/clientes.js`;
- `app/modules/comercial.js`;
- `app/modules/marketing.js`.

Estado:

`PRESENT_POST_PHASE_A_WORKSTREAM_PENDING_VISUAL`.

No se eliminan. No se usan como condición previa para validar o congelar Phase A.

## 8. Hallazgo de composición vigente

El build DEV actual contiene físicamente estos módulos, pero el manifest activo A+B solo certifica 23 archivos y no demuestra la mejor versión aprobada de toda Phase A.

Por tanto:

- la URL actual sirve como evidencia técnica y punto de comparación;
- no sirve todavía como candidata definitiva para aprobación;
- no se realizará la revisión fragmentada solicitada anteriormente;
- no se exige a Paula repetir validaciones hasta completar la comparación de SHAs y dependencias.

## 9. Siguiente bloque exacto

1. recuperar SHA aprobado/source lock por cada fila;
2. comparar contra SHA vivo;
3. clasificar `PRESERVAR / RESTAURAR / RECONCILIAR`;
4. construir manifest Phase A completa;
5. crear gates de cobertura, navegación multirol, sourceRevision, Finanzas, Reservas y Reportes;
6. aplicar únicamente el delta probado;
7. publicar un solo DEV de reemplazo solo si cambia `app/`;
8. solicitar `CHECKPOINT_VISUAL_PHASE_A_COMPLETA`.

## 10. Estado seguro

- cambios funcionales de este bloque: 0;
- deploy: 0;
- provider writes: 0;
- merge: false;
- producción: intacta.
