# RESUMEN PARA CLAUDE — Addendum C6 IAM read-only inventory

No hubo cambios en `/app/modules`, `/app/core`, rutas, estilos, textos ni UX.

El inventario IAM read-only encontró únicamente:

```text
Default Compute service account
Firebase Admin SDK service account
```

Ambas identidades están excluidas para el runtime aislado. No existe una identidad reutilizable demostrada.

```text
decision=ADMIN_IDENTITY_CREATION_REQUIRED
deploy=0
providerReads=0
iamWrites=0
```

Claude no debe mostrar una integración nueva ni un ejecutor disponible. El `direct_trusted_runner` continúa sin desplegar.
