# ADDENDUM MAESTRO — CORRECCIÓN DE RECONSTRUCCIÓN PHASE A COMPLETA

**Fecha:** 2026-08-03  
**Estado:** `PHASE_A_COMPLETE_CUMULATIVE_RECONSTRUCTION_LOCK_ACTIVE__FRAGMENTED_AB_VISUAL_REVIEW_CANCELLED`

## 1. Corrección prevalente

El esquema visual por familias A+B, C+D, E+F y G queda **anulado como gate de reconstrucción y aprobación** porque fragmentó artificialmente una Phase A que ya tenía módulos operativos indispensables trabajados, probados y, en varios cortes, aprobados o frozen.

No se realizará una aprobación previa de CRM/Clientes/Comercial/Marketing para luego incorporar Operación, Visitas, Reservas, Finanzas, Reportes o perfiles. Esa secuencia contradice el estado real del proyecto y el plan Phase A.

La única salida permitida es una candidata acumulativa única que, antes de pedir revisión visual a Paula, contenga y reconcilie toda la Phase A indispensable.

## 2. Autoridad histórica recuperada

La continuidad del PR #7 demuestra:

- RC Phase A tuvo smoke técnico y visual/consola PASS para Dashboard, Postulaciones, Reservas, Cuestionario Shopper, Finanzas y Academia;
- Corte 1 confirmó HR viva y definió Reportes Admin/Cliente/Shopper como parte de la validación funcional;
- V172 produjo un NO-GO precisamente porque el empalme no era acumulativo y faltaban reportes por rol, `mireportes`, Panorama, branding, gráficas y navegación;
- M1/Corte 1 y Corte 2A quedaron documentados como FROZEN/APROBADOS;
- Corte 3 quedó como `FROZEN_ACTIVE_BASELINE` después de los fixes financieros focales;
- C6 cerró técnicamente entrada por perfiles, HR, Staff, Shopper, Cliente, Finanzas, Portal Shopper y Reservas, y fijó la revisión humana acumulativa correcta:

`entrada → Dashboard/hoja de ruta → histórico/refresh → Shoppers/portales → Finanzas → Reportes → Reservas`.

Por tanto, CRM Ops Leads pertenece al trabajo siguiente y puede permanecer físicamente en la candidata, pero **no es el gate de cierre de Phase A**.

## 3. Alcance mínimo de la candidata acumulativa Phase A

### Base transversal

- shell y entrada directa por perfiles;
- tenant, proyecto y periodo separados;
- navegación y permisos por rol;
- HR viva y actualización in-place;
- `CX.data` canónico;
- Auth técnica aislada del carril humano;
- cache/service worker/build-lock coherentes.

### Administración y operación

- Dashboard Operativo y drilldowns;
- Mi Día/hoja de ruta;
- Proyectos, Periodos, HR e Histórico;
- Visitas, ficha/detalle y Revisión Admin;
- Postulaciones;
- Reservas y asignación;
- Shoppers;
- notificaciones/novedades operativas.

### Shopper y perfiles

- entrada Shopper/Evaluador;
- Disponibles;
- Mis Visitas;
- Reservas;
- Mi Día;
- Mi Perfil;
- cuestionario;
- certificaciones presentadas e histórico;
- documentos;
- beneficios.

### Finanzas completa

- Dashboard Financiero;
- liquidaciones;
- movimientos;
- costos;
- CxP/CxC;
- lotes/pagos en su estado real;
- separación exacta de revisión financiera, conciliación y pago;
- multi-país y multi-moneda;
- contrato delegado `tya::cinepolis`, localBilling false, regalía 0, Q60/L200.

### Portales y reportes

- Portal Cliente;
- Portal Shopper;
- Reportes Admin, Cliente y Shopper;
- PDF, XLSX y PPTX donde fueron definidos;
- branding, gráficas, periodo, alcance, fuente y filas coherentes;
- mismo `sourceRevision` en Dashboard, Liquidaciones y Reportes;
- cero métricas, NPS, porcentajes, hallazgos o responsables fabricados.

## 4. Tratamiento de módulos posteriores

CRM Ops Leads, Clientes comerciales, Comercial y Marketing:

- se preservan físicamente;
- no se eliminan ni se reconstruyen otra vez;
- no condicionan el cierre de Phase A;
- se mantienen como `PRESENT_POST_PHASE_A_WORKSTREAM_PENDING_VISUAL`, salvo dependencias transversales indispensables.

## 5. Regla de aprobación

La aprobación visual anterior de un módulo se conserva como autoridad histórica. Un build posterior requiere smoke antirretroceso, no una reauditoría desde cero.

Estados permitidos:

- `APPROVED_LINEAGE_PRESENT_REQUIRES_ANTI_REGRESSION_SMOKE`;
- `FROZEN_LINEAGE_PRESENT_REQUIRES_COMPOSITION_PROOF`;
- `RESTORE_APPROVED_SHA`;
- `RECONCILE_APPROVED_FUNCTIONAL_OUTCOME`;
- `PRESENT_POST_PHASE_A_WORKSTREAM_PENDING_VISUAL`;
- `P0_PROVEN`.

Quedan prohibidos:

- aprobar primero módulos posteriores dejando fuera Phase A;
- llamar acumulativa a una composición certificada solo por 23 archivos A+B;
- usar la presencia física de archivos como prueba de mejor versión aprobada;
- reiniciar Visitas, Reservas, Finanzas, Reportes o perfiles como si nunca se hubieran aprobado;
- crear nueva candidata, rama, PR, shell, Firebase, Hosting o metodología.

## 6. Gate visual correcto

No habrá Checkpoint Visual 1 fragmentado.

La próxima revisión humana será:

`CHECKPOINT_VISUAL_PHASE_A_COMPLETA`

sobre un único build con:

1. entrada y contexto;
2. Dashboard/hoja de ruta;
3. Histórico y refresh;
4. Visitas/Postulaciones/Reservas;
5. Shoppers y perfiles;
6. Finanzas completa;
7. Portal Cliente/Shopper;
8. Reportes y exportaciones;
9. smoke transversal por roles.

CRM/Comercial/Marketing pueden observarse después, sin bloquear el freeze Phase A salvo P0 transversal.

## 7. Siguiente bloque exacto

`RECUPERAR SHAS APROBADOS PHASE A → COMPARAR CON SHAS VIVOS → RESTAURAR/RECONCILIAR SOLO DIFERENCIAS → MANIFEST PHASE A COMPLETA → GATES ACUMULATIVOS MULTIROL → UN SOLO DEV DE REEMPLAZO SI CAMBIA APP → CHECKPOINT VISUAL PHASE A COMPLETA → FREEZE → CUTOVER`.

## 8. Estado seguro

Este addendum corrige el contrato documental:

- cambios funcionales en este archivo: 0;
- deploy: 0;
- provider writes: 0;
- merge: false;
- producción: intacta.

## 9. Clasificación

- **Reusable CXOrbia:** recuperación de aprobaciones por linaje y smoke antirretroceso.
- **Exclusivo cliente:** TyA/Cinépolis, HR, GT/HN y reglas financieras.
- **Claude/prototipo:** preservar UX aprobada y no volver a fragmentarla.
- **Academia:** se actualiza después del build Phase A completo aprobado.
- **Sin impacto Claude:** SHAs, manifests, gates y trazabilidad.
