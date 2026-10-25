# ADDENDUM FROZEN — GRAVICENTRA CX — LIQUIDACIONES, REEMBOLSOS, PAGOS Y SOPORTE FINANCIERO/FISCAL

Fecha: 2026-09-28
ID: GRAVICENTRA-CX-POSTPROD-FINANCIAL-SETTLEMENTS-20260928
Estado: FROZEN_POSTPRODUCTION_NON_BLOCKING_PHASE_A
Carril: POST_PRODUCTION / PHASE_B_FINANCIAL_HARDENING
Repositorio: paulaosoriof86/demoCXOrbia
Rama de continuidad: recovery/cxorbia-phase-a-20260831
Producto comunicado: Gravicentra CX
Denominación técnica histórica: CXOrbia puede permanecer en nombres internos hasta una migración de naming expresamente autorizada.

## 1. Precedencia y no bloqueo de Fase A

Este addendum NO reabre I0, I1, I2 ni I3, NO crea I5 y NO modifica el criterio de I4.

La implementación completa aquí descrita se ejecutará después del PRODUCTION_LOCK de Fase A, partiendo exactamente del artefacto productivo sellado.

Estas capacidades nuevas NO son condición adicional para que Fase A salga a producción. No pueden convertirse retroactivamente en gates de I3/I4 ni retrasar el reemplazo productivo si los contratos vigentes de Fase A pasan.

Única excepción: si una prueba vigente demuestra un defecto que ya viola un contrato P0 actual —por ejemplo pago mostrado como confirmado sin fuente, duplicidad, moneda incorrecta, pérdida de trazabilidad o dato financiero fabricado— ese defecto se resuelve dentro de Recovery por su owner exacto. No se amplía Recovery para implementar este addendum.

Durante I3/I4:
- no ejecutar pagos reales;
- no activar DTE, Factura Especial, retenciones ni gross-up;
- no abrir Storage financiero por este addendum;
- no reconstruir Finanzas, Liquidaciones ni Mis Beneficios;
- no sustituir shopperBenefits, paymentLots, financialMovements ni reconciliations;
- no reimportar datos;
- no modificar reglas económicas vigentes;
- no tocar producción salvo I4 autorizado y con el artefacto certificado.

## 2. Auditoría AS-IS de la candidata canónica V92

Baseline auditada:
- product source: b168955f405cd82630a8caad04de0b1766b26fc8
- product tree: 7ee35f25dd6a1c1b6f6a562ed770e9ba80cceeeb
- producción: DO_NOT_TOUCH

Owners/evidencia principal:
- app/modules/finanzas.js — blob d8cdc2268837b49656aa04a00d282f443e894396
- app/modules/beneficios.js — blob 73e200e57530479637792c89c644fcfdf78b6799
- app/core/liquidacion.js — blob b3f4d3fd387ad5dde454d115a7a3a8235fbfaaa3
- app/core/backend-finance-benefits.js — blob dc492b96ede5da4fbd065564a4f130b14b15dd4f
- app/core/backend-cxdata-finance-read.js — blob d3e519f20bb92662e0feb11407a735b36fd13457
- backend/runtime/cxorbia-finance-command-provider-v1.mjs — blob e1c428ca1156cae36ca233cdc3bdeaad4ecccf89
- backend/runtime/cxorbia-finance-phase-a-read-model-v1.mjs — blob 30c6d69acc05fd7fc478db1cf0389870588d4335
- firebase/schema/cxorbia-finance-benefits-v2.json — blob 798963cdd63ea11687dd5abd86d458d98c7ef086
- backend/contracts/liquidations-payments-phase-a-v1.json — blob 2a73926909b57dead046ca19c85da6cc57445c94
- app/core/backend-resources.js — blob 05c3b4b9eb4936c45894ad942a89a7e1725dd6a0
- storage.rules — blob dcd0c8a3e76b3108fe02609d4a6d815903dda860

### 2.1 Clasificación AS-IS

