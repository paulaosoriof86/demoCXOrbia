# RECONSTRUCCIÓN DE CANDIDATA ACUMULATIVA — MATRIZ MAESTRA VIVA

**Inicio:** 2026-08-02  
**Estado:** `RECONSTRUCTION_ACTIVE_SOURCE_ONLY__NO_DEPLOY__NO_PRODUCTION`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama única:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**HEAD de arranque:** `c646af04b8fba0ca8685fa4d6ce0a46e62221276`

## 1. Propósito vinculante

Reconstruir una sola candidata acumulativa con la mejor versión demostrable de cada módulo y de todas sus dependencias. La selección no se hará por el número nominal más alto, por el último deploy ni por el estado actual del HEAD. Cada módulo debe quedar conectado a evidencia de proveniencia, aprobación, SHA y compatibilidad.

Hasta cerrar esta matriz quedan suspendidos los diagnósticos C6 aislados, nuevos deploys, nuevas candidatas, shells reducidos, ramas/PR paralelos y correcciones de síntomas no vinculadas a la composición acumulativa.

## 2. Criterio obligatorio por módulo

Cada módulo o dependencia termina en exactamente uno de estos estados:

- `APPROVED_AND_PRESENT`: versión humana aprobada y archivo exacto presente.
- `BEST_APPROVED_RESTORE`: existe una versión aprobada mejor que la actual.
- `RECONCILIATION_REQUIRED`: dos o más versiones contienen mejoras vigentes que deben integrarse.
- `BEST_TECHNICAL_PENDING_VISUAL`: mejor estado técnico disponible, sin aprobación humana suficiente.
- `RETIRED_BY_EXPLICIT_DECISION`: versión o componente descartado expresamente.

No se permite estado final `UNKNOWN`.

## 3. Campos mínimos de la matriz

Para cada módulo:

1. módulo funcional;
2. ruta principal;
3. archivos core/estilos/adapters relacionados;
4. SHA/blob actual;
5. candidata/commit de origen;
6. última evidencia humana o freeze;
7. dependencias que deben viajar juntas;
8. estado de proveniencia;
9. acción: preservar/restaurar/reconciliar/validar/retirar;
10. SHA objetivo de la candidata final;
11. gate técnico;
12. gate visual.

## 4. Familias y orden de reconstrucción

### A. Base transversal

- `app/index.html`;
- `app/app.js`;
- `app/styles/layout.css` y estilos compartidos;
- `app/core/build-lock.js`;
- `app/core/config.js`;
- `app/core/router.js`;
- `app/core/store.js`;
- `app/core/data.js`;
- `app/core/data-source.js`;
- `app/core/permissions.js`;
- login, tenant, marca, navegación, roles, proyecto/periodo, `CX.data`, HR y adapters de runtime.

### B. CRM Ops Leads y control ejecutivo

- `dashboard.js`;
- `crm.js`;
- `comercial.js`;
- `clientes.js`;
- `marketing.js`;
- hoja de ruta, indicadores, drilldowns y contexto por proyecto/periodo/país.

### C. Operación e histórico

- `proyectos.js`;
- `periodos.js`;
- `historico.js`;
- `hr-source.js`;
- `visitas.js`;
- `visita-detalle.js`;
- `revision-admin.js`;
- `postulaciones.js`;
- `reservas.js`;
- `novedades.js`;
- `shoppers.js`.

### D. Experiencia Shopper

- `midia.js`;
- `misvisitas.js`;
- `cuestionario-shopper.js`;
- `beneficios.js`;
- `cert.js`;
- `tablon.js`;
- `documentos.js`;
- Mi Perfil y navegación Shopper.

### E. Finanzas

- `app/core/finanzas-core.js`;
- `app/core/liquidacion.js`;
- `app/modules/finanzas.js`;
- `app/modules/beneficios.js`;
- `app/core/costos.js`;
- movimientos, liquidaciones, lotes, pagos, monedas, países y modelos de proyecto.

### F. Portales y reportes

- `cliente.js`;
- `cliente-extra.js`;
- `cliente-insights.js`;
- `operacion-extra.js`;
- reportes Admin/Cliente/Shopper;
- PDF/XLSX/PPTX;
- branding, gráficas, filas, periodo, alcance y `sourceRevision`.

### G. Administración, producto y Academia

- `configuracion.js`;
- `administrabilidad.js`;
- `saas-console.js`;
- `importador.js`;
- `integraciones.js`;
- `automatizaciones.js`;
- `correo.js`;
- `soporte.js`;
- `marca.js`;
- `diagnostico.js`;
- `academia.js`.

Academia se reconstruye y documenta, pero no bloquea la prioridad CRM Ops Leads/Phase A salvo P0 demostrado.

## 5. Inventario de carga actual confirmado

`app/index.html` carga un único shell y el conjunto completo de core/módulos de la rama viva. Blob actual:

`3855486bdddcfcdc2c702f08b2a640d99717d980`.

Esto prueba presencia física, no aprobación ni mejor versión por módulo.

## 6. Hallazgo raíz inicial — identidad de release en drift

`app/core/build-lock.js` actual:

- blob `717dd4a40e3a24c380089cf22596e04fc8c25da1`;
- declara `V174 Corte 2A R20`;
- referencia `docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json`;
- estado declarado `V174_R20_SOURCE_IDENTITY_FIX_PENDING_FINAL_GATES`.

Después de V174 se aplicaron Corte 3/V182, Auth, HR, Finanzas y otros fixes. Por tanto, el build-lock actual es obsoleto como autoridad de composición. Debe conservarse sin editar durante la reconstrucción y sustituirse solo al ensamblar la candidata acumulativa final.

Clasificación: `RECONCILIATION_REQUIRED / REPLACE_AT_FINAL_ASSEMBLY`.

## 7. Ancla V182 inspeccionada

Paquete aportado:

`Prototype development request CXOrbia V182.zip`  
Paquete interno: `CANDIDATA_V182_CORTE3_20260725`  
Tipo declarado: `CANDIDATA_INCREMENTAL` sobre V181/V174 viva.

Delta del paquete:

- `app/app.js`;
- `app/core/finanzas-core.js`;
- `app/modules/beneficios.js`;
- `app/modules/finanzas.js`;
- `app/styles/layout.css`.

Comparación exacta mediante Git blob:

| Archivo | Blob V182 | Blob actual | Resultado inicial |
|---|---|---|---|
| `app/app.js` | `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36` | `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36` | V182 exacta presente |
| `app/modules/beneficios.js` | `73e200e57530479637792c89c644fcfdf78b6799` | `73e200e57530479637792c89c644fcfdf78b6799` | V182 exacta presente |
| `app/styles/layout.css` | `2cea8372cad099cb4610b93744824e4596b04adc` | `2cea8372cad099cb4610b93744824e4596b04adc` | V182 exacta presente |
| `app/core/finanzas-core.js` | `ca1811366180eedbc910f2fbf8cfb2a75a242997` | `6d3f46f003f3319f96cfd759b8b5ed52afc6a125` | modificación posterior; reconciliar |
| `app/modules/finanzas.js` | `42a3394065fcf8853450d29fba4c90e6ded397be` | `623fab9ba1e06c39f83beda610bb771e23910a07` | modificación posterior; reconciliar |

Conclusión: la rama conserva exactamente tres de los cinco archivos V182 y contiene cambios posteriores en los dos archivos financieros. No se restaurarán ciegamente los blobs V182 porque los fixes financieros posteriores tienen PASS remoto. Se reconstruirá la proveniencia completa de esos cambios antes de definir el SHA objetivo.

## 8. Familia A — inventario inicial

| Ruta | Blob actual | Evidencia inicial | Estado provisional | Próxima verificación |
|---|---|---|---|---|
| `app/index.html` | `3855486bdddcfcdc2c702f08b2a640d99717d980` | carga core y módulos actuales | `INVENTORIED` | scripts, dependencias y huérfanos |
| `app/app.js` | `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36` | coincide byte a byte con V182 | `APPROVED_BASE_PRESENT__OVERLAYS_PENDING` | entrada humana y adapters Auth posteriores |
| `app/styles/layout.css` | `2cea8372cad099cb4610b93744824e4596b04adc` | coincide byte a byte con V182 | `APPROVED_AND_PRESENT` provisional | responsive y regresiones visuales posteriores |
| `app/core/build-lock.js` | `717dd4a40e3a24c380089cf22596e04fc8c25da1` | identidad V174 obsoleta | `REPLACE_AT_FINAL_ASSEMBLY` | manifest final |
| `app/core/config.js` | `0bf7b6c1daded062806d90e03ba2c5d67ac1fe63` | navegación/roles/módulos actual | `PROVENANCE_REVIEW` | V171/V174/V182 y freezes |
| `app/core/router.js` | `fdd3c91c1428d49413fb305ed464dffdc6ea3e13` | resolver de navegación V171 | `PROVENANCE_REVIEW` | rutas por rol y aprobaciones |
| `app/core/data.js` | `3a679020205617e44126ec586e0022edc70b0512` | capa demo genérica base | `PRESERVE_AS_FALLBACK_ONLY` | impedir autoridad final demo |
| `app/core/data-source.js` | `6149dff1d91b83af007badbaafdef63f00c34d1f` | indicador único de fuente | `PROVENANCE_REVIEW` | source-safe/connected y copy |
| `app/core/permissions.js` | `bedc4f8bbc80dba9f03e34ec6bbcf9cfeeb2a1d5` | acciones sensibles fail-closed | `PROVENANCE_REVIEW` | scopes y rutas reales |

Los estados provisionales no equivalen a freeze. La familia A solo cerrará cuando se incorporen adapters y overlays que cambian el comportamiento del shell sin modificar estos archivos.

## 9. Reglas antirretroceso de la reconstrucción

1. Comparar la composición completa contra HEAD vivo, nunca solo contra la candidata inmediata anterior.
2. No asumir que un delta incremental contiene los antecedentes que declara preservar.
3. No usar `build-lock`, manifest o número de versión como sustituto de evidencia por módulo.
4. No restaurar una versión antigua si existe un fix posterior con evidencia válida.
5. No seleccionar por nombre visual, marca o coincidencia aproximada.
6. No llamar aprobado a un módulo sin evidencia humana.
7. No mover el HEAD funcional durante inventario/proveniencia.
8. No desplegar durante la reconstrucción source-only.
9. Documentar cada bloque en esta matriz, checkpoint, CAMBIOS, Claude, Pendientes, Academia y PR #7.
10. Al final: un solo commit funcional, manifest, build-lock, verificador, build DEV y validación humana.

## 10. Próximo bloque exacto

`FAMILIA A COMPLETA: INVENTARIAR STORE/CX.DATA/HR/ADAPTERS/AUTH/TENANT/PROYECTO-PERIODO → TRAZAR APROBACIONES Y COMMITS → CLASIFICAR PRESERVAR/RESTAURAR/RECONCILIAR → CERRAR DEPENDENCIAS DEL SHELL`.

Después: Familia B, empezando por CRM Ops Leads, Dashboard y hoja de ruta.

## 11. Estado seguro

- cambios funcionales: 0;
- Hosting deploy: 0;
- Cloud Run: 0;
- Firestore/Auth/HR/Rules/Storage writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: false.

## 12. Clasificación del bloque

- **Reusable CXOrbia:** matriz de proveniencia, composición por módulo y freeze por SHA.
- **Exclusivo cliente:** reglas TyA/Cinépolis y evidencias HR/financieras que se anexarán por módulo.
- **Claude/prototipo:** recuperar la mejor experiencia visual sin solicitar nueva candidata por rutina.
- **Academia:** mantener cursos/manuales alineados al módulo realmente seleccionado.
- **Sin impacto Claude:** source inventory, hashes, manifest y control de continuidad.
