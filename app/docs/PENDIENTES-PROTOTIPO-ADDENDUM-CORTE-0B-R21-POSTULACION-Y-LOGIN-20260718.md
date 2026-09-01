# PENDIENTES PROTOTIPO — CORTE 0B R21

Fecha: 2026-07-18  
Estado: `R21_TECHNICAL_PASS_FRONTEND_DELTA_REQUIRED`

## P0 frontend localizado

1. `app/core/router.js`
   - separar proyecto y periodo en Shopper y Cliente;
   - selector de proyectos activos/autorizados por alcance;
   - selector de periodos sin colapsar identidades.

2. `app/modules/visita-detalle.js`
   - consumir `CX.data.postulationEligibility()`;
   - no mostrar `null`;
   - bloquear fecha anterior, fuera de Q1/Q2 y franja incompatible;
   - no mostrar éxito falso.

3. `app/app.js`
   - login desde `CX.tenantProfile`;
   - DEV con todos los roles y rótulo `Accesos de validación`;
   - producción sin bloque técnico;
   - banderas, Cliente y autorregistro configurables.

4. Cliente
   - exponer Academia como ruta distinta de Capacitación por brechas.

## Verdad operativa vinculante

- Julio: 44 visitas, 39 asignadas y 5 sin asignar.
- Solo 4 son oportunidades publicables.
- MC. Santa Clara Q2 está bloqueada por `P1Q`.
- La fuente puede ser hoja externa, hoja interna, archivo o API; la UI consume el mismo contrato.

## Evidencia

- Commit técnico `287cd0729c14ef9dfe63ce566c6bc2ff8604f2a0`.
- Gates run `29669735189`: éxito.
- R21 no está desplegado.

## P1 posterior al freeze

- Pantalla `Configuración > Tenant > Accesos y login` con persistencia real.
- Manuales documentales profundos y distintos de cursos.
- Administración ampliada de fuentes y proyectos desde plataforma.

No solicitar candidata general ni reabrir la semántica HR. Corregir únicamente estos archivos/rutas sobre la última baseline empalmada.
