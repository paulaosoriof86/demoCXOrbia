# CANDIDATA LEGAL TyA V0.3 — CONSOLIDADA / NO-CODE / REBRAND-SAFE · PARA REVISIÓN JURÍDICA

**Fecha:** 2026-08-15  
**Estado:** `COUNSEL_REVIEW_CANDIDATE__NOT_APPROVED__NOT_PUBLISHED__NO_PROVIDER_MATERIALIZATION__NO_ACCEPTANCE__NO_PRODUCTION`  
**Draft version:** `tya-legal-bundle-v0.3-counsel-review-20260815`  
**Prevalencia:** consolida V0.1 + V0.2 para revisión jurídica. V0.1/V0.2 quedan como antecedentes, no como textos publicables separados.  
**Regla no-code:** los valores específicos del tenant se resuelven desde `tenantLegalProfile`; este archivo no hardcodea NIT, correo, domicilio privado, marca futura ni reglas de un proyecto.

Esta candidata es un documento de trabajo contractual/técnico. No sustituye asesoría jurídica de Guatemala/Honduras y no debe publicarse hasta cerrar los puntos marcados `LEGAL_REVIEW_REQUIRED`.

## 0. Arquitectura jurídica y de publicación

La Plataforma es un SaaS multi-tenant. El texto legal visible para un usuario debe ser una **versión inmutable publicada**, no una plantilla que cambie silenciosamente cuando cambie la configuración no-code.

Reglas obligatorias:

1. El contenido editable del tenant vive en configuración provider-authoritative.
2. Al publicar una versión legal, los valores públicos aplicables se resuelven y se congelan en un snapshot de publicación.
3. El documento canónico mostrado al usuario se genera desde plantilla + snapshot.
4. El `contentDigest` SHA-256 se calcula sobre el contenido canónico ya resuelto; nunca sobre placeholders dinámicos.
5. Un cambio posterior del perfil no reescribe la versión publicada ni su digest.
6. Un cambio material exige evaluación jurídica y, si corresponde, nueva versión y nueva aceptación humana.
7. Domicilio registrado restringido, secretos, credenciales, datos bancarios y demás campos privados nunca entran al snapshot público salvo decisión jurídica explícita.
8. El nombre visible puede cambiar por rebranding; el snapshot conserva el nombre mostrado en cada versión.

Contratos relacionados:
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`;
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`;
- `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`.

# ACUERDO DE USO DE PLATAFORMA, CONFIDENCIALIDAD, PROTECCIÓN DE INFORMACIÓN, PROPIEDAD INTELECTUAL Y TRATAMIENTO DE DATOS

## 1. Identificación y alcance

Este Acuerdo regula el acceso y uso del entorno configurado para `{{tenant.operator.legalDisplayName}}` sobre `{{platform.genericLegalReference}}`, actualmente identificada comercialmente como `{{platform.displayName}}` cuando corresponda (la “Plataforma”).

La contraparte contractual se mostrará desde el snapshot de publicación con la estructura jurídica validada para el país. Para TyA, el modelo de revisión es una persona comerciante individual propietaria de una empresa mercantil individual establecida en Guatemala. La empresa mercantil no debe presentarse como si fuera persona jurídica separada cuando jurídicamente no lo sea.

La Plataforma apoya investigación de mercados, mystery shopping, auditoría de experiencia, operaciones de campo, gestión de visitas, shoppers/evaluadores, certificaciones, cuestionarios, evidencias, liquidaciones, pagos, reportes, Academia y otras funciones habilitadas para cada tenant/proyecto.

El acceso no crea por sí solo relación laboral, sociedad, agencia, franquicia, representación, exclusividad ni vínculo distinto del contrato específico aplicable.

`LEGAL_REVIEW_REQUIRED`: validar fórmula exacta del Operador TyA frente a usuarios de Guatemala y Honduras.

## 2. Cuenta, identidad y autoridad

