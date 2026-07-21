# RESULTADO-DIAGNOSTICO-PERMISSION-DENIED-SHOPPERBENEFITS-20260630

## Error reportado

Durante la carga de `shopperBenefits` calculados en Firestore DEV, Firebase respondió:

```text
PERMISSION_DENIED: Missing or insufficient permissions.
```

## Causa raíz

El script escribe en:

```text
tenants/tya/shopperBenefits/{benefitId}
```

Las reglas publicadas en DEV sí tenían reglas para colecciones financieras anidadas dentro de:

```text
tenants/{tenantId}/projects/{projectId}/liquidations/{liquidationId}
tenants/{tenantId}/projects/{projectId}/lots/{lotId}
tenants/{tenantId}/projects/{projectId}/finance/{movementId}
```

Pero todavía no existía una regla específica para la colección top-level:

```text
tenants/{tenantId}/shopperBenefits/{benefitId}
```

Por el deny global, Firestore bloqueó correctamente la escritura.

## Cambio aplicado en repo

Archivo modificado:

```text
firestore.rules
```

Se agregó:

```text
match /shopperBenefits/{benefitId} {
  allow read: if tenantAllowed(tenantId) && (
    isAdmin() ||
    isOps() ||
    isOwnResource()
  );
  allow create, update: if tenantAllowed(tenantId) && isAdmin();
  allow delete: if tenantAllowed(tenantId) && isAdmin();
}
```

## Alcance del cambio

- Admin/super puede crear y actualizar beneficios calculados.
- Ops puede leer beneficios.
- Shopper solo puede leer beneficios propios por `shopperId`.
- No se habilitan pagos reales.
- No se habilita escritura a `paymentLots`, `financialMovements` ni `reconciliations`.
- No se modifica `/app/modules`.
- No se publica Hosting.
- No se toca producción.

## Estado

Cambio creado en GitHub, rama:

```text
feat/firebase-backend-dev-config-20260627
```

Pendiente:

- Publicar reglas Firestore únicamente en Firebase DEV `cxorbia-backend-dev`, si Paula lo autoriza expresamente.
- Reintentar la carga `shopperBenefits`.
