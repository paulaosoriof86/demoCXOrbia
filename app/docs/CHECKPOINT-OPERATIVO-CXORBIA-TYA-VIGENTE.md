# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-04  
**Estado:** `SOURCE_STATIC_PASS__CLIENT_PRESTATE_RESTORED__DOMAIN_GATE_ROOT_FIX_APPLIED__FINAL_RUNTIME_RETRY_PENDING__CLOUD_V5_HOLD__NO_PRODUCTION`

## 1. Carril vigente

Continuar únicamente sobre:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- manifest final Phase A;
- árbol funcional `app/` preservado.

Producción `tya-plataforma` permanece intacta.

## 2. Autoridades preservadas

- RC Phase A smoke técnico y visual PASS;
- M1/Corte 1 frozen/aprobado;
- Corte 2A/V174 frozen/aprobado;
- Corte 3/V182 frozen active baseline;
- 29 decisiones únicas cerradas;
- 0 restauraciones requeridas;
- 53/53 blobs críticos PASS en gate source/static;
- navegación y módulos Admin/Cliente/Shopper confirmados por source/static.

## 3. Gate source/static

PASS confirmado:

- run `30910224561`;
- artifact `8892730161`;
- 53/53 blobs;
- 111 scripts;
- cero duplicados;
- report kit PDF/XLSX/PPTX;
- repositorio sin delta;
- writes 0.

## 4. Autoridad HR dinámica

Los gates históricos fueron corregidos para no congelar `616` visitas ni `2026-07`.

Última observación runtime:

- 15 periodos;
- 660 visitas;
- 209 shoppers;
- primera autoridad histórica preservada desde 2025-06;
- último periodo derivado de la fuente viva.

Se mantienen como gates:

- stable keys;
- cero duplicados;
- identidad shopper exacta;
- paridad entre HR, Staff, Cliente y Shopper.

## 5. Acceso Cliente — causa raíz corregida

El HOLD `HOLD_CLIENT_R4_A3_C0_H0_S0` provenía de un selector que solo examinaba el bundle legacy y omitía la identidad Cliente canónica ya materializada el 2 de agosto.

Identidad canónica preservada:

- UID `cxorbia-c6-client-tya-cinepolis-v1`;
- rol `cliente`;
- namespace `staff`;
- tenant `tya`;
- proyecto `cinepolis`.

Se corrigió:

- selección por UID y correo interno exactos;
- validación de claims, membership y sign-in;
- bloqueo ante ambigüedad o colisión;
- cero creación de usuarios;
- cero cambios/resets de contraseña.

## 6. Ejecución autorizada y rollback

La ejecución detectó que faltaba el membership:

`tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1`.

Creó temporalmente exactamente un documento membership dentro del límite autorizado y avanzó al runtime acumulativo.

El gate de dominio se detuvo con:

`CANONICAL_MODULE_MISSING`.

El rollback automático obtuvo:

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

Estado final:

- preestado restaurado: sí;
- claims finales alterados: no;
- membership temporal conservado: no;
- usuarios creados: 0;
- password changes/resets: 0;
- deploy/merge/producción: 0.

Evidencia:

`app/docs/evidence/CORTE6-CLIENT-ACCESS-RUNTIME-FAILURE-LATEST.json`.

## 7. Causa raíz del HOLD de dominio

El test esperaba el nombre histórico inexistente:

`CX.modules.cliente`.

La autoridad funcional real es:

`CX.modules.cli_dashboard`.

Correctivo aplicado:

- gate valida `cli_dashboard`, `miperfil`, `financiero` y `reservas`;
- cualquier fallo identifica el módulo exacto;
- el último periodo se deriva directamente de HR;
- el wrapper deja de reescribir código temporalmente y solo verifica el contrato dinámico.

No se modificó la UI para compensar un error del test.

## 8. Cloud V5

Paquete:

`Prototype development request V5.zip`  
SHA-256: `c55f83fedb9263a99705f9e2cc41ade8a186fe7d9c2e675689d901de43089ed1`.

Decisión:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

Razones principales:

- órbita sobredimensionada en desktop;
- encabezado transversal pesado;
- formulario demasiado alto;
- jerarquía orbital inferior a la referencia;
- desktop y mobile miden ambos `924×540`;
- capturas fuera del manifest;
- residuos V4/HEAD histórico;
- no incluye el backlog frontend acumulado.

Fuentes:

- `AUDITORIA-FOCAL-CLOUD-LOGIN-PORTABLE-V5-20260804.md`;
- `PROMPT-CLOUD-FRONTEND-ACUMULADO-V6-20260804.md`;
- `RESUMEN-PARA-CLAUDE.md`.

No se aplicó V5 a `app/`.

## 9. Pendiente exacto

### ChatGPT

La autorización anterior exigía una sola repetición y quedó consumida. Falta una única autorización de reejecución final para:

```text
SNAPSHOT CLIENTE
→ MEMBERSHIP IDEMPOTENTE
→ READBACK
→ RUNTIME STAFF/CLIENTE/SHOPPER
→ TRES RECARGAS Y NUEVA PESTAÑA
→ HR DINÁMICA
→ FINANZAS/PORTALES/RESERVAS
→ CONSERVAR SOLO CON PASS
→ ROLLBACK AUTOMÁTICO ANTE CUALQUIER FALLO
```

### Cloud

Entregar V6 frontend acumulativa:

- Login/órbita refinados;
- responsive P1;
- PDF P1;
- Excel P2;
- opción Regional;
- copy delegado;
- Ficha Shopper;
- evidencia real y manifest completo.

## 10. Secuencia posterior

```text
FINAL_RUNTIME_RETRY
→ AUDITORÍA FOCAL CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO CON GO
→ BRIDGE FIREBASE SEGURO
→ GATES ACUMULATIVOS
→ ÚNICO DEV SI CAMBIA app/
→ CHECKPOINT_VISUAL_PHASE_A_COMPLETA
→ FREEZE
→ CONFIRMAR PERIODO NUEVO/DISPONIBLES/POSTULACIONES
→ CUTOVER AUTORIZADO
```

## 11. Estado seguro

- cambios funcionales `app/` en este bloque: 0;
- estado proveedor restaurado: sí;
- Hosting/Cloud Run deploys: 0;
- Firestore de negocio/HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## 12. Clasificación

- **Reusable CXOrbia:** autoridad HR dinámica, identidad Cliente canónica, membership idempotente, rollback y gate por módulos reales.
- **Exclusivo cliente:** `tya/cinepolis`, 15 periodos, 660 visitas y 209 shoppers.
- **Cloud/prototipo:** V5 HOLD y V6 acumulativa requerida.
- **Academia:** impacto documentado, actualización final pendiente del GO.
- **Sin impacto Cloud:** Auth, membership, HR, runtime y producción.
