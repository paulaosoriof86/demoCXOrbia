# RECONSTRUCCIÓN ACUMULATIVA — SCOPE LOCK A+B Y CLASIFICACIÓN DE EXTRAS

**Fecha:** 2026-08-02  
**Estado:** `A_PLUS_B_SCOPE_LOCKED__LATER_FAMILY_EXTRAS_DEFERRED__NO_DEPLOY`  
**Rama única:** `docs-tya-v6-v71-audit`

## 1. Objetivo

Evitar que el primer checkpoint visual se expanda nuevamente a toda la plataforma. El bloque A+B solo puede modificar o reconciliar componentes indispensables para:

- shell, acceso, tenant, proyecto, periodo, fuente y navegación;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns de esas superficies.

Todo componente de Familias C–G se preserva físicamente, se documenta y se difiere, salvo que demuestre una dependencia directa o un P0 sobre A+B.

## 2. Clasificación de archivos extra inspeccionados

### `app/modules/operacion-extra.js`

El archivo comienza por `Mi Perfil` Shopper y contiene lógica de:

- identidad Shopper;
- perfil;
- datos bancarios;
- histórico y KPIs Shopper;
- edición de datos personales.

Clasificación:

`FAMILY_D__PRESERVE_UNTOUCHED_DURING_A_PLUS_B`

No pertenece al checkpoint A+B y no debe abrirse funcionalmente ahora. Sus contratos de identidad exacta y nueva pestaña permanecen protegidos por los PASS previos.

### `app/modules/cliente-extra.js`

Contiene principalmente:

- capacitación del Portal Cliente;
- reportes Cliente/Admin;
- `CX.reportKit` para PDF/XLSX/PPTX;
- configuración y exportación de reportes.

Clasificación:

`FAMILY_F_PLUS_G__PRESERVE_UNTOUCHED_DURING_A_PLUS_B`

No bloquea el primer checkpoint. Los pendientes conocidos de gráficas PDF, formato Excel y paridad de reportes se atienden en Familia F, no dentro de CRM Ops Leads.

### `app/modules/cliente-insights.js`

Contiene Portal Cliente:

- benchmark;
- NPS;
- anotaciones;
- reuniones;
- oportunidades de mejora.

También conserva:

- benchmarks sectoriales hardcodeados;
- persistencia local de NPS/notas/reuniones;
- valores de referencia como promedio sectorial y top performers.

Clasificación:

`FAMILY_F__RECONCILIATION_REQUIRED_LATER__PRESERVE_UNTOUCHED_DURING_A_PLUS_B`

Estos valores no se presentan como autoridad real en la candidata final sin fuente verificable, pero su corrección se difiere a Portales/Reportes para no ampliar A+B.

## 3. Overlays que sí afectan A+B

Los únicos overlays posteriores identificados que alteran directamente el Checkpoint 1 son:

- `app/adapters/tya-c6-domain-consistency-bridge.js`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`;
- read guards y normalizadores que sustituyen `CX.data`;
- configuración tenant/proyecto/periodo;
- build-lock/service worker.

Estos overlays sí forman parte de la reconciliación A+B porque modifican Dashboard, login, fuente, estados, Finanzas transversal y comportamiento del shell después de cargar los módulos.

## 4. Decisión de foco

El delta A+B no incluirá cambios funcionales en:

- Mi Perfil Shopper;
- experiencia Shopper;
- Portal Cliente;
- reportes y exportaciones;
- Insights/Benchmark;
- Finanzas completa;
- Academia;
- integraciones.

Se permitirá únicamente preservar compatibilidad y evitar que una dependencia transversal de Familia A los rompa.

## 5. Resultado esperado del primer checkpoint

Una sola candidata visible con:

1. acceso/shell/fuente correctos;
2. Proyecto y Periodo separados;
3. CRM Ops Leads completo, sin fixtures aparentes en modo conectado;
4. Dashboard con semántica canónica, sin bridge DOM como única autoridad;
5. Hojas de Ruta con HR viva;
6. Clientes sin contactos/prospectos inventados;
7. Comercial alineado al contrato financiero por proyecto;
8. Marketing sin métricas ficticias ni integraciones falsas;
9. validación visual de Paula sobre el build exacto.

## 6. Próximo bloque exacto

`PROVENIENCIA/APROBACIONES DE A+B → SHAS OBJETIVO → DELTA ACUMULATIVO FOCALIZADO → GATES SOURCE-ONLY → SOLICITUD DE ÚNICO DEV PARA CHECKPOINT VISUAL 1`

## 7. Estado seguro

- cambios funcionales: 0;
- Hosting deploy: 0;
- provider writes: 0;
- merge: false;
- producción: false.

## 8. Clasificación

- **Reusable CXOrbia:** scope lock por checkpoint.
- **Exclusivo cliente:** prioridad TyA CRM Ops Leads/Phase A.
- **Claude/prototipo:** no tocar módulos posteriores durante A+B.
- **Academia:** impacto diferido.
- **Sin impacto Claude:** clasificación de archivos y gates.