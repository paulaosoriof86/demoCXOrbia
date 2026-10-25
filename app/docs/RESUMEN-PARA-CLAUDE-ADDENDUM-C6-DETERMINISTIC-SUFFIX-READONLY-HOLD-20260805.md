# RESUMEN PARA CLAUDE — C6 Deterministic Suffix Read-only HOLD

**Fecha:** 2026-08-05  
**Impacto Claude/prototipo:** ninguno en este bloque

## Estado conectado

El backend adoptó como contrato source-only la excepción `DETERMINISTIC_TECHNICAL_SUFFIX` para shoppers activos distintos que comparten `nombre.apellido`.

La regla no se aplicó al runtime ni al frontend. El plan continúa no ejecutable.

## Resultado técnico

- 71 de los 83 apellidos técnicos activos pendientes se completaron mediante consenso multi-fuente source-safe;
- permanecen 12 perfiles activos sin apellido técnicamente suficiente;
- el baseline corregido es 65 grupos de colisión y 142 identidades activas;
- 52 grupos conservan un titular técnico inequívoco con `nombre.apellido`;
- 13 grupos requieren sufijo para todas sus identidades;
- 90 identidades reciben sufijo de 4 caracteres en el plan;
- no se necesitaron sufijos de 6 u 8 caracteres;
- no existen colisiones de sufijo ni target login;
- el perfil multi-Auth continúa empatado;
- plan no superpuesto: 340 filas, 13 HOLD, no ejecutable.

## No tocar desde frontend

- no modificar Login para fabricar o interpretar aliases;
- no deduplicar shoppers por nombre visible;
- no guardar el sufijo como lógica hardcodeada en módulos;
- no mostrar fingerprints, emails internos, UID o metadata técnica;
- no modificar `/app/modules`, `/app/core` ni `CX.data` por este HOLD.

## Ajuste frontend futuro

Solo después de materialización Auth autorizada, el selector/login deberá aceptar el identificador visible exacto entregado por backend. El frontend no debe recalcular el sufijo.

## Academia

Sin cambio de rutas, cursos, manuales o notificaciones todavía. El patrón reusable a documentar es: identidad visible amigable con excepción técnica estable, no PII y gobernada por backend.

## Pendiente real

Diseñar un bloque source-only que incremente evidencia para los 12 apellidos y separe el empate multi-Auth sin leer nuevamente al provider. No existe autorización para Auth, contraseñas, deploy o producción.
