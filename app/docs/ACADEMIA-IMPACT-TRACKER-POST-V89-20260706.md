# Academia impact tracker post V89 - CXOrbia TyA

Fecha: 2026-07-06
Base: V89 working candidate controlada

## Respuesta operacional

Sí: a partir de este bloque queda separado un tracker específico de Academia para documentar cada pendiente, complemento o cambio que surja en los bloques de empalme, backend, pagos, HR, automatizaciones, notificaciones y módulos operativos.

Academia no se debe tratar como un módulo decorativo. Cada cambio funcional debe revisar impacto en cursos, lecciones, manuales, checklists, glosario, evaluaciones, rutas por rol, notificaciones y textos que prometen integraciones reales.

## Regla viva para todos los bloques siguientes

Cada bloque que cambie o complemente una regla debe agregar una entrada con módulo afectado, cambio funcional, curso o manual impactado, roles, notificación, texto honesto, validación esperada y pendiente para prototipo comercializable.

## Impacto Academia por bloque reciente

### V89 - Cursos nuevos

Se conserva:

- a_backend_prepared
- a_ops_conflicts_route

Pendientes:

- Verificar visualmente que ambos cursos abren correctamente.
- Confirmar que progreso no se mezcla con cursos heredados.
- Revisar que todas las lecciones usen lenguaje preparado o pendiente backend.
- No prometer Make activo, HR bidireccional real, portal en vivo, pagos automáticos ni notificaciones reales.

### Post V89 - Textos honestos P0

Pendientes:

- Agregar lección sobre diferencia entre preparado, preview, fallback manual y real confirmado.
- Actualizar manual de notificaciones para explicar que mensajería/correo/Make quedan preparados hasta activar backend/proveedor.
- Actualizar checklist de operación para no prometer notificación enviada cuando solo quedó preparada.

### Liquidaciones y beneficios

Pendientes:

- Crear o ampliar lección de Mis beneficios.
- Separar honorario, reembolso, total, lote y pago confirmado.
- Explicar que junio es corte de pagos/liquidaciones pendientes, no visitas pendientes.
- Explicar que cuestionario realizado no es submitido ni pago.

### HR e importador

Pendientes:

- Explicar sourceRef opaco.
- Explicar que no se guarda URL real de HR en frontend.
- Explicar que sync HR requiere gate backend.
- Enseñar conflictos y revisión manual cuando faltan llaves estables.

### Automatizaciones

Pendientes:

- Enseñar diferencia entre evento preparado, payload preview, webhook pendiente backend y disparo real.
- No decir Make activo ni evento enviado si el gate está apagado.
- Incluir fallback manual.

### Cuestionario, submitido y revisión

Pendientes:

- Reforzar que cuestionario realizado/completado no equivale a submitido.
- Enseñar estados: realizado, revisión, corrección, aprobado para submitido, submitido registrado, liquidación candidata, pago confirmado.

## Estado seguro

Documento de trazabilidad. Sin runtime, sin deploy, sin producción, sin Firestore/Auth/Storage reales, sin HR writes reales, sin Make/Gemini/mensajería/correo real y sin datos sensibles.
