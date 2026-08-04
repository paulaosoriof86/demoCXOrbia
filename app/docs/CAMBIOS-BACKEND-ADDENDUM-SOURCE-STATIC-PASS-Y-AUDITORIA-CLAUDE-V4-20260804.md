# CAMBIOS-BACKEND · Addendum source/static PASS y auditoría Claude v4

**Fecha:** 2026-08-04

## Reusable CXOrbia

### Carril de gates

- Se añadió `tools/release/cxorbia-phase-a-complete-composition-source-static-runner.mjs`.
- Se actualizó `.github/workflows/cxorbia-readonly-post-gates-runner.yml` para enrutar el perfil `PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC` mediante el runner controlado existente.
- Se corrigió la causa raíz de autodetección del escáner:
  - solo fixtures exactos conocidos pueden degradarse a warning;
  - cualquier hit desconocido continúa bloqueando;
  - no se reproducen secretos ni patrones sensibles en artifacts.
- Se clasificó `app/core/backend-dev-auth.local.js` como override DEV opcional y gitignored, no como autoridad productiva.
- La solicitud exitosa quedó desactivada después de una ejecución.

### Evidencia

- run `30910224561`;
- artifact `8892730161`;
- decisión `PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS`;
- 53/53 blobs críticos;
- repositorio sin delta después del gate;
- provider/data writes 0.

## Exclusivo cliente TyA

- No se modificaron datos HR, shoppers, certificaciones, liquidaciones ni pagos.
- No se cambió Cinépolis ni reglas GT/HN.
- No se materializó agosto.

## Claude/prototipo

Se auditó `Prototype development request (20).zip`:

- SHA-256 `862e415df3d3a24be09ffbd48cb74f98779a59d2a2265587969c1880b48841c9`;
- decisión `HOLD_CLAUDE_LOGIN_PORTABLE_V4__NOT_READY_FOR_APPLY_DELTA_DIRECTLY`;
- no se copió ningún archivo a `app/`.

Bloqueos:

- evidencia móvil no corresponde a viewport móvil;
- selector multi-país incompleto;
- token CSS `--gcx-navy-2` indefinido;
- README con HEAD histórico;
- ausencia de bridge/ruta/integración canónica.

Documentos:

- `AUDITORIA-FOCAL-CLAUDE-LOGIN-PORTABLE-V4-20260804.md`;
- `MATRIZ-TRAZABILIDAD-FORENSE-A-IMPLEMENTACION-Y-CLAUDE-20260804.md`;
- `PROMPT-CLAUDE-CORRECCION-LOGIN-PORTABLE-V4-20260804.md`.

## Academia

No cambia contenido funcional de cursos ni certificaciones. Se documenta el impacto en addendum separado.

## Sin impacto Claude

- Auth/claims;
- HR/adapters;
- Finanzas;
- report kit;
- overlay A+B;
- runtime multirol;
- agosto;
- deploy/freeze/producción.

## Estado seguro

- cambios funcionales en `app/`: 0;
- deploy: 0;
- Firestore/Auth/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## Siguiente bloque exacto

`RUNTIME_MULTIROLE_ACCUMULATIVE_GATE → CLAUDE_V4_CORREGIDO → AUDITORIA_UNICA_DELTA → APPLY_DELTA_DIRECTLY_SOLO_CON_GO → BRIDGE_SEGURO → GATES → DEV`.
