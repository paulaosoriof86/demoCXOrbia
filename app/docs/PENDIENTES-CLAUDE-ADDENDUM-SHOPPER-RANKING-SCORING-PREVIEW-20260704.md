# Pendientes Claude addendum - Shopper ranking/scoring preview

Fecha: 2026-07-04

## Origen

Backend agrego contrato y validador preview para shopper ranking/scoring. Este documento lista pendientes frontend/prototipo para Claude.

## Pendientes ranking UI

1. Mostrar ranking como preview/ayuda admin.
2. No presentar score como decision final o punitiva.
3. Mostrar desglose de metricas.
4. Mostrar pesos.
5. Mostrar periodo/proyecto/tenant.
6. Mostrar muestra insuficiente.
7. Mostrar conflicto/revision manual.
8. Mostrar metrica sensible bloqueada.
9. Mostrar ajuste manual con razon y reviewer.

## Pendientes privacidad

1. No usar ni mostrar DPI/documento.
2. No usar ni mostrar banco/cuenta.
3. No usar ni mostrar telefono/correo/WhatsApp.
4. No usar cuerpos de comunicacion.
5. No usar atributos protegidos.
6. No usar monto pagado como proxy de calidad.

## Pendientes operativos

1. Ranking no debe autoasignar visitas.
2. Ranking no reemplaza reglas de disponibilidad.
3. Ranking no reemplaza franja/quincena.
4. Ranking no reemplaza assignment sync/conflicts.
5. Ranking no reemplaza revision admin.
6. Ranking debe estar segmentado por tenant/proyecto/periodo.

## Pendientes Academia

1. Curso Admin: ranking review.
2. Curso Ops: seleccion operativa apoyada en ranking.
3. Curso Shopper: transparencia de desempeno.
4. Curso Superadmin: configuracion de pesos y versionamiento.
5. Manual shopper ranking.
6. Manual metric breakdown.
7. Manual fair scoring rules.
8. Checklist antes de usar ranking para asignacion.
9. Checklist antes de ajuste manual.
10. Glosario de ranking/scoring.

## No corresponde a Claude

- Implementar validator backend.
- Activar Gemini real.
- Escribir Firestore.
- Autoasignar visitas.
- Procesar datos reales.
- Modificar `tools/migration` o `app/contracts`.

## Prioridad

P0: ranking como preview honesto, sin autoasignacion ni datos sensibles.

P1: desglose de metricas, estados de revision y segmentacion por proyecto.

P2: Academia profunda con manuales, checklists y glosario.