| Capacidad | Clasificación | Estado real |
|---|---|---|
| Admin → Finanzas | IMPLEMENTADA Y FUNCIONAL PARA ALCANCE SOURCE-SAFE | Dashboard, Movimientos, Liquidaciones y Lotes; separación país/moneda, estados de fuente y revisión fail-closed. No equivale a ejecución bancaria. |
| Liquidaciones | IMPLEMENTADA PARCIALMENTE | Existe liquidación derivada de visita y contratos/estados. Falta consolidación multi-visita, versionado y aceptación shopper. |
| Pagos | IMPLEMENTADA PARCIALMENTE | El provider finance.payment.batch hace registro durable interno con ACK/idempotencia. Declara externalPaymentConfirmed=false y bankWrites=0. No ejecuta transferencia bancaria. |
| Movimientos | IMPLEMENTADA PARCIALMENTE | financialMovements existe, tiene lectura conectada y el provider puede registrar movimientos internos. Falta cierre pago ↔ comprobante ↔ confirmación ↔ conciliación. |
| shopperBenefits | IMPLEMENTADA PARCIALMENTE / OPERATIVA EN LECTURA | Colección/esquema/read bridge existen. Se preserva y extiende. |
| paymentLots | IMPLEMENTADA PARCIALMENTE | Colección, lectura y creación durable interna existen. Se preserva como agrupador sin perder granularidad por shopper. |
| financialMovements | IMPLEMENTADA PARCIALMENTE | Modelo y lectura existen; la transferencia externa no está confirmada automáticamente. |
| reconciliations | MODELADA E IMPLEMENTADA PARCIALMENTE | Esquema y sugerencias existen; falta workflow durable completo. |
| Shopper → Mis Beneficios | IMPLEMENTADA Y FUNCIONAL PARA ALCANCE ACTUAL | Filtra shopper autenticado; separa honorarios/reembolsos y moneda; Pagado exige paymentConfirmed + referencia. Falta aceptación/liquidación consolidada/recibo. |
| Documentos/evidencias metadata | IMPLEMENTADA Y FUNCIONAL | Firestore metadata durable y scoped. |
| Storage binario | MODELADO PERO NO CONECTADO / FAIL-CLOSED | uploadBinary existe, pero Storage requiere autorización/rules; storage.rules hoy bloquea read/write. Correcto para Fase A. |
| Trazabilidad proyecto/período/visita | IMPLEMENTADA | tenantId, projectId, periodId/periodKey, visitId, hrRowId, shopper, país y moneda existen. round/cut debe modelarse sin confundirlo con período. |
| Soporte fiscal configurable | NO IMPLEMENTADO COMO CAPA CANÓNICA | Queda para este workstream postproducción. |

### 2.2 Compatibilidad obligatoria

1. shopperBenefits, paymentLots, financialMovements y reconciliations ya existen: no crear reemplazos paralelos.
2. Mis Beneficios ya separa honorarios y reembolsos y exige fuente para considerar pago confirmado.
3. El provider financiero actual es durable, scoped e idempotente, pero no confirma banco externo.
4. El contrato Phase A ya separa honorariumAmount, reimbursementAmount y totalAmount.
5. La ejecución bancaria real está expresamente fuera del alcance actual.
6. Storage binario está deliberadamente cerrado; no se abre antes del cierre Recovery.
7. El read model histórico con literales TyA/Cinépolis/cortes antiguos es evidencia source-safe histórica, no arquitectura global futura.
8. paymentBatches aparece en contratos históricos y paymentLots en la implementación viva. Postproducción adjudicará compatibilidad; no se crean dos verdades.

## 3. Objetivo canónico postproducción

Formalizar:
VISITA → APROBACIÓN → HONORARIO → REEMBOLSO → LIQUIDACIÓN → ACEPTACIÓN SHOPPER → PAGO → COMPROBANTE → CONFIRMACIÓN DE RECEPCIÓN → SOPORTE CONTABLE/FISCAL CONFIGURABLE.

Gravicentra CX será autoridad de trazabilidad financiera.
WhatsApp y Drive NO son repositorios financieros canónicos.
Podrá existir exportación/réplica administrativa sin desplazar la autoridad.

## 4. Principio económico

Mantener siempre separados:
A. HONORARIO DEL SHOPPER.
B. REEMBOLSO DE GASTOS.
C. AJUSTES AUTORIZADOS.

TOTAL A TRANSFERIR = HONORARIOS APROBADOS + REEMBOLSOS APROBADOS + AJUSTES AUTORIZADOS.

La separación es financiera, contable, analítica y fiscal. No implica transferencias bancarias separadas.

## 5. Una sola transferencia

Por cada liquidación de shopper:
- una liquidación vigente;
- una aceptación vigente;
- una transferencia;
- un paymentId;
- un comprobante;
- una confirmación de recepción.

Un lote puede contener muchos shoppers, pero nunca fusiona sus liquidaciones, pagos, comprobantes, aceptaciones ni confirmaciones.

## 6. Reembolsos

