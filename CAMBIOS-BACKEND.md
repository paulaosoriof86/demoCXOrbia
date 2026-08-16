# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-15 18:05 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_LEGAL_STOP__LEGAL_PROVIDER_WIRING_SOURCE_ONLY_PASS__TYA_LEGAL_V0_2_NOCODE_DRAFT__REGISTERED_DOMICILE_RESTRICTED__GO_LIVE_35__NO_PRODUCTION`

## Preservado

I1 PASS 15/15 e I2 PASS 20/20. Histórico I3 congelado desde run `31906391682`; reset histórico único consumido; toda continuación `passwordResets=0`; sin acceso/reconcile/recovery histórico.

Request08 run `31909354336` / job `95071998299`: STOP fail-closed `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo ni Auth/Firestore writes. Request consumido, no rerun.

## Autoridad legal durable source-only

Cadena técnica preservada:
- `c3f8fc362a4b2dddb0a19fa3327170f87b5f9eed`
- `09092fec7e95d6ccc33aefb780bffdc0b81ff1a0`
- `0602d6ca0f64280222a4b1522b36f3be77c65c87`

Gate canónico `31913700755` / `95082399402` SUCCESS; gate PR `31913704247` / `95082407608` SUCCESS. Exact identity, human-only, versioned receipt, server timestamp, provider ACK, idempotencia, read model fail-closed y cero localStorage authority preparados. Browser bridge no activado; provider/Auth/Firestore/legal writes reales `0`.

## TyA legal V0.2 no-code / rebrand-safe

Archivos fuente/documentales vigentes:
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`
- `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.2-NOCODE-REVISION-HUMANA-20260815.md`
- `app/docs/DECISION-LOCK-TYA-LEGAL-V0.2-NOCODE-20260815.md`
- base: `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.1-REVISION-HUMANA-20260815.md`

Principios congelados: tenant-specific no hardcode; rebranding dinámico; perfil legal no-code; Provider Registry dinámico; retención configurable; evidencia por proyecto; IP separada de marca; arbitraje diferenciado; banco completo bajo controles reforzados; documentos mínimos.

## Bloque adicional — domicilio registrado recuperado sin exponerlo

Se agotó la búsqueda read-only antes de pedir información manual. El RTU vigente localizado en Drive confirma el establecimiento TyA, NIT/identidad ya validados y el domicilio fiscal/comercial registrado. El domicilio coincide con una residencia privada, por lo que **no se copió el valor exacto al repositorio ni se promovió como texto público**.

Cambios aplicados:

1. `app/docs/DECISION-LOCK-TYA-LEGAL-V0.2-NOCODE-20260815.md`
   - marca el domicilio exacto como recuperado y restringido;
   - elimina la necesidad de volver a preguntarlo a Paula;
   - deja únicamente pendiente la validación jurídica de qué nivel de dirección publicar.

2. `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`
   - reemplaza domicilio único por separación explícita:
     - `operator.registeredLegalDomicileRestricted`;
     - `operator.publicLegalAddress`;
     - `operator.publicLegalAddressMode`;
   - prohíbe autopublicar un domicilio residencial registrado;
   - añade auditoría y revisión humana/legal para la dirección pública.

3. `RESUMEN-PARA-CLAUDE.md` / `PENDIENTES-PROTOTIPO.md`
   - documentan la futura superficie no-code y reducen pendientes reales.

No se guardó la dirección residencial en el repo. No se modificó `/app/modules`, `/app/core` ni entrypoint.

## Investigación y recomendaciones jurídicas conservadoras

- Empresa individual: modelar contraparte como propietaria/comerciante individual de la empresa mercantil, no fingir personalidad jurídica separada de la empresa.
- Conservación: evidencia cruda 90 días default con piso humano 60; documentación comercial/financiera/auditoría/receipts puede requerir cinco años o más, sujeto a norma especial, contrato o legal hold.
- Arbitraje: institucional como default B2B; no imponer universalmente a Shopper/individual sin revisión local.
- Rebranding: usar “la Plataforma” + nombre dinámico; no afirmar marca registrada sin referencia verificada.

## Claude / prototipo

No se modificó UI desde backend. Futuro bloque autorizado debe empalmar:
- `configuracion.js`: Legal y cumplimiento provider-authoritative, incluyendo domicilio registrado restringido vs dirección pública;
- `administrabilidad.js`: retirar semántica demo/local tras provider real;
- proyectos: Evidencias y privacidad;
- integraciones: Provider Registry;
- marca: rebranding/estado registral separado de IP/licenciante.

## Seguridad / efectos reales

Tenant/provider/legalContent/legalAcceptance/Auth/Firestore/HR/Storage/Rules/Make/Gemini/pagos writes `0`; product entrypoint activation `0`; `/app/modules` changes `0`; `/app/core` changes `0`; deploy `0`; merge=false; producción=false.

## Pendiente real

Validación jurídica del nivel de dirección pública; revisión legal GT/HN; consolidación V0.1+V0.2; versión final + SHA-256 final; aprobación humana final. El rebranding no bloquea técnicamente porque el nombre visible es dinámico.

Después: gate provider para materialización, aceptación humana y continuación Admin → único Shopper nuevo.

## Clasificación

- **Reusable CXOrbia / sucesor de marca:** contrato no-code legal multi-tenant, rebrand-safe, Provider Registry, retención, project evidence policy y separación domicilio registrado/publicable.
- **Exclusivo TyA:** valores concretos del tenant, operación Guatemala/Honduras y datos legales recuperados pero no copiados al repo.
- **Claude/prototipo:** superficies no-code; sin parche backend UI.
- **Academia:** actualizar cuando provider real esté activo.
- **Sin impacto Claude inmediato:** investigación legal, decision lock, privacidad del domicilio y documentación.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**
