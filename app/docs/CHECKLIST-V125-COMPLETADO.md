# CHECKLIST V125

- [x] PASS_COMPROBADO — documento.edit/documento.delete/cliente.edit/crm.edit registradas en permissions.js.
- [x] PASS_COMPROBADO — documentos.js gatea editar/eliminar.
- [x] PASS_COMPROBADO — clientes.js gatea guardar edición.
- [x] PASS_COMPROBADO — crm.js gatea move() en el único punto de mutación.
- [x] PASS_COMPROBADO — Documentos/Clientes/CRM registran historial vía CX.automations.logAction() con ctx completo.
- [x] PASS_COMPROBADO — probado en runtime: 4 acciones registradas, move() gatea+audita+muta correctamente, 48×3 roles sin error.
- [ ] NO_ATENDIDO — gap 3 (carpeta externa por referencia opaca).
- [ ] NO_ATENDIDO — gap 4 (vínculo documento↔visita individual).
- [ ] NO_ATENDIDO — gap 5 (identidad de contacto compartida clientes.js/crm.js).
