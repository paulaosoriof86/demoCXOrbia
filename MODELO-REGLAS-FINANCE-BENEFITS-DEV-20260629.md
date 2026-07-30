# MODELO-REGLAS-FINANCE-BENEFITS-DEV-20260629

## Estado

Borrador funcional de reglas para Finanzas profundo. No publicado.

Intento de archivo `.rules` bloqueado por la herramienta, por lo que se deja este modelo documentado hasta convertirlo localmente.

## Colecciones cubiertas

```text
tenants/{tenantId}/shopperBenefits/{benefitId}
tenants/{tenantId}/paymentLots/{paymentLotId}
tenants/{tenantId}/financialMovements/{movementId}
tenants/{tenantId}/reconciliations/{reconciliationId}
tenants/{tenantId}/franchiseReimbursements/{reimbursementId}
```

## Lectura

### shopperBenefits

- Admin, owner, superAdmin, finanzas y operaciones pueden leer por tenant.
- Shopper solo puede leer sus propios beneficios.
- Regla crítica: `shopperId` debe coincidir con usuario autenticado o con identidad shopper resuelta por claims/perfil.
- Nunca permitir lectura masiva de beneficios de otros shoppers desde Mis Beneficios.

### paymentLots / financialMovements / reconciliations / franchiseReimbursements

- Solo admin, finanzas u operaciones autorizadas por tenant.
- Shoppers no leen movimientos financieros reales ni conciliaciones internas.

## Escritura

Solo admin/finanzas puede crear o actualizar:

- shopperBenefits;
- paymentLots;
- financialMovements;
- reconciliations;
- franchiseReimbursements.

No se permite delete. Las correcciones se hacen con estado, ajuste o acción auditada.

## Estados permitidos

### shopperBenefits

```text
calculated
pendingValidation
scheduled
partiallyPaid
paid
observed
cancelled
```

### paymentLots

```text
draft
scheduled
paid
partiallyPaid
cancelled
observed
```

### financialMovements

```text
imported
classified
matched
reconciled
ignored
observed
```

### reconciliations

```text
unmatched
suggested
matched
reconciled
dismissed
needsReview
```

### franchiseReimbursements

```text
expected
partial
received
observed
cancelled
```

## Validaciones mínimas

- tenantId del documento debe coincidir con ruta.
- ID del documento debe coincidir con ruta.
- country permitido: GT, HN, OTHER.
- currency permitida: GTQ, HNL, USD, OTHER.
- totalCalculated no negativo.
- totalAmount no negativo.
- expectedAmount y receivedAmount no negativos.
- confidence entre 0 y 1.

## Reglas de negocio protegidas

- Beneficio calculado no equivale a pago real.
- Pago real requiere lote o movimiento financiero.
- Reembolso cliente/franquicia es independiente del pago al shopper.
- Mis Beneficios no puede exponer datos de otros shoppers.
- Shoppers no pueden modificar beneficios, lotes, movimientos ni conciliaciones.

## Gate

Convertir este modelo a archivo `.rules` solo cuando se vaya a validar reglas Finanzas DEV.
No publicar sin autorización explícita.
