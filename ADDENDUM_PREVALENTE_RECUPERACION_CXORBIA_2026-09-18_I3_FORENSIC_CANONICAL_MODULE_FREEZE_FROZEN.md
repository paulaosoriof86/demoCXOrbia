# ADDENDUM PREVALENTE — I3 FORENSIC CANONICAL MODULE FREEZE

**Fecha:** 2026-09-18
**ID:** `CXORBIA-I3-FORENSIC-CANONICAL-MODULE-FREEZE-20260918`
**Estado:** `FROZEN_PREVALENT_UNTIL_REGISTRY_ADJUDICATED`
**Iteración:** `I3 — FUNCTIONAL CLOSURE`

## 1. Motivo
La aceptación humana/visual posterior al run 188 demostró drift funcional reproducible aunque el workflow técnico, Gate20 y Gate21 hubieran pasado. La igualdad de blobs declarados en la MODULE_TRUTH_MATRIX anterior no basta para probar que un módulo funcional completo está en su última versión aprobada.

Este addendum no abre otra metodología ni otra iteración. Corrige dentro de I3 una `RELEASE_COMPOSITION_FAILURE`: la unidad de autoridad pasa de archivo owner aislado a **módulo funcional + dependency closure + load order + evidencia humana/funcional exacta**.

## 2. HOLD inmediato
- I3 permanece `HOLD`.
- Product source `8d0df77a6e0ffe39eb70c0dcd2eee7d22cf692c6` queda sólo como candidata de comparación; no es promovible.
- No product writes, rebuild, recertificación, candidata paralela, rama paralela, overlay nuevo ni producción hasta adjudicar el registry.
- `https://tya-plataforma.web.app/` continúa `DO_NOT_TOUCH`.

## 3. Evidencia congelada
- Run 188 `35361181438`: SUCCESS técnico y Gate21 del artifact exacto, no prueba de canonicidad funcional completa.
- Run 191 `35363178226`: HOLD, artifact `10556195012`, digest `sha256:07bb5a660530ffcbc37d459ec688c63742039484b0c2d318e7d7684668a63d8a`, terminal `AUTH_FAILURE:CLIENT_MEMBERSHIP_MISSING`.
- Capturas humanas 18-09-2026: identidad shopper protegida en Admin; Shopper autenticado sin vínculo canónico/país/histórico; Postulaciones sin evento real; Reservas con fuente pendiente; incoherencia financiera; contexto de período histórico no uniforme.
- Source readback: fallback `Shopper protegido`; `mapPosts(visits, identity)`; Reservations read-only; overlay superseded todavía cargado.

## 4. Regla canónica definitiva
Para cada uno de los 20 dominios Fase A se adjudica una sola versión canónica por:
1. checkpoint humano/funcional explícitamente aprobado;
2. gate/receipt funcional del módulo exacto;
3. manifest/lock/blob congelado;
4. cronología Git sólo como evidencia auxiliar.

`último commit != último aprobado`.
`owner MATCH != módulo funcional MATCH`.

## 5. Registry obligatorio
`CXORBIA_CANONICAL_MODULE_REGISTRY_2026-09-18.json` es el registro durable de adjudicación. Cada dominio debe terminar con checkpoint aprobado, source commit, owner blobs, dependency closure, load order, served blobs, evidencia humana, contratos, clasificación y acción `KEEP` o `RECOVER_EXACT_APPROVED_DELTA`.

No se modifica producto antes de completar 20/20.

## 6. Contratos reforzados
- Cinépolis histórico/presente/futuro proviene de la misma Hoja de Ruta viva/revisión externa.
- Dashboard, visitas, KPIs, históricos y Shoppers se reconcilian contra esa misma revisión.
- Admin autorizado ve identidad real; “Shopper protegido” no es estado normal.
- Shopper autenticado ve nombre, país, perfil, KPIs e histórico.
- Postulaciones sólo por eventos durables reales, nunca sintetizadas desde visitas.
- Reservas/Asignación requiere fuente durable y ACK.
- Cada proyecto es aislado y configurable por tenant/project/source/mapping/periodicidad/cortes/país/moneda; no hardcodes globales.
- Writes bidireccionales requieren ACK remoto, idempotencia y readback.
- Legal nunca bloquea acceso, pruebas o producción.

## 7. Procedimiento único y ágil
`READ-ONLY ADJUDICATION → REGISTRY 20/20 → ONE ATOMIC RECOVER COMPOSITION → OWNER GATES → ONE FULL HUMAN ACCEPTANCE → ONE ARTIFACT → GATE21 → I3 GO/HOLD`.

No habrá reparación pantalla por pantalla ni reconstrucción general.

## 8. Salida
No se reanuda build/certificación hasta registry 20/20 + composition manifest exacto. Después se hace una sola recomposición atómica y una sola aceptación exhaustiva.

## 9. Producción
No autoriza I4. Producción sigue intacta.

## 10. Mutabilidad
FROZEN. Cualquier supersesión exige addendum posterior con BEFORE/AFTER, causa, evidencia, efecto y SHA-256.
