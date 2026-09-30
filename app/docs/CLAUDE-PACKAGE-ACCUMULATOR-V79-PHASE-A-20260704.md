# Claude package accumulator V79 Phase A

Fecha: 2026-07-04

## Proposito

Mantener acumulado todo lo que debe entrar al proximo paquete para Claude, mientras se trabaja sobre V79 y Claude no tiene capacidad.

## Estado de paquete

- Ultimo paquete preparado: `PAQUETE_CLAUDE_CXORBIA_V79_AUDITORIA_FORENSE_PHASE_A_20260704.zip`.
- Paula indica que Claude no atendio ese ultimo paquete.
- No generar nuevo paquete hasta que Paula lo pida.
- Mientras tanto, documentar nuevos hallazgos, mejoras, decisiones y cambios directos.

## Pendientes acumulados actuales

### P0 V79

1. Unificar enum de cuestionario entre creacion, edicion y ejecucion.
2. Hacer funcional el cuestionario externo general y por visita desde HR.
3. Convertir revision en etapa funcional real: accion admin, estado, fecha, persistencia, siguiente paso.
4. Alinear submitido como configuracion de proyecto y dato que puede venir desde HR.
5. Llevar configuracion Phase A completa al wizard de creacion.

### P1 V79

6. SourceRef seguro de HR/cuestionario.
7. Campo HR para link por visita.
8. Contactos por gestion con nombre, estado, plantilla y fallback.
9. Textos honestos de integraciones.
10. `nvBanner`.
11. Version default de nuevo tenant.
12. PWA si sigue pendiente.

## Nuevos elementos a seguir acumulando

- Cambios directos hechos por backend/ChatGPT.
- Ajustes que mejoren prototipo comercializable.
- Bugs detectados al preparar backend.
- Decisiones de Paula.
- Validaciones esperadas.
- Riesgos y no regresiones.

## Formato obligatorio para cada nuevo hallazgo

- Fecha.
- Archivo/modulo afectado.
- Tipo: bug, mejora, configuracion, backend, UX, Phase A, comercializable.
- Impacto.
- Recomendacion para Claude.
- Si se corrigio directamente, documentar como cambio directo.
- Validacion esperada.

## Estado

- Acumulador creado.
- Sin cambios frontend en este documento.
- Sin deploy.
- Sin runtime conectado.