El Usuario declara que la información de su cuenta es correcta y utilizará únicamente su identidad. La cuenta es personal e intransferible. No podrá compartir contraseñas, enlaces privados, códigos, sesiones, tokens ni dispositivos autenticados con terceros no autorizados.

La Plataforma puede aplicar controles por tenant, proyecto, país, rol, scope, membresía y estado operativo. Los permisos se limitan a lo necesario.

Quien actúe por una organización cliente declara tener autorización suficiente. La organización deberá mantener actualizadas altas, bajas y cambios de permisos.

## 3. Aceptación electrónica humana

La aceptación legal será realizada exclusivamente por el Usuario humano autenticado mediante acción afirmativa específica. No podrá aceptar por el Usuario QA, GitHub Actions, Make, Gemini, IA, scripts, bots, administradores técnicos ni terceros.

La evidencia incluirá como mínimo identidad autenticada exacta, tenant, scope/proyecto cuando aplique, rol, `legalContentId`, versión inmutable, `contentDigest`, timestamp de servidor, método `human_ui` y referencia de auditoría/provider ACK.

Una aceptación de otra cuenta, rol, tenant, proyecto o versión no sustituye la del Usuario cuando el alcance jurídico sea distinto. Banner, navegación, uso continuado, casillas premarcadas o localStorage no constituyen aceptación.

`LEGAL_REVIEW_REQUIRED`: confirmar suficiencia probatoria para términos, confidencialidad y avisos en Guatemala/Honduras.

## 4. Licencia de uso

Se concede una licencia limitada, revocable, no exclusiva, no transferible y no sublicenciable para usar la Plataforma únicamente dentro de funciones/proyectos autorizados. El Usuario no adquiere propiedad sobre software, código, arquitectura, interfaces, diseños, documentación, modelos de datos, reglas de negocio, materiales propios ni componentes licenciados.

## 5. Usos permitidos

Según rol/proyecto, el Usuario podrá consultar información autorizada; gestionar postulaciones, agenda y visitas; aportar evidencias; responder/acceder a cuestionarios; realizar certificaciones; consultar liquidaciones/pagos; gestionar usuarios/proyectos/reportes cuando corresponda; usar Academia y realizar otras operaciones habilitadas.

## 6. Usos prohibidos

Queda prohibido acceder a scopes no autorizados; compartir credenciales; eludir autenticación/roles/gates; falsificar visitas/evidencias/comprobantes/estados; borrar trazabilidad para ocultar errores; extraer masivamente información sin autorización; divulgar información confidencial; introducir malware; realizar fraude, suplantación, acoso, discriminación o represalias; usar secretos/know-how para competir deslealmente; o contactar shoppers/terceros fuera del flujo permitido.

## 7. Información confidencial

Incluye identidad de clientes/shoppers/personal; escenarios, protocolos, cuestionarios y criterios; ubicaciones, agendas y asignaciones; fotos, videos, audios, recibos y archivos; resultados, históricos y métricas; honorarios/reembolsos/pagos; configuraciones e integraciones; código, arquitectura, procesos, metodología, know-how y secretos empresariales; contratos, comunicaciones internas y planes comerciales; datos personales y financieros.

No será confidencial lo que pueda demostrarse que era público legítimamente, ya era conocido lícitamente sin deber de reserva, fue recibido de tercero autorizado o desarrollado independientemente.

## 8. Obligaciones de confidencialidad

El Usuario utilizará información solo para la finalidad autorizada, aplicará cuidado razonable, limitará divulgaciones, evitará copias/descargas innecesarias, protegerá dispositivos/sesiones, reportará incidentes y devolverá/eliminará información al terminar la autorización sujeto a retenciones válidas.

Las obligaciones sobreviven al cierre de cuenta mientras corresponda.

## 9. Evidencias de campo

Las reglas son configurables por proyecto y no se presumen globalmente. Foto, video, audio, geolocalización, comprobante y otros tipos pueden ser `no requerido`, `opcional` u `obligatorio`, con instrucciones, retención y referencia de autorización.

