# PENDIENTES PROTOTIPO — PAQUETE ACUMULADO POST-V156

Fecha: 2026-07-17

## P0 antes de la nueva candidata

1. Eliminar lenguaje técnico interno de todas las superficies comerciales por rol y módulo.
2. Incluir gate reproducible que navegue roles, módulos, modales, toasts, manuales y accesibilidad, con 0 coincidencias.
3. Bloquear navegación directa al contenido técnico para audiencias comerciales.
4. Actualizar los documentos internos de la candidata que todavía refieren V82 y hacer coincidir reporte, delta, manifest y árbol real.

## P1 acumulado a verificar, no reconstruir

- contexto único tenant/proyecto/periodo/país;
- fuente externa configurable consumida mediante `CX.data`;
- importadores separados con revisión humana y datos protegidos;
- controles administrativos auditables por módulo;
- certificaciones, carryover y excepciones individuales;
- beneficios, liquidaciones, pagos, lotes y movimientos individuales;
- postulaciones, asignaciones, reprogramación y conflictos;
- correo, WhatsApp Web, outbox y proveedores con estados honestos;
- CRM, documentos y shopper history;
- login/white-label/configuración multi-tenant/multi-proyecto;
- centro de novedades;
- Academia profunda, editable, por rol y sincronizada con módulos.

## No pendientes válidos

No se debe pedir a Claude que rehaga:

- proyecto vs periodo;
- KPIs y estados ortogonales;
- Finanzas protegida y hotfix R18D;
- PWA;
- fixtures tenant-safe y proyectos demo curados;
- backend, tools, workflows, Firebase, overlays TyA o integraciones reales;
- reglas o datos exclusivos TyA/Cinépolis como lógica global.

## Siguiente secuencia

Claude entrega candidata nueva derivada de V156 → ChatGPT audita únicamente el delta y los gates → si no hay P0, `APPLY_DELTA_DIRECTLY` → manifest/build-lock de unión → gates post-empalme → Hosting DEV autorizado cuando corresponda → validación visual → freeze → retomar Phase A operativa.

## Clasificación

- **Reusable CXOrbia:** todos los patrones genéricos del paquete.
- **Exclusivo cliente:** configuración y overlays TyA/Cinépolis fuera del frontend genérico.
- **Claude/prototipo:** P0 y P1 descritos en el paquete acumulado.
- **Academia:** cierre profundo y sincronía transversal.
- **Sin impacto Claude:** infraestructura, contratos backend, gates y datos reales.

## Estado seguro

Sin modificación de UI, empalme, merge, deploy, producción, imports reales, writes, proveedores live ni pagos.