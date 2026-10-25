# ADDENDUM PREVALENTE — I3 CANONICAL CONVERGENCE / SHOPPER IDENTITY & ANTI-REGRESSION

**Fecha:** 2026-09-18  
**ID:** `CXORBIA-I3-CANONICAL-CONVERGENCE-20260918`  
**Estado:** `FROZEN_PREVALENT_UNTIL_I3_GO_OR_NEWER_EXPLICIT_SUPERSESSION`  
**Iteración:** `I3 — FUNCTIONAL CLOSURE`

## 1. Motivo
La evidencia viva de I3 demostró que los PASS históricos y Gate 21 no bastan si una candidata compone parcialmente módulos aprobados o si excepciones de identidad shopper bloquean la HR completa. Este addendum congela las decisiones de convergencia necesarias para cerrar una sola candidata canónica sin depender de conversaciones.

## 2. Decisiones congeladas
1. **Una sola candidata y un solo carril.** Continúa únicamente `recovery/cxorbia-phase-a-20260831`; no se crea rama, candidata, workflow, Firebase, overlay, materializador, importador ni metodología paralela.
2. **Regla de credenciales canónica y global para shoppers durables activos.** Usuario visible = `nombre.apellido`, normalizado sin tildes/espacios; contraseña Auth = `Nombre123*`; `credentialRuleVersion=tya-shopper-nombre-apellido-v1`. No se permiten sufijos, IDs técnicos como login ni contraseñas persistidas en Firestore/HR/localStorage.
3. **La regla no se limita al HR vigente.** Todo membership shopper durable activo con identidad exacta y perfil suficiente debe converger idempotentemente al patrón canónico, aunque el shopper no aparezca en la revisión HR del período actual.
4. **Excepciones no bloqueantes pero fail-closed por shopper.** Nombre insuficiente, login/email collision o identidad sin evidencia exacta no autoriza inventar ni fusionar. Ese shopper queda sin write destructivo y entra a revisión/cola; no puede tumbar HR, módulos ni shoppers no afectados.
5. **Aliases exactos probados.** Un alias HR sólo puede converger a un shopper canónico por `shopperIdentityLinks`, crosswalk exacto aprobado, documento/email protegido exacto u otra autoridad persistida autorizada. Un crosswalk legacy self-mapped de un alias ya probado se clasifica deuda de migración exacta y no bloquea HR global.
6. **Perfil/histórico usan identidad canónica.** La sesión shopper debe resolver `Auth/membership -> canonicalShopperId -> durable shopper profile/history`. Un ID técnico no puede provocar perfil vacío cuando existe un perfil canónico exacto.
7. **LEGACY_ORACLE es oráculo funcional, no arquitectura.** Se conserva el comportamiento observable de alta/perfil/login/histórico sin copiar localStorage, hardcodes ni deuda técnica.
8. **Gate 20 requiere semántica, no sólo render.** Antes de artifact final debe demostrar, en la misma source: módulos Admin aprobados visibles, Shopper login, Mi Perfil con identidad/usuario/contacto autorizado, histórico/visitas y ausencia de regresiones funcionales relevantes. Un DOM visible sin datos correctos no es PASS.
9. **Artifact único.** Gate 20, empaquetado y Gate 21 deben usar exactamente la misma source/build/artifact; no rebuild entre certificación y deploy. I4 sigue prohibido hasta `I3=GO` y autorización expresa de Paula.
10. **No reabrir gates sin drift.** Un FAIL posterior sólo corrige el owner exacto afectado y repite el paquete focal; no reabre I0-I2 ni los 21 gates completos.

## 3. Evidencia causal congelada
- Run 162 aisló cinco identidades sin evidencia exacta y no probó que debieran fusionarse.
- Run 163 superó el preflight de esas excepciones y expuso `SHOPPER_CROSSWALK_SCOPE_CONFLICT` por deuda legacy exacta.
- Run 164 dejó atrás ese conflicto y expuso `SHOPPER_CREDENTIAL_NAME_INCOMPLETE`.
- Run 165 consiguió `HR fresh=1 = PASS` y avanzó hasta la validación de credenciales, donde encontró inventario durable aún no convergido al patrón canónico.
- Esta secuencia demuestra avance causal; no autoriza volver al diagnóstico general.

## 4. Criterio de cierre I3 desde este addendum
I3 sólo puede emitir `GO` cuando una única source produzca: HR fresh PASS; credenciales durables normalizadas o excepciones aisladas; Admin/Shopper human lane PASS; perfil/histórico canónico PASS; persistencia focal PASS; Gate 20 semántico PASS; un único artifact; Gate 21 sobre ese mismo artifact.

## 5. Precedencia y mutabilidad
Este archivo es FROZEN. No se edita. Sólo puede ser sustituido por un addendum posterior fechado, con BEFORE/AFTER, causa, evidencia y hash. No autoriza producción.
