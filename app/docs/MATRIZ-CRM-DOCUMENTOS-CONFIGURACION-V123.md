# MATRIZ — CRM / Documentos / Configuración (backlog ítem 10, OLA2)

Auditoría de código real contra `01-BACKLOG-COMPLETO-POR-MODULO.md` sección
10. Evidencia: archivo + línea. Estados: PASS_COMPROBADO, PARCIAL, FAIL,
NO_ATENDIDO (no auditado en esta ronda).

## cliente/tenant/proyecto
**PASS_COMPROBADO** — `modules/clientes.js addClient()` vincula automáticamente
la Cuenta de CRM (`CX.crmStore.addCuenta`/sincroniza `clientId`) — una sola
entidad, no dos fuentes divergentes (`clientes.js:57-64`).

## Contactos
**PASS_COMPROBADO** — clientes.js tiene contactos embebidos por cliente
(`contactos:[{nombre,rol,email,whatsapp}]`, editable en el modal de edición,
`clientes.js:153-155`). CRM tiene su propia entidad Contactos independiente
(`crm.js contactosSeed()/contactos()/addContacto()`) — **dos modelos de
contacto que no comparten identidad** (uno por cliente en clientes.js, otro
por cuenta en crm.js, sin `contactId` cruzado). **PARCIAL**: funciona pero no
es una única fuente de contactos.

## Oportunidades/pipeline
**PASS_COMPROBADO** — `crm.js` tiene pipeline completo (kanban por etapa,
`seed()/list()/add()/move()`, columnas configurables) — ya gateado a
`showFixtures()` desde V117.

## Documentos
**PASS_COMPROBADO** — `modules/documentos.js` tiene CRUD real (agregar/editar/
eliminar/reemplazar archivo), visor a pantalla completa multi-formato
(PDF/imagen/video/Excel/Word vía SheetJS/Mammoth), vinculado a
`p.id`=proyecto activo.

## Carpeta externa por referencia opaca
**FAIL** — no encontrado. `documentos.js` almacena el archivo como data-URL
en memoria/localStorage (`rd.readAsDataURL`), no como referencia opaca a una
carpeta externa (`sourceRef`/`folderRef`). No hay campo `externalFolderRef`
en ningún documento.

## Historial
**PARCIAL** — CRM tiene historial de actividades por oportunidad
(`acts`/`addAct` con timeline), pero **documentos.js no tiene historial de
cambios** (editar/reemplazar un documento no deja rastro de quién/cuándo/
motivo) y **clientes.js tampoco** (editar un cliente no genera entrada de
auditoría).

## Permisos
**PARCIAL** — Configuración SÍ tiene matriz de permisos por acción/rol real
(`configuracion.js:270`, `CX.permissions.matrix()/setActionRoles()`), y
Documentos usa `role==='admin'` para mostrar edit/delete (chequeo de rol
crudo, no `CX.permissions.can()` con contexto) — **no verificado contra
`CX.session.effectiveRole()`**, mismo patrón de riesgo que se corrigió en
otros módulos en V94. **CRM y Clientes no llaman a `CX.permissions` en
absoluto** — cualquier admin puede mover/editar sin gate de acción.

## Estados
**PASS_COMPROBADO** — clientes.js (`Prospecto/Activo`), CRM (`nuevo/calif/
propuesta/negoc/ganado/perdido`) — estados reales, no fabricados.

## Acciones preparadas vs reales
**PASS_COMPROBADO** — WhatsApp desde CRM/Documentos ya está correctamente
etiquetado "borrador manual, no envío automático" (auditado en ronda
anterior, ver reporte de continuación post-V117).

## Vínculos proyecto↔visitas↔documentos
**PASS_ESTRUCTURAL** — `documentos.js` filtra por `pid` (proyecto activo,
correctamente migrado a `period().id` en V113); no hay vínculo explícito
documento↔visita individual (un documento es del proyecto, no de una visita
específica) — coherente con el modelo actual (recursos de proyecto, no de
visita), pero el backlog pedía explícitamente ese vínculo — **NO_ATENDIDO**.

## No hardcodear proveedor de nube
**PASS_COMPROBADO** — ningún nombre de proveedor de storage/nube hardcodeado
en documentos.js/crm.js/clientes.js; el almacenamiento es data-URL local
(prototipo), sin simular un proveedor específico conectado.

---

## Resumen de gaps reales encontrados (no en el reporte anterior)
1. Documentos/Clientes/CRM no verifican `CX.permissions.can()` con contexto
   real — solo `role==='admin'` crudo en Documentos, y ningún gate en
   CRM/Clientes.
2. Documentos y Clientes no tienen historial/auditoría de cambios.
3. No existe el concepto de "carpeta externa por referencia opaca".
4. Documentos no está vinculado a visitas individuales, solo a proyecto.
5. Contactos duplicados entre clientes.js y crm.js sin identidad compartida.

Estos son defectos reales de diseño (backlog no cumplido al 100%), no bugs
de regresión — no se corrigen en esta ronda por ser cambios de alcance
medio-grande (nuevo campo de auditoría + gate de permisos en 3 módulos);
quedan documentados para la siguiente ronda si se prioriza.
