# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-15 17:52 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_LEGAL_STOP__LEGAL_PROVIDER_WIRING_SOURCE_ONLY_PASS__TYA_LEGAL_V0_2_NOCODE_DRAFT__GO_LIVE_35__NO_PRODUCTION`

## Preservado

I1 PASS 15/15 e I2 PASS 20/20. Histórico I3 congelado desde run `31906391682`; reset histórico único consumido; toda continuación `passwordResets=0`; sin acceso/reconcile/recovery histórico.

Request08 run `31909354336` / job `95071998299`: STOP fail-closed `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo ni Auth/Firestore writes. Request consumido, no rerun.

## Autoridad legal durable source-only

Cadena técnica preservada:
- `c3f8fc362a4b2dddb0a19fa3327170f87b5f9eed`
- `09092fec7e95d6ccc33aefb780bffdc0b81ff1a0`
- `0602d6ca0f64280222a4b1522b36f3be77c65c87`

Gate canónico `31913700755` / `95082399402` SUCCESS; gate PR `31913704247` / `95082407608` SUCCESS. Exact identity, human-only, versioned receipt, server timestamp, provider ACK, idempotencia, read model fail-closed y cero localStorage authority preparados. Browser bridge no activado; provider/Auth/Firestore/legal writes reales `0`.

## Draft legal V0.1

Creado previamente para revisión humana:
`app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.1-REVISION-HUMANA-20260815.md`.

No aprobado, no materializado y sin aceptación.

## Bloque 2026-08-15 17:52 — TyA V0.2 no-code / rebrand-safe

Paula confirmó las decisiones faltantes y reiteró que la plataforma debe ser **no-code** y que el producto tendrá **rebranding**. Se avanzó sin provider writes.

### Archivos creados

1. `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`
   - contrato reusable multi-tenant;
   - valores específicos de TyA prohibidos en runtime code;
   - perfil legal provider-authoritative editable desde UI autorizada;
   - brand/rebrand dinámico;
   - licenciante separado de marca;
   - Provider Registry dinámico;
   - política de retención tenant + override por proyecto;
   - banco/documentos sensibles;
   - evidencias por proyecto;
   - controversias configurables;
   - cambios materiales obligan evaluación/versionado sin reescribir históricos.

2. `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.2-NOCODE-REVISION-HUMANA-20260815.md`
   - incorpora decisiones humanas y cláusulas de reemplazo;
   - usa “la Plataforma” + `platform.displayName` dinámico en vez de hardcodear CXOrbia/Gravicentra;
   - modelo de operador como comerciante individual/empresa mercantil individual;
   - Honduras operada desde Guatemala por el mismo operador TyA;
   - contactos editables;
   - retención recomendada;
   - proveedores derivados del estado real;
   - arbitraje diferenciado B2B/individual;
   - cuentas bancarias completas solo bajo controles reforzados;
   - evidencia configurable por proyecto.

3. `app/docs/DECISION-LOCK-TYA-LEGAL-V0.2-NOCODE-20260815.md`
   - congela decisiones humanas para no volver a preguntarlas;
   - no contiene credenciales, banco ni documento de identidad crudos;
   - no sustituye el source lock técnico de I3.

### Decisiones humanas aplicadas

- TyA es empresa mercantil individual establecida en Guatemala; la propietaria/comerciante individual es la contraparte contractual adecuada salvo revisión del abogado.
- Honduras se opera desde Guatemala por el mismo Operador TyA; no se presume entidad hondureña.
- El contacto inicial legal/privacidad/incidentes ya fue confirmado, pero debe materializarse luego como dato del tenant y permanecer editable sin deploy.
- Rebranding: el nombre de producto no puede ser una constante jurídica perpetua.
- Marca visible y titularidad/licencia de software son entidades distintas; no afirmar marca registrada si no existe referencia verificable.
- Mientras no haya cesión formal a una futura entidad, la titularidad/licencia debe atribuirse a quien pueda acreditar los derechos; un cambio UI no transfiere IP.
- Evidencia cruda: piso humano 60 días; default recomendado 90 días por proyecto.
- Registros comerciales/financieros/auditoría/receipts: referencia conservadora de cinco años cuando corresponda; legal hold suspende borrado.
- Números de cuenta completos permitidos con cifrado/protección, mínimo privilegio, máscara en UI y retención limitada; cero repo/logs/prompts IA.
- Documentos: mínimo indispensable.
- Foto/video/audio/geolocalización/comprobantes: configuración por proyecto desde Crear/Editar proyecto.
- Make/Gemini no son receptores actuales mientras estén gated; Provider Registry reflejará solo proveedores realmente habilitados.
- Preferencia por arbitraje: institucional en B2B; no imponer universalmente a Shoppers/individuales sin validación por país.
- Revisión profesional final GT/HN: sí.

### Fundamento jurídico verificado en esta iteración

- Código de Comercio de Guatemala: comerciante individual ejerce en nombre propio; la empresa mercantil es una cosa mercantil; la personalidad jurídica propia y distinta corresponde a sociedades mercantiles constituidas como tales.
- Código de Comercio art. 382: documentación de la empresa por no menos de cinco años, salvo ley especial.
- Decreto 67-95: Ley de Arbitraje de Guatemala vigente; existe iniciativa de reforma en 2026, no tratada como ley vigente.
- CRECIG y CENAC operan como centros institucionales de arbitraje/conciliación; V0.2 recomienda CRECIG para B2B como default de propuesta, sujeto al contrato y revisión legal.
- Honduras: Decreto 161-2000 Ley de Conciliación y Arbitraje como referencia local.
- Iniciativas guatemaltecas de protección integral de datos siguen en trámite en 2026; no se inventa una ley general vigente.

## Claude / prototipo

No se modificó `/app/modules` ni `/app/core` desde backend. Queda documentado para frontend:
- `configuracion.js`: evolucionar de “Guardar NDA” local a Legal y cumplimiento provider-authoritative;
- `administrabilidad.js`: retirar semántica demo/local solo después de provider real;
- proyecto: Crear/Editar > Evidencias y privacidad;
- integraciones: Provider Registry;
- marca: rebranding y estado de marca separado de licenciante/IP.

Todos los valores de tenant deben ser editables desde la plataforma viva, no desde código.

## Seguridad / efectos reales

Tenant/provider/legalContent/legalAcceptance/Auth/Firestore/HR/Storage/Rules/Make/Gemini/pagos writes `0`; product entrypoint activation `0`; `/app/modules` changes `0`; `/app/core` changes `0`; deploy `0`; merge=false; producción=false.

## Pendiente real

Domicilio comercial/legal público adecuado; nombre visible temporal/final si rebranding no está cerrado; revisión jurídica GT/HN; consolidación V0.1+V0.2; versión final + SHA-256 final; aprobación humana final. Solo después: gate provider para materialización, aceptación humana y continuación Admin → único Shopper nuevo.

## Clasificación

- **Reusable CXOrbia / sucesor de marca:** contrato no-code legal multi-tenant, rebrand-safe, Provider Registry, retención y project evidence policy.
- **Exclusivo TyA:** valores concretos del tenant, operación Guatemala/Honduras, preferencias y datos de contacto.
- **Claude/prototipo:** superficies no-code por configuración/proyecto; sin parche backend de UI.
- **Academia:** actualizar manuales cuando provider real esté activo, explicando versionado, rebranding, evidencias por proyecto y aceptación humana.
- **Sin impacto Claude inmediato:** investigación legal, decision lock y documentación.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**