Cada gasto reembolsable debe relacionarse con:
tenantId, projectId, periodId, roundId/cutId cuando aplique, visitId, shopperId, país, tipo de gasto, fecha, moneda, monto solicitado, monto aprobado, evidenceRef, estado y motivo de ajuste/rechazo.

Estados:
PENDING, VALIDATED, ADJUSTED, REJECTED, LIQUIDATED, PAID.

Una visita puede tener varios reembolsos.
La evidencia se carga una sola vez y se referencia posteriormente.

## 7. Honorarios

Cada visita conserva:
- honorario esperado;
- honorario aprobado;
- moneda;
- país;
- proyecto;
- período/ronda;
- shopper;
- fecha de elegibilidad;
- estado de liquidación/pago;
- source/audit revision.

Nunca mezclar honorario y reembolso en un solo campo.

Dashboards:
HONORARIOS
REEMBOLSOS
TOTAL TRANSFERIDO

Siempre por moneda; no sumar monedas distintas.

## 8. Liquidación consolidada

Extender el contrato existente; no crear una segunda Liquidaciones.

Una liquidación:
- pertenece a un shopper/proyecto/país/moneda/período-ronda;
- puede contener múltiples visitas;
- tiene versión;
- conserva items/referencias a shopperBenefits y reimbursements;
- calcula honorariumTotal, reimbursementTotal, adjustmentTotal y totalPayable;
- conserva estado, disputa, aceptación vigente y audit refs.

No crear documento por visita cuando las visitas pertenecen a la misma liquidación consolidada.

## 9. Mis Beneficios

Ampliar el módulo existente, no sustituirlo:

1. Por liquidar
2. Liquidaciones
3. Pagados
4. Reembolsos

Cada liquidación muestra honorarios, reembolsos, ajustes, total, visitas de origen, versión, estado, aceptación/disputa y pago/comprobante/confirmación cuando corresponda.

Mantener filtro por shopper autenticado y aislamiento tenant/project.

## 10. Aceptación electrónica

Antes del pago: REVISAR Y ACEPTAR LIQUIDACIÓN.

Registrar de forma inmutable:
liquidationId, shopperId, version, honorarios, reembolsos, ajustes, total, fecha/hora, usuario autenticado y fingerprint/digest de la versión.

Si cualquier monto cambia:
- conservar versión anterior;
- invalidar la aceptación para la versión activa;
- generar nueva versión;
- exigir nueva aceptación.

Permitir REPORTAR DIFERENCIA antes de aceptar.

## 11. Declaración de shopper independiente

Texto congelado:

“Declaro que participo como shopper independiente. Confirmo que la información personal y fiscal proporcionada es correcta según mi conocimiento y reconozco que me corresponde atender las obligaciones tributarias personales que legalmente me resulten aplicables.”

Registrar versión, timestamp, shopper autenticado y digest.

No afirmar exención, condición automática de “no contribuyente” ni liberación de obligaciones legales del tenant/T&A.

## 12. Información fiscal declarativa

Agregar al perfil:
- país de residencia;
- identificación;
- NIT, si tiene;
- persona individual;
- emite factura Sí/No;
- régimen declarado: No informa/no conoce, Pequeño Contribuyente, IVA General, Otro;
- fecha actualización.

En modo fiscal desactivado:
- no exigir factura;
- no bloquear por ausencia de NIT;
- no bloquear por régimen desconocido;
- no bloquear sólo porque el shopper declara que no factura.

Son declaraciones del shopper, no determinaciones tributarias de Gravicentra CX.

## 13. Pago

Una liquidación aceptada puede pasar a PAYMENT_SCHEDULED.

Admin registra:
banco, fecha, referencia, moneda, monto, paymentId, liquidationId.

Crear una entidad payment individual por liquidación y enlazarla al paymentLot cuando corresponda.

El comprobante bancario se carga una sola vez y se referencia desde:
payment → liquidation → shopper → beneficios/reembolsos → visitas → proyecto → ronda.

No guardar credenciales bancarias ni secretos.

## 14. Confirmación shopper

Después de pago mostrar:
PAGO REALIZADO
Honorarios
Reembolsos
Total recibido
Fecha
Referencia bancaria

Acciones:
VER COMPROBANTE
CONFIRMAR RECEPCIÓN

La confirmación es inmutable y auditable.

## 15. Constancia operativa

Generar CONSTANCIA DE LIQUIDACIÓN, PAGO Y RECEPCIÓN con:
shopper, identificación, proyecto, período/ronda, visitas, honorarios, reembolsos, ajustes, total, referencia bancaria, fecha, aceptación, confirmación e identificador único.