Solo se recolectará evidencia necesaria. Biometría, reconocimiento facial u otros tratamientos de alto impacto requieren gate legal/técnico separado.

`LEGAL_REVIEW_REQUIRED`: validar audio/video/geolocalización por país/proyecto antes de habilitar cada modalidad.

## 10. Principios de tratamiento de datos

Aplicar necesidad, proporcionalidad, finalidad, minimización, control de acceso, segregación tenant/proyecto, trazabilidad, conservación limitada y seguridad razonable.

La aceptación de este Acuerdo no equivale a consentimiento genérico e ilimitado. Consentimientos opcionales o específicos irán separados y no premarcados.

## 11. Categorías de datos

Según rol/proyecto: identidad/contacto; país/ciudad/perfil; roles/membresías/asignaciones; postulaciones/certificaciones; agenda/trazas; cuestionarios/resultados; evidencias autorizadas; liquidaciones/reembolsos/estado de pago; información bancaria necesaria; documentos estrictamente necesarios; registros técnicos/seguridad y comunicaciones operativas.

## 12. Finalidades

Autenticar cuentas; gestionar roles/proyectos; postulaciones/certificaciones; planificar/auditar visitas; procesar evidencias/resultados; liquidaciones/pagos; históricos legítimos; soporte/seguridad/fraude/conflictos; obligaciones contractuales/fiscales/contables/legales; reportes; trazabilidad; Academia y comunicaciones operativas. Marketing se separa.

## 13. TyA y Clientes frente a datos

El Operador TyA podrá determinar finalidades/medios para cuenta, shoppers y operación propia conforme a ley. Cuando un Cliente aporte datos o determine finalidades, las responsabilidades se definirán contractualmente. La Plataforma no autoriza usos incompatibles con la finalidad del proyecto.

## 14. Proveedores tecnológicos

La lista de proveedores actuales no será texto estático. El snapshot de publicación incluirá solo proveedores técnicamente activos que procesen datos y su metadata legal aprobada.

Un proveedor deshabilitado no se describe como receptor actual. Activar un flujo nuevo exige evaluación legal y puede requerir nueva versión. Make y Gemini no se describen como receptores mientras sigan gated/deshabilitados.

`LEGAL_REVIEW_REQUIRED`: revisar contratos/DPAs, ubicaciones, subencargados y transferencias de cada proveedor antes de activarlo.

## 15. Procesamiento transfronterizo

La infraestructura puede implicar procesamiento fuera del país. Antes de habilitar un proveedor transfronterizo se revisarán ley, contrato del Cliente, ubicación, medidas y garantías.

Para TyA, Honduras se opera desde Guatemala por el mismo Operador salvo contrato específico.

`LEGAL_REVIEW_REQUIRED`: confirmar implicaciones contractuales/regulatorias de Honduras desde Guatemala.

## 16. Retención y eliminación

Retención no-code por tenant con override por proyecto sujeto a ley, contrato y legal hold.

Recomendación inicial:
- evidencia cruda: 90 días después de aceptación final, con piso inicial humano 60 días;
- geolocalización precisa: 90 días cuando se habilite;
- resultados/reportes y auditoría operativa relevante: referencia inicial 5 años;
- liquidaciones/pagos y documentación mercantil relevante: referencia inicial 5 años o más si aplica;
- cuenta bancaria completa: mientras sea necesaria y como default hasta 180 días después del último pago/desactivación;
- documentos de identidad: solo mientras exista necesidad contractual/legal;
- receipts legales: 5 años después de terminar relación o más por disputa/obligación.

90 días para evidencia cruda no se presenta como mandato legal. Legal hold suspende borrado relacionado con disputa/investigación/auditoría/requerimiento.

`LEGAL_REVIEW_REQUIRED`: validar matriz final por país/categoría.

## 17. Seguridad

