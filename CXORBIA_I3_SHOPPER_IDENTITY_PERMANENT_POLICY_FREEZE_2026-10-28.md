# CXOrbia I3 — norma permanente de identidad y fusión de shoppers

**Autoridad:** decisión expresa de Paula, 28-oct-2026, America/Guatemala.  
**Estado:** FROZEN / ADITIVO / SOURCE-ONLY para la interfaz nueva.  
**Alcance:** `tya`, Cinépolis GT/HN, con reglas de prevención reutilizables por todos los proyectos y países sin cruzar tenants.  
**Repositorio:** `paulaosoriof86/demoCXOrbia`, rama `recovery/cxorbia-phase-a-20260831`.  
**Continuidad:** preserva el plan rector y `CXORBIA_I3_PRIORIDAD_TRANSVERSAL_GO_LIVE_FREEZE_2026-10-28.md`; no concede I4 ni despliegue LIVE.

## DEC-I3-IDENTITY-001 — Normalización de comparación, no de presentación

1. La clave técnica para comparar **nombres** elimina tildes y marcas diacríticas (`NFD`), convierte a minúsculas, compacta espacios y quita espacios iniciales/finales. Así `María   Pérez`, `MARIA PEREZ` y `maria perez` producen la misma clave.
2. Los nombres visibles y la hoja de ruta conservan su grafía humana original: la clave normalizada **no sobrescribe** el nombre de presentación ni un ID canónico de HR.
3. La clave se evalúa siempre dentro del **tenant y país** correctos; se cotejan teléfono/WhatsApp normalizados cuando existen. Un nombre igual, por sí solo, **no autoriza** una fusión.
4. Identificadores técnicos de HR, Auth, perfil, membresía, crosswalk e `identityLink` prevalecen sobre heurísticas de nombres. Una coincidencia de nombres se marca como *candidata a revisión* hasta acreditar su procedencia o disponer de una adjudicación humana explícita.

## DEC-I3-IDENTITY-002 — No crear nuevos duplicados

1. Antes de crear manualmente un shopper, el proveedor protegido contrasta nombre normalizado, teléfono y país con los expedientes existentes y bloquea la creación conflictiva con `SHOPPER_CREATE_EXISTING_IDENTITY_REVIEW_REQUIRED` **sin crear otra cuenta**.
2. Un shopper previamente enlazado por un crosswalk/identidad exacta se vincula al expediente canónico con operación idempotente; no debe duplicar la cuenta ni su historial.
3. Si el registro carece de evidencia suficiente, se debe abrir revisión, no adivinar una persona por semejanza textual ni fusionar automáticamente. Si no hay teléfono o la identidad histórica es ambigua, es necesaria comprobación adicional.
4. Toda fusión debe conservar el UID/credencial de acceso acreditado y el expediente de historial (visitas, agenda, cuestionarios, certificaciones, beneficios, liquidaciones y pagos), sin alterar HR y con readback obligatorio.

## DEC-I3-IDENTITY-003 — Aviso para Administración y Operaciones

1. Al ingresar personal con rol `super`, `admin`, `ops` u `operaciones`, la navegación deberá mostrar **un indicador de revisiones pendientes**, nunca un conteo inventado.
2. El indicador debe abrir el flujo de revisión de identidad ya previsto en Shoppers; se alimenta de conflictos protegidos, expedientes sin autoridad suficiente y colisiones de nombres normalizados, deduplicando los avisos.
3. Operaciones/Administración podrán registrar `SÍ / NO / PENDIENTE`, escoger la identidad correcta, y solicitar información faltante. El **SÍ** es confirmación humana; la ejecución técnica sigue exigiendo fuente canónica, país, titular acreditado, dependencias y operación idempotente.
4. El resultado debe ser auditable por actor, fecha, origen, alias, canónico, estado, idempotency key, ACK de proveedor y comprobación posterior. No mostrar contraseñas, tokens, teléfonos completos ni datos sensibles en alertas o logs.
5. Los roles Shopper/Cliente no reciben un panel de fusiones de terceros. Las notificaciones de revisiones deben quedar pendientes hasta resolución real, no desaparecer al cerrar el aviso.

## DEC-I3-IDENTITY-004 — Cohorte exacta aprobada de Paula

- Excel original de tres hojas: `Confirmar 66`, `Revisar nombre` y `Trazabilidad`; **139 `SÍ`**, agrupadas en **83 expedientes**, 66 coincidencias fuertes y 73 revisadas.
- Huella inmutable de las decisiones: `ac3e15184316d62aa53942359e857f2c34dec486a2ca41057e529a39f062d872`.
- Fuente viva DEV acreditada: `4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a`.
- Canarios con ACK, readback y Shopper UI **PASS**: F-001 ([RUN 40807723152](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40807723152)) y F-048 histórico ([RUN 40810550024](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40810550024)).
- Preflight actualizado y acreditado **PASS** ([RUN 40811114059](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40811114059)): **2** consolidados y verificados, **32** `KEEPER_VERIFIED`, **37** con visitas históricas de alias pendientes de migración exacta, **11** con varios principales HR, **1** con keeper no acreditado. Total **83**. El `SÍ` humano **no elimina** los `HOLD` técnicos.
- Prohibido volver a fusionar F-001/F-048, reutilizar su canario en otro grupo o modificar el libro aprobado.

## DEC-I3-IDENTITY-005 — Estado comprobado de implementación

- En el backend existe el bloqueo protegido de creación manual duplicada (`backend/runtime/cxorbia-shopper-command-provider-v1.mjs`).
- Cambios **SOURCE-ONLY** versionados: normalizador de colisiones de nombre en `app/adapters/tya-cumulative-read-model-v2.js` (commit `d5ec59c25d6061f13127c344a8cdbdbb5989b31e`), aviso contextual de Administración/Operaciones en `app/core/router.js` (commit `4d771372752aea98f58ea3d27a79ec7fd5b86ca2`). Las pruebas de nombres, roles y proveedor pasaron en RUN 40811114059.
- Falta probar el aviso y la prevención extremo a extremo en el **artefacto DEV servido**, acreditar cada fusión pendiente y comprobar el flujo de nuevos shoppers. No declarar desplegado el aviso ni resuelto el P0 de visitas disponibles sin evidencia.
- No modificar producción `tya-plataforma.web.app`. `I3 HOLD`, `Gate20/Gate21 HOLD`, `I4 NOT_AUTHORIZED` hasta cierre formal conforme a autoridad vigente.

## Reanudación obligatoria sin reinicios

1. Leer el HEAD y esta decisión congelada. Reconciliar la misma cohorte exacta: 139/83, sin reprocesar grupos ya cerrados.
2. Ejecutar los siguientes grupos por lotes pequeños, comprobando preflight particular antes de cada escritura, ACK idempotente y readback Auth + identidad + todas las referencias + UI Shopper; detener el grupo ante cualquier drift y continuar con grupos independientes seguros.
3. Trabajar en paralelo **sólo** en frentes de diagnóstico/QA: visitas disponibles, flujo Admin/Shopper, certificaciones, finanzas, notificaciones y tiempos de sincronización. Un único escritor de código y DEV por intento.
4. Cerrar los gates reales de Fase A y publicar únicamente tras autorización I4 para el mismo artefacto probado. Mantener evidencia acumulativa, sin perder PASS anteriores.

**Regla de cambio:** FROZEN y aditivo. Cualquier supersession exige BEFORE/AFTER, causa, autor, impacto, pruebas y commit exacto. Nunca reescribir silenciosamente estas decisiones.
