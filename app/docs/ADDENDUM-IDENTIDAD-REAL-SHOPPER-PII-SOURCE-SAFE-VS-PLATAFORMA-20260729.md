# ADDENDUM — Identidad real de shopper: source-safe no significa UI anonimizada

Fecha: 2026-07-29  
Estado: ACTIVO Y VINCULANTE

## 1. Corrección conceptual

La protección `source-safe` existe para impedir que nombres, teléfonos, correos, DPI, datos bancarios, NDA y otros datos personales queden expuestos en GitHub, logs, evidencias, fixtures o artefactos de diagnóstico.

**No significa que la plataforma operativa de TyA deba ocultar la identidad real del shopper a los roles autorizados.**

La migración final debe conservar la información real, vigente y útil del shopper en el backend canónico, con control de acceso por rol y propósito.

## 2. Fuente real vigente

El legacy operativo actual es Firebase `tya-plataforma`. El refresh autorizado leyó en vivo Firebase Realtime Database, nodo `tya_shoppers_extra`, exclusivamente para shoppers y certificaciones.

La evidencia GitHub es deliberadamente sanitizada; por eso no contiene nombres, teléfonos, correos, DPI, banco, NDA ni respuestas pregunta por pregunta. Esto no elimina esos datos de la fuente ni autoriza perderlos durante la migración.

## 3. Política de materialización de identidad

Cuando se autorice el write plan real:

- `cxorbia-backend-dev` debe recibir el perfil real del shopper directamente desde las fuentes autorizadas, sin pasar PII cruda por el repositorio;
- nombre e identidad operativa deben conservarse;
- teléfono, correo, país, ciudad y demás campos útiles deben migrarse cuando existan y sean pertinentes;
- DPI/documentos de identidad, banco, NDA, adjuntos y equivalentes deben almacenarse solo si realmente aplican, bajo acceso restringido/protección adecuada; nunca como texto crudo en GitHub;
- no sobrescribir silenciosamente un valor real no vacío cuando dos fuentes difieran: el conflicto pasa a revisión;
- la certificación histórica debe quedar enlazada al perfil real correspondiente.

## 4. Visibilidad por rol

La UI final no debe mostrar `Shopper protegido` como identidad permanente cuando existe un perfil real autorizado.

- Admin/Operativo TyA: identidad y datos operativos necesarios para gestionar al shopper.
- Shopper: su propio perfil e historial permitido.
- Cliente: solo los datos expresamente autorizados para su operación/proyecto.
- Academia/reportes/logs técnicos: minimizar PII según necesidad.

La seguridad se implementa con Auth/RBAC/Rules y separación de datos, no sustituyendo el nombre real por hashes en la experiencia operativa autorizada.

## 5. Dedupe no equivale a ocultamiento

Mantener la regla `no name-only automerge` no contradice mostrar identidad real.

Su objetivo es evitar unir por error a dos personas solo porque sus nombres coinciden o fueron escritos de forma distinta. La identidad puede leerse y mostrarse; para fusionar registros se exigen llaves/evidencias suficientes o revisión humana.

## 6. Crosswalk por visita — resultado vigente

El gate autorizado contra `cxorbia-backend-dev` usó HR source-safe + visitas canónicas existentes y solo evidencia exacta de visita.

Resultado:
- 210 referencias shopper HR;
- 201 resueltas hacia un shopper canónico existente;
- 9 aún no resueltas;
- 616 visitas HR con shopperRef;
- 571 visitas con identidad exacta recuperada;
- 45 sin visita canónica histórica suficiente para derivar identidad;
- 0 conflictos multi-shopper;
- 0 writes, Auth changes, deploy o producción.

El primer intento produjo 0 matches por un defecto del gate: trataba espacios en `sourceSheet/hrRowId` como inválidos. Se corrigió la causa raíz; los nombres de pestaña/row identity son evidencia operacional, no PII de shopper. El rerun v2 resolvió 201/210.

## 7. Próximo objetivo

Resolver las 9 referencias restantes sin perder identidad real y sin crear duplicados. La siguiente reconciliación debe utilizar la información real autorizada del shopper como fuente de perfil, manteniendo PII fuera del repo y enviando únicamente conflictos genuinos a revisión.

## 8. Clasificación

- Reusable CXOrbia: separación `PII en backend protegido` vs `artefacto source-safe`, RBAC y dedupe por evidencia.
- Exclusivo cliente: campos y fuentes TyA, legacy `tya-plataforma` y HR Cinépolis.
- Claude/prototipo: cuando el backend canónico tenga perfiles reales, la UI debe renderizar identidad real autorizada, no placeholders permanentes.
- Academia: explicar privacidad por rol, PII, dedupe, identidad y trazabilidad.
- Sin impacto Claude inmediato: crosswalk/provider read actual.

## 9. Estado seguro

Este addendum no autoriza writes, import, Auth changes, deploy, merge ni producción.
