# AUDITORIA-FLUJOS-LOGICAS-SINCRONIZACIONES-PROTOTIPO-V52-20260629

## Alcance

Se inició revisión del prototipo actual V52 para entender sus flujos, lógicas y sincronizaciones antes de continuar conectando backend real.

La regla sigue siendo: el prototipo manda. No se modifican módulos de UI ni lógica del frontend en `/app/modules` o `/app/core`; los hallazgos que requieran cambio visual/funcional se documentan para Claude.

## Archivos revisados en esta pasada

- `app/core/hr.js`
- `app/core/importador.js`
- `app/core/liquidacion.js`
- `app/core/data.js`
- `app/modules/proyecto-wizard.js`
- `app/modules/beneficios.js`

## Flujo HR detectado

El prototipo ya tiene un motor conceptual de HR genérico en `CX.hr`:

- soporta la idea de HR interna, importada u online;
- maneja una HR externa simulada por proyecto;
- compara filas externas contra visitas existentes;
- usa `visitId`, `extId` y llave natural por `CX.dedupe` para evitar duplicados;
- sincroniza HR hacia plataforma creando visitas nuevas o actualizando fecha/reembolso;
- hace write-back plataforma hacia HR cuando cambia una visita;
- puede disparar automatización `hr_writeback` por Make.

### Brecha backend

Actualmente la HR externa está simulada en memoria (`CX.hr._ext`) y no conectada a Excel Online, Google Sheets ni Firestore.

Para backend real se requiere implementar conectores/colas de sincronización sin cambiar la interfaz usada por módulos:

- `CX.hr.external(project)` debe leer desde backend/conector o caché Firestore;
- `CX.hr.diff(project)` debe operar sobre snapshot real;
- `CX.hr.sync(project)` debe escribir visitas en Firestore mediante adapter;
- `CX.hr.writeBack(project, visit)` debe registrar trabajo de write-back a Sheets/Excel/HR nativa.

## Flujo importador detectado

`CX.importador` ya tiene una lógica genérica para pegar/cargar HR o histórico:

- parsea CSV/TSV/texto delimitado;
- autodetecta columnas por sinónimos;
- construye visitas candidatas;
- detecta duplicados con `CX.dedupe`;
- normaliza nombres de shoppers;
- crea shoppers faltantes;
- crea visitas del proyecto activo;
- emite `visit-flow`.

### Brechas detectadas

- La importación actual usa el primer país del proyecto como país por defecto; para TyA/Cinépolis se debe soportar hoja GT y hoja HN por periodo.
- No hay mapeo persistente por proyecto (`project.hrConfig.columnMapping`).
- No hay preview/dry-run persistente ni lote de importación auditable.
- No hay resolución de conflictos guardada.
- No hay importación directa real de `.xlsx` desde la plataforma; el motor actual trabaja sobre texto delimitado o demo.

## Flujo de liquidación / beneficios detectado

`CX.liq` deriva liquidaciones desde el estado de la visita:

- `realizada` genera pendiente de cuestionario;
- `cuestionario` genera validada/lista para lote;
- `liquidada` genera pagada;
- calcula honorario + reembolso;
- calcula fecha estimada de pago con `project.pago.diasPago`.

### Ajuste conceptual necesario

Este motor debe separarse en backend como:

- beneficios calculados del shopper (`shopperBenefits`);
- pagos reales/lotes (`paymentLots`);
- movimientos financieros (`financialMovements`);
- conciliación (`reconciliations`).

No se debe asumir que toda liquidación derivada de HR sea pago real.

## Flujo de pago detectado

`CX.data.payVisits()` marca visitas como `liquidada`, guarda fecha de pago y genera egreso financiero consolidado por país.

### Brecha backend

En backend real esta acción debe ser transaccional:

1. actualizar estado del beneficio/lote;
2. actualizar visita solo si corresponde;
3. crear movimiento financiero real o vincularlo a movimiento importado;
4. registrar auditoría;
5. disparar notificación;
6. no mezclar monedas;
7. no marcar como pagado lo que solo está calculado.

## Wizard de proyecto detectado

El wizard actual ya crea proyecto aislado con:

- países;
- monedas;
- honorarios recibidos/pagados;
- boleto y combo reembolsable;
- modelo directo/delegado;
- cuestionario;
- origen HR básico;
- escenarios;
- restricción;
- días de pago.

### Brecha para CXOrbia real

Falta llevar al modelo/configuración:

- `hrConfig` real por proyecto;
- URL o referencia de Google Sheets/Excel Online;
- hojas por país y periodo;
- HR nativa dentro de CXOrbia;
- colaboradores por proyecto/país;
- permisos de coordinadores, representantes y aliados;
- import batches;
- sync runs;
- write-back jobs;
- reglas de conflicto;
- auditoría.

## Mis beneficios detectado

`app/modules/beneficios.js` muestra honorarios, reembolsos, por cobrar y pagado desde `CX.liq.forProject(data)`.

### Pendiente importante para Claude

La vista de shopper debe filtrar por el shopper autenticado. No debe mostrar todo el proyecto a todos los shoppers.

Además debe mostrar:

- histórico propio;
- mes actual;
- pendientes de meses anteriores;
- honorario;
- boleto;
- combo;
- estado calculado/pendiente/programado/pagado/conciliado;
- normalización de shopper por alias históricos.

## TyA específico confirmado por Paula

- Lo migrado hasta ahora es Cinépolis/T&A, no todos los proyectos futuros.
- Cada proyecto futuro debe configurarse desde la plataforma.
- En TyA/Cinépolis cada mes puede tener HR GT y HR HN.
- La HR de Honduras se identifica con `HN`.
- Cinépolis HN tiene honorario L200.
- Hojas `Liquidación` están asociadas a T&A y deben entrar al diagnóstico financiero/liquidaciones.
- Archivo financiero contiene datos de varios negocios/personales; solo se deben importar hojas T&A/TyA HN/Liquidación relacionadas.

## CXOrbia generalizable

Cada proyecto debe poder escoger su propia fuente HR:

- Excel Online;
- Google Sheets;
- upload `.xlsx/.csv`;
- HR nativa creada en CXOrbia.

Cada proyecto debe poder definir lógica propia:

- países;
- moneda;
- honorarios;
- reembolsos;
- escenarios;
- quincenas/periodos;
- disponibilidad;
- asignación;
- cuestionario;
- submitido;
- beneficios;
- pagos;
- conciliación;
- sincronización.

## Próximo paso backend recomendado

Antes de escribir más datos en Firestore, crear el modelo backend para:

- `project.hrConfig`;
- `project.financeConfig`;
- `project.collaborators`;
- `hrImportBatches`;
- `hrSyncRuns`;
- `hrWriteBackJobs`;
- `shopperBenefits`;
- `paymentLots`;
- `financialMovements`;
- `reconciliations`;
- alias y normalización de shoppers.

## Restricciones conservadas

- No se modificó `/app/modules`.
- No se modificó `/app/core`.
- No se escribió Firestore.
- No se importó Excel/Sheets.
- No se hizo Hosting.
- No se hizo merge.
- No se tocó producción.
- No se activó adapter global.
