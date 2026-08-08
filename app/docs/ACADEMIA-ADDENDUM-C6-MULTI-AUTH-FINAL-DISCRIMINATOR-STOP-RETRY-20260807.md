# ACADEMIA — Addendum C6 Multi-Auth Final Discriminator

## Caso incorporable a Academia

El bloque demuestra un patrón reutilizable de gobernanza de identidad: dos cuentas pueden cumplir simultáneamente el mismo contrato técnico de acceso y, aun así, no existir evidencia suficiente para decidir automáticamente cuál es la identidad canónica.

### Evidencia

- mismo tenant/proyecto/rol shopper;
- mismo vínculo shopperId source-safe;
- password provider presente en ambas;
- mismos claims allowlisted presentes;
- cero marcadores source/batch/migration/import en ambas;
- cero discriminadores decisivos;
- selectores débiles expresamente prohibidos.

### Aprendizaje

Un sistema multi-tenant no debe convertir una diferencia incidental —orden, antigüedad, estado habilitado o verificación de correo— en autoridad de identidad. Cuando la evidencia técnica válida es simétrica, el control correcto es `STOP_RETRY` y adjudicación humana explícita del tenant.

### Trazabilidad

```text
run=31199988897
artifact=9002409950
decision=STOP_RETRY_C6_MULTI_AUTH_FINAL_DISCRIMINATOR_TENANT_ADJUDICATION_REQUIRED
```

### Impacto en manuales/cursos

Agregar a seguridad y operación:

1. diferencia entre autenticación válida e identidad canónica;
2. allowlist de señales técnicas;
3. prohibición de selectores arbitrarios;
4. fail-close ante empate;
5. separación entre adjudicación read-only y posterior write de retiro de acceso.

No hay cambio en rutas por rol, UI o notificaciones en este bloque.
