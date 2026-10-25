# Project visit restrictions and postulation card Phase A TyA

Fecha: 2026-07-04

## Objetivo

Corregir y complementar la regla de reservas/franja: lo de WK/WKND y quincena queda especifico para el proyecto Cinepolis, mientras que todos los proyectos deben poder configurar sus propias restricciones de visita, perfil, frecuencia, horario, dias y origen de la restriccion.

Este bloque no modifica frontend y no activa runtime. Define contrato, validador, gaps y Academia asociada.

## Decision

La plataforma no debe asumir que todos los proyectos funcionan como Cinepolis.

Cada proyecto debe poder configurar restricciones como:

- edad o rango de edad si el escenario/proyecto lo requiere;
- ciudad, ubicacion o zona;
- nivel de experiencia del shopper;
- certificacion requerida;
- documentos requeridos;
- frecuencia maxima de visitas;
- fecha de ultima visita;
- dias minimos entre visitas;
- si se permite o no repetir shopper;
- dias permitidos;
- horarios permitidos;
- ventanas de visita;
- fechas bloqueadas;
- reglas de escenario;
- evidencias requeridas;
- cuestionario interno, externo o link por visita.

## Cinepolis como caso especifico

Para Cinepolis:

- la frecuencia del proyecto es mensual;
- el periodo de medicion/realizacion es quincenal;
- WK/WKND aplica como restriccion del cliente;
- la validacion de fecha debe revisar `Disponible desde`, franja y quincena.

Esto no debe convertirse en regla global. Debe ser configuracion del proyecto Cinepolis dentro de TyA.

## Requisito del cliente vs medicion interna

Cada restriccion debe indicar su origen:

- requisito del cliente;
- medicion interna de avance;
- regla operativa de calidad;
- requisito del escenario;
- cumplimiento/legal si aplica;
- excepcion manual de proyecto.

Esto es importante porque no todas las restricciones deben bloquear igual ni comunicar lo mismo.

Ejemplo:

- Si el cliente exige WK/WKND, la plataforma debe mostrarlo como requisito del cliente.
- Si la consultora usa una quincena solo para medir avance interno, debe mostrarse como control interno/operativo.

## Contrato creado

- `app/contracts/project-visit-restrictions-postulation-card-phase-a.tya.contract.json`

El contrato define:

- configuracion de frecuencia y periodo de medicion;
- origen de restriccion;
- restricciones de perfil shopper;
- restricciones de frecuencia/ultima visita;
- restricciones de horario, dias y ventana;
- restricciones de escenario;
- campos minimos de ficha de postulacion;
- reglas de excepcion;
- impacto Academia.

## Validador creado

- `tools/migration/tya-project-visit-restrictions-validator.mjs`

El validador revisa:

- gates apagados;
- frecuencia/periodo/origen de restriccion;
- grupos de restricciones;
- campos requeridos en ficha de postulacion;
- reglas de visibilidad antes de postular;
- regla de no hard-codear Cinepolis;
- regla de no penalizar automaticamente;
- impacto Academia.

## Campos minimos de ficha de postulacion

La ficha de postulacion debe mostrar antes de que el shopper aplique:

- proyecto;
- cliente;
- sucursal/visita;
- pais;
- moneda;
- honorario;
- reembolso;
- escenario;
- resumen del proyecto;
- disponible desde;
- ventana permitida;
- franja o restriccion de agenda;
- periodo de medicion;
- si la restriccion es del cliente o interna;
- elegibilidad del shopper;
- restriccion por ultima visita/frecuencia;
- certificacion requerida;
- documentos requeridos;
- tipo de cuestionario;
- evidencias requeridas;
- estado del boton de postulacion;
- advertencias de restricciones.

## Reglas Phase A

1. El shopper debe ver honorario, reembolso, escenario, resumen del proyecto y restricciones antes de postularse.
2. Si una visita tiene restricciones de perfil, deben mostrarse claramente.
3. Si permite fecha propuesta, debe mostrar `availableFrom`, dias/horarios/franja y periodo.
4. Si la restriccion viene del cliente, debe decir requisito del cliente.
5. Si es medicion interna, debe decir control interno o medicion operativa.
6. Si la elegibilidad es dudosa, debe ir a revision manual, no permitir/denegar silenciosamente.
7. La ficha no debe prometer HR sincronizada si el gate esta apagado.
8. Cinepolis no debe hard-codearse como modelo unico.

## Pendientes backend

- Mapear restricciones por proyecto en el futuro `projectConfig` backend.
- Integrar con reservas/franja/rango y lifecycle.
- Crear contrato de scoring/ranking shopper antes de penalizaciones.
- Crear preview validator para elegibilidad de shopper y restricciones de fecha.

## Pendientes prototipo

- Ficha de postulacion debe mostrar restricciones completas y no solo datos basicos.
- Debe mostrar honorario, reembolso, escenario y resumen del proyecto.
- Debe mostrar restricciones de perfil, frecuencia, ultima visita, fecha, franja, horario y dias.
- Debe mostrar si la restriccion es requisito del cliente o control interno.
- Debe permitir revision manual si hay duda.
- Debe documentarse para Claude cuando vuelva a tener capacidad.

## Impacto Academia

Academia debe crear contenido para:

### Shopper

- Como leer la ficha de postulacion.
- Que significa honorario y reembolso.
- Que es escenario.
- Que significa restriccion de perfil.
- Que significa ultima visita/frecuencia.
- Que significa requisito del cliente vs medicion interna.
- Como saber si es elegible.
- Que hacer si requiere revision manual.

### Operativo / coordinador

- Como configurar y revisar restricciones.
- Como validar elegibilidad.
- Como responder dudas de shoppers.
- Como escalar excepciones.

### Admin

- Como definir restricciones por proyecto.
- Como decidir si una restriccion es del cliente o interna.
- Como auditar excepciones.
- Como evitar penalizaciones indebidas.

### Cliente

- Como se reflejan sus requisitos en la plataforma.
- Que valor tiene mostrar restricciones claras al shopper.

### Consultora / representante / franquiciado / aliado / socio

- Como configurar proyectos distintos sin hard-codear reglas.
- Como la ficha de postulacion reduce errores y reprocesos.
- Como esto mejora valor comercial y operativo.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin HR writes.
- Sin Make real.
- Sin deploy.
- Sin produccion.
