# Academia — impacto R16E y validación en plataforma

Fecha: 2026-07-13

## Contenido que Academia debe cubrir

Academia debe enseñar la diferencia entre:

1. source lock aprobado;
2. Hosting DEV source-safe;
3. comparación read-only contra proveedor;
4. Firestore DEV materializado;
5. Auth/roles DEV;
6. operación integral;
7. producción.

## Regla operativa

Una URL remota funcional no prueba por sí sola que la migración esté materializada. La validación cambia según el checkpoint:

- source-safe: navegación, estructura y conteos sanitizados;
- materialización: datos realmente conectados y trazabilidad;
- Auth/roles: permisos y visibilidad;
- operación: flujos de extremo a extremo;
- preproducción: cutover y rollback.

## Caso R16E

- el precheck y la normalización contractual pasaron;
- la lectura llegó a Firestore;
- la cuota bloqueó antes de obtener clasificaciones;
- no hubo writes ni persistencia de datos provider;
- la build DEV sigue válida y disponible.

## Ruta por rol

### Admin/Superadmin

- identificar ambiente y fuente;
- revisar conteos y colas;
- distinguir blocker técnico de error de datos;
- no autorizar materialización sin comparación completa.

### Operativo

- validar visitas, periodos y estados;
- revisar que junio sea pagos/liquidaciones pendientes;
- enviar conflictos a revisión.

### Shopper/Cliente

- no exponer cuota, credenciales o detalles provider;
- mostrar únicamente estado funcional y mensajes comprensibles.

## Formato futuro

- tarjeta de ambiente;
- checklist por checkpoint;
- ejemplos de aprobación/rechazo;
- errores frecuentes;
- botón para solicitar capacitación;
- notificación cuando se habilite un nuevo checkpoint.

Estado editorial: backfill documental. No modifica Academia runtime, no publica cursos y no activa Gemini.

## Clasificación

- **Reusable CXOrbia:** guía de madurez y UAT por ambiente.
- **Exclusivo cliente:** ejemplos TyA/Cinépolis.
- **Claude/prototipo:** futura representación administrable, sin P0 actual.
- **Academia:** impacto alto y transversal.
- **Sin impacto Claude:** detalles de quota, service account y artifacts.
