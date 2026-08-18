# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-18 11:51 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-ROOT-CAUSE-RECOVERY-01`  
**Estado vigente:** `NO_FRONTEND_PATCH_FOR_I3_11C__SOURCE_TRUTH_SYNCHRONIZED__NO_CODE_PRODUCT_CONTRACTS_PRESERVED`

## Estado real Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 formal` hasta cierre integral; I4 `0/25`; I5 `0/15` = **35% / 65%**.

I3.1→I3.8 PASS. I3.9/I3.10 congelados PASS/no rerun. Rules I3.11C ya PASS/verified/consumed; no están pendientes.

Blocker vivo backend/provider:
`I3_11C_EXPECTED_PROVIDER_LINK_NOT_IN_APPLICABLE_RUNTIME_SET`.

Target de cierre QA:
`shp-57d2e3769946 → TYA_GT_0C0BA8856E`; actualmente target link applicable `0`, agosto canonical `0`, residual live `2`.

Siguiente bloque: focal provider identity-link **read-only** bajo nueva autorización; no es tarea UI.

## Qué debe preservar Claude

- prototipo aprobado y contratos actuales;
- interfaz exacta `CX.data`;
- `/app/modules` y `/app/core` sin compensaciones backend ad hoc;
- identidad exacta/crosswalk; cero fuzzy matching por nombre/email/teléfono;
- Staff/Admin existente; no crear UI workaround para un Admin “ausente”;
- I3.9/I3.10 frozen PASS;
- Historical Shopper sin reproceso;
- provider authority y legal durable;
- multi-tenant por `tenantId` + `projectId`;
- Cinépolis como proyecto normal configurable, no global.

## Corrección de continuidad que Claude debe respetar

Fuente operativa machine-readable:
`app/docs/CXORBIA-EXECUTION-STATE.json`.

Índice:
`app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

Source lock estable:
`app/docs/SOURCE-LOCK-CXORBIA-TYA.md`.

Los addenda/source locks fechados son historia salvo activación explícita desde el índice. Si evidencia/HEAD contradice la capa canónica, no se debe “elegir” un documento viejo: se activa `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION` y primero se sincroniza.

## Mejoras locales que deben promoverse al producto reusable

Cada descubrimiento TyA/Cinépolis que represente capacidad general debe entrar al prototipo como patrón reusable, no como parche de cliente. Para cada handoff se debe especificar archivo/módulo, contrato backend, comportamiento, criterios de aceptación y alcance reusable/tenant/project.

### Contratos no-code a preservar/evolucionar

Configuración por tenant/proyecto para:
- país, moneda, timezone, locale;
- fuente de HR/roadmap y mapping;
- períodos/frecuencia;
- documentos e instrucciones;
- reglas/certificación;
- disponibilidad/postulación/asignación;
- agenda/reprogramación/cancelación;
- cuestionario: CXOrbia, TyAOnline, plataforma externa, link general o link por visita;
- ejecución/evidencias/revisión;
- liquidación/pagos;
- roles/scopes/notificaciones;
- integraciones/gates;
- privacidad/retención;
- Academia/manuales/cursos/rutas.

### Fuentes de roadmap/proyecto objetivo

El producto debe poder incorporar adapters configurables para:
- Google Sheets;
- Excel;
- CSV;
- API;
- CXOrbia nativo;
- import manual;
- plataforma/proveedor externo;
- link externo cuando aplique.

El dominio no debe cambiar según la fuente.

### Flujo objetivo de Project Builder

`crear proyecto → seleccionar/configurar source → mapear campos → dry-run → validar conflictos/IDs → activar → monitorear sync`.

El backend define contratos/adapters; Claude/prototipo implementa las superficies visuales/no-code correspondientes cuando su bloque llegue. No crear lógica específica “Cinépolis” para resolver capacidades generales.

## I4 — backlog visual/operacional que sí llegará a Claude

Después de I3 integral PASS, el trabajo visible se organiza por capacidades:
1. documentos/instrucciones/certificación + disponibles/postulación/asignación;
2. agenda/reprogram/cancelación + ejecución/evidencias/cuestionario/submit/review;
3. Finanzas/liquidaciones/pagos + multi-proyecto/configuración;
4. roles/scopes/notificaciones/integraciones y soporte a HR bidireccional;
5. estados vacíos/errores/conflictos/revisión humana coherentes con contratos backend.

No asumir que un módulo “existe” equivale a que está Phase-A complete; cada slice debe tener criterios E2E y autoridad backend correcta.

## Academia / manuales / notificaciones

Cualquier cambio funcional que altere acciones del usuario, rol, certificación, agenda, ejecución, cuestionario, evidencias, pagos o configuración debe producir también actualización del material correspondiente. Esto debe registrarse junto al cambio, no como trabajo olvidado al final.

## Clasificación de este bloque

- **Reusable CXOrbia:** state machine documental, no-code config/product contracts.
- **Exclusivo TyA/Cinépolis:** IDs de QA y reconciliación actual solamente.
- **Claude/prototipo:** handoff futuro de Project Builder/configuración y módulos I4; sin parche actual.
- **Academia:** integración obligatoria por cambio operacional.
- **Sin impacto Claude inmediato:** adjudicación focal provider identity-link.

## Prohibiciones actuales

No parchear UI para esconder el HOLD, no hardcodear el shopper target, no duplicar provider logic, no recrear Admin/Shopper, no volver a I3.9/I3.10, no hacer lógica por mes/proyecto/tenant en módulos.
