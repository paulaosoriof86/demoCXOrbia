# Pendientes prototipo addendum - Sensitive data policy Phase A

Fecha: 2026-07-04

## Origen

Backend agrego politica consolidada de datos sensibles para Phase A. Este documento lista pendientes frontend/prototipo para Claude.

## Pendientes UI generales

1. Mostrar estados honestos para datos protegidos:
   - protegido;
   - pendiente backend;
   - requiere autorizacion;
   - referencia privada;
   - revision manual.
2. No mostrar datos bancarios, documentos, NDA, adjuntos privados ni cuerpos crudos de comunicacion en vistas shopper.
3. No usar textos que aparenten Storage/correo/WhatsApp/Make/Gemini reales si los gates estan apagados.
4. No mostrar URLs publicas de adjuntos privados.

## Mis beneficios

1. Mostrar montos y estados sin datos bancarios.
2. Si falta perfil de pago, mostrar `dato protegido/pendiente de autorizacion`, no pedir ni mostrar cuenta bancaria en vista shopper.
3. Separar pago pendiente/programado/pagado/revision sin exponer datos internos.

## Comunicaciones

1. Mostrar trazabilidad permitida: canal, plantilla, estado, fecha, referencia.
2. No mostrar cuerpo crudo de correo/WhatsApp si no esta autorizado.
3. No mostrar adjuntos privados.
4. Si correo real no esta conectado, usar borrador/fallback/manual, no `enviado`.

## CRM / documentos / evidencias

1. Mostrar referencia privada u opaca cuando exista carpeta/archivo protegido.
2. No mostrar documento privado como publico.
3. Si falta Storage real, mostrar pendiente backend.
4. Si hay evidencia privada, no exponerla al shopper salvo regla explicita futura.

## Academia

1. Curso Admin: datos protegidos.
2. Curso Ops: import seguro.
3. Curso Finanzas: pagos sin exponer banco.
4. Curso Shopper: privacidad.
5. Checklist antes de importar fuente.
6. Checklist antes de mostrar datos al shopper.
7. Checklist antes de activar integracion.
8. Glosario de privacidad y source-safe.

## No corresponde a Claude

- Implementar validator backend.
- Activar Storage/Firestore/Auth/Make/Gemini/correo real.
- Procesar datos reales.
- Definir cifrado o reglas finales desde UI.

## Prioridad

P0: textos honestos y no exposicion de datos sensibles en shopper/Mis beneficios/comunicaciones.

P1: Academia y glosario/checklists.
