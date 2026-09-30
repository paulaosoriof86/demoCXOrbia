# SOURCE LOCK — ITERATION 3 · LEGAL V0.4 INTERIM GO-LIVE · COUNSEL DEFERRED · SOURCE-ONLY PASS · 2026-08-16

**Estado:** `PASS_I3_LEGAL_V0_4_INTERIM_GOLIVE_COUNSEL_DEFERRED_SOURCE_ONLY__COUNSEL_POST_GOLIVE_OPEN__NO_PROVIDER_IO__GO_LIVE_35`

## 1. Carril y autoridad

Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

Este lock prevalece para la decisión de counsel diferido y complementa, sin invalidar, los locks técnicos de aceptación durable, publicación inmutable y el histórico I3 congelado.

No se reabren I1/I2. Historical Shopper exacto permanece congelado en run `31906391682`; reset histórico único consumido; toda continuación `passwordResets=0`, cero credential access/reconcile/recovery histórico. Request08 continúa consumido y no puede reutilizarse.

## 2. Decisión humana nueva

Paula indicó el 2026-08-16 que la revisión del abogado quedará pendiente porque no está disponible y que CXOrbia/TyA no puede detener la salida a producción por ese punto.

Interpretación operativa exacta:
- counsel GT/HN deja de ser dependencia bloqueante **pre-go-live interino**;
- counsel sigue pendiente post-go-live y no se declara aprobado/completado;
- no se inventa opinión jurídica;
- no se convierte ninguna automatización en firmante;
- la aceptación dentro de la Plataforma sigue siendo exclusivamente humana;
- los provider/deploy/production gates técnicos continúan separados.

## 3. Delta de este bloque

Cadena source/docs:
- `66d1d99f19e32ae411fbf7ab1ed49c16a00ee296` — `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
- `9eeea214a34a840b66c5ce1ba5fd2fb163b0abc1` — `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
- `5032347c3cb54d2eb70c2e0e6d527feedd960546` — `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.
- `cf1aeb6c27f625326c2bfa82c761b8d698541c9a` — índice vivo movido a V0.4/provider gate.
- `98f4541beba59a5f972f2b9f131b77960cc10fde` — checkpoint actualizado.
- `158c1af40ec1964fbdebe80c697d79bc03b76d96` — CAMBIOS actualizado.
- `cab41459e95fa23bdce5b90f7c218611cc61e441` — RESUMEN-PARA-CLAUDE actualizado.
- `a43cbe877d8c0e4bb38b9b242b55b6ea26730f73` — PENDIENTES actualizado.
- `38182f92874c56acae0de10931d5677ee1400c0d` — tracker actualizado.
- `876b4219c117ca8a5fc6e718387830d3054c95fa` — Academia actualizada.

No hubo delta en `/app/modules`, `/app/core`, product entrypoint, Auth provider, Firestore provider o producción.

## 4. V0.4 interina

`CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md` sustituye V0.3 únicamente como candidata interina de ruta crítica.

V0.4:
- no muestra marcadores internos `LEGAL_REVIEW_REQUIRED` al usuario;
- no afirma revisión/aprobación profesional;
- usa formulaciones conservadoras sobre aceptación electrónica;
- no afirma ausencia de obligaciones hondureñas;
- no impone arbitraje universal a usuarios individuales;
- mantiene evidencia configurable por proyecto y tratamientos de alto impacto bajo gate;
- mantiene retención operativa 60/90 separada de documentación empresarial/financiera;
- mantiene rebranding/no-code y separación marca/IP/licenciante;
- mantiene domicilio registrado restringido;
- solo permite mostrar proveedores realmente activos/documentados.

## 5. Counsel post-go-live preservado

`PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md` conserva abiertos `GT-01..GT-08`, `HN-01..HN-06`, `X-01..X-06`.

Cuando counsel esté disponible:
1. revisar V0.4 contra paquete/matriz;
2. incorporar cambios exactos;
3. emitir nueva versión si aplica;
4. evaluar materialidad;
5. requerir nueva aceptación humana cuando el cambio material lo amerite.

Ningún punto se marca `APROBADO SIN CAMBIO` por inferencia técnica.

## 6. No-code / rebrand-safe

Regla prevalente:

`tenantLegalProfile mutable provider-authoritative`
→ `snapshot de publicación inmutable con valores públicos resueltos`
→ `render canónico UTF-8/LF`
→ `SHA-256 post-render`
→ `receipt humano exact identity + legalVersion + contentDigest + server timestamp`.

Operador, identificación tributaria, contactos, dirección pública, países, retención, controversias, proveedores, branding/licenciante y evidencia de proyecto no deben hardcodearse en producto.

## 7. Seguridad / efectos reales

Provider credentials/reads/writes: `0/0/0`.
Firestore/Auth/legalContent/legalAcceptance writes: `0/0/0/0`.
Historical credential access/reset/reconcile: `0/0/0`.
HR/Storage/Rules/Make/Gemini/pagos: `0`.
`/app/modules` cambios: `0`.
`/app/core` cambios: `0`.
Product entrypoint activation: `0`.
Deploy: `0`.
Merge: `false`.
Producción: `false`.

## 8. Clasificación

- **Reusable CXOrbia / sucesor de marca:** counsel diferido como estado explícito, sin falsificar aprobación; perfil mutable → snapshot → digest → receipt humano.
- **Exclusivo TyA:** candidata legal V0.4 y decisiones GT/HN; valores no hardcodeados.
- **Claude/prototipo:** futuro UI Legal y cumplimiento / Provider Registry / Evidencias y privacidad / rebranding; no parcheado desde backend.
- **Academia:** debe distinguir versión publicada, aceptación humana y estado de counsel.
- **Sin impacto Claude inmediato:** decision/source lock y documentación.

## 9. Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**GO-LIVE 35% completado / 65% pendiente.** El cambio de dependencia legal no suma I3 hasta que la aceptación durable y el Admin/new Shopper cierren integralmente.

## 10. Siguiente gate exacto

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

El siguiente bloque puede preparar source-only la materialización V0.4 y el wiring durable. Cualquier write real en `cxorbia-backend-dev` deberá quedar limitado por presupuesto explícito. La aceptación jurídica permanece humana e indelegable. Request08 no se reutiliza.
