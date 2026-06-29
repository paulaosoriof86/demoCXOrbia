# DECISION-CINEPOLIS-COMO-PROYECTO-INICIAL-Y-PLANTILLA-CXORBIA-20260629

## Contexto

Paula aclaró que todo lo migrado hasta ahora corresponde al proyecto Cinépolis, porque era el proyecto creado hasta el momento en T&A.

La plataforma CXOrbia no debe quedar rígida para Cinépolis. Debe permitir crear nuevos proyectos desde la plataforma y definir allí sus lógicas operativas, financieras, HR y de importación.

## Decisión

Cinépolis/T&A se usará como primer caso real y plantilla de aprendizaje, pero no como modelo hardcodeado.

Toda lógica detectada en Cinépolis debe clasificarse como:

1. regla específica de Cinépolis;
2. regla específica de T&A;
3. patrón generalizable para CXOrbia;
4. configuración editable del proyecto.

## Implicación para creación de nuevos proyectos

Desde la plataforma debe poder crearse un proyecto nuevo con:

- tenant / consultora;
- cuenta / cliente final;
- país o países;
- moneda por país;
- honorarios por país;
- reembolsos por país y tipo de evidencia;
- escenarios;
- quincenas/periodos;
- franjas;
- reglas de disponibilidad;
- reglas de asignación;
- reglas de cuestionario;
- reglas de submitido;
- reglas de pago y liquidación;
- fuente HR si aplica;
- mapeo de columnas;
- validación previa y preview;
- importación histórica;
- sincronización viva/incremental.

## HR como fuente configurable

La lectura de HR no debe estar amarrada solo a Cinépolis.

La plataforma debe permitir configurar una HR por proyecto, incluyendo:

- archivo o fuente externa;
- hojas por país;
- convención de nombres de hoja;
- detección de hoja GT y HN;
- periodo/mes;
- mapeo de columnas;
- deduplicación por visita, shopper y sucursal;
- normalización de shoppers;
- validación de fechas;
- cálculo de beneficios esperados;
- importación inicial;
- actualización incremental.

## HR GT/HN

Para Cinépolis/T&A, cada mes puede tener hoja de ruta Guatemala y hoja de ruta Honduras. La hoja de Honduras finaliza o se identifica con `HN`.

Esto debe tratarse como país/proyecto/periodo separado dentro del mismo tenant/cuenta, no como mezcla dentro de una sola hoja.

## Hojas Liquidación

Paula aclaró que las hojas `Liquidación` también están asociadas a T&A y deben considerarse en la migración financiera/operativa.

Estas hojas deben entrar al diagnóstico/importador como fuente de:

- honorarios pagados;
- honorarios pendientes;
- reembolsos relacionados;
- lote o estado de pago cuando exista;
- conciliación con movimientos financieros.

No deben mezclarse con hojas personales ni de otros negocios.

## Reglas de país y honorarios confirmadas

- GT / Cinépolis: honorario según regla de proyecto ya documentada, por ejemplo Q60 cuando aplique.
- HN / Cinépolis: honorario confirmado L200.

Estos valores deben ser configurables por proyecto y país desde la plataforma.

## Separación de fuentes

- HR: visitas, asignaciones, fechas, cuestionarios, submitidos, estado operativo y beneficios esperados.
- Liquidación: pagos/honorarios/reembolsos asociados a T&A.
- Movimientos financieros: ingresos/egresos reales, conciliación, pagos efectivamente ejecutados y saldos.

## Requisito generalizable CXOrbia

Cada cliente/tenant debe poder importar y operar sus propios archivos desde la plataforma, sin depender de scripts manuales:

- importador HR;
- importador financiero;
- importador de liquidaciones/pagos;
- preview antes de escribir;
- dry-run;
- bitácora de importación;
- auditoría de cambios;
- reversión o marca de lote importado;
- validación multi-tenant.

## Impacto para Claude/frontend

Claude debe crear o ajustar el frontend para que la configuración de proyecto permita administrar estas lógicas desde UI. ChatGPT/backend no debe parchear módulos de UI; si se requiere cambio de frontend, debe quedar documentado para Claude.

## Clasificación doble documentación

- TyA específico: Cinépolis como proyecto inicial, HR GT/HN, hoja HN, hojas Liquidación asociadas a T&A y honorario HN L200.
- CXOrbia generalizable: motor de creación de proyectos, configuración de lógicas por proyecto, importador HR/financiero/liquidaciones y preview/dry-run desde plataforma.

## Restricciones conservadas

- No se escribió Firestore.
- No se importó el Excel todavía.
- No se hizo Hosting.
- No se hizo merge.
- No se tocó producción.
- No se activó adapter global.
- No se modificó `/app/modules`.
