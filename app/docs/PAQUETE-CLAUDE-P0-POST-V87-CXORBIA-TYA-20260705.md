# Paquete Claude P0 post V87 - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Dejar acumulado el paquete exacto para Claude cuando recupere capacidad, sin reiniciar metodologia y sin pedirle que trabaje P1 o Academia antes de cerrar P0.

Este paquete concentra:

1. Prompt corto P0.
2. Contexto minimo obligatorio.
3. Backend acumulado que Claude debe respetar.
4. Matriz de produccion controlada.
5. Criterios de auditoria de la proxima candidata.
6. Entrega esperada.

## Estado base

- V87 fue auditada contra V86.
- V87 no trajo delta real de contenido en `/app`.
- No se considera nueva baseline ni source lock.
- Siguen vivos P0 de honestidad operativa.
- Backend siguio avanzando en modo seguro, sin tocar frontend ni activar produccion.

## Prompt corto para Claude

```text
CXOrbia TyA - Correccion P0 urgente post V87

Trabaja sobre la ultima candidata auditada. V87 no tuvo delta real contra V86 y sigue bloqueada por P0 de honestidad operativa.

Objetivo unico: entregar una candidata correctiva minima con delta real para corregir textos visibles o semivisibles que prometen acciones reales con gates apagados.

No redisenes. No reescribas modulos. No toques backend, contracts, tools, docs backend, gates, providers ni integraciones. No amplíes Academia ahora.

Corrige unicamente textos que digan o sugieran:
- WhatsApp enviado.
- Correo enviado.
- HR sincronizada.
- Sincronia automatica real.
- Sincroniza HR externa.
- Mueve liquidacion.
- Cuestionario enviado cuando corresponde realizado/completado pendiente revision.

Archivos señalados:
- app/modules/postulaciones.js
- app/modules/dashboard.js
- app/core/topbar.js
- app/modules/correo.js
- app/modules/academia.js
- app/core/automations.js
- app/core/manuales-data.js
- app/core/liquidacion.js

Reemplaza por estados honestos:
- preparado;
- pendiente proveedor;
- fallback/manual preparado;
- pendiente backend;
- pendiente revision;
- HR sync pendiente;
- cuestionario realizado/completado pendiente revision.

Validacion obligatoria:
- 0 apariciones operativas de los textos P0.
- 0 scripts locales faltantes.
- 0 scripts duplicados.
- 0 fallas node --check en JS modificados.
- Mantener UTF-8 sin BOM.

Entrega:
- ZIP candidata correctiva con delta real.
- Lista de archivos modificados.
- Lineas/bloques cambiados.
- Confirmacion de no backend, no contracts, no tools, no providers, no deploy, no produccion.
- No digas production ready ni source lock.
```

## Backend acumulado que Claude debe respetar

Claude no debe tocar estos bloques:

- Synthetic fixtures manifest.
- Synthetic input pack runner.
- Synthetic pack readiness map.
- Readiness map to release snapshot bridge.
- Release readiness snapshot validator.
- Release readiness sanitized report generator.
- Controlled production matrix.

Estos bloques existen para backend preview y salida controlada, pero no autorizan produccion.

## Matriz de prioridad

1. P0 frontend obligatorio: corregir honestidad operativa.
2. Backend preview listo: no tocar.
3. Backend local execution pending: no corresponde a Claude.
4. P1 post-P0: diferido.
5. Academia posterior: diferido hasta cerrar P0.
6. Source lock: bloqueado hasta nueva candidata auditada.
7. Produccion: no autorizada.

## Criterios de auditoria de la proxima candidata

La proxima candidata de Claude debe auditarse antes de empalmar:

1. Comparar contra la baseline inmediata.
2. Confirmar delta real.
3. Listar archivos agregados, eliminados y modificados.
4. Validar `index.html`:
   - scripts locales existentes;
   - 0 duplicados;
   - 0 rutas huerfanas.
5. Ejecutar `node --check` en JS.
6. Buscar P0:
   - `WhatsApp enviado`;
   - `Correo enviado`;
   - `HR sincronizada`;
   - `Sincronía automática`;
   - `sincroniza la HR externa`;
   - `mueve la liquidación`;
   - `Cuestionario enviado`.
7. Confirmar que cualquier aparicion residual sea documental/no operativa y justificar linea por linea.
8. Confirmar que no tocó contracts/tools/backend.
9. Confirmar que no activó gates ni providers.
10. Solo si pasa auditoria se reconsidera `prototype_audit`.

## No hacer

- No source lock.
- No deploy.
- No merge.
- No produccion.
- No import real.
- No Firestore writes.
- No Storage writes.
- No HR writes.
- No Make real.
- No Gemini real.
- No correo real.
- No WhatsApp real.
- No pagos reales.

## Entrega esperada al volver Claude

Claude debe entregar una candidata correctiva P0 con delta real. Luego ChatGPT/Codex debe auditarla antes de empalmar cualquier cosa.
