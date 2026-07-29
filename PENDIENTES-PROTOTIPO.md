# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-29  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_READONLY_STATIC_PASS_PROVIDER_IAM_BLOCKED_NO_PRODUCTION`

Este archivo contiene únicamente pendientes reales de frontend/prototipo para Claude. Backend, Firebase, IAM, Rules, Auth, loaders, adapters, tools, workflows, Make/Gemini/Storage reales e importadores no son tareas de Claude.

## 1. No reabrir

- M1: `FROZEN/APROBADO`.
- Corte 1: `FROZEN/APROBADO`.
- Corte 2A: `FROZEN/APROBADO`.
- Corte 3: `FROZEN_ACTIVE_BASELINE`.
- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no crear V183/R33.
- HR e histórico: 14 periodos / 616 visitas.
- Finanzas canónicas y pagos históricos de mayo/junio quedan congelados.

Solo un P0 reproducible puede reabrir un corte congelado.

## 2. Corte 4 no requiere nueva candidata frontend

Corte 4 está bloqueado por IAM/proveedor al intentar crear/verificar el Firebase nuevo `cxorbia-tya-dev-260729-c4`.

No corresponde a Claude:

- crear proyecto Google Cloud/Firebase;
- corregir IAM;
- tocar `CX.data` backend;
- desplegar Rules;
- activar Firestore/Auth/Storage;
- crear fallback mock/localStorage;
- pedir otra candidata por este bloqueo.

La UI futura debe mantener copy honesto: credencial válida, permiso IAM, proyecto creado, Firebase agregado, Rules activas, lectura y escritura son gates distintos.

## 3. Backlog frontend no bloqueante post-Corte 3

### Reportes

- PDF: corregir gráfica ausente/impresión del reporte cuando se atienda el bloque transversal.
- Excel: mejorar formato manteniendo contenido y alcance canónicos.
- `reportKit`: consolidación transversal pendiente.
- Mantener mismo alcance/filas entre PDF, Excel y futuras exportaciones.

### Copy

- Refinar mensajes genéricos `Pendiente de fuente` para indicar qué fuente específica falta cuando sea posible.
- No mostrar pago/import/sync/proveedor como ejecutado sin evidencia real.

### Academia

- Mantener profundidad por rol y módulo.
- Diferenciar manual de curso.
- Mantener administración visible: crear, editar, archivar/soft-delete, duplicar, versionar, estado, rol/proyecto/módulo y revisión humana.
- Incluir en Corte 4 la explicación de credencial válida vs IAM vs proyecto vs Firebase vs Rules vs lectura vs escritura.

## 4. Pendientes transversales ya documentados y preservados

- Proyecto configurable y multi-proyecto; Cinépolis no es lógica global.
- Mis beneficios/liquidaciones/pagos: honorario, boleto, combo/reembolso, total, moneda, estado y movimientos separados.
- Postulaciones/asignaciones/conflictos: origen HR/plataforma, revisión humana y no dedupe por nombre.
- Readiness/source-safe con estados honestos.
- No llamar proveedores reales directamente desde módulos UI.

Estos puntos permanecen como backlog de producto y no deben confundirse con el bloqueo IAM de Corte 4.

## 5. Siguiente intervención de Claude

Ninguna por rutina en este momento.

Solo abrir una tarea frontend si:

1. el smoke DEV de Corte 4 muestra una diferencia visual/funcional reproducible localizada; o
2. Paula decide atender el backlog P1/P2 transversal después del gate operativo correspondiente.

## 6. Estado seguro

PR #7 draft/open/no merge. Sin producción, provider activation, Rules deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes reales, Make ni Gemini live.
