# PAQUETE CONCENTRADO DE REVISIÓN JURÍDICA — TyA GT/HN · V0.3

**Fecha:** 2026-08-15  
**Estado:** `COUNSEL_REVIEW_PACKAGE__NO_PROVIDER_WRITE__NO_ACCEPTANCE__NO_PRODUCTION`  
**Documento a revisar:** `CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md`

## 1. Objetivo

Reducir la revisión profesional a decisiones jurídicas concretas. No se solicita al abogado rediseñar la Plataforma ni sustituir la arquitectura técnica ya definida. Debe validar/corregir el texto contractual, los anexos país y los puntos marcados `LEGAL_REVIEW_REQUIRED`.

La revisión no autoriza publicación, materialización provider, aceptación de usuarios, Firebase/Auth/Firestore/Storage/HR/Make/Gemini, deploy, merge ni producción.

## 2. Arquitectura ya fijada — no requiere rediseño jurídico

- SaaS multi-tenant y multi-proyecto.
- Valores específicos de cada tenant/proyecto configurables no-code desde provider authority; no hardcodeados.
- Rebranding: el cuerpo utiliza principalmente “la Plataforma”; nombre visible dinámico y estado marcario separado.
- Marca visible, registro de marca y titular/licenciante del software son conceptos distintos.
- Aceptación exclusivamente humana, asociada a identidad autenticada exacta, rol/scope, versión y digest; timestamp de servidor y provider ACK.
- No localStorage como autoridad legal; no aceptación por QA/bot/IA/Make/Gemini/administrador técnico.
- Perfil legal mutable separado de publicación legal inmutable.
- Antes de publicar: resolver únicamente valores públicos aprobados, congelarlos en snapshot, renderizar contenido canónico UTF-8/LF y calcular SHA-256 después del render.
- Una edición no-code posterior no reescribe la versión aceptada; un cambio jurídico material exige evaluación y nueva versión cuando corresponda.
- Domicilio registrado residencial completo clasificado como restringido; nunca se autopublica.
- Evidencias foto/video/audio/geolocalización/comprobantes configurables por proyecto.
- Provider Registry: solo un proveedor técnicamente activo y jurídicamente documentado puede aparecer como receptor actual.

