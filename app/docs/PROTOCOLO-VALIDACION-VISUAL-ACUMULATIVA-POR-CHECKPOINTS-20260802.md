# PROTOCOLO DE VALIDACIÓN VISUAL ACUMULATIVA — PHASE A COMPLETA

**Fecha original:** 2026-08-02  
**Corrección prevalente:** 2026-08-03  
**Estado:** `FRAGMENTED_CHECKPOINTS_SUPERSEDED__PHASE_A_COMPLETE_VISUAL_GATE_REQUIRED`  
**Rama única:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. Corrección

El orden anterior A+B → C+D → E+F → G queda anulado como gate visual porque trasladó a fases posteriores módulos ya trabajados y necesarios para cerrar Phase A, mientras priorizó CRM/Comercial/Marketing todavía pendientes.

La fuente prevalente es:

`ADDENDUM-MAESTRO-CORRECCION-RECONSTRUCCION-PHASE-A-COMPLETA-20260803.md`.

No se pedirá a Paula aprobar CRM Ops Leads, Clientes comerciales, Comercial o Marketing antes de demostrar la composición completa de Phase A.

## 2. Único checkpoint válido antes del freeze

`CHECKPOINT_VISUAL_PHASE_A_COMPLETA`

Debe ejecutarse sobre una sola candidata, un solo build y una sola URL, después de cerrar la matriz y los gates completos.

Incluye:

1. entrada directa por Administración/Coordinación, Portal Cliente y Shopper/Evaluador;
2. shell, tenant, proyecto, periodo, fuente y navegación;
3. Dashboard Operativo, hoja de ruta, Histórico y refresh estable;
4. Visitas, ficha/revisión, Postulaciones y Reservas;
5. Shoppers y experiencia transversal por perfiles;
6. Mi Día, Disponibles, Mis Visitas, Mi Perfil, cuestionario, certificaciones, documentos y beneficios;
7. Finanzas completa: dashboard, liquidaciones, movimientos, costos, CxP/CxC, lotes/pagos en estado real;
8. Portal Cliente y Portal Shopper;
9. Reportes Admin/Cliente/Shopper y exportaciones;
10. smoke anti-regresión por rol, proyecto, periodo y nueva pestaña.

## 3. Conservación de aprobaciones previas

Las aprobaciones visuales, freezes y smoke anteriores no desaparecen. Se consideran autoridad histórica y se someten únicamente a:

- comparación de SHA/linaje;
- prueba de composición;
- smoke anti-regresión del build nuevo.

No se reaudita desde cero un módulo ya aprobado salvo regresión reproducible.

## 4. Módulos posteriores

CRM Ops Leads, Clientes comerciales, Comercial y Marketing:

- permanecen en el árbol;
- no se eliminan;
- no bloquean la candidata Phase A;
- se revisan después del freeze Phase A, salvo P0 transversal demostrado.

## 5. Evidencia obligatoria

Registrar por módulo:

- build ID;
- commit funcional;
- manifest SHA;
- URL DEV;
- rol;
- proyecto/periodo;
- aprobación histórica utilizada;
- SHA aprobado;
- SHA vivo;
- resultado del smoke anti-regresión;
- observación de Paula;
- corrección y revalidación, si corresponde.

## 6. Estados permitidos

- `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE`;
- `FROZEN_LINEAGE_PRESENT_REQUIRES_COMPOSITION_PROOF`;
- `RESTORE_APPROVED_SHA`;
- `RECONCILE_APPROVED_FUNCTIONAL_OUTCOME`;
- `HUMAN_VISUAL_APPROVED_FOR_BUILD`;
- `HUMAN_VISUAL_FINDING`;
- `HUMAN_VISUAL_NO_GO`;
- `FINAL_HUMAN_VISUAL_APPROVED`;
- `PRESENT_POST_PHASE_A_WORKSTREAM_PENDING_VISUAL`.

## 7. Regla de no fragmentación

Queda prohibido:

- presentar una candidata certificada solo por el manifest A+B como acumulativa definitiva;
- dejar Visitas, Reservas, Finanzas, Reportes o perfiles para después de una aprobación CRM;
- crear shells o builds paralelos;
- trasladar a Paula la reconstrucción de SHAs o dependencias;
- convertir PASS técnico en aprobación visual;
- repetir capturas de un módulo no modificado sin razón de anti-regresión.

## 8. Tratamiento de hallazgos

Toda falla se corrige sobre la misma rama y linaje. Se ejecutan gates focales y acumulativos y, si cambió `app/`, un único build de reemplazo autorizado. No se abre otra candidata.

## 9. Siguiente operación

`RECUPERAR SHAS APROBADOS PHASE A → COMPARAR CON SHAS VIVOS → DELTA ÚNICO → MANIFEST COMPLETO → GATES MULTIROL → DEV ÚNICO → CHECKPOINT VISUAL PHASE A COMPLETA`.

## 10. Estado seguro

Este cambio es documental:

- deploy: 0;
- provider writes: 0;
- merge: false;
- producción: intacta.
