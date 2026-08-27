# DECISION-HR-POR-PROYECTO-Y-HOJA-RUTA-NATIVA-CXORBIA-20260629

## Contexto

Paula aclaró que cada proyecto debe leer su propia hoja de ruta (HR). En T&A, actualmente muchas HR son compartidas por Excel Online o Google Sheets. Cuando Paula no es autora del archivo original, empuja la fuente a Google Sheets para poder administrarla.

Además, CXOrbia debe permitir crear y administrar una hoja de ruta nativa dentro de la plataforma, con colaboración controlada de coordinadores, representantes o aliados autorizados.

## Decisión

CXOrbia debe soportar tres modalidades de HR por proyecto:

1. HR externa Excel Online.
2. HR externa Google Sheets.
3. HR nativa creada y administrada dentro de CXOrbia.

La fuente de HR debe ser configuración propia de cada proyecto, no configuración global del tenant.

## Configuración por proyecto

Cada proyecto debe guardar su propia configuración de HR:

- `hrSourceType`: `excelOnline`, `googleSheets`, `native`, `upload`.
- `hrSourceUrl` o referencia segura de archivo.
- `hrOwnerType`: propia, cliente, aliado, externa.
- `syncMode`: manual, programado, incremental, solo importación inicial.
- `countrySheets`: mapeo de hojas por país, por ejemplo GT/HN.
- `periodMapping`: mes, ronda, quincena o campaña.
- `columnMapping`: columnas operativas.
- `validationRules`: fechas, duplicados, estados, obligatoriedad.
- `importPreviewRequired`: siempre verdadero antes de escribir.
- `lastSyncAt` y `lastSyncStatus`.
- `auditTrail` de importaciones, cambios y conflictos.

## HR nativa CXOrbia

La plataforma debe permitir crear la hoja de ruta dentro de CXOrbia sin depender de Excel/Sheets.

La HR nativa debe permitir:

- crear visitas/sucursales desde cero;
- importar base inicial y luego administrar desde CXOrbia;
- editar país, ciudad, sucursal, escenario, quincena, franja y disponibilidad;
- asignar shoppers;
- controlar estados;
- calcular beneficios esperados;
- generar cuestionarios asociados;
- manejar periodos/rondas;
- colaborar con otros usuarios autorizados;
- registrar bitácora de cambios.

## Colaboración y acceso

La HR nativa o conectada debe poder compartirse con:

- coordinadores internos;
- representantes;
- aliados;
- administradores del tenant;
- eventualmente clientes con acceso limitado.

Todo acceso debe respetar:

- tenantId;
- projectId;
- rol;
- permisos por módulo;
- permisos por país si aplica;
- auditoría de cambios.

## Regla para fuentes externas no propias

Cuando el archivo original no sea de Paula o no pueda administrarse directamente, se permite empujar la información a Google Sheets como fuente administrable, siempre documentando:

- fuente original;
- fecha de copia/sincronización;
- responsable;
- si es copia controlada o espejo operativo;
- riesgos de desactualización;
- reglas para sincronizar cambios.

## Flujo recomendado

1. Crear proyecto en CXOrbia.
2. Definir si usará HR externa o HR nativa.
3. Configurar países, monedas, honorarios y reglas.
4. Conectar fuente externa o crear HR nativa.
5. Mapear columnas.
6. Ejecutar preview/dry-run.
7. Resolver conflictos y duplicados.
8. Confirmar importación.
9. Operar en vivo desde CXOrbia o sincronizar fuente externa.
10. Registrar auditoría.

## Aplicación inmediata a T&A/Cinépolis

Cinépolis/T&A seguirá usando HR GT/HN como fuente histórica y operativa actual.

Cada periodo/proyecto Cinépolis debe tener su propia configuración de HR. Las hojas GT y HN deben mapearse por país y periodo.

Las hojas de Liquidación y movimientos financieros son fuentes relacionadas, pero no reemplazan la HR operativa.

## Requisito para Claude/frontend

Claude debe incorporar en la UI de configuración de proyecto:

- selección de fuente HR;
- conexión Excel Online / Google Sheets;
- creación de HR nativa;
- mapeo de columnas;
- preview antes de escribir;
- panel de colaboradores y permisos;
- bitácora de importaciones/sincronizaciones;
- resolución de conflictos.

ChatGPT/backend no debe parchar `/app/modules`. Si esto requiere cambios de UI, queda como pendiente para Claude.

## Clasificación doble documentación

- TyA específico: HR actuales compartidas por Excel Online/Google Sheets y uso de Google Sheets como copia administrable cuando Paula no es autora.
- CXOrbia generalizable: cada proyecto con HR propia, conectores externos, HR nativa colaborativa y control de permisos/auditoría.

## Restricciones conservadas

- No se escribió Firestore.
- No se conectó ninguna fuente externa nueva.
- No se importó Excel/Sheets.
- No se hizo Hosting.
- No se hizo merge.
- No se tocó producción.
- No se activó adapter global.
- No se modificó `/app/modules`.
