# RESUMEN PARA CLAUDE — materialización Firestore R6

Claude no toca este bloque ni importa sus archivos.

El backend ya puede representar el paso `source_safe → materialization_plan` con estados honestos. Para el prototipo genérico, únicamente debe existir soporte visual para:

- plan preparado;
- validación aprobada o bloqueada;
- conteos por dominio;
- lotes técnicos;
- fuente pendiente;
- materialización pendiente de autorización;
- error/conflicto;
- confirmado después de ejecución real.

No mostrar `Firestore conectado`, `datos importados`, `pago ejecutado` o `certificación migrada` por el solo hecho de que exista un plan.

El frontend debe mantener `CX.data` estable. El switch al backend lo hará ChatGPT/Codex en el punto único autorizado, no Claude.
