# Postulation card dynamic data source Phase A TyA

Fecha: 2026-07-04

## Objetivo

Corregir y profundizar la ficha de postulacion para que sea dinamica, configurable y basada en datos vivos, no hard-codeada.

Este bloque recoge lo observado por Paula en la ficha actual y define que informacion viene de HR, de configuracion del proyecto, de reglas calculadas, de override admin o de fallback manual.

No modifica frontend y no activa runtime.

## Regla principal

Toda informacion operacional debe ser dinamica.

La ficha de postulacion no debe contener datos fijos en codigo. Debe reflejar:

- HR viva o preview seguro cuando aplique;
- configuracion del proyecto;
- reglas calculadas;
- overrides admin;
- fallback manual si el mapeo no esta listo;
- ultimo estado seguro disponible.

## Contrato creado

- `app/contracts/postulation-card-dynamic-data-source-phase-a.tya.contract.json`

## Fuente de datos por tipo de campo

### Datos que suelen venir de HR

- escenario;
- disponible desde;
- franja;
- quincena si afecta la postulacion;
- canal/formato si viene por visita;
- combo o compra requerida;
- honorario/reembolso si HR lo trae por visita;
- link de cuestionario por visita si aplica.

### Datos que pueden venir de configuracion del proyecto

- resumen general del proyecto;
- reglas de elegibilidad;
- certificacion requerida;
- documentos o recursos requeridos;
- dias/horarios permitidos si no vienen de HR;
- restricciones de perfil;
- reglas de frecuencia;
- tipo de cuestionario interno/externo/link;
- instructivo y recursos.

### Datos calculados

- ventana permitida combinando `availableFrom`, franja, quincena, dias y horario;
- elegibilidad preliminar;
- advertencias de restriccion;
- si requiere revision manual;
- estado del boton de postularme.

### Datos internos que NO necesariamente debe ver el shopper

- si la restriccion es requisito del cliente o medicion interna;
- modo tecnico de cuestionario;
- nombres de columnas HR;
- detalles de mapping backend;
- reglas internas de medicion si no afectan una accion del shopper.

El shopper debe ver instrucciones claras, no taxonomia interna.

## Ficha frontal recomendada

La vista principal debe mostrar solo lo necesario para decidir si postularse:

- proyecto;
- sucursal/ubicacion;
- escenario o resumen operativo;
- formato/canal si aplica;
- quincena o ventana si afecta la fecha;
- franja o restriccion de agenda si aplica;
- compra/combo si aplica;
- honorario;
- reembolso;
- restricciones relevantes;
- certificacion si aplica;
- disponibilidad de instructivo/recursos;
- boton ver detalle/postularme.

## Dorso o detalle de postulacion

Al abrir detalle o postularme, debe ampliar:

- escenario completo;
- disponible desde explicado;
- fecha permitida o ventana;
- campo de fecha propuesta cuando aplique;
- confirmacion de que cumple restricciones;
- aceptacion de condiciones;
- que pasa despues de enviar;
- aviso de que operaciones/admin revisara;
- notificacion esperada.

## Flujo posterior a postularse

Cuando shopper envia postulacion:

1. Se crea postulacion pendiente de revision.
2. Se notifica a operaciones/admin.
3. Se confirma al shopper recepcion de postulacion.
4. Cuando admin/ops aprueba, se registra quien aprobo.
5. La visita debe salir de gestiones disponibles para evitar doble aprobacion.
6. Se notifica al shopper que fue aprobado/asignado.
7. Si el proyecto requiere programar, se le pide programar.
8. Si ya tenia fecha propuesta aprobada, queda agendada o pendiente de confirmacion segun reglas del proyecto.
9. Se habilitan acciones permitidas: reprogramar, cancelar, ver instructivo, ver documentos/recursos.

## Punto importante de UI

La ficha no debe decir al shopper si una restriccion es del cliente o interna salvo que sea necesario para explicarle la regla. Esa clasificacion es util para admin/backend, pero el texto visible debe ser natural:

- `Debes programar dentro de la quincena asignada.`
- `No debes haber visitado esta sucursal en los ultimos 2 meses.`
- `Esta visita solo permite fin de semana.`

## Pendientes backend

- Mapear cada campo de la ficha con fuente: HR, config, calculado, override, fallback.
- Crear preview validator de ficha con datos mock/staging.
- Integrar con restricciones, reservas, lifecycle y assignment sync.
- Preparar mapeo inteligente HR/manual en project wizard.

## Pendientes prototipo

- Ficha frontal/dorso debe distinguir dato shopper-visible vs interno.
- Debe mostrar solo restricciones relevantes y claras.
- Debe tomar escenarios y availableFrom dinamicos desde HR cuando aplique.
- Debe permitir fallback manual/configurable.
- Debe reflejar cambios vivos de HR/config cuando runtime este habilitado.

## Impacto Academia

Academia debe explicar:

- como leer ficha de postulacion;
- que viene de HR y que viene de configuracion;
- como proponer fecha;
- que pasa despues de postularse;
- como operaciones aprueba;
- por que la visita desaparece de disponibles tras asignacion;
- que acciones tiene el shopper luego de aprobacion.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin HR writes.
- Sin Make real.
- Sin deploy.
- Sin produccion.