Es contractual/operativa/contable.
Nunca denominarla factura, Factura Especial, DTE o documento tributario.
Nunca afirmar que sustituye documentación tributaria obligatoria.

## 16. Capa fiscal independiente

fiscalSupportType:
NONE
INTERNAL_LIQUIDATION
SHOPPER_DTE
SMALL_TAXPAYER_DTE
SPECIAL_INVOICE
FOREIGN_DOCUMENT
OTHER_SAT_AUTHORIZED
ACCOUNTING_REVIEW

Campos:
UUID/document number, fecha, base, impuesto, evidenceRef, estado, observaciones, país, policy version/vigencia.

La ausencia de soporte fiscal no bloquea el flujo operativo mientras la policy fiscal esté desactivada.

Configurable por tenant + country + companyTaxRegime + effectiveFrom/effectiveTo.

Este addendum NO valida la procedencia legal de ningún documento fiscal en una jurisdicción. Toda activación exige validación jurídica/contable vigente y aprobación expresa.

## 17. Factura Especial — preparada, no activa

NO emitir automáticamente.
NO practicar retenciones automáticamente.
NO obligar al shopper a gestionarla.

Compatibilidad futura únicamente si una política legal aprobada la habilita:
- una por shopper/liquidación cuando legalmente proceda;
- no una por visita;
- vínculo con liquidationId y paymentId;
- impuestos/retenciones auditados;
- integración posterior con certificador FEL autorizado;
- XML/PDF/UUID preservados.

## 18. NET SHOPPER GUARANTEED / GROSS-UP — preparado, no activo

Preparar configuración futura para preservar el honorario neto prometido cuando una regla legal aprobada requiera retención.

No activar fórmula, porcentaje ni retención sin regla aprobada, país, vigencia, tenant, pruebas y autorización expresa.

## 19. Deducibilidad

deductibilityStatus:
NOT_EVALUATED
DOCUMENTED_OPERATIONALLY
FISCALLY_SUPPORTED
NON_DEDUCTIBLE
ACCOUNTANT_REVIEW

Gravicentra CX no decide autónomamente deducibilidad. Proporciona evidencia y trazabilidad para revisión contable.

## 20. Acumulados

Por shopper y moneda:

Mensual:
honorarios, reembolsos, total transferido, visitas.

Anual:
honorarios, reembolsos, total transferido, proyectos, visitas.

No derivar automáticamente obligaciones tributarias desde acumulados.
Permitir exportación contable.

## 21. paymentLots

Preservar paymentLots.

Un lote contiene muchos paymentId de shoppers.
Cada shopper conserva liquidación individual, paymentId, honorarios, reembolsos, total, comprobante/referencia, aceptación y confirmación.

No perder granularidad por lote.

## 22. Anticipos y rendición T&A

Preparar posteriormente:
anticipo/transferencia T&A → proyecto → ronda → fondo disponible → liquidaciones shoppers → reembolsos → otros costos → saldo consumido → saldo disponible → liquidación final de ronda.

Una transferencia puede incluir saldo anterior + anticipo siguiente.
No considerar automáticamente todo anticipo utilidad.
No activar tratamiento tributario automático.

La entidad física de fondos se define tras auditoría postproducción para no duplicar una estructura existente.

## 23. Multipaís

Arquitectura financiera común.
Capa fiscal configurable por país.

No aplicar reglas GT por defecto a HN, SV, NI u otros.

Toda policy fiscal llevará country, tenant, vigencia, versión y autoridad/configuración.

## 24. Exportación contable

XLSX/CSV mensual:
shopper, identificación, país, NIT cuando exista, proyecto, ronda/período, honorarios, reembolsos, ajustes, total, paymentId, fecha de transferencia, referencia, soporte de reembolso, fiscalSupportType, fiscalSupportStatus, UUID cuando exista y deductibilityStatus.

La exportación no es segunda fuente de verdad.

## 25. Gates postproducción

Bloquear:
- doble liquidación;
- doble pago;
- reembolso sin visita;
- reembolso mayor al autorizado sin aprobación;
- pago distinto a liquidación sin motivo/auditoría;
- modificación silenciosa posterior a aceptación;
- eliminación destructiva de documentos históricos;
- pérdida de relación pago ↔ liquidación ↔ visita;
- confirmación de pago sin evidencia/autoridad;
- mezcla de monedas;
- comprobante reutilizado para pagos incompatibles;
- automatización fiscal sin policy vigente/aprobada.