Controles según riesgo: autenticación, mínimo privilegio, segregación tenant/proyecto, cifrado en tránsito, cifrado/protección equivalente para campos sensibles, protección de secretos, logs/auditoría, incidentes, backups/recuperación, revisión humana de conflictos y gates de integraciones/writes.

## 18. Datos bancarios y documentos

Números completos de cuenta bancaria solo cuando sean necesarios para pagos y bajo cifrado/protección, mínimo privilegio, UI enmascarada, trazabilidad de revelado, cero repo/logs/prompts IA/exports no autorizados y eliminación al vencer necesidad/retención.

Documentos: mínimo indispensable; preferir atributo verificado, estado o referencia cuando sea suficiente.

## 19. Incidentes

Reportar accesos no autorizados, credenciales comprometidas, evidencias expuestas, pérdida de dispositivo, envío erróneo, extracción masiva, manipulación o vulnerabilidades. El canal se resuelve desde snapshot de publicación.

## 20. Derechos y solicitudes sobre datos

El Usuario podrá solicitar acceso/corrección y ejercer demás derechos aplicables, con validación de identidad. No se prometerán derechos/plazos inexistentes ni se excluirán derechos imperativos.

`LEGAL_REVIEW_REQUIRED`: confirmar marco privado vigente al go-live en GT/HN y derechos/plazos/canales concretos.

## 21. Propiedad intelectual, rebranding y licenciante

Software, código, arquitectura, interfaces, documentación, esquemas y componentes se protegen por derechos del titular/licenciante.

Nombre visible, registro marcario y titularidad del software son conceptos distintos. Mientras no exista instrumento de cesión a una sociedad futura, no se atribuye software a una marca/entidad sin soporte. El snapshot identifica licenciante válido en esa versión.

El rebranding puede cambiar `platform.displayName`; ello no transfiere derechos. No se afirmará marca registrada sin referencia verificable.

`LEGAL_REVIEW_REQUIRED`: confirmar cadena de titularidad/licencia y estrategia de marca.

## 22. Contenidos de Clientes y Usuarios

Las marcas, instructivos y materiales de Cliente pertenecen a sus titulares salvo pacto distinto. El Usuario autoriza almacenamiento/procesamiento solo en la medida necesaria para el proyecto, contrato, trazabilidad y obligaciones. Resultados/entregables se rigen por contrato TyA–Cliente.

## 23. Secretos empresariales y know-how

Metodologías, configuraciones, procesos, reglas, estrategias y documentación no pública se tratarán como Información Confidencial y, cuando proceda, como secretos empresariales.

## 24. Comunicaciones

TyA podrá enviar comunicaciones operativas necesarias para seguridad, asignaciones, proyectos, certificaciones, pagos, soporte o actualizaciones legales. Promocionales se separan cuando corresponda.

## 25. Exactitud y auditoría

El Usuario registrará información veraz. La Plataforma podrá conservar trazabilidad de cambios, decisiones, versiones, asignaciones y estados. Las correcciones no borrarán silenciosamente la historia cuando sea necesaria auditoría.

## 26. Suspensión y terminación

TyA podrá suspender/cancelar acceso cuando finalice autorización, exista riesgo de seguridad, incumplimiento/fraude, solicitud válida del Cliente u obligación legal. La suspensión no elimina deberes de confidencialidad ni retenciones válidas.

## 27. Responsabilidad

Cada parte responde conforme al contrato y ley. Nada excluye responsabilidades que por ley no puedan limitarse.

`LEGAL_REVIEW_REQUIRED`: revisar límites de responsabilidad, indemnidades y exclusiones por tipo de usuario.

## 28. Cambios al contenido legal

Cambios materiales generan nueva versión inmutable y pueden exigir reaceptación. Un cambio puramente visual de marca no reescribe aceptaciones; si cambia licenciante, operador, tratamiento, proveedores, alcance, retención o controversias, debe evaluarse nueva versión.

## 29. Controversias

