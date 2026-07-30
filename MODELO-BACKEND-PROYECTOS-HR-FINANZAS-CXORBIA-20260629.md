# MODELO-BACKEND-PROYECTOS-HR-FINANZAS-CXORBIA-20260629

## Objetivo

Definir el modelo backend necesario para convertir las lógicas actuales del prototipo CXOrbia en persistencia real, configurable por proyecto y multi-tenant.

No se modifica frontend ni se escriben datos.

## Principio base

El prototipo ya contiene lógicas funcionales importantes. El backend debe respetar esas interfaces y convertirlas en persistencia real, sincronización segura y configuración editable.

TyA/Cinépolis es el primer caso real. Debe alimentar configuración, no lógica fija.

## Rutas Firestore propuestas

```text
/tenants/{tenantId}
/tenants/{tenantId}/clients/{clientId}
/tenants/{tenantId}/projects/{projectId}
/tenants/{tenantId}/projects/{projectId}/visits/{visitId}
/tenants/{tenantId}/projects/{projectId}/postulations/{postulationId}
/tenants/{tenantId}/projects/{projectId}/questionnaires/{questionnaireId}
/tenants/{tenantId}/projects/{projectId}/shopperBenefits/{benefitId}
/tenants/{tenantId}/projects/{projectId}/paymentLots/{lotId}
/tenants/{tenantId}/projects/{projectId}/financialMovements/{movementId}
/tenants/{tenantId}/projects/{projectId}/reconciliations/{reconciliationId}
/tenants/{tenantId}/projects/{projectId}/hrImportBatches/{batchId}
/tenants/{tenantId}/projects/{projectId}/hrSyncRuns/{syncRunId}
/tenants/{tenantId}/projects/{projectId}/hrWriteBackJobs/{jobId}
/tenants/{tenantId}/projects/{projectId}/collaborators/{userId}
/tenants/{tenantId}/shoppers/{shopperId}
/tenants/{tenantId}/shoppers/{shopperId}/aliases/{aliasId}
/tenants/{tenantId}/auditLogs/{logId}
```

## Configuración HR por proyecto

Cada proyecto debe guardar su propia configuración HR:

- tipo de fuente: Google Sheets, Excel Online, HR nativa, upload o ninguna;
- URL o referencia segura;
- dueño de la fuente: propio, cliente, aliado o externo;
- modo de sincronización: manual, programado, incremental o importación inicial;
- write-back habilitado o no;
- hojas por país;
- periodo/ronda/quincena;
- mapeo de columnas;
- reglas de validación;
- última sincronización;
- auditoría.

## Configuración financiera por proyecto

Cada proyecto debe guardar:

- modelo financiero: directo, delegado o franquicia;
- monedas por país;
- honorarios pagados al shopper por país;
- honorarios recibidos por país;
- reembolsos configurados: boleto, combo u otros;
- reglas de pago;
- hojas permitidas para importación financiera;
- requisito de preview antes de escribir.

Para Cinépolis/TyA confirmado:

- GT: honorario según regla del proyecto, por ejemplo Q60 cuando aplique;
- HN: honorario L200.

## Colaboradores por proyecto

Debe existir una capa de colaboradores por proyecto con permisos por rol, país y módulo.

Roles posibles:

- admin;
- coordinator;
- representative;
- ally;
- clientViewer;
- finance;
- ops.

Permisos esperados:

- leer HR;
- editar HR;
- sincronizar HR;
- asignar visitas;
- leer finanzas;
- editar finanzas;
- aprobar pagos.

## hrImportBatches

Debe registrar cada importación o preview de HR:

- fuente;
- modo dry-run o escritura;
- estado;
- país;
- periodo;
- hojas;
- filas leídas;
- visitas nuevas;
- visitas actualizadas;
- duplicados;
- rechazados;
- incidencias;
- responsable.

## hrSyncRuns

Debe registrar sincronizaciones de HR viva:

- tipo manual, programado o webhook;
- fuente;
- hora de inicio y cierre;
- estado;
- conteos;
- conflictos;
- responsable o sistema.

## hrWriteBackJobs

La escritura de vuelta a Sheets/Excel no debe ser frágil ni directa desde UI. Debe registrarse como trabajo idempotente:

- visita;
- fila destino;
- payload;
- estado;
- intentos;
- fecha de proceso.

## shopperBenefits

Representa beneficio calculado, no pago real.

Debe contener:

- visita;
- shopper;
- país;
- moneda;
- periodo;
- honorario;
- reembolso boleto;
- reembolso combo;
- total;
- estado calculado, pendiente, listo para pago, en lote, pagado, observado o conciliado;
- fuente.

## paymentLots

Agrupa pagos a shoppers:

- periodo;
- país;
- moneda;
- shoppers;
- beneficios;
- visitas;
- monto;
- estado;
- fecha de pago;
- aprobador.

## financialMovements

Representa movimientos reales importados o capturados:

- fecha;
- periodo;
- país;
- moneda;
- monto;
- dirección ingreso/egreso;
- concepto;
- contraparte;
- categoría;
- hoja y fila origen;
- lote de importación;
- estado.

## reconciliations

Cruza beneficios, lotes y movimientos reales:

- beneficios;
- lote de pago;
- movimientos;
- estado de cruce;
- diferencia;
- notas;
- revisor.

## Normalización shopper

`shoppers` debe incluir:

- id estable;
- displayName;
- fullNameCanonical;
- firstName;
- lastName;
- nameKey;
- username con patrón nombre.apellido;
- correo/teléfono cuando exista;
- país;
- aliases históricos.

Los aliases deben conservar variaciones de nombre detectadas en HR, finanzas o importaciones.

## Reglas clave

- `shopperBenefits` puede leerlo admin/ops y el shopper dueño.
- `financialMovements` solo roles financieros/admin.
- `hrImportBatches`, `hrSyncRuns`, `hrWriteBackJobs` solo operadores autorizados.
- `collaborators` solo admin y usuarios con permisos explícitos.
- Información sensible debe protegerse con reglas y segmentación estricta.

## Impacto en adapter

El adapter actual puede persistir proyectos, shoppers y visitas. Debe extenderse después, sin romper interfaz, para persistir:

- import batches;
- sync runs;
- write-back jobs;
- benefits;
- lots;
- movements;
- reconciliations.

## Restricciones conservadas

- No se escribió Firestore.
- No se importó Excel/Sheets.
- No se activó adapter global.
- No se hizo Hosting.
- No se hizo merge.
- No se modificó `/app/modules`.