Contratos técnicos de referencia:
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`
- `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`

## 3. Hechos TyA que deben asumirse para la revisión

Estos hechos ya fueron confirmados y no deben volver a solicitarse salvo contradicción jurídica/documental:

- TyA opera en Guatemala como empresa mercantil individual de su propietaria/comerciante individual.
- Honduras se administra desde Guatemala por el mismo Operador TyA; no se presume entidad hondureña distinta.
- Identidad tributaria y contacto inicial están verificados fuera del código y serán campos no-code provider-authoritative.
- El domicilio fiscal/comercial registrado fue recuperado de RTU y coincide con residencia privada; se conserva restringido. Debe definirse qué dirección/localidad/canal debe mostrarse públicamente.
- Existe rebranding previsto; no afirmar registro de marca mientras no exista referencia registral verificada.
- Preferencia de TyA: arbitraje para relaciones B2B, sin imponerlo universalmente a Shopper/usuarios individuales sin validación local.
- Evidencia cruda: piso operativo inicial 60 días; default recomendado 90 días por proyecto, sujeto a contrato/ley/legal hold.
- Cuenta bancaria completa puede almacenarse solo cuando sea necesaria y con protección/cifrado, mínimo privilegio, UI enmascarada y retención limitada. Documentos: mínimo indispensable.
- Las reglas de captura de evidencia varían por proyecto.
- Make/Gemini no son receptores actuales mientras sigan gated/deshabilitados.

## 4. Guatemala — decisiones solicitadas al abogado

### GT-01 · Identidad contractual
Validar la fórmula contractual correcta para persona comerciante individual + empresa mercantil individual y la manera de presentar el nombre comercial sin atribuir personalidad jurídica inexistente.

### GT-02 · Dirección pública
Definir el mínimo jurídicamente suficiente en términos/aviso: dirección completa, localidad/municipio/departamento, dirección comercial distinta o canal de notificaciones. El domicilio residencial registrado completo debe permanecer restringido salvo obligación legal expresa.

### GT-03 · Shopper / naturaleza de la relación
Revisar la cláusula que indica que el acceso a la Plataforma no crea por sí solo una relación laboral. Confirmar redacción que no pretenda alterar la calificación que derive de los hechos reales de cada relación.

### GT-04 · Aceptación electrónica
Confirmar que la evidencia propuesta —usuario autenticado, acción afirmativa, versión, digest, timestamp de servidor y auditoría— es una base adecuada para aceptación de términos/avisos/confidencialidad, diferenciándola cuando proceda de una firma electrónica avanzada u otros actos con formalidades especiales.

### GT-05 · Privacidad
Confirmar marco privado vigente al momento de publicación, derechos/canales/plazos aplicables y tratamiento contractual adecuado. La Iniciativa 6464 no debe citarse como ley vigente mientras siga siendo iniciativa.

### GT-06 · Foto/video/audio/geolocalización
Definir requisitos por tipo de captura, especialmente audio, personas identificables, geolocalización precisa y cualquier tratamiento de alto impacto. Determinar qué debe pedirse al Cliente/proyecto antes de habilitarlo.

### GT-07 · Retención
Validar la matriz: 60/90 días para evidencia cruda como regla operativa, 5 años de referencia para documentación empresarial/financiera/auditoría cuando corresponda, cuenta bancaria completa con retención limitada y legal hold.

### GT-08 · Controversias
Validar negociación/conciliación/arbitraje institucional para B2B: institución, sede, idioma, número de árbitros, ley aplicable, costas y materias arbitrables. Confirmar tratamiento separado para usuarios individuales.

## 5. Honduras — decisiones solicitadas al abogado/revisor local

### HN-01 · Operación desde Guatemala
Confirmar si la actividad de field operations/mystery shopping en Honduras desde un operador guatemalteco exige registro, presencia, permisos, establecimiento u otra formalidad según alcance real de la operación.

### HN-02 · Contratación/aceptación electrónica
Validar el uso de aceptación electrónica de términos y evidencia propuesta frente al Decreto 149-2013 y su Reglamento, distinguiendo actos que requieran formalidad adicional.

### HN-03 · Privacidad y habeas data
Confirmar marco privado aplicable, derechos y obligaciones actuales. Las fuentes oficiales consultadas siguen publicando el documento como “Anteproyecto de Ley de Protección de Datos Personales”; no presumir una ley general privada sin confirmación local.

### HN-04 · Evidencias
Validar foto/video/audio/geolocalización y requisitos de información/consentimiento/autorización según contexto del proyecto.

### HN-05 · Arbitraje transfronterizo
Confirmar validez y conveniencia de pactar sede en Guatemala en contratos B2B vinculados con Honduras, normas imperativas, reconocimiento/ejecución y materias no arbitrables.

### HN-06 · Shopper / relación jurídica
Revisar redacción de independencia/no laboralidad conforme a hechos y derecho hondureño, sin usar una cláusula de plataforma para predeterminar la naturaleza jurídica de una relación.

## 6. Puntos transversales

### X-01 · Rebranding y marca
Confirmar copy que permita utilizar nombre comercial no registrado sin sugerir registro. Validar qué aviso debe mostrarse cuando exista solicitud/registro futuro.

### X-02 · Titular/licenciante del software
Confirmar redacción temporal que identifique al titular/licenciante que pueda acreditar derechos actualmente. Una futura marca o sociedad solo debe figurar como titular después de instrumento jurídico válido.

### X-03 · Proveedores y transferencias
Definir documentación mínima por proveedor activo: finalidad, categorías de datos, ubicación/procesamiento, subencargados, contrato/DPA y transferencias. Validar que proveedores deshabilitados no se presenten como receptores actuales.

### X-04 · Datos bancarios
Validar base/aviso/retención para números de cuenta completos de shoppers, controles de acceso y eliminación/referencia enmascarada posterior.

### X-05 · Cliente vs TyA en datos
Definir criterios para determinar responsable/encargado u obligaciones equivalentes y cuándo exigir anexo/DPA por Cliente/proyecto.

### X-06 · Responsabilidad e indemnidad
Proponer límites/exclusiones/indemnidades válidos para B2B y tratamiento separado de usuarios individuales, sin excluir responsabilidades imperativas.

## 7. Fuentes oficiales ya verificadas — punto de partida, no sustituyen revisión profesional

### Guatemala
- Congreso de la República: Decreto 47-2008, Ley para el Reconocimiento de las Comunicaciones y Firmas Electrónicas.
- Congreso de la República: Decreto 67-95, Ley de Arbitraje.
- Congreso de la República: Decreto 57-2000, Ley de Propiedad Industrial, incluidos secretos empresariales.
- Organismo Judicial: Código de Comercio, artículo 382, conservación de documentos empresariales por no menos de cinco años salvo ley especial.
- Congreso de la República: Iniciativa 6464, Ley de Protección de Datos Personales y Garantía de Derechos Digitales; la Comisión continuaba su discusión en julio de 2026.

### Honduras
- Tribunal Superior de Cuentas: Decreto 149-2013, Ley sobre Firmas Electrónicas.
- Tribunal Superior de Cuentas: Acuerdo Ejecutivo 41-2014, Reglamento de la Ley sobre Firmas Electrónicas.
- Tribunal Superior de Cuentas: Decreto 161-2000, Ley de Conciliación y Arbitraje.
- Tribunal Superior de Cuentas: Ley sobre Justicia Constitucional, que incluye habeas data.
- Portal Único de Transparencia/IAIP: publicaciones oficiales siguen identificando “Anteproyecto de Ley de Protección de Datos Personales”.

## 8. Formato de respuesta solicitado al abogado

Para cada código `GT-*`, `HN-*` y `X-*`, responder una de estas opciones:

- `APROBADO SIN CAMBIO` — la redacción V0.3 puede mantenerse.
- `CAMBIO REQUERIDO` — indicar texto exacto sugerido o criterio inequívoco de reemplazo.
- `NO APLICA` — explicar brevemente por qué.
- `REQUIERE DOCUMENTO/HECHO ADICIONAL` — identificar únicamente el documento/hecho indispensable.

Evitar observaciones genéricas sin instrucción aplicable al texto.

## 9. Criterio de cierre jurídico

La revisión se considera cerrada cuando:

1. todos los marcadores `LEGAL_REVIEW_REQUIRED`, `LEGAL_REVIEW_REQUIRED_GT` y `LEGAL_REVIEW_REQUIRED_HN` de V0.3 tienen decisión;
2. se incorporan cambios exactos;
3. se determina el nivel de dirección pública;
4. se confirma licenciante/IP y arbitraje aplicable;
5. se valida privacidad/evidencias/retención/proveedores;
6. Paula revisa y aprueba humanamente el texto consolidado;
7. se genera una versión publicable sin marcadores pendientes;
8. solo después se crea snapshot de publicación, se resuelven valores públicos y se calcula SHA-256 final.

**La revisión jurídica no autoriza provider materialization ni aceptación.** Esas acciones requieren un gate explícito posterior.
