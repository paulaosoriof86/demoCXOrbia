# Resumen para Claude — C6 bloqueado antes de Hosting DEV

- V7.2-P0F1 continúa empalmada y congelada.
- No crear V7.3 ni modificar Login, `app.js`, `layout.css`, módulos o core.
- Los gates de composición Phase A y Lab permanecen PASS.
- Se eliminaron autoridades heredadas del predeploy: manifiesto parcial A+B y conteo HR congelado en 616.
- La autoridad HR viva devolvió 660 visitas y el selector dinámico pasó ese punto.
- El bloqueo vigente no es visual ni de frontend.
- El usuario Auth de Portal Cliente y sus claims pasaron la validación.
- Falla exclusivamente el documento de membresía Cliente requerido por el contrato v2:
  `tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1`.
- No parchar UI para resolverlo.
- No se ejecutó Hosting DEV ni ninguna escritura de datos.
- El siguiente paso backend requiere autorización separada para máximo un write de membresía Firestore en DEV, con snapshot, idempotencia, readback y rollback dry-run.
