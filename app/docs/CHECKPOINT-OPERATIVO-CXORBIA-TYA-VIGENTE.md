# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-19
Estado: `TECHNICAL_PASS_PENDING_DEV_AUTHORIZATION`

## 1. Repositorio y estado seguro

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Candidata aplicada: V161C.
- Commit de empalme V161C: `ab862d2e2a92993238ee96d214c7024fccb22c1a`.
- HEAD técnico documentado de cierre post-gates: `7acc4e6c18355827df6ed649c3a537db07eec196`.
- Manifest: `app/docs/MANIFEST-V161C-EMPALME-DIRECTO-20260719.json`.
- Build lock: `app/core/build-lock.js`.
- Verificador: `tools/release/tya-v161c-empalme-directo-verify.mjs`.
- Sin Hosting DEV nuevo, sin merge, sin deploy, sin producción, sin importaciones reales, sin Firestore/Auth/Storage/HR writes, sin Make/Gemini live y sin pagos.

## 2. Corte activo

`CORTE 0B - MOTOR CANÓNICO HISTÓRICO + TENANT/LOGIN`

V161C quedó empalmada y los post-gates R21 quedaron completos sobre el build canónico reproducible.

## 3. Fuente y alcance comprobados

- La lectura HR viva detectó 15 periodos, 30 pestañas y 684 visitas, incluyendo agosto de 2026.
- Corte 0B permanece bloqueado al inventario contractual verificado `tya-hr-tab-inventory-r20-v1`:
  - junio de 2025 a julio de 2026;
  - 14 periodos;
  - 28 pestañas GT/HN;
  - 616 visitas.
- Agosto de 2026 fue excluido únicamente del corte actual y queda registrado como periodo posterior pendiente de incorporación controlada; no se borró ni se interpretó como parte del baseline de julio.
- El filtro source-safe no contiene PII, workbook crudo, escrituras, imports ni producción.

## 4. Gates aprobados

Workflow:

- Run: `29712762494`.
- Resultado: `SUCCESS`.
- Artifact: `8449340543`.
- Digest artifact: `sha256:a2e4861610a1928bbf77ce34b790bad1765ff5bda91302669f7d14ad1ee75864`.

Decisiones:

- `PASS_R20_VERIFIED_INVENTORY_FILTER`.
- `PASS_R21_ELIGIBILITY_FINAL_CANONICAL_PASS`.
- `PASS_R21_POSTULATION_ELIGIBILITY`.
- `PASS_WITH_WARNING_R21_TYA_SOURCE_SEMANTICS`.

Evidencia navegador:

- 14 periodos, 616 visitas y 209 referencias shopper protegidas.
- Proyecto actual: `cinepolis`.
- Periodo actual: `cinepolis-2026-07`.
- Julio: 44 visitas, 39 asignadas, 5 sin asignar, 4 disponibles y 1 bloqueada por elegibilidad.
- 4 oportunidades publicables con `availableFrom`, `franjaCode`, inicio y fin de ventana.
- Contratos públicos `availableVisits()` y `postulationEligibility()` presentes.
- 0 blockers, 0 page errors y 0 console errors.
- Advertencia no bloqueante: diferencia shopper `209/216`, preservada para revisión sin inventar ni eliminar identidades.

## 5. Corrección de causa raíz

El primer HOLD no provenía de V161C. Se identificaron y corrigieron dos desviaciones del gate:

1. el flujo estaba usando el builder estático anterior, que no aplicaba la semántica canónica de asignación/disponibilidad;
2. la HR viva ya contenía agosto de 2026, mientras Corte 0B está contractual y visualmente definido hasta julio de 2026.

Se reutilizó el mapper R20 de columnas con resolución exacta/única y se agregó un filtro fail-closed al inventario verificado antes de canonicalizar y construir el runtime R21.

## 6. Siguiente bloque exacto

```text
AUTORIZACION_SEPARADA_HOSTING_DEV_R21
-> reproducir el mismo build canónico con inventario Corte 0B
-> publicar únicamente Hosting DEV
-> ejecutar smoke remoto Admin / Operativo / Shopper / Cliente / Academia
-> validación visual de Paula
-> corrección focalizada solo si existe diferencia reproducible
-> APROBADO
-> freeze Corte 0B
```

No iniciar Corte 1 antes de la validación visual y freeze de Corte 0B.
