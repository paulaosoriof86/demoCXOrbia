# DECISION-FUENTE-MOVIMIENTOS-FINANCIEROS-TYA-20260629

## Contexto

Paula compartió el archivo histórico de movimientos financieros con corte a mayo, usado antes del proyecto de migración de T&A.

Archivo recibido por ChatGPT:

```text
2026 Ingresos Egresos y Presupuesto Paula.xlsx
```

## Regla de alcance

El archivo contiene movimientos de varios negocios y personales. Para CXOrbia/T&A solo se debe importar lo correspondiente a T&A.

Se debe omitir todo lo que no corresponda a T&A.

## Hojas válidas para T&A

Para movimientos financieros se deben considerar únicamente:

- hojas de `TyA` / `T&A Guatemala` de cada mes;
- hojas de `TyA HN` / `T&A Honduras` de cada mes;
- hoja o bloques de liquidaciones/honorarios cuando estén dentro de las hojas TyA;
- histórico desde 2025 en adelante, salvo que Paula autorice usar hojas anteriores.

## Hojas o registros detectados en primera inspección

Se detectaron hojas relacionadas con T&A y liquidaciones/honorarios, entre ellas:

- `May TyA`
- `Jun TyA`
- `Jul TyA`
- `Ago TyA`
- `Ago TyA HN`
- `Nov TyA`
- `Nov TyA HN`
- `Dic TyA 24`
- `Dic TyA HN`
- `Ene TyA 25`
- `Feb TyA 25`
- `Mar TyA 25`
- `Abr TyA 25`
- `May TyA 25`
- `Jun TyA 25`
- `Jul TyA 25`
- `Ago TyA 25`
- `Sept TyA 25`
- `Oct TyA 25`
- `Nov TyA 25`
- `Dic TyA 25`
- `Ene TyA 26`
- `Feb TyA 26`
- `Mar TyA 26`
- `Abr TyA 26`

La detección inicial se hizo como inventario, no como importación.

## Reglas de honorarios por país

- Guatemala / GT: mantener la regla ya documentada de Cinépolis GT, Q60 cuando aplique según proyecto/visita.
- Honduras / HN: Paula aclaró que el honorario de Cinépolis HN es L200.

Esto reemplaza cualquier default previo de HN que hubiera usado L180.

## Pagos y pendientes

Según Paula:

- hasta abril está todo pagado;
- mayo tiene pagada la mayoría de la primera quincena;
- mayo segunda quincena está pendiente parcial;
- junio y meses posteriores deben manejarse en vivo desde la plataforma o importaciones futuras.

## Separación obligatoria de conceptos

La plataforma debe separar:

1. `financialMovements`: ingresos/egresos reales por mes y país.
2. `shopperBenefits`: beneficios calculados por visita, honorarios + boleto + combo.
3. `paymentLots`: lotes o pagos agrupados a shoppers.
4. `reconciliations`: conciliación entre beneficios calculados, pagos realizados y movimientos financieros.
5. `franchiseReimbursements`: remesas o reembolsos T&A hacia Paula/franquiciada.

## Importación futura desde plataforma

La plataforma CXOrbia debe quedar habilitada para que cada cliente/tenant pueda importar directamente su archivo financiero propio desde UI, con:

- selección de cliente/tenant;
- selección de país;
- selección de hojas a importar;
- preview antes de escribir;
- detección de hojas no permitidas;
- mapeo de columnas;
- clasificación de ingresos/egresos;
- identificación de honorarios, reembolsos, pagos y saldos pendientes;
- conciliación posterior;
- registro de auditoría.

## Regla de seguridad para este archivo

Este archivo se usará como fuente de migración segura para agilizar el proceso, pero la plataforma debe ser la fuente de operación futura.

No se debe cargar información personal o de otros negocios.

No se debe escribir Firestore hasta tener transformador, dry-run, conteos y autorización explícita.

## Impacto sobre HR V4

HR V4 aporta operación/visitas/cuestionarios y beneficios esperados.

El archivo financiero aporta movimientos reales, pagos realizados, pagos pendientes, honorarios y conciliación financiera.

Ambas fuentes deben cruzarse por mes, país, shopper normalizado, visita/proyecto y tipo de concepto.

## Clasificación doble documentación

- TyA específico: hojas TyA/TyA HN, corte a mayo, reglas de pago y honorario HN L200.
- CXOrbia generalizable: importador financiero multi-tenant por cliente, país, hoja, preview, dry-run y conciliación.

## Restricciones conservadas

- No se escribió Firestore.
- No se importó el archivo todavía.
- No se hizo Hosting.
- No se hizo merge.
- No se tocó producción.
- No se activó adapter global.
- No se modificó `/app/modules`.
