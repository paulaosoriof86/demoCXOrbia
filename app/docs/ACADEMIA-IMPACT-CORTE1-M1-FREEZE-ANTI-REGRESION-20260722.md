# Academia — Impacto Corte 1 / M1 y lock anti-regresión

Fecha: 2026-07-22

## Contenido que debe agregarse o actualizarse

### Para Admin y Operativo

- Diferencia entre HR viva, snapshot y dato importado.
- Qué significa `sourceRevision` y por qué todas las pantallas deben compartirla.
- Cómo cambiar periodo y comprobar que Dashboard, Visitas, Panorama y reportes cambian juntos.
- Diferencia entre asignada, agendada, realizada, cuestionario, submitida, liquidada y pagada.
- Por qué un dato ausente no debe mostrarse como cero.
- Qué hacer ante estado degradado, refresh fallido o conflicto de fuente.

### Para Cliente

- Alcance del Panorama por periodo y país.
- Cómo interpretar cobertura, realizadas y cuestionarios.
- Qué datos están disponibles y cuáles aparecen como `Pendiente de fuente`.
- Cómo personalizar y exportar reportes sin alterar la fuente.

### Para Shopper

- Por qué una visita asignada en HR deja de aparecer como disponible.
- Por qué Mis Reportes permanece bloqueado sin identidad verificable.
- Diferencia entre seguridad fail-closed y error de plataforma.
- Qué debe cambiar cuando se confirma cuestionario o asignación.

### Para administración de reportes

- Diferencias entre preview, PDF, Excel y PowerPoint.
- Personalización de columnas, orden, encabezado y notas.
- Requisitos de branding/logo por tenant.
- Gráficas equivalentes por formato y límites cuando una fuente no existe.
- No inventar score, velocidad, calidad, hallazgos ni pagos.

## Checklist de validación de aprendizaje

1. El usuario identifica proyecto, periodo y revisión activa.
2. Distingue estado operativo de cuestionario, submitido, liquidación y pago.
3. Reconoce `Pendiente de fuente` frente a cero confirmado.
4. Sabe comprobar coherencia entre Admin y Cliente.
5. Entiende por qué una sesión shopper sin identidad no puede ver reportes.
6. Puede identificar una recarga completa o un estado degradado.
7. Sabe reportar una regresión con periodo, pantalla, revisión y resultado observado.

## Estado

Pendiente de implementación/profundización en Academia. No cambia runtime, frontend ni proveedores.
