# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-03  
**Estado:** `PHASE_A_COMPLETE_CUMULATIVE_RECONSTRUCTION_ACTIVE__FRAGMENTED_AB_VISUAL_REVIEW_CANCELLED__NO_PRODUCTION`

## 1. Decisión prevalente

La revisión A+B centrada en CRM Ops Leads, Clientes comerciales, Comercial y Marketing queda cancelada. No corresponde al estado real de Phase A.

La única operación vigente es reconstruir y demostrar una candidata acumulativa que incluya toda la Phase A indispensable antes de volver a solicitar revisión visual.

Fuentes prevalentes:

- `ADDENDUM-MAESTRO-CORRECCION-RECONSTRUCCION-PHASE-A-COMPLETA-20260803.md`;
- `MATRIZ-CANDIDATA-ACUMULATIVA-PHASE-A-COMPLETA-20260803.md`;
- `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md` corregido;
- `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
- evidencia y comentarios autoritativos del PR #7.

## 2. Repositorio y estado seguro

- repo: `paulaosoriof86/demoCXOrbia`;
- rama única: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- Hosting DEV actual: existe como punto técnico de comparación, no como candidata definitiva;
- último build desplegado: source lock `b908daa8c9cce0bd1c06cb05e3aceb9ff1b98beb`;
- producción `tya-plataforma`: intacta;
- nuevo deploy durante este bloque: 0.

## 3. Causa raíz metodológica cerrada

El esquema A+B/C+D/E+F/G fragmentó módulos que ya formaban parte de Phase A y colocó CRM/Comercial/Marketing antes de:

- Dashboard Operativo acumulativo;
- Visitas y Revisión;
- Postulaciones y Reservas;
- Histórico y refresh;
- Shoppers y experiencia por perfiles;
- Finanzas completa;
- Portal Cliente/Shopper;
- Reportes y exportaciones.

Ese orden contradice:

- el visual smoke RC Phase A;
- M1/Corte 1 y Corte 2A frozen/aprobados;
- Corte 3 frozen active baseline;
- el gate C6 que fijó `entrada → Dashboard/hoja de ruta → histórico → Shoppers/portales → Finanzas → Reportes → Reservas`.

## 4. Matriz Phase A completa iniciada

Se inventariaron y fijaron los Git blobs vivos de:

- base transversal;
- Dashboard, Histórico, Visitas, ficha, Revisión, Postulaciones, Reservas y Shoppers;
- Mis Visitas, Mi Perfil/reportes Shopper, Certificación, Cuestionario, Beneficios y Documentos;
- motor financiero, liquidación, costos y UI financiera completa;
- Portal Cliente, Reportes Cliente e Insights;
- navegación `mireportes` y rutas por rol.

La matriz no confunde blob vivo con blob aprobado. Cada fila queda pendiente de comparación exacta con su linaje aprobado.

## 5. Autoridades históricas preservadas

- RC Phase A technical + visual smoke PASS;
- M1/Corte 1: aprobado/frozen con P1/P2 documentados;
- Corte 2A/V174: frozen/aprobado;
- Corte 3/V182: `FROZEN_ACTIVE_BASELINE`;
- C6: entrada directa por perfiles, HR, Staff, Shopper, Cliente, Finanzas, Portal Shopper y Reservas técnicamente preservados;
- Reportes Admin/Cliente/Shopper y `mireportes` son parte del alcance aprobado/obligatorio y no pueden diferirse detrás de CRM.

## 6. Estado del DEV actual

La URL actual sigue disponible:

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Pero queda clasificada como:

`TECHNICAL_COMPARISON_BUILD__NOT_FINAL_PHASE_A_CANDIDATE`.

Razón:

- contiene físicamente un árbol amplio;
- pasó gates de HR/Auth/Finanzas/roles;
- el manifest activo solo certifica A+B y no prueba mejor versión aprobada de toda Phase A;
- no corresponde pedir a Paula una revisión fragmentada.

## 7. Próxima revisión humana válida

Únicamente:

`CHECKPOINT_VISUAL_PHASE_A_COMPLETA`

Incluye:

1. entrada/contexto/navegación;
2. Dashboard/hoja de ruta/Historico/refresh;
3. Visitas/Postulaciones/Reservas;
4. Shoppers y experiencia por perfiles;
5. Finanzas completa;
6. Portal Cliente/Shopper;
7. Reportes y exportaciones;
8. smoke multirol y nueva pestaña.

CRM, Clientes comerciales, Comercial y Marketing permanecen preservados, pero no bloquean este freeze.

## 8. Siguiente bloque exacto

`RECUPERAR SHAS APROBADOS Y SOURCE LOCKS POR MÓDULO PHASE A → COMPARAR CON BLOBS VIVOS → CLASIFICAR PRESERVAR/RESTAURAR/RECONCILIAR → MANIFEST PHASE A COMPLETA → GATES ACUMULATIVOS MULTIROL/FINANZAS/REPORTES/RESERVAS → DELTA ÚNICO SI APLICA`.

Después:

- un solo DEV de reemplazo únicamente si cambia `app/`;
- Checkpoint Visual Phase A completa;
- freeze;
- fuente exacta agosto/disponibles/postulaciones;
- cutover autorizado.

## 9. Estado seguro

- cambios funcionales en este bloque: 0;
- Hosting deploy nuevo: 0;
- Cloud Run/Firestore/Auth/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## 10. Clasificación

- **Reusable CXOrbia:** recuperación por linaje y smoke anti-regresión.
- **Exclusivo cliente:** TyA/Cinépolis, HR, GT/HN y reglas financieras.
- **Claude/prototipo:** preservar todas las superficies aprobadas de Phase A.
- **Academia:** actualización posterior al build completo aprobado.
- **Sin impacto Claude:** matriz de blobs, gates y trazabilidad.
