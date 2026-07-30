# PENDIENTES-PROTOTIPO-ADDENDUM-20260629-AUDITORIA-FLUJOS-V52

## Objetivo

Pendientes para Claude derivados de la revisión inicial de flujos, lógicas y sincronizaciones del prototipo V52.

## P0 - Seguridad / visibilidad shopper

### Mis Beneficios debe filtrar por shopper autenticado

El módulo `beneficios` usa liquidaciones del proyecto completo. Para rol shopper debe mostrar solo las visitas/beneficios del shopper autenticado.

Debe considerar alias y normalización de nombres para histórico:

- `shopperId` estable;
- `nameKey`;
- `aliases`;
- coincidencias por email/teléfono cuando existan;
- variaciones de nombre en mayúscula/minúscula/incompleto.

## P0 - No confundir beneficio calculado con pago real

El prototipo habla de liquidación derivada de visita. Debe separar visualmente:

- beneficio calculado;
- pago pendiente;
- lote programado;
- pago real;
- movimiento financiero conciliado.

No debe marcar pagado solo porque la HR tenga visita/cuestionario/liquidación esperada.

## P1 - Configuración HR por proyecto

El wizard de proyecto debe ampliar la configuración HR:

- Excel Online;
- Google Sheets;
- carga de archivo;
- HR nativa CXOrbia;
- URL/referencia;
- hojas por país;
- mapeo de columnas;
- preview;
- dry-run;
- conflictos;
- auditoría;
- write-back.

## P1 - HR nativa colaborativa

Agregar UI/flujo para crear la HR dentro de CXOrbia y compartirla con:

- coordinadores;
- representantes;
- aliados;
- administradores;
- clientes con acceso limitado si aplica.

Debe respetar tenant, proyecto, país, rol y permisos.

## P1 - Importador multipaís/multihoja

El importador actual debe evolucionar para hojas GT/HN y futuras variantes por país/periodo.

Debe permitir:

- seleccionar hojas válidas;
- identificar hoja HN;
- mapear columnas por hoja;
- validar honorario por país;
- dry-run antes de crear visitas;
- no duplicar por llave natural.

## P1 - Liquidación / pagos / movimientos financieros

Crear pantallas o ajustes donde corresponda para diferenciar:

- beneficios esperados del shopper;
- liquidaciones/honorarios por pagar;
- movimientos financieros reales;
- reembolsos T&A a franquiciada;
- pagos de franquiciada a shoppers;
- conciliación.

## P1 - Configuración de honorarios por país

La lógica debe tomar honorarios desde configuración del proyecto/país, no defaults fijos.

Para Cinépolis/T&A confirmado:

- GT: Q60 cuando aplique;
- HN: L200.

## P2 - Sincronización bidireccional real

El prototipo simula HR online. La UI debe reflejar estados reales de sincronización:

- última lectura;
- último write-back;
- conflictos;
- filas nuevas;
- filas actualizadas;
- filas rechazadas;
- lote de importación;
- responsable.

## Clasificación

- TyA específico: GT/HN, hojas Liquidación, Cinépolis, honorario HN L200.
- CXOrbia generalizable: configuración HR por proyecto, HR nativa colaborativa, importador multihoja, beneficios/pagos/movimientos separados.

## Restricciones

Estos pendientes son para Claude/frontend. ChatGPT/backend no debe modificar `/app/modules` ni parchar UI.
