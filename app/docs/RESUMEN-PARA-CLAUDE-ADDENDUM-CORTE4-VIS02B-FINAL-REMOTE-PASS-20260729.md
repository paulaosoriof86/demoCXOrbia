# RESUMEN PARA CLAUDE — Corte 4 VIS-02B final remoto PASS

**Fecha:** 2026-07-29  
**Estado:** `NO_NUEVA_CANDIDATA__NO_UI_PATCH__PRESERVAR_FIX_CORE__HUMAN_VISUAL_PENDING`

## Conectado / resuelto
- P0-C4-VIS-01: no fallback demo/localStorage.
- P0-C4-VIS-02: backend vacío es estado válido del shell; Admin/Shopper no deben montar módulos dependientes de proyecto cuando no existe proyecto.
- P0-C4-VIS-02B: eliminada referencia huérfana `adapters/tya-phase-a-source-safe-dev-adapter.js` del entrypoint DEV.
- Gate reusable de integridad de scripts del entrypoint: PASS.
- Hosting DEV final VIS-02B: ejecutado exactamente una vez.
- Diagnóstico remoto independiente: PASS, 0 pageerrors, role-switch Admin→Shopper→Admin estable y sin DOM residual.

## Qué NO debe hacer Claude
- no crear nueva candidata por estos P0;
- no modificar `app/modules` para resolverlos;
- no reintroducir el adapter inexistente;
- no convertir el estado vacío en demo ni materializar datos para ocultarlo;
- no mostrar mensajes técnicos de backend en UI final.

## Qué preservar en futuras candidatas
- `app/core/backend-corte4-empty-shell-guard.js` o su equivalente integrado en core, manteniendo el mismo contrato;
- limpieza de rail/view/crumb al salir/cambiar rol;
- null-safety de helpers de proyecto/período cuando dataset=0;
- `app/index-backend-dev.html` sin referencias a assets inexistentes;
- gate de integridad de entrypoint antes de Hosting/visual.

## Pendiente vivo
Únicamente validación visual humana final de Corte 4. Si no aparece P0 reproducible: freeze Corte 4 y pasar a Corte 5.

## Clasificación
- Reusable CXOrbia: sí.
- Exclusivo cliente: evidencias Firebase TyA DEV.
- Claude/prototipo: preservar; no intervenir ahora.
- Academia: documentar patrón empty-backend + asset-integrity.
