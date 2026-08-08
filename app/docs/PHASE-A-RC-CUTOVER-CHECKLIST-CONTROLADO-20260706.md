# Phase A RC cutover checklist controlado - CXOrbia TyA

Fecha: 2026-07-06

## Propósito

Dejar el checklist operativo para preparar una salida RC Phase A controlada sin esperar a Claude y sin activar integraciones reales antes de tiempo.

## Estado de decisión

- Estado actual: RC Phase A en preparación.
- Producción real con integraciones activas: NO autorizada todavía.
- Siguiente paso de decisión: correr smoke gate y hacer smoke visual/consola.

## Precondiciones obligatorias

### Código / estructura

- PR #7 abierto y draft.
- Rama activa: `docs-tya-v6-v71-audit`.
- Base: `release/cxorbia-tya-rc-20260630`.
- V89 empalmada como working candidate controlada.
- Guard de copy seguro cargado en `app/index.html`.
- Smoke gate local creado.
- Workflow de smoke creado.

### Estado seguro

- Sin Firestore real conectado.
- Sin Auth real conectado.
- Sin Storage real de evidencias.
- Sin HR writes reales.
- Sin Make real.
- Sin Gemini real.
- Sin mensajería/correo real.
- Sin import real de datos.
- Sin datos sensibles en repo.

## Checklist para RC Phase A controlada

### 1. Gate técnico automático

Ejecutar o revisar resultado de:

```bash
node tools/migration/tya-phase-a-rc-smoke-gate.mjs --out .tmp/phase-a-rc-smoke
```

Criterio:

- Hard fails = 0.
- Warnings permitidos solo si están mitigados por guard y documentados.

### 2. Smoke visual mínimo

Validar en navegador o hosting temporal:

- Login / shell carga.
- Dashboard abre.
- Postulaciones abre.
- Reservas abre.
- Automatizaciones abre.
- Cuestionario shopper abre.
- Finanzas abre.
- Academia abre.
- No errores de consola.
- No pantallas en blanco.
- No navegación rota.
- No modales rotos.
- No tablas/KPIs críticos rotos.

### 3. Copy honesto visible

Confirmar que no se vean promesas operativas reales sin gate activo:

- No `WhatsApp enviado` si solo queda fallback/preparado.
- No `Correo enviado` si no hay proveedor/cuenta conectada.
- No `HR sincronizada` si no hay gate real.
- No `Make activo` si no está activado.
- No `pago automático` si no hay pago real.
- No `cuestionario enviado`; usar realizado/completado.

### 4. Academia

Validar visualmente:

- Curso `a_backend_prepared` abre.
- Curso `a_ops_conflicts_route` abre.
- No se mezcla progreso de cursos heredados.
- Textos usan preparado/preview/pendiente backend/confirmado.
- Pendientes de Academia siguen documentados en tracker.

### 5. Phase A operativo

Validar que la salida cubre, aunque sea en modo controlado:

- Shopper puede ingresar.
- Shopper ve documentos/instructivos.
- Shopper ve certificación o estado de certificación.
- Shopper ve visitas disponibles.
- Shopper puede postularse.
- Admin puede gestionar postulaciones.
- Shopper puede seguir ciclo base de visita.
- Cuestionario dirige a origen configurado/preparado.
- Beneficios/liquidaciones muestran estado sin prometer pago real automático.

## Decisión final

### GO RC Phase A controlada

Se puede avanzar si:

- Gate técnico sin hard fails.
- Smoke visual sin errores críticos.
- Copy honesto visible.
- Academia abre sin bloqueo crítico.
- No se activan integraciones reales.

### NO GO

No avanzar si:

- Hay error JS crítico.
- Hay pantalla blanca.
- Falla navegación base.
- El guard rompe render.
- Academia no carga.
- Se promete envío/sync/pago real de forma visible.
- Se detecta dato sensible en repo.

## Pendientes post RC

- Aplicar patch permanente por archivo para no depender solo del guard.
- Conectar base nueva limpia.
- Configurar Auth/Firestore/Storage por gates.
- Integrar Make por flujo controlado.
- Integrar Gemini con revisión humana.
- Importar solo datos limpios y útiles.
- Hacer hardening completo.

## Estado seguro

Este checklist no ejecuta producción. No autoriza merge, deploy, imports, writes ni proveedores reales.
