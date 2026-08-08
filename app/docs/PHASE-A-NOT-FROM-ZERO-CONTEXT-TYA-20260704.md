# Phase A not-from-zero context TyA

Fecha: 2026-07-04

## Correccion de contexto

Phase A no parte de cero.

Ya existe una plataforma operando, reglas documentadas, lectura HR trabajada, mapeo de columnas trabajado, deduplicacion analizada y paquetes de migracion generados.

La salida de hoy debe aprovechar ese avance, no repetir levantamientos completos.

## Contexto operativo ya conocido

- Hasta junio ya esta ejecutado con fechas e informacion operativa en HR.
- Hasta mayo los pagos estan completos segun archivo de movimientos.
- Quedan pagos pendientes de algunas visitas de primera quincena de junio y todos los de segunda quincena de junio.
- Julio aun no tiene postulaciones nuevas relevantes que compliquen migracion.
- La HR es fuente operativa principal para visitas, asignaciones y control completo.
- La base de certificaciones y los flujos son prioridad para conservar y mejorar.

## Implicacion para Phase A

No se debe pedir nuevamente informacion ya trabajada salvo que el archivo o acceso no este disponible en la sesion actual.

Se debe reutilizar:

- logica HR ya mapeada;
- reglas Cinépolis Q1/Q2;
- deduplicacion postulación/plataforma/HR;
- migracion RTDB/HR V6 y V7.1;
- shoppers y postulaciones ya extraidas;
- certificaciones historicas disponibles;
- proyecto Cinépolis ya creado como si viniera desde plataforma.

## Prioridad real de hoy

1. Conservar y estabilizar flujos existentes.
2. Validar lectura completa HR.
3. Mantener import historico completo como base de control.
4. Mantener asignaciones reales sin duplicacion.
5. Conservar shoppers ya certificados.
6. Permitir nuevos proyectos desde configuracion/plataforma.
7. Pedir accesos Make solo cuando se llegue a integracion real.

## Informacion que no se debe volver a pedir de entrada

- Mapeo de columnas HR ya trabajado.
- Reglas base HR ya documentadas.
- URL HR si ya aparece en documentos o configuracion del repo.
- Lista historica de shoppers/certificaciones si ya aparece en paquetes V6/V7.1.
- Dedupe base si ya esta documentado.

## Informacion que si puede pedirse cuando toque

- Accesos Make o webhook.
- Estructura especifica del nuevo proyecto si no se puede crear desde plataforma.
- Confirmacion de pagos pendientes de junio para liquidaciones.
- Cualquier dato que no este en repo, paquetes o documentos disponibles.

## Estado

- Contexto corregido.
- Sin cambios frontend.
- Sin runtime conectado.
- Sin deploy ejecutado.
- Sin escritura Firestore en este bloque.
