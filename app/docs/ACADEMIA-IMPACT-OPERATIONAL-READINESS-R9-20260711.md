# Academia — impacto Operational Readiness R9

Fecha: 2026-07-11

## Alcance

No rehacer cursos existentes. Agregar contenido transversal para Admin, Superadmin y Operaciones sobre la diferencia entre preparación, evidencia, revisión y ejecución.

## Lección nueva requerida

### De baseline empalmada a autorización controlada

Debe explicar:

1. qué significa baseline auditada de continuidad;
2. por qué no equivale a source lock final;
3. carril baseline/source-safe;
4. carril de base DEV nueva y vacía, verificado read-only;
5. carril de pagos y certificaciones mediante export sanitizado y dry-run;
6. carril de smoke post-empalme;
7. diferencia entre HOLD y listo para revisión humana;
8. por qué revisión humana no es autorización de escritura;
9. qué bloquea una evidencia inconclusa o no limpia;
10. cómo interpretar conteos y hashes sin abrir datos crudos.

## Checklist interactivo sugerido

- baseline correcta;
- tenant/proyecto correctos;
- conteos source-safe correctos;
- 0 writes/import/producción;
- target clean-state verificado;
- pagos con llave estable;
- certificaciones con shopper estable y revisión autenticada;
- reviewQueue revisada;
- smoke reproducible;
- autorización separada pendiente.

## Errores frecuentes

- confundir `liquidada` con `pagada`;
- asumir que una base es vacía sin verificación;
- usar nombre de shopper como llave;
- usar HTML/base legacy como export limpio;
- tratar `READY_FOR_HUMAN_AUTHORIZATION_REVIEW` como GO;
- publicar o certificar desde práctica preview;
- ocultar blockers o sustituirlos por toast de éxito.

## Rutas por rol

- Superadmin/Admin: lección obligatoria antes de cualquier futura autorización.
- Operaciones/coordinador: lectura de estados y reviewQueue, sin acceso a credenciales.
- Shopper/Cliente: sin contenido técnico de materialización; solo estados operativos relevantes.

## Notificaciones

Representar únicamente in-app/outbox:

- evidencia faltante;
- fuente limpia recibida;
- dry-run finalizado;
- conflicto pendiente;
- smoke finalizado;
- revisión humana requerida.

No afirmar correo, WhatsApp o Make enviado sin confirmación backend.

## Estado

Impacto documentado. Sin cambios runtime, cursos, proveedores ni producción.
