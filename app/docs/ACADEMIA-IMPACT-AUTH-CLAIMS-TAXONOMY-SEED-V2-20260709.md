# Academia impact Auth claims taxonomy seed v2

Fecha: 2026-07-09

## Impacto Academia

Academia debe cubrir:

- persona operativa;
- rol tecnico;
- scope;
- diferencia entre cargo visible y permiso real;
- por que los custom claims deben ser pequenos;
- por que no se usan datos reales en templates;
- como se configura un representante;
- como se configura un coordinador;
- como se configura una franquicia/franquiciado;
- como se configura cliente/marca evaluada;
- que puede hacer financeOperator;
- que puede hacer certificationOperator;
- que ve shopperEvaluator;
- que significa devClaimsDryRun;
- que significa devClaimsWrite.

## Por rol

- SaaS/admin tenant: crea roles/personas y scopes.
- Operacion: asigna representantes/coordinadores por pais/proyecto.
- Finanzas: ve liquidaciones sin datos bancarios crudos.
- Certificacion: administra intentos/carryover sin exponer datos sensibles.
- Cliente/marca: ve solo su proyecto/reportes.
- Shopper: ve solo su propio perfil.
