# SOURCE LOCK — I3.5C-1 · PERIOD-INDEPENDENT IDENTITY ROLL-FORWARD · SOURCE PASS

**Fecha:** 2026-08-17 16:15 -06:00  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `I3_5C_1_SOURCE_PASS__PERIOD_INDEPENDENT__MULTI_TENANT__MULTI_PROJECT__CURRENT_TARGET_STILL_REQUIRES_AUTHORITY__NO_PROVIDER_WRITE`

## 1. Decisión

Se preserva íntegramente el PASS histórico de Auth/identidad Shopper y se corrige la brecha sistémica sin reprocesar identidades.

La solución fuente implementada convierte el crosswalk en una autoridad durable **independiente del período**. Un vínculo exacto materializado una sola vez puede reutilizarse en agosto, septiembre, octubre o cualquier período posterior, siempre que el mismo identificador técnico de origen siga vigente. El `periodKey` no participa en la clave canónica del vínculo.

No se hardcodea `TyA`, `Cinépolis`, agosto, septiembre ni ningún nombre de tenant/proyecto en el contrato reusable.

## 2. Implementación source-only

Archivos funcionales:

- `app/adapters/cxorbia-identity-roll-forward-v1.js`;
- `backend/contracts/cxorbia-identity-roll-forward-v1.json`;
- `tools/qa/cxorbia-identity-roll-forward-gate.mjs`;
- `app/core/backend-config-preview-dev.js` — únicamente carga el adapter reusable en el carril protegido DEV; no modifica módulos UI ni `CX.data` como interfaz pública.

Evidencia:
`app/docs/evidence/ITERATION3-I3-5C-IDENTITY-ROLL-FORWARD-SOURCE-LATEST.json`.

Commits funcionales/source:

- `454bbfe637b7c06634937ca802fe4e767902ea08` — adapter inicial;
- `f207f4a289bf341d678dacbce4252a7e09c224fb` — contrato reusable;
- `b0d9e0efeda3d803116d2953e000673b2d95c483` — gate futuro-período/multi-proyecto;
- `83f1440e1863702a9c07aae5e17842544146eb4f` — boot protegido resiliente;
- `387319b86fcb9591e2d584cc87b7ea5e3b321eb9` — loader protegido DEV.

## 3. Invariantes del mecanismo

El vínculo durable vive en:

`tenants/{tenantId}/shopperIdentityLinks/{identityLinkId}`

No existe mes/período en el path ni en el criterio de resolución.

Cada vínculo debe tener como mínimo:

- `tenantId`;
- `canonicalShopperId`;
- `sourceSystem`;
- `sourceIdentityKey` o alias técnico exacto;
- `status` activo/confirmado/aprobado/materializado;
- `authorityType` confiable;
- `authorityRef` auditable.

Autoridades aceptadas:

- `provider_exact`;
- `tenant_adjudication`;
- `platform_created`;
- `migrated_exact`.

Nombre, email, teléfono, WhatsApp, username, shopperCode o hash derivado de texto humano nunca son autoridad suficiente por sí solos.

## 4. Multi-tenant y multi-proyecto

El resolver aísla primero por `tenantId` y `sourceSystem`.

Luego admite dos scopes:

1. **project-specific:** el vínculo solo aplica al `projectId` exacto cuando el identificador upstream es propio del proyecto;
2. **tenant-wide (`*`):** el vínculo puede reutilizarse entre proyectos del mismo tenant únicamente cuando el identificador upstream es realmente tenant-wide.

No existe fallback entre tenants. Un identificador idéntico en dos tenants puede resolver a dos shoppers canónicos distintos sin colisión.

No se introduce ninguna regla global de Cinépolis. El proyecto actual continúa siendo configuración normal del tenant actual.

## 5. Prueba anti-recurrencia

Gate local source-only:

`PASS_CXORBIA_IDENTITY_ROLL_FORWARD_PERIOD_INDEPENDENT`

Escenarios ejecutados:

