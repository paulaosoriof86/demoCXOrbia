# Auditoría forense candidata V101

Fecha: 2026-07-11

## Decisión

`HOLD / NO EMPALMAR TODAVÍA`.

V101 contiene avances reales que deben preservarse, pero no debe sustituir el runtime Phase A ni convertirse aún en baseline. Persisten bloqueadores P0 de demo leakage, copy de integraciones, permisos contextuales, workflow Academia/Certificación, source lock y smoke.

## Identidad

- V101 SHA-256: `c0e08f261394e1424e57f09bc102b5e4be2b6e1760951c14b88200b167e78479`.
- V100 → V101: 9 agregados, 0 eliminados, 11 modificados, 98 idénticos.
- Runtime empalmado → V101: 14 backend/locales ausentes, 27 distintos y 76 idénticos.

## Validación estructural

- 66 JavaScript;
- 0 errores de sintaxis;
- 66 scripts declarados, 64 locales;
- 0 scripts faltantes o duplicados;
- 49 módulos e IDs únicos;
- UTF-8 sin BOM/mojibake;
- sin llamadas directas a proveedores; solo `fetch()` PWA en `sw.js`.

## Avances aceptados

- `hookConfigured()` depende de `connectionRef()`;
- no hay refs locales falsas ni webhook individual;
- permisos namespaced por tenant;
- contexto tenant/proyecto/país funciona cuando el handler lo entrega;
- `academy.review` y `academy.approve`;
- `auditRef` por evento;
- `contentVersion` separado de `workflowVersion`;
- persistencia de lección nueva corregida;
- score nulo/null-safe en Portal Cliente;
- manifest reproducible para los 103 archivos listados;
- BUILD_ID compartido entre app y service worker.

## Bloqueadores P0

### Fixtures

- Certificación shopper conserva 88%, aprobado, intento y feedback fijos fuera de demo cuando no hay banco.
- Cualquier banco con preguntas queda disponible por existir, sin validar estado confirmado/publicado.
- Portal Cliente aún inventa responsable, scores de sección, score previo, NPS y fecha cuando faltan datos.
- `modules/cliente.js::branchVisits()` genera historial sintético sin guard de modo.
- Finanzas conserva lotes `#L-204/#L-205/#L-206` sin guard, además de estimaciones demo.
- Dashboard fabrica trimestre histórico, días Real→Submit, calidad, margen y reprogramación.

### Integraciones/copy

- Integraciones conserva toasts “activado/desactivado” y mensajes “cada integración activa”.
- Marketing afirma “Automatización de publicación activada (Make)”.
- Manuales todavía dicen que `CX.automations.fire` hace POST directo al webhook.

### Permisos

- muchos handlers pasan `{}` o ningún contexto;
- Automatizaciones, Integraciones, Diagnóstico, conflictos y Academia quedan parcialmente role-only;
- no hay override por proyecto;
- algunos controles de Academia se muestran por `role==='admin'` y no por permiso.

### Academia/Certificación

- restaurar lección no exige motivo;
- varios wrappers no pasan contexto;
- banco heurístico usa un nombre digitado como supuesto segundo actor;
- `approved_preview` puede ser tomado por shopper y el examen afirma habilitación operativa.

### Manifest/source lock

V101 contiene 118 archivos, pero el manifest lista 103. Excluye 15, aunque la nota dice que solo excluye `core/build-lock.js` y `sw.js`. Además conserva nombres `V100` dentro de V101.

### Smoke

Las capturas 01–03 muestran páginas operativas. Las capturas 04–06 y `mobile-shopper` muestran principalmente el modal NDA. La imagen “móvil” mide 909×540, igual que desktop. No existe log reproducible de consola. No se demuestra smoke de seis perfiles ni móvil real.

## Próxima corrección Claude

Preservar todo avance aceptado y corregir únicamente:

1. `modules/cert.js`, `core/cliente-data.js`, `modules/cliente.js`, `modules/dashboard.js`, `modules/finanzas.js` y benchmark no configurado.
2. Copy/estados en Integraciones, Marketing, Manuales y Academia.
3. Contexto y visibilidad de todos los permisos sensibles.
4. Workflow real de Academia/Certificación, separando práctica preview de certificación operativa.
5. Manifest V101 con exclusiones exactas.
6. Smoke de seis perfiles, desktop/móvil, rutas críticas y log de consola.

## Empalme posterior

Solo después de reauditoría se hará empalme de tres vías preservando snapshot, adapters, entry point TyA, `core/data.js`, Administrabilidad, Importador, layout y documentación Phase A.

## Estado seguro

Sin empalme, deploy, merge, producción, imports, writes, Auth, reglas, Make, Gemini ni pagos.