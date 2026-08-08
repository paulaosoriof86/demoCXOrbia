# Phase A visual smoke workflow - CXOrbia TyA

Fecha: 2026-07-06

## Bloque completado

Se agregó un smoke visual/consola automatizado para avanzar desde el gate técnico hacia RC Phase A controlada.

## Archivos creados

- `tools/qa/tya-phase-a-visual-smoke.mjs`
- `.github/workflows/cxorbia-phase-a-visual-smoke.yml`
- `app/docs/PHASE-A-VISUAL-SMOKE-WORKFLOW-20260706.md`

## Qué valida

El smoke visual:

- Levanta un servidor local estático sobre `/app`.
- Abre Chromium con Playwright.
- Entra como admin demo.
- Navega Dashboard, Postulaciones, Reservas, Automatizaciones, Finanzas y Academia.
- Verifica que `CX.shopperQuestionnaire` exista como función cargada.
- Entra como shopper demo.
- Navega Visitas, Reservas, Mis visitas, Beneficios, Academia y Certificación.
- Captura errores de consola y `pageerror`.
- Verifica que las vistas no queden en blanco.
- Verifica que el texto visible no prometa envíos/sync/pagos reales con gates apagados.

## Workflow

Archivo:

- `.github/workflows/cxorbia-phase-a-visual-smoke.yml`

Ejecuta:

```bash
node tools/qa/tya-phase-a-visual-smoke.mjs --out .tmp/phase-a-visual-smoke
```

## Artifact

El workflow sube:

- `phase-a-visual-smoke-report`

Con:

- `phase-a-visual-smoke-report.json`
- `phase-a-visual-smoke-report.md`
- `phase-a-visual-smoke-last-page.png`

## Criterio

### GO_VISUAL_CONDICIONADO_RC_PHASE_A

Se puede avanzar si no hay failures de consola, pageerror, pantalla en blanco, navegación faltante o copy visible prohibido.

### NO_GO_VISUAL

No avanzar si el smoke detecta:

- error de consola crítico;
- `pageerror`;
- vista vacía;
- navegación faltante;
- copy visible que promete envío/sync/pago real;
- función de cuestionario shopper no cargada.

## Estado seguro

El workflow sirve la app localmente. No hace deploy, no usa producción, no llama proveedores reales, no escribe base de datos, no importa datos y no usa secretos.

## Impacto Academia

El smoke incluye Academia en admin y shopper. La validación profunda de contenido sigue documentada en el tracker de Academia post V89, pero este smoke cubre carga visual básica y ausencia de bloqueo crítico.