### 29.1 B2B / Clientes
Preferencia TyA: negociación de buena fe, conciliación opcional y arbitraje institucional cuando sea válido. Para Guatemala se propone como default de revisión arbitraje institucional con sede en Ciudad de Guatemala; el contrato comercial podrá elegir CRECIG, CENAC u otra institución válida.

### 29.2 Shopper / individual
No se impone cláusula arbitral universal por defecto. Reclamación directa, conciliación cuando proceda y tribunales competentes salvo cláusula específica validada por abogado local.

### 29.3 Honduras
Contratos B2B transfronterizos podrán pactar sede en Guatemala si es válido, sin excluir normas imperativas hondureñas.

`LEGAL_REVIEW_REQUIRED`: validar institución, sede, ley, idioma, árbitros, costos y alcance.

## 30. Ley aplicable

Se determinará por contratante, país, relación y contrato. Los anexos país no eliminan normas imperativas.

`LEGAL_REVIEW_REQUIRED`: fijar GT/HN y conflictos de ley para operación desde Guatemala con campo en Honduras.

## 31. Domicilio y contactos

El snapshot mostrará identificación pública del Operador, identificación tributaria que deba mostrarse, `publicLegalAddress` en nivel aprobado, correo legal/privacidad y canal de incidentes.

El domicilio registrado residencial permanece en `registeredLegalDomicileRestricted` y no se autopublica.

`LEGAL_REVIEW_REQUIRED`: definir dirección completa, localidad suficiente u otro domicilio/canal válido.

# ANEXO A — SHOPPER / EVALUADOR

El Shopper puede postularse, certificarse, gestionar oportunidades/asignaciones/agenda, ejecutar visitas, aportar evidencias, contestar cuestionarios y consultar liquidaciones/pagos según permisos.

No revelará condición de mystery shopping, protocolos, preguntas, resultados, identidad de otros usuarios ni futuras visitas confidenciales. Solo capturará evidencia solicitada y no la reutilizará para redes, portafolio, IA, publicidad o terceros. No simulará visitas, reutilizará evidencia ajena, alterará fechas/comprobantes, delegará visitas ni compartirá cuenta.

Certificaciones previas válidas se preservan conforme a política del proyecto. Ejecutado, liquidado y pagado son estados distintos.

El acceso como Shopper no crea por sí solo relación laboral; la relación concreta se determina por contrato y ley.

`LEGAL_REVIEW_REQUIRED`: revisar independencia/no laboralidad GT/HN para que no contradiga hechos operativos.

# ANEXO B — ADMIN / OPERACIONES / COORDINACIÓN

Operar con mínimo privilegio. Prohibido consultar/exportar datos sensibles sin necesidad, compartir por canales no autorizados, ocultar errores, resolver identidad por fuzzy matching cuando hay conflicto, sobrescribir silenciosamente HR/plataforma o usar banco/documentos/evidencias fuera del proceso. Altas/bajas y roles deben mantenerse actualizados.

# ANEXO C — CLIENTES / REPRESENTANTES

Acceso solo al scope contratado. Deben proteger identidad de shoppers, metodología, resultados no públicos, datos personales e información de TyA. No usar la Plataforma para identificar públicamente, presionar, tomar represalias o contactar shoppers fuera del flujo acordado. El Cliente declara autoridad para aportar datos/materiales.

`LEGAL_REVIEW_REQUIRED`: determinar cuándo se necesita DPA/anexo de tratamiento por Cliente.

# ANEXO D — SUPERADMIN / CONSULTORA / REPRESENTANTE / FRANQUICIADO / ALIADO

Respetar segregación de tenants, evitar acceso por curiosidad, documentar excepciones, proteger integraciones/datos comerciales, no trasladar información entre tenants y aplicar configuración país/proyecto sin volver una regla de cliente lógica global.

# ANEXO PAÍS — GUATEMALA

