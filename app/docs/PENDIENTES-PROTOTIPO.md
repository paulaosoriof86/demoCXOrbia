# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-12 19:48 -06:00  
**Estado:** `C6_RUNTIME_12_PASS_M7__PHASE_A_93__NEXT_M8`

## Pendiente vivo de continuidad

```text
M8 (3 puntos, definición canónica por recuperar de fuentes vigentes)
→ M9 (3 puntos)
→ M10 (1 punto)
→ Phase A 100%
```

No reabrir C6/M7 ni repetir Hosting Runtime 12: el gate ya tiene PASS completo.

## Cerrado y no reabrir

- Exact Write V2/canonical readback.
- Principal canónico Runtime Staff `B=admin`.
- Formulario único `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- Action explícita/fail-closed.
- Selector Staff canónico sin bundle/password guessing legacy.
- Shell Hosting con `bash -n`, sin heredocs anidados.
- Submit QA canónico por Enter desde `#lgPass`.
- Wiring Staff fail-closed contra `tenants/tya/users/{uid}`.
- Handoff authority-ready → membership → stale-empty reconcile → `CX.app.enter()`.
- Republicación post-`CX.app.enter()` de la membership ya verificada.
- Preflight v4 antes de provider.
- D technical-login rebase/private handoff, Auth340, SKIP13, MultiAuth, HR y M4/static.
- **M7 Runtime Staff: PASS Runtime 12.**

No reabrir sin drift reproducible.

## Resultado Runtime 12

Run `31658676280`, job `94318658180`, artifact `9165383310`, digest `sha256:a327b0d5e0a592d41417dce7ff934984ab51d3d5927dbee9ba774200eee5befe`.

- preflight Staff v4: PASS;
- selector canónico: `B=admin`, `exactWriteCanonical=true`, `legacyCredentialBundleUsed=false`;
- Google Cloud auth: PASS;
- Hosting DEV: **1/1 PASS**;
- remote parity: PASS exact=true;
- Auth/contexto: `admin/staff/tya/cinepolis`;
- membership: PASS y persistida en `CX.session/RBAC` después de `CX.app.enter()`;
- datos runtime: **15 periodos / 660 visitas / 197 shoppers**, `2025-06 → 2026-08`;
- frontend handoff: `entered`;
- stale provider empty: limpiado;
- primera carga: PASS;
- **3 reloads: PASS**;
- **new-tab: PASS**;
- nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0;
- segundo Hosting=0; segundo Exact Write=0; merge=false; producción=false.

## Pendiente inmediato

Localizar en las fuentes vigentes la definición exacta de `M8`. Ejecutar directamente cualquier parte source-only/read-only ya autorizada por continuidad; si el milestone requiere provider/write/deploy/merge/producción, solicitar únicamente el gate específico faltante.

No iniciar nueva auditoría general, nueva candidata, nueva rama/PR ni reauditar C6.

## Pendiente frontend heredado separado

`app/modules/cliente-extra.js`: PDF print, XLSX y PPTX. No bloqueó M7 y no se considera automáticamente parte de M8/M9/M10 sin fuente canónica que lo establezca.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=0/3 | M9=0/3 | M10=0/1`

**93% certificado | 7% restante | delta certificado Runtime 12=+5%.**

## Claude / Academia

Cero cambios a `/app/modules` o UI visual por Runtime 12. No pedir candidata. Academia puede actualizar el flujo Staff real: formulario único, Auth/membership/RBAC, acceso a datos operativos y continuidad de sesión; no incluir mecanismos internos QA/credenciales.
