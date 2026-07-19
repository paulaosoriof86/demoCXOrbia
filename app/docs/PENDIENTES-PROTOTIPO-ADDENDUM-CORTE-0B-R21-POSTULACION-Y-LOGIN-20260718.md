# PENDIENTES PROTOTIPO — CORTE 0B R21

Fecha: 2026-07-18

## P0 frontend localizado

1. `app/core/router.js`: Shopper y Cliente deben mostrar proyecto y periodo separados y usar selector de proyectos activos/autorizados.
2. `app/modules/visita-detalle.js`: consumir `CX.data.postulationEligibility`; bloquear fecha anterior, fuera de quincena y franja incompatible; no mostrar `null` ni éxito falso.
3. `app/app.js`: en DEV mostrar todos los roles con rótulo `Accesos de validación`; en producción ocultar el bloque técnico y usar configuración tenant.
4. Cliente: exponer Academia Cliente como ruta distinta de Capacitación por brechas.

## Verdad operativa julio

- 5 visitas sin shopper.
- 4 oportunidades publicables con fecha válida.
- 1 visita, MC. Santa Clara Q2, bloqueada por dependencia `P1Q`; no debe aparecer como disponible.

## P1

- Pantalla `Configuración > Tenant > Accesos y login` para países, banderas, roles visibles, autorregistro, Cliente y Academia por rol.
- Misma experiencia para HR externa, archivo, API o hoja interna.
- Manuales documentales profundos y distintos de cursos.

No solicitar candidata general. Corregir solo estos archivos/módulos sobre la última baseline auditada.
