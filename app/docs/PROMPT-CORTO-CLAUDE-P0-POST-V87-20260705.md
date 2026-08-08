# Prompt corto Claude P0 post V87

Fecha: 2026-07-05

Copia y pega este prompt cuando Claude recupere capacidad:

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
