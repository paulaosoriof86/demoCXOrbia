# Pendientes del prototipo — addendum auditoría V97

Fecha: 2026-07-10

## Hecho en candidata y no reabrir

- arquitectura modular y carga de scripts;
- branding/tenant/proyecto/periodo;
- usuarios, personas y scopes;
- matriz fail-closed por ruta;
- PWA base;
- Academia profunda preexistente;
- Diagnóstico, Administrabilidad y conflictos preview;
- copy honesto ya consolidado en rondas previas.

## Hecho en V97 y preservar

- IA sin `fetch` directo;
- `cx_ai` sin API key/endpoint;
- preferencia IA sin input secreto;
- expansión de seis lecciones;
- audiencia Academia corregida;
- ciclo de vida parcial de cursos personalizados.

## P0 pendiente neto

1. Corregir semántica `ready()/ask()` y fallbacks IA.
2. Eliminar secretos/endpoints/webhooks del navegador en Integraciones y Automatizaciones.
3. Corregir manuales que piden secretos/configuración directa.
4. Retirar purga hardcodeada de artefactos de prueba.
5. Completar soft-delete, estados, permisos por acción y notificación en Academia.
6. Implementar máquina exclusiva de modo de datos.
7. Implementar bridge único `CX.data`.
8. Excluir seeds demo fuera de demo.
9. Reemplazar datos demo por fuente activa o vacío honesto en Certificaciones, Finanzas, Correo, Soporte y portales.
10. Implementar permisos por acción sensible.
11. Versionar caché PWA por build/source lock.
12. Entregar documentación forense coherente.

## P1

- consolidar componentes de gate/error/reintento/revisión;
- normalizar outbox visual;
- limpiar versiones históricas visibles;
- generalizar NDA y ejemplos geográficos;
- auditar acceso persistente/notificaciones de Academia;
- pruebas responsive, teclado, foco y accesibilidad.

## Nuevo hallazgo

`CX.ai.ready()` puede ser verdadero aunque ningún proveedor esté disponible; varios módulos cierran con error sin fallback. Este defecto no existía con la misma semántica en baseline y bloquea aceptación de V97.

## Estado

Pendientes para Claude/prototipo solamente. No incluye backend real, rules, providers, imports, writes, deploy o producción.