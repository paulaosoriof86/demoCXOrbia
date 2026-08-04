# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `PHASE_A_FINAL_COMPOSITION_MANIFEST_SOURCE_COMPLETE__STATIC_GATE_PENDING_EXECUTION__NO_PRODUCTION`

## 1. Bloqueante actual único

La recuperación de autoridades y el manifest final source-only ya quedaron cerrados.

Bloqueante real:

`SOURCE_STATIC_GATE_NOT_EXECUTED_ON_AUTHENTICATED_EXACT_HEAD`.

No corresponde solicitar capturas ni aprobación visual antes de ejecutar los gates acumulativos.

## 2. Logros cerrados

- RC Phase A smoke técnico y visual/consola PASS preservado;
- M1/Corte 1 FROZEN/APROBADO preservado;
- Corte 2A/V174 FROZEN/APROBADO preservado;
- Corte 3/V182 `FROZEN_ACTIVE_BASELINE` preservado;
- C6 entrada/HR/Staff/Shopper/Cliente/Finanzas/Reservas técnicamente preservado;
- 29 decisiones únicas de preservar/reconciliar cerradas;
- 0 restauraciones requeridas;
- autoridad de Ficha, Revisión, Documentos, Costos y `cliente-data.js` cerrada;
- report kit y consumidores inventariados;
- load order y overlays inventariados;
- manifest final creado;
- gate source/static creado.

Fuentes:

- `COMPARACION-SHAS-PHASE-A-BLOQUE4-AUTORIDADES-Y-COMPOSICION-20260804.md`;
- `MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`;
- `tools/qa/tya-phase-a-complete-composition-source-gate.mjs`.

## 3. Pendiente inmediato

1. obtener checkout autenticado del HEAD exacto;
2. ejecutar `tools/qa/tya-phase-a-complete-composition-source-gate.mjs`;
3. guardar evidencia sanitizada del resultado;
4. si PASS, ejecutar gate runtime multirol acumulativo;
5. si FAIL, aplicar un único delta focalizado y repetir una sola vez;
6. reutilizar el DEV actual si `app/` no cambia o hacer un único deploy DEV si cambia;
7. ejecutar `CHECKPOINT_VISUAL_PHASE_A_COMPLETA`;
8. freeze;
9. reconciliar agosto;
10. validar disponibles/postulaciones;
11. cutover autorizado.

## 4. Phase A que debe cubrir el runtime

### Base

- entrada y single-login;
- tenant/proyecto/periodo;
- Auth/claims/scopes;
- HR viva y refresh in-place;
- `CX.data` canónico;
- build-lock, PWA y service worker.

### Operación

- Dashboard Operativo y drilldowns;
- Mi Día/hoja de ruta;
- Proyectos, Periodos, HR e Histórico;
- Visitas, Ficha y Revisión Admin;
- Postulaciones;
- Reservas;
- Shoppers;
- notificaciones.

### Shopper/perfiles

- Disponibles;
- Mis Visitas;
- Reservas;
- Mi Día;
- Mi Perfil;
- cuestionario;
- certificaciones presentadas/históricas;
- documentos;
- beneficios;
- reportes Shopper.

### Finanzas

- Dashboard Financiero;
- Liquidaciones;
- Movimientos;
- Costos;
- CxP/CxC;
- lotes/pagos en estado real;
- multi-país/multi-moneda;
- revisión, conciliación y pago separados;
- modelo delegado, localBilling false, regalía 0, Q60/L200.

### Portales/reportes

- Portal Cliente;
- Portal Shopper;
- Reportes Admin/Cliente/Shopper;
- PDF/XLSX/PPTX;
- branding, periodo, alcance, fuente y filas coherentes;
- cero métricas/NPS/hallazgos fabricados.

## 5. Overlay pendiente de decisión

`app/adapters/tya-ab-cumulative-composition-v1.js`

Clasificación:

`P1_SUPERSEDED_LOADED_OVERLAY__NOT_P0_PROVEN`.

No remover sin prueba. El gate debe decidir si:

- se conserva temporalmente;
- se sustituye por un guard Phase A completa;
- se elimina mediante delta focalizado sin pérdida.

## 6. Auth y seguridad pendientes

- cerrar claims completos por tenant/persona/proyecto/país;
- activación/reset seguro para credenciales históricas;
- eliminar dependencia productiva de patrón predecible;
- mantener Firebase Auth como autoridad;
- no JWT Emergent;
- no PII/rol en URL;
- no token en localStorage;
- rotar/revocar la cuenta de servicio expuesta en el paquete Emergent;
- Storage y documentos sensibles solo con rules/auditoría;
- pagos reales continúan bloqueados.

## 7. Multi-país

El modelo es genérico. Falta probar UX con:

- 1 país;
- 2–3 países;
- 10–12 países;
- selector buscable;
- scope autorizado;
- monedas separadas;
- sin sumar monedas incompatibles.

## 8. P1/P2 no bloqueantes

- PDF sin algunas gráficas;
- Excel con formato básico;
- mejoras visuales transversales de exportación.

No se convierten en P0 mientras datos, filas, periodo, alcance y fuente sean correctos.

## 9. DEV actual

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Clasificación:

`TECHNICAL_COMPARISON_BUILD__NOT_FINAL_PHASE_A_CANDIDATE`.

## 10. Estado seguro

- cambios funcionales en este bloque: 0;
- deploy nuevo: 0;
- provider writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
