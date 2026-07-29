# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-29  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_NEW_EMPTY_FIREBASE_VERIFIED_PASS__PROVIDER_BOOTSTRAP_AUTHORIZATION_PENDING_NO_PRODUCTION`

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

Los bloqueos anteriores de creación/IAM ya fueron superados.

Estado backend actual:

- Firebase nuevo `cxorbia-tya-dev-260729-c4`: identidad verificada PASS;
- vacío integral verificado PASS;
- apps=0, Auth users=0, Firestore DB=0, Storage buckets=0;
- Hosting contiene únicamente el `DEFAULT_SITE` provider-managed, sin señal de contenido/despliegue;
- provider writes durante probes/verificación=0.

No corresponde a Claude:

- registrar/configurar Web App Firebase;
- inicializar Firestore/Auth;
- desplegar Rules;
- tocar `CX.data` backend;
- crear fallback mock/localStorage;
- pedir otra candidata por Corte 4.

La UI futura debe mantener copy honesto: identidad/vacío verificados no significa `CX.data` conectado ni datos materializados.

## 3. Próxima intervención de Claude

Ninguna por rutina en este momento.

Solo abrir una tarea frontend si:

1. el smoke DEV de Corte 4 muestra una diferencia visual/funcional reproducible localizada; o
2. Paula decide atender el backlog P1/P2 transversal después del gate operativo correspondiente.

## 4. Backlog frontend no bloqueante post-Corte 3

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
- En Corte 4 distinguir: credencial, IAM, identidad, vacío, `DEFAULT_SITE`, Web App, Auth bootstrap, Firestore, Rules, lectura y escritura/materialización.

## 5. Pendientes transversales ya documentados y preservados

- Proyecto configurable y multi-proyecto; Cinépolis no es lógica global.
- Mis beneficios/liquidaciones/pagos: honorario, boleto, combo/reembolso, total, moneda, estado y movimientos separados.
- Postulaciones/asignaciones/conflictos: origen HR/plataforma, revisión humana y no dedupe por nombre.
- Readiness/source-safe con estados honestos.
- No llamar proveedores reales directamente desde módulos UI.

Estos puntos permanecen como backlog de producto y no bloquean el cierre técnico de Corte 4.

## 6. Estado seguro

PR #7 draft/open/no merge. Sin producción, Rules deploy, Firestore/Auth/Storage/HR data writes, imports, pagos, lotes reales, Make ni Gemini live.
