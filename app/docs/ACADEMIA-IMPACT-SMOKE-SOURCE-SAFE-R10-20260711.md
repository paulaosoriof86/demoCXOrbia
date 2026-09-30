# Academia — impacto smoke visual source-safe R10

Fecha: 2026-07-11

## Propósito

El smoke R10 introduce una validación operacional que debe reflejarse en Academia para que Admin y Operaciones entiendan cuándo la plataforma está mostrando datos demo, source-safe o backend real.

## Contenido que debe incorporarse

### Lección: reconocer el modo de datos

Explicar:

- demo/localStorage;
- source-safe preview;
- backend DEV;
- producción;
- qué estados permiten operar y cuáles son solo verificación;
- por qué un PASS visual no autoriza importación ni pagos.

### Lección: validar proyecto y fuente

Checklist:

- tenant correcto;
- proyecto correcto;
- país y moneda;
- periodos y conteos;
- visitas y shoppers protegidos;
- fuente y fecha de actualización;
- ausencia de PII cruda;
- ausencia de métricas inventadas.

### Lección: revisar por rol

Admin:

- proyectos;
- visitas;
- postulaciones;
- certificaciones;
- finanzas;
- Academia.

Cliente:

- síntesis permitida;
- estados vacíos honestos;
- límites de acceso.

Shopper:

- visitas propias;
- certificación/carryover;
- beneficios propios;
- protección de datos de terceros.

### Lección: liquidación no es pago

Mantener la regla TyA:

- visita ejecutada;
- cuestionario/submitido;
- liquidación;
- elegibilidad de pago;
- pago confirmado;
- lote y movimiento individual.

Junio debe enseñarse como control de pagos pendientes, no como repetición de visitas.

## Interactividad requerida

- checklist por rol;
- ejemplo PASS/HOLD;
- escenario de conteo diferente;
- escenario de fuente ausente;
- escenario de copy deshonesto;
- escenario de certificación carryover;
- ejercicio para distinguir liquidada vs pagada;
- progreso y validación final.

## Edición y gobierno

El contenido debe ser administrable, versionable y segmentado por tenant/proyecto/rol. Cambios en módulos o contratos deben generar revisión de manual, curso, checklist y notificación correspondiente.

## Estado

Impacto documentado. No se modificó runtime de Academia ni se activó Gemini, notificaciones reales, Make o producción.