No bloquear en modo fiscal desactivado sólo por:
- shopper sin factura;
- shopper sin NIT;
- régimen desconocido/no informado;
- ausencia de Factura Especial.

## 26. Auditoría

Reutilizar entityAuditTrail si satisface el contrato; no crear log paralelo sin necesidad.

Eventos mínimos:
CREATE
EDIT
APPROVE
SHOPPER_ACCEPT
DISPUTE
PAYMENT_SCHEDULE
PAYMENT_EXECUTED
EVIDENCE_UPLOADED
PAYMENT_CONFIRMED
FISCAL_SUPPORT_ADDED
FISCAL_STATUS_CHANGED
CORRECTION

Nunca sobrescribir silenciosamente.

## 27. Experiencia shopper

Mantener simple:
VISITA → APROBADA → LIQUIDACIÓN → ACEPTAR/REPORTAR DIFERENCIA → RECIBIR UNA TRANSFERENCIA → VER COMPROBANTE → CONFIRMAR.

El shopper no debe necesitar entender contabilidad o tributación para cobrar.

## 28. Pruebas obligatorias

Antes de activar productivamente este bloque:
1. honorario Q150;
2. honorario + reembolso;
3. una transferencia por ambos;
4. múltiples visitas en una liquidación;
5. shopper sin NIT;
6. shopper que no emite factura;
7. shopper que sí emite DTE;
8. reembolso con comprobante;
9. reembolso sin comprobante;
10. corrección antes de aceptación;
11. corrección después de aceptación → nueva versión/nueva aceptación;
12. pago por lote;
13. intento de pago duplicado;
14. comprobante bancario único/readback;
15. confirmación shopper;
16. histórico/reload/nueva sesión;
17. exportación contable;
18. capa fiscal desactivada;
19. soporte fiscal simulado sin DTE real;
20. correspondencia Admin ↔ Mis Beneficios.

Además:
idempotencia, RBAC, tenant/project/period/round isolation, currency isolation, Storage upload/readback/delete al activarse, auditoría completa, no localStorage authority y no evidencia física duplicada.

## 29. Plan postproducción

Después del PRODUCTION_LOCK:

B-FIN-0 — AS-IS POST-LOCK
Releer el artefacto productivo exacto y actualizar la matriz.

B-FIN-1 — CANONICAL DATA COMPATIBILITY
Adjudicar estructura física reutilizando shopperBenefits, paymentLots, financialMovements, reconciliations, contratos existentes y entityAuditTrail.

B-FIN-2 — REIMBURSEMENTS + EVIDENCE
Entidad de reembolso y Storage documental seguro si no existe equivalente.

B-FIN-3 — CONSOLIDATED LIQUIDATION + ACCEPTANCE
Liquidación multi-visita, versionado, aceptación/disputa.

B-FIN-4 — PAYMENT + PROOF + RECEIPT CONFIRMATION
Payment individual, lote existente, comprobante único, confirmación shopper y conciliación.

B-FIN-5 — FISCAL SUPPORT ADAPTER
Perfil declarativo, fiscal supports y deductibility; automatización fiscal desactivada inicialmente.

B-FIN-6 — ACCOUNTING / T&A FUNDS
Exportación y luego anticipos/rendición.

Método por bloque:
AUDIT → owner exacto → delta mínimo → tests → DEV → readback → no regresión → promoción con evidencia.

No overlays.
No reconstrucción general.
No segunda fuente financiera.

## 30. Decisiones congeladas

- Gravicentra CX es el nombre comunicado del producto.
- No reconstruir Finanzas, Liquidaciones ni Mis Beneficios.
- No reemplazar shopperBenefits.
- Preservar paymentLots, financialMovements y reconciliations.
- Backend/Firebase será autoridad financiera.
- Storage será autoridad documental cuando sea activado y certificado.
- WhatsApp y Drive no son autoridad financiera.
- localStorage nunca es autoridad financiera.
- Honorario y reembolso siempre separados.
- Una transferencia por liquidación.
- Aceptación versionada.
- Evidencia cargada una sola vez y referenciada.
- Capa fiscal independiente y desactivada por defecto.
- Factura Especial, retenciones y gross-up quedan preparados pero inactivos.
- Multipaís: fiscal configurable por país, nunca global.
- Los porcentajes pueden informar gestión, pero no sustituyen GO/HOLD/NO_GO ni evidencia.
- Ninguna capacidad nueva de este addendum bloquea Fase A por sí misma.
- Producción no se modifica por este addendum.
