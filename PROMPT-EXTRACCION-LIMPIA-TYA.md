# Prompt de extraccion limpia TyA

Usar en la conversacion/proyecto de la plataforma actual TyA.

```text
Necesito preparar una exportacion limpia para CXOrbia nueva. Devuelve solo informacion confiable y funcionando bien. Omite registros demo, duplicados, logicamente inconsistentes, parches fallidos o soluciones temporales.

Organiza la respuesta asi:

1. HR viva
- Campos fuente de verdad.
- Reglas confiables de disponible desde, quincena, franja, semana o fin de semana, asignacion, realizada, cuestionario, submitido y liquidacion.
- Flujo correcto por pais GT/HN y periodo.

2. Postulaciones y asignaciones
- Campos obligatorios.
- Fecha propuesta y franja.
- Aprobacion, solicitud de cambio de fecha, espera, reasignacion y notificaciones que si funcionan.
- Vistas utiles por sucursal y por shopper.

3. Shoppers
- Campos buenos.
- Identificador canonico.
- Historial y estadisticas reales utiles para puntaje.
- Criterios de score confiables.

4. Visitas
- Campos validos por visita.
- Estados validos.
- Relacion con HR, proyecto, pais, periodo, sucursal y shopper.
- Restricciones reales de Cinepolis y otros proyectos vigentes.

5. Finanzas, beneficios y liquidaciones
- Honorarios y reembolsos confiables.
- Moneda por pais.
- Reglas de boleto, combo, honorario, fechas y estado de pago.
- Que NO debe migrarse por inconsistencia.

6. Certificaciones y aprendizaje
- Bancos de preguntas confiables.
- Resultados validos.
- Reglas funcionales de aprobacion o recertificacion.

7. Notificaciones y tablero
- Eventos confiables.
- Mensajes que deben conservarse.
- Estados atendido o pendiente si son confiables.

8. Accesos y roles
- Roles reales usados.
- Accesos validos.
- Datos sensibles que deben omitirse o cifrarse.

9. Export recomendado
Proponer estructura limpia para: projects, periods, branches, visits, applications, shoppers, shopperStats, benefits, liquidations, certifications, notifications, roles.

10. No migrar
Lista todo lo que no debe pasar a CXOrbia nueva por estar mal, duplicado, viejo, demo, hardcodeado o contaminado.

Formato final:
- Resumen ejecutivo.
- Tablas por modulo.
- Diccionario de campos.
- Reglas de negocio limpias.
- JSON ejemplo por entidad.
- Lista final: MIGRAR / NO MIGRAR / REVISAR MANUALMENTE.
```