1. Evidencia de aceptación electrónica considerando Decreto 47-2008, sin afirmar que cualquier clic equivale automáticamente a firma avanzada.
2. Propiedad industrial/secreto empresarial: Decreto 57-2000.
3. Código de Comercio art. 382: conservación de documentos de empresa por no menos de cinco años salvo ley especial.
4. Ley de Arbitraje vigente: Decreto 67-95. Una iniciativa de reforma fue presentada en julio de 2026; no se trata como vigente.
5. La iniciativa 6464 de protección de datos personales continuaba en discusión en julio de 2026; no se presenta como ley general vigente.

`LEGAL_REVIEW_REQUIRED_GT`: identidad contractual; domicilio público; Shopper/no laboralidad; privacidad privada; grabaciones/geolocalización; retención; arbitraje; evidencia electrónica; IP/licenciante.

# ANEXO PAÍS — HONDURAS

1. Aceptación electrónica: Decreto 149-2013 y Acuerdo Ejecutivo 41-2014.
2. Conciliación/arbitraje: Decreto 161-2000.
3. Ley sobre Justicia Constitucional incluye habeas data.
4. Fuentes IAIP siguen identificando un Anteproyecto de Ley de Protección de Datos Personales; no se presenta una ley privada general sin confirmación local.
5. TyA se configura como operador establecido en Guatemala y operando Honduras desde Guatemala; no se presume entidad hondureña distinta.

`LEGAL_REVIEW_REQUIRED_HN`: registro/presencia local; ley aplicable a shoppers; privacidad/habeas data; audio/video/geolocalización; procesamiento transfronterizo; arbitraje/elección de ley; contratación electrónica.

# AVISO RESUMIDO PARA PANTALLA

**Quién opera el servicio.** La identidad pública del Operador se muestra desde la versión legal vigente.  
**Para qué usamos datos.** Autenticación, roles/proyectos/visitas, evidencias, certificaciones, liquidaciones/pagos, soporte, seguridad, auditoría y obligaciones.  
**Qué datos.** Depende del rol/proyecto y aplica minimización.  
**Proveedores.** Solo proveedores activos relevantes de la versión vigente.  
**Retención.** Depende de categoría, proyecto, contrato, ley y legal hold.  
**Derechos/contacto.** Los aplicables a versión/país.

# COPY DE ACEPTACIÓN UI — PROPUESTO

Casilla obligatoria 1, no premarcada:  
`He leído el Acuerdo de Uso, Confidencialidad y Protección de Información aplicable a mi cuenta, rol, país y proyecto, y acepto obligarme conforme a la versión indicada.`

Casilla obligatoria 2, no premarcada:  
`He leído el Aviso de Privacidad aplicable y reconozco cómo se tratarán mis datos para operar la Plataforma y los proyectos autorizados.`

Botón: `Aceptar y continuar`

Texto auxiliar: `Tu aceptación queda vinculada a tu cuenta autenticada, a esta versión y a la fecha/hora registrada por el servidor. Si existe un cambio jurídico material, podremos solicitar una nueva aceptación.`

Consentimientos opcionales irán separados.

# CONDICIONES PARA PASAR DE V0.3 A CANDIDATA PUBLICABLE

- [ ] Abogado Guatemala cerró `LEGAL_REVIEW_REQUIRED_GT`.
- [ ] Revisión Honduras cerró `LEGAL_REVIEW_REQUIRED_HN`.
- [ ] Nivel de domicilio público definido.
- [ ] Identidad contractual validada.
- [ ] Licenciante/IP y rebranding validados.
- [ ] Matriz de retención validada.
- [ ] Evidencia por proyecto validada.
- [ ] Política de controversias validada.
- [ ] Proveedores/transferencias revisados al momento de publicación.
- [ ] Cero marcadores `LEGAL_REVIEW_REQUIRED`.
- [ ] Snapshot de publicación inmutable generado.
- [ ] Todos los placeholders públicos resueltos.
- [ ] `contentDigest` final calculado sobre UTF-8/LF del contenido renderizado.
- [ ] Aprobación expresa de Paula.
- [ ] Solo después: autorización de materialización provider-authoritative.
