# ADDENDUM PREVALENTE — I3 HUMAN/LIVE ACCEPTANCE BEFORE I4

**Fecha:** 2026-09-18  
**Estado:** FROZEN_PREVALENT_UNTIL_I3_HUMAN_ACCEPTANCE  
**Causa:** aclaración explícita de Paula + evidencia visual nueva del artifact del run 181.

## BEFORE
El checkpoint/lock `CXORBIA_I3_TERMINAL_CUMULATIVE_LOCK_2026-09-18.json` interpretó el éxito técnico del run 181 como cierre suficiente de I3.

## EVIDENCIA QUE INVALIDA ESA INTERPRETACIÓN
1. El Plan Rector exige demostrar producto real antes de producción, incluyendo E2E Admin, E2E Shopper y browser/visual.
2. El addendum del 10-09 exige readback visual incremental por módulo, rol, tenant, proyecto, período, sourceRevision, expected, observed y fingerprint.
3. La evidencia visual del mismo artifact 181 en `gate20-focal-shopper-desktop-miperfil.png` muestra: **“No se encontró tu registro de evaluador”** y **“Shopper · sin país asignado”**.
4. `gate20-semantic-shopper.json` reportó `historyVisitCount: 0`, por lo que no demostró histórico real proveniente de HR para el shopper muestreado.
5. Un PASS automatizado de Gate20/Gate21 demuestra identidad/integridad del artifact, pero no sustituye aceptación funcional/visual integral de todos los módulos y flujos.

## AFTER — REGLA PREVALENTE
- I3 vuelve a **HOLD**.
- El artifact del run 181 se conserva como **TECHNICALLY_CERTIFIED_NOT_YET_HUMAN_ACCEPTED**.
- No se autoriza I4.
- No se cambia product source `f836f38dc0ce3a48034ed8968220d5dece9d6629` por esta corrección de estado.
- Antes de I3=GO se debe ejecutar aceptación funcional/visual integral en DEV sobre ese mismo artifact/source, sin rebuild:
  - Admin: módulos Fase A, flujos, KPIs, sincronizaciones, reportes y visualización;
  - Shopper: login con patrón aprobado, Mi Perfil, KPIs, histórico HR, Mi Día, Disponibles, Reservas/Asignación, Mis Visitas, Certificación, Recursos, Beneficios y Reportes;
  - Cliente: módulos/reportes Fase A aplicables;
  - HR live: misma revisión externa, disponibilidad, asignación, histórico y KPIs;
  - multiproyecto: configuración durable y ausencia de default global;
  - responsive/visual: desktop/mobile y ausencia de versiones antiguas/sombreadas.
- Cada PASS debe registrar role + tenant + project + period + sourceRevision + expected + observed + fingerprint.
- El P0 visible de Shopper Mi Perfil debe clasificarse y resolverse por owner probado antes de GO.
- Producción `tya-plataforma.web.app` permanece DO_NOT_TOUCH.

## PRECEDENCIA
Este addendum supersede únicamente el estado GO prematuro del lock/checkpoint del 18-09. Conserva intactos los hashes, source, artifact, Gate21 y evidencia técnica del run 181 como evidencia histórica/técnica.

## SIGUIENTE ACCIÓN EXACTA
Construir y ejecutar la matriz de aceptación LIVE/HUMAN de Fase A sobre el artifact 181 en DEV, empezando por el P0 Shopper Mi Perfil/identidad/histórico y continuando por todos los módulos Admin/Shopper/Cliente. Sólo después de evidencia integral PASS se emite I3=GO y se solicita autorización I4.
