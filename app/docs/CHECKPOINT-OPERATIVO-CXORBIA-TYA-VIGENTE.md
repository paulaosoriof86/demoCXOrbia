# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-02  
**Estado:** `RECONSTRUCTION_ACTIVE__FAMILY_A_CONTRACT_DEFINED__FAMILY_B_INVENTORY_ACTIVE__NO_DEPLOY__NO_PRODUCTION`

## 1. Decisión prevalente

Se reconstruye una única candidata acumulativa con la mejor versión demostrable de cada módulo. No se permiten diagnósticos C6 aislados, shells paralelos, nuevas candidatas ni correcciones fuera de la composición acumulativa.

Fuentes vivas:

- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-B-INVENTARIO-INICIAL-20260802.md`;
- `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`.

## 2. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- HEAD de arranque de reconstrucción: `c646af04b8fba0ca8685fa4d6ce0a46e62221276`.
- Familia A contrato: `92651f41acc423841d909487558d68be5d10b2b6`.
- Familia B inventario: `06fbfac28a1971d229ab121778ee6babdd1fd904`.
- Índice vigente: `b13e0354aa02dee1dcd0182be668e2168adffaea`.
- Producción `tya-plataforma`: intacta.
- Agosto 2026 todavía no existe en HR.

## 3. Causa raíz corregida metodológicamente

El problema no era únicamente seleccionar archivos. Varias capas podían reemplazar en memoria:

- tenant/proyecto/periodo;
- colecciones y métodos de `CX.data`;
- estados/KPIs;
- Dashboard;
- Finanzas;
- login/sesión.

Por eso se fijó una precedencia técnica de Familia A y se inició Familia B sobre esa única autoridad.

## 4. Familia A — contrato técnico

- tenant `tya`;
- proyecto `cinepolis`;
- periodos `cinepolis-YYYY-MM`;
- HR viva gobierna periodos, visitas y estado operacional;
- Firestore solo enriquece por llaves exactas;
- `CX.data` conserva su interfaz;
- read model + canonical semantics gobiernan estados/KPIs;
- localStorage no concede Auth, rol o scope;
- guards bloquean writes sin sustituir datos;
- bridges DOM no son autoridad final;
- build-lock V174 y caché se reemplazan al ensamblar.

## 5. Familia B — inventario real

### Dashboard

UI y drilldowns se preservan. Requiere reconciliar `phaseFlow`, comparativos y overlays para consumir una sola semántica canónica.

### CRM Ops Leads

Suite funcional amplia, pero store local/demo. Se preserva experiencia y se exige pending-source honesto hasta disponer de fuente CRM real.

### Clientes

El módulo fabrica contactos, correos y prospectos. Deben excluirse en modo conectado; se conserva ficha y relación Cliente→Proyecto.

### Comercial

La calculadora/propuestas deben consumir el contrato financiero por proyecto. Cinépolis: delegado, localBilling false, regalía 0, Q60/L200.

### Marketing

Contenido, fechas y métricas actuales son fixtures. La UI se preserva, pero Gemini/Make y métricas quedan gateadas y sin datos inventados.

### Hojas de Ruta

Se preserva HR viva y la interfaz. IA/import/Google Sheets y writes quedan gateados.

## 6. PASS técnicos preservados

- HR: 14 periodos y 616 visitas;
- Staff/Shopper/Cliente remoto estable;
- identidad Shopper exacta y `ownVisits=1`;
- Cliente `tya/cinepolis`;
- modelo financiero delegado;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- 14 delegados, 0 directos, 0 sin configurar y 0 violaciones.

No equivalen a aprobación visual.

## 7. Checkpoint Visual 1

Paula revisará en un solo build A+B:

- login/shell/tenant/proyecto/periodo/fuente/navegación;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns.

No se avanza a Operación/Shopper sin esa validación.

## 8. Pendiente real inmediato

1. inspeccionar overlays/extras que alteran Dashboard, Cliente y CRM;
2. recuperar aprobaciones/commits históricos de A+B;
3. definir SHA objetivo por archivo;
4. construir delta completo;
5. crear gates source-only de fixtures, semántica, autoridad, finanzas e integraciones;
6. ejecutar gates;
7. solicitar un único deploy DEV para Checkpoint Visual 1.

## 9. Siguiente bloque exacto

`OPERACION-EXTRA/CLIENTE-INSIGHTS/OVERLAYS B → PROVENIENCIA Y APROBACIONES → MATRIZ SHA A+B → DELTA Y GATES SOURCE-ONLY`.

## 10. Estado seguro

- cambios funcionales: 0;
- deploy: 0;
- Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0;
- merge: false;
- producción: false.