- mismo vínculo tenant-wide en `2026-08` → mismo canonical;
- mismo vínculo en `2026-09` → mismo canonical sin nueva adjudicación;
- mismo vínculo en `2027-01` → mismo canonical sin nueva adjudicación;
- tenant B con el mismo source key → identidad distinta y aislada;
- vínculo project-specific no se filtra a otro proyecto;
- vínculo project-specific sí resuelve en su proyecto;
- vínculo que intenta incluir `periodKey` como scope de identidad → rechazado;
- nombre sin ancla técnica → rechazado.

`node --check` PASS para adapter, loader protegido y gate.

## 6. Runtime protegido preparado

Cuando este source llegue a un build DEV autorizado, el adapter:

1. lee `shopperIdentityLinks` del tenant autenticado;
2. filtra solo vínculos con autoridad válida;
3. respeta scope de tenant/proyecto;
4. antes del composer canónico inyecta `profileId` únicamente cuando existe un vínculo durable autorizado;
5. el composer exacto ya existente reutiliza entonces el canonical shopper sin depender del período;
6. si no hay vínculo o hay conflicto, permanece fail-closed/review;
7. una actualización del conjunto de links provoca reconciliación del mismo runtime, sin reautenticar al histórico.

El carril Shopper solo consulta vínculos de su `canonicalShopperId`; roles no operativos no reciben una superficie global de identidad.

## 7. Alta de Shopper desde plataforma

El contrato reusable fija que un Shopper creado desde Administración debe cerrar en la misma transacción lógica controlada:

`Auth → claims → membership → profile/shopper → identity link authorityType=platform_created → provider ACK/readback`.

Ese identity link tampoco depende del período. Por ello el Shopper seguirá resolviendo al abrir futuros meses/proyectos compatibles sin crear otra identidad.

## 8. Estado del target actual de agosto

I3.5B ya demostró que hoy existen `0 shopperIdentityLinks` y `0` fuentes provider exactas independientes para el target de agosto.

La implementación source evita repetir el problema en períodos futuros **después de que exista el primer vínculo autoritativo**, pero no inventa retroactivamente la autoridad que falta hoy.

Por tanto:

- I3.5C-1 source mechanism = **PASS**;
- el target actual sigue `NOT_MATERIALIZED_YET`;
- no se rerun I3.5B;
- no se reprocesa Historical Shopper/Auth;
- no se crea mapping automático por nombre/PII;
- falta exclusivamente I3.5C-2: una autoridad exacta para este vínculo y su materialización provider-backed bajo gate separado.

## 9. Safety

Durante este bloque:

- Historical Shopper login/recovery/reset/access: `0`;
- Auth writes: `0`;
- Firestore writes: `0`;
- identity-link writes: `0`;
- HR writes: `0`;
- Finance writes: `0`;
- Rules/Storage writes: `0`;
- Make/Gemini/payment writes: `0`;
- deploy: `0`;
- merge: `false`;
- production: `false`.

## 10. Progreso

Formal: I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15` = **35% / 65%**.

El score formal no sube hasta I3.11. Operativamente, esta iteración sí cierra la causa sistémica de recurrencia mensual a nivel source.

## 11. Siguiente frontera exacta

`I3.5C-2_ONE_TIME_AUTHORITATIVE_ADJUDICATION_AND_PERIOD_INDEPENDENT_LINK_MATERIALIZATION`.

Requisitos:

1. no repetir diagnóstico general;
2. no rerun I3.5B;
3. usar exclusivamente el target actual;
4. autoridad = tenant adjudication explícita o nueva fuente provider exacta independiente;
5. máximo un upsert idempotente del vínculo period-independent;
6. provider ACK/readback obligatorio;
7. luego probar el mismo vínculo contra agosto y un fixture de septiembre sin crear un segundo vínculo;
8. si PASS, cerrar I3.5 y continuar directamente con I3.8→I3.11 bajo sus gates propios.

## 12. Clasificación

- **Reusable CXOrbia:** contrato period-independent, tenant/project scope, one-time adjudication, future-period reuse.
- **Exclusivo cliente:** únicamente el target actual que necesita materialización; no se codifica en el mecanismo.
- **Claude/prototipo:** no rediseño UI; si muestra revisión de identidad, debe ser por tenant/proyecto/fuente y no por mes.
- **Academia:** enseñar identidad durable vs período operativo y scope tenant/project.
- **Sin impacto Claude:** gate source-only, provider read bridge, source lock/evidence.
