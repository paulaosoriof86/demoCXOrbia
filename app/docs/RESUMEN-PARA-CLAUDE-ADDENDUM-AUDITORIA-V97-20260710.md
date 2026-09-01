# Resumen para Claude — addendum auditoría V97

Fecha: 2026-07-10

## Regla anti-reproceso

V97 modifica únicamente cuatro archivos y conserva 96 de 100 byte a byte. No reconstruir ni volver a pedir arquitectura modular, navegación, branding, proyecto/periodo, usuarios/personas/scopes, permisos por ruta, PWA base, Academia existente, Diagnóstico, Administrabilidad ni conflictos preview.

## Preservar de V97

1. Retiro de `fetch` directo a proveedores de IA.
2. Purga de `apiKey` y `endpoint` en `cx_ai`.
3. UI de preferencia IA sin campo secreto.
4. Profundización de `mg1`, `mg2`, `mg3`, `mg4`, `smg1`, `smg2`.
5. Corrección del selector de audiencia en Academia.
6. Duplicar/archivar/restaurar/versionar/auditar como base parcial.

## Correcciones P0 focalizadas

1. Separar preferencia de IA de disponibilidad/conexión real.
2. Garantizar fallback local o estado pendiente en cada consumidor de `CX.ai.ask()`.
3. Retirar API keys, tokens, contraseñas, endpoints y webhooks de `modules/integraciones.js` y de Automatizaciones; dejar solo estado/referencia opaca.
4. Actualizar Manuales y Academia para no instruir pegar secretos, webhooks o configuración sensible.
5. Eliminar `_purgeTestArtifacts()`; no borrar contenido por ID/título hardcodeado.
6. Completar Academia con soft-delete, estados, motivo, permiso por acción y notificación, sin reescribir cursos existentes.
7. Implementar modo exclusivo `demo/source_safe_preview/connected`.
8. Implementar bridge único de `CX.data`.
9. Bloquear seeds demo fuera de demo y usar vacíos honestos.
10. Implementar permisos por acción sensible preservando matriz de rutas/scopes.
11. Versionar caché PWA por build/source lock.
12. Entregar matriz de preservación, archivos tocados y pruebas.

## No tocar

- `backend/`;
- `tools/`;
- workflows;
- reglas;
- secrets;
- datos reales;
- proveedores reales;
- imports/writes/pagos reales.

## Entrega obligatoria

- candidata completa ZIP;
- diff de archivos;
- matriz `HECHA_EN_CANDIDATA / PATCH_LOCAL / PARCIAL / PENDIENTE_NETO / BACKEND_ONLY`;
- pruebas de los tres modos;
- prueba de todos los consumidores de IA;
- prueba de permisos por acción;
- impacto Academia;
- confirmación de cero secrets/proveedores/backend-only.

## Estado

V97 está en `HOLD`; no es nueva baseline ni source lock. Debe corregirse sobre sí misma con diff mínimo.