# ADDENDUM PREVALENTE — I3 LIVE HUMAN ACCEPTANCE / FINANCE-STYLE SCENARIO LAB

**Fecha:** 2026-09-17  
**ID:** `CXORBIA-I3-LIVE-HUMAN-ACCEPTANCE-20260917`  
**Estado:** `FROZEN_PREVALENT_FOR_I3_ACCEPTANCE`  
**Iteración:** I3 — Functional Closure  
**Producción:** `DO_NOT_TOUCH`

## 1. Causa autorizante y evidencia nueva
Después de emitir `CXORBIA_I3_TERMINAL_LOCK_2026-09-17.json`, Paula solicitó la visualización real Admin + Shopper y señaló que no debe entrar I4 sin repetir el patrón de pruebas vivas con datos ficticios utilizado en Finanzas.

La evidencia material del MISMO artefacto certificado confirma el problema: `gate20-focal-shopper-desktop-miperfil.png` (SHA-256 `8647670568dd07945ac46ce2171a51d3a6442cfb23ea407b2eec0feb5a29e379`) muestra una sesión Shopper autenticada cuya ruta `Mi Perfil` renderiza `No se encontró tu registro de evaluador. Contacta al equipo para verificar tu identidad.` y el rail inferior `Shopper · sin país asignado`.

Por tanto, el PASS técnico previo de Gate 20 no demuestra aceptación funcional/visual Shopper. El script validaba estructura de ruta, DOM, autoridad HR, ausencia de modal, overflow y contenido mínimo, pero no exigía semántica de identidad/perfil Shopper ni el ciclo Disponibles → Postulación → Asignación → Mis Visitas.

**Clasificación P0 actual:** `MAPPING_FAILURE` focal de identidad Shopper ↔ registro HR/perfil visible.  
No se reabre login/membership/identity como diagnóstico general: la autenticación ya pasó; el fallo demostrado es el binding visible de dominio.

## 2. Efecto sobre el lock terminal previo
`CXORBIA_I3_TERMINAL_LOCK_2026-09-17.json` se conserva como evidencia histórica válida de fuente única, build único, artefacto único, Gate 20 estructural, Gate 21 fingerprint y no rebuild/recomposición.

Pero su elegibilidad para promoción a I4 queda **SUSPENDIDA**. El estado certificable vigente vuelve a `HOLD` hasta completar esta aceptación humana/viva. No se toca producción.

## 3. Metodología obligatoria
Se adopta y ejecuta, no solo se cita, la metodología ya existente en el source certificado:
- `app/docs/METODOLOGIA-PRUEBAS-EN-PLATAFORMA-REUTILIZABLE-DESDE-FINANZAS-20260804.md`;
- `app/docs/MATRIZ-EJECUCION-LABORATORIO-ADMIN-SHOPPER-20260804.md`.

No se crea otra metodología ni workflow paralelo. Se usa el DEV actual y los contratos normales del producto.

## 4. Plan de microiteraciones congelado
### MI-1 — Truth visible / exact defect
- conservar el artefacto `b94911a4748c03c2e604415e8a97ee091da96218` como fuente bajo prueba;
- registrar la captura Shopper FAIL y la captura Admin como evidencia comparativa;
- localizar únicamente el owner exacto del binding Shopper ↔ HR/perfil;
- si el defecto es de código, corregir solo ese owner; si es fixture/mapping, corregir solo el mapping/fixture DEV.

### MI-2 — Live synthetic scenario visible to Paula
Run único: `AUDIT-TYA-20260917-LIVE1` (o sucesor incremental si un FAIL focal obliga repetir).

**Admin/Operaciones visible:** Dashboard/HR viva, Visitas, Disponibles, Postulaciones, ficha de postulación, Shoppers, Reservas/Asignación y Finanzas.

**Shopper visible:** Login, Mi Perfil con identidad/país/perfil correctos, Certificaciones, Visitas Disponibles, Postulación, Mis Visitas antes y después de aprobación, Reserva/Agenda, Histórico y Reportes/beneficios cuando exista fuente.

**Cross-module obligatorio:** misma revisión HR y periodo; visita elegible visible una vez; postulación visible en Admin y Shopper; aprobación/asignación retira la visita de Disponibles; la misma visita aparece una vez en Mis Visitas del shopper exacto; Admin ve identidad/histórico/KPIs coherentes; reload x3 + pestaña nueva estable; cero duplicados; evidencia visual acumulativa; cleanup exacto y fingerprint final igual al baseline.

## 5. Datos y seguridad
- Solo DEV.
- Datos sintéticos `AUDIT-*`; sin PII real.
- HR real se usa como autoridad de lectura/revisión cuando corresponda; no se inventa una segunda autoridad.
- No writes a producción.
- Un write remoto solo puede ejecutarse si existe provider ACK/idempotencia y scope DEV seguro; de lo contrario la etapa se marca `BLOCKED` y no se simula como PASS.
- Los datos sintéticos permanecen visibles el tiempo indispensable para el checkpoint humano de Paula y después se limpian de forma exacta.

## 6. Checkpoint humano obligatorio
Antes de volver a declarar I3=GO, Paula debe poder abrir la candidata DEV y visualizar Admin y Shopper durante el escenario vivo. No basta screenshot ni DOM automático.

El checkpoint humano verifica al menos Shopper con identidad y país correctos; Mi Perfil completo/coherente; Disponibles coherentes con HR; postulación visible; asignación reflejada en Admin y Shopper; Mis Visitas correcto; Admin Shoppers/ficha/histórico/KPIs coherentes; navegación y visual sin regresión evidente.

## 7. Regla de rapidez / anti-bucle
- No se repiten 21 gates.
- No se crea rama/candidata/workflow paralelos.
- No se reimportan datos.
- Un FAIL se corrige solo en su owner y se repite únicamente el slice afectado.
- Si cambia source de producto por un fix P0, se genera UNA nueva identidad de artefacto y se repite solo la cadena terminal necesaria para esa nueva identidad, no todo Recovery.

## 8. Salida
I3 retorna a `GO` únicamente con escenario Admin/Shopper vivo PASS, checkpoint humano de Paula aceptado, cleanup exacto PASS y artefacto/fingerprint terminal coherente con cualquier fix aplicado.

Solo entonces puede solicitarse autorización I4.

**Este addendum NO reemplaza el plan de postproducción.**
