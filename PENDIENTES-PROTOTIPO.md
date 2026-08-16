# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-16 10:38 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_V0_4_INTERIM_GOLIVE__COUNSEL_DEFERRED_NONBLOCKING__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR. I1/I2 cerradas. I3 continúa por provider materialization + aceptación humana durable + Admin/new Shopper. Counsel GT/HN queda pendiente post-go-live y ya no bloquea la ruta crítica interina.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.  
Decision lock: `app/docs/DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.  
Candidata interina: `app/docs/CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.  
Registro counsel post-go-live: `app/docs/PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## No reprocesar

Auth owner/exact identity/Staff membership, I1/I2, Mis Visitas, protected HR authority, histórico request06 congelado y reset consumido. Request08 consumido. Toda continuación `passwordResets=0`; no acceso/reconcile/recovery histórico.

## Ya resuelto

- Provider legal durable exact-identity/versioned/human-only/ACK/fail-closed source-only.
- Perfil legal no-code provider-authoritative multi-tenant.
- Rebranding dinámico separado de IP/titularidad.
- Domicilio registrado residencial recuperado/restringido.
- Evidencias/retención configurables por proyecto.
- Provider Registry dinámico.
- Publicación legal inmutable: perfil mutable → snapshot → render UTF-8/LF → SHA-256 → receipt humano.
- V0.3 y matriz primaria preservadas como soporte de revisión profesional.
- **V0.4 interina creada para go-live con counsel diferido**, sin mostrar marcadores internos al usuario y sin afirmar revisión jurídica inexistente.
- Registro GT/HN/X trasladado a pendiente post-go-live controlado.

## Decisiones humanas cerradas — no volver a preguntar

1. TyA empresa mercantil individual Guatemala.
2. Honduras administrada desde Guatemala por el mismo Operador TyA.
3. Identidad/NIT/contacto inicial confirmados; valores provider no-code, no constantes.
4. Domicilio registrado exacto recuperado/restringido.
5. Evidencia cruda: piso 60 días, default 90 por proyecto.
6. Rebranding previsto; no afirmar marca registrada sin referencia.
7. Titular/licenciante separado de marca.
8. Banco completo bajo controles reforzados; documentos mínimos.
9. Evidencias configurables por proyecto.
10. Providers activos desde runtime/registry; Make/Gemini no actuales mientras estén gated.
11. Arbitraje preferido B2B, no universal para individuales.
12. **Counsel GT/HN queda diferido post-go-live por decisión expresa de Paula; no marcarlo como aprobado.**

## Pendiente ruta crítica I3

1. resolver snapshot público V0.4 desde configuración viva/no-code;
2. materializar `tenantLegalProfile` + `legalContents`/version en `cxorbia-backend-dev` bajo gate exacto;
3. habilitar read model durable en runtime sin localStorage como autoridad;
4. mostrar versión completa y solicitar aceptación exclusivamente humana;
5. provider ACK + receipt exact identity/version/digest/server timestamp;
6. crear request09/continuación nueva, no reutilizar request08;
7. Admin crea/edita un único Shopper nuevo;
8. Auth + claims + membership + profile/shopper + crosswalk exactos;
9. provider readback;
10. login nuevo Shopper + reload + new-tab + segundo contexto;
11. cero fuzzy, otras identidades, resets históricos o providers prohibidos.

## Pendiente legal post-go-live — no bloquear ahora

Counsel posterior resuelve `GT-01..GT-08`, `HN-01..HN-06`, `X-01..X-06`. Si exige cambios materiales, generar versión posterior y reaceptación cuando corresponda.

## Pendiente prototipo / Claude

No rediseñar UI desde backend. Futuro frontend autorizado:
- `configuracion.js`: Legal y cumplimiento no-code;
- `administrabilidad.js`: auditoría y retiro de demo/local tras provider real;
- proyectos: Evidencias y privacidad;
- integraciones: Provider Registry;
- marca/white-label: displayName/estado registral/licenciante separados;
- gate humano: texto completo, versión, casillas no premarcadas y sin `#bnOk` como aceptación.

## Academia

Después del provider real: enseñar configuración vs versión publicada, aceptación humana, reaceptación por cambio material, evidencia por proyecto, retención, banco/documentos, providers, rebranding y que `counsel pendiente` no significa `aprobado`.

## Gate siguiente

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

No aceptación automática. No request08 rerun. Deploy/merge/producción continúan sujetos a sus gates posteriores.
