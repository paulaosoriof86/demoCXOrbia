# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-17 13:22 -06:00  
**Estado:** `UNIFIED_PHASE_A_PLAN_DOCUMENTED__NO_REPROCESS__SOURCE_PASS__I3_RUNTIME_VALIDATION_NEXT`

## 2026-08-17 — Unificación del plan Phase A y sincronización anti-desvío

Se detectó un **drift documental de secuencia**: coexistían el plan histórico por Cortes 0B→8, los seis bloques forenses S1→S6, el plan durable I1→I5 y un `PHASE-A-PLAN-LOCK` repo que todavía mostraba una cadena histórica `M7→M10`/porcentaje anterior. No se encontró un plan funcional nuevo; eran representaciones distintas del mismo camino y podían causar omisiones o re-procesos.

### Decisión

Se creó:

- `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Ese addendum es ahora prevalente para **secuencia, porcentaje formal, subgates intermedios y siguiente acción**. Preserva íntegramente:

- Cortes 0B→8 como cobertura funcional;
- S1→S6 como controles forenses dentro de I1→I5;
- I1→I5 como avance formal;
- no-reproceso de Admin, Shopper histórico, HR y Finanzas;
- Phase A completa: documentos, certificación, disponibles, postulaciones, asignación, agenda/reprogramación/cancelación, realizada, cuestionario, submit/revisión, HR bidireccional/Make, Finanzas, multi-proyecto/configuración, roles, evidencias, Academia, Gemini gated y E2E same-build;
- exact build/preproducción/rollback/go-live.

### Hallazgos de cobertura que se hicieron explícitos

Dos puntos del plan anterior podían quedar ocultos en resúmenes cortos y ahora quedan congelados:

1. **I3.7 legal receipt durable readback** después de la aceptación humana ya realizada.
2. **I3.8/I3.9 Admin create/update de un Shopper nuevo + Auth/claims/membership/profile/crosswalk/ACK + login/reload/new-tab/segundo contexto**, distinto del Admin existente PASS y del Shopper histórico PASS.

También quedaron enumerados todos los subgates I3.1→I3.11, I4.1→I4.12 e I5.1→I5.8 para impedir que futuros pasos intermedios aparezcan como metodología nueva.

### Documentos sincronizados en este bloque

- `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md` — eliminó la secuencia histórica aislada y apunta al plan unificado;
- `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md` — el addendum unificado queda como lock de secuencia prevalente;
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` — estado actual y subgates I3 completos;
- `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md` — crosswalk Cortes/S/I y subgates explícitos;
- `RESUMEN-PARA-CLAUDE.md` — sincronización pendiente/realizada en este mismo bloque;
- `PENDIENTES-PROTOTIPO.md` — sincronización pendiente/realizada en este mismo bloque;
- `SOURCE-LOCK-PHASE-A-CANONICAL-AUTHORITY-REGRESSION-ROOT-CAUSE-SOURCE-PASS-20260817.md` — referencia al plan unificado;
- Academia addendum de impacto — documenta continuidad de manuales/cursos/rutas/notificaciones;
- PR #7 — se sincroniza al cierre del bloque.

### Efectos

Solo documentación/continuidad. Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción: `0/false`. No se creó rama ni PR. No se reprocesó ningún usuario, visita, fuente financiera o gate consumido.

### Clasificación

- `Reusable CXOrbia`: crosswalk de planes, subgates explícitos, circuit breakers anti-desvío.
- `Exclusivo cliente`: estado TyA/Cinépolis y evidencias 15/660/44.
- `Claude/prototipo`: no reconstruir módulos; respetar cobertura funcional del plan unificado.
- `Academia`: I4.10 obligatorio y addendum de continuidad.
- `Sin impacto Claude`: documentación/gates internos, salvo la obligación de no revertir decisiones.

## 2026-08-17 — I3 Admin TARGET_B credential recovery

Se reutilizó el runner read-only existente `cxorbia-corte6-auth-mapping-capability-readonly.yml`; no se creó rama, PR ni workflow nuevo.

Archivos backend/tools tocados:
- `tools/qa/cxorbia-i3-admin-target-b-credential-handoff-readonly.mjs`: verificador exacto de TARGET_B, login Firebase real y handoff cifrado.
- `tools/qa/cxorbia-corte6-auth-mapping-capability-readonly.mjs`: routing del modo TARGET_B al verificador nuevo, preservando el modo histórico.
- `backend/config/i3-admin-target-b-handoff-public.pem`: clave pública efímera/source-safe para cifrar el handoff; no contiene secreto.
- `backend/config/corte6-auth-mapping-capability-readonly-request.json`: request `i3-admin-target-b-credential-handoff-readonly-20260817-01`, consumido read-only.
- `app/docs/evidence/CORTE6-AUTH-MAPPING-CAPABILITY-READONLY-LATEST.json`: evidencia sanitizada del PASS.

Ejecución real: workflow run `32049054855`, job `95443726801`, `SUCCESS`. TARGET_B alias `B`, rol `admin`, binding técnico exacto, Auth habilitado, claims exactos y `firebasePasswordSignIn=true`.

Ledger exacto: Auth writes `0`; passwordChanges `0`; passwordResets `0`; Firestore reads/writes `0/0`; Shopper reads/writes `0/0`; historicalCredentialAccess `0`; otras identidades modificadas `0`; HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción `0/false`.

La credencial vigente fue recuperada únicamente en memoria privada del runner, comprobada mediante sign-in real y persistida solo como ciphertext. No se rotó contraseña porque la credencial actual funciona.

Clasificación: `Reusable CXOrbia` = handoff cifrado/read-only de credencial canónica existente; `Exclusivo cliente` = TARGET_B TyA; `Claude/prototipo` = sin cambio UI; `Academia` = sin cambio de contenido; `Sin impacto Claude` = sí.

## Histórico preservado

Gate `31762716234`: one provider read consumed; inventory 231 Auth / 209 principals / 340 profiles / HR 15-660-212. V1 `62/137/10` non-authoritative; independent 616/208/194.

Source gap fixed: exact linked protected owners canonicalized via `CX_EXACT_IDENTITY_CONTRACT` before HR composition. Run `31763545130` SUCCESS / `PASS_P0_GLOBAL_COMPOSITION_SOURCE` / hard fails 0.

Historical handoff no current credential; request disabled; `31763754714` provider/E2E skipped; no second read.