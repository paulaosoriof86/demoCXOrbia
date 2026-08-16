# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-16 10:38 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_PROVIDER_SOURCE_PASS__LEGAL_V0_4_INTERIM_GOLIVE__COUNSEL_DEFERRED_NONBLOCKING__GO_LIVE_35__NO_PRODUCTION_YET`

## Preservado

I1 PASS 15/15 e I2 PASS 20/20. Histórico I3 congelado desde run `31906391682`; reset histórico único consumido; toda continuación `passwordResets=0`; sin acceso/reconcile/recovery histórico.

Request08 run `31909354336` / job `95071998299`: STOP fail-closed `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo ni Auth/Firestore writes. Request consumido, no rerun.

## Autoridad legal durable previa

Source durable `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate `31913700755` / `95082399402` SUCCESS. Aceptación exact-identity/versioned/human-only/provider-ACK/fail-closed preparada. Bridge no activado. Provider/Auth/Firestore/legal writes reales `0`.

Patrón no-code:
`tenantLegalProfile mutable → snapshot público inmutable → render UTF-8/LF → SHA-256 post-render → receipt humano por legalVersion/contentDigest`.

## Bloque 2026-08-16 — decisión de no bloquear go-live por counsel

Paula indicó que la plataforma no puede detenerse por indisponibilidad temporal del abogado. Se documentó la decisión como **counsel diferido post-go-live**, sin afirmar revisión jurídica inexistente.

### Archivos creados

1. `app/docs/DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`  
   Commit `66d1d99f19e32ae411fbf7ab1ed49c16a00ee296`.

2. `app/docs/CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`  
   Commit `9eeea214a34a840b66c5ce1ba5fd2fb163b0abc1`.

3. `app/docs/PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`  
   Commit `5032347c3cb54d2eb70c2e0e6d527feedd960546`.

### Regla

El gate `HUMAN_COUNSEL_REVIEW_TYA_GT_HN_AND_PAULA_APPROVAL_BEFORE_PROVIDER_MATERIALIZATION` deja de ser bloqueo pre-go-live por decisión humana expresa. Counsel no queda cerrado: los códigos `GT-01..GT-08`, `HN-01..HN-06`, `X-01..X-06` permanecen en registro post-go-live y deberán producir una nueva versión si el abogado requiere cambios.

### V0.4 interina

V0.4:
- no contiene marcadores internos `LEGAL_REVIEW_REQUIRED` dentro del texto destinado al usuario;
- no afirma que exista revisión profesional;
- evita afirmar suficiencia universal de un clic/firma;
- no afirma ausencia de obligaciones locales hondureñas;
- no impone arbitraje universal a usuarios individuales;
- mantiene evidencia por proyecto y tratamientos de alto impacto bajo gate específico;
- mantiene retención 60/90 para evidencia cruda separada de documentación financiera/mercantil;
- preserva rebranding/no-code y separación marca vs IP/licenciante;
- preserva domicilio registrado restringido;
- Provider Registry solo muestra proveedores realmente activos.

## No-code / datos TyA

Operador, identificación tributaria, contactos, dirección pública, países, retención, controversias, proveedor(es), branding/licenciante y evidencia por proyecto deben vivir en configuración provider-authoritative editable. No se convirtieron en constantes runtime ni seeds TyA dentro del código.

## Claude / prototipo

No se modificó `/app/modules` ni `/app/core`. Sigue documentado para frontend futuro:
- `configuracion.js`: Legal y cumplimiento no-code, perfil mutable vs versiones publicadas;
- `administrabilidad.js`: auditoría y retiro de autoridad local/demo tras provider real;
- proyectos: Evidencias y privacidad;
- integraciones: Provider Registry;
- marca/white-label: nombre visible/estado registral/licenciante separados;
- gate legal: texto completo, versión, casillas no premarcadas y acción humana.

## Seguridad / efectos reales del bloque

Provider credentials/reads/writes `0/0/0`; Auth/Firestore/legalContent/legalAcceptance writes `0`; password resets `0`; historical access/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; `/app/modules` cambios `0`; `/app/core` cambios `0`; product entrypoint activation `0`; deploy `0`; merge=false; producción=false.

## Pendiente real

Siguiente gate:
`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Debe materializar V0.4/configuración legal en DEV bajo presupuesto exacto, habilitar autoridad durable en runtime y dejar la aceptación únicamente al humano autenticado. Después se crea nueva continuación I3 Admin/new Shopper; request08 no se reutiliza.

## Clasificación

- **Reusable CXOrbia / sucesor de marca:** counsel diferible sin falsificar revisión; perfil mutable → snapshot inmutable → digest → receipt.
- **Exclusivo TyA:** V0.4 interina y decisiones GT/HN; valores no hardcodeados.
- **Claude/prototipo:** superficies futuras documentadas; cero parche UI en este bloque.
- **Academia:** revisión profesional pasa a pendiente post-go-live; aceptación humana/versionada continúa obligatoria.
- **Sin impacto Claude inmediato:** decision lock, candidata legal, registro post-go-live y docs.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**
