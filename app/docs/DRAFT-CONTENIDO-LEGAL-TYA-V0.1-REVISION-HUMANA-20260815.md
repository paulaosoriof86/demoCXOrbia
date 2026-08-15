# DRAFT LEGAL TyA — REVISIÓN HUMANA OBLIGATORIA

**Fecha:** 2026-08-15  
**Estado:** `DRAFT_ONLY__NOT_APPROVED__NO_PROVIDER_MATERIALIZATION__NO_ACCEPTANCE__NO_PRODUCTION`  
**Draft version:** `tya-legal-bundle-v0.1-draft-20260815`  
**Draft SHA-256 (solo del cuerpo legal que sigue):** `c3deb7becd660d35f260f8b0847ee63bd736557237cf99da292737cce6ccd823`  
**Autoridad:** ninguna. Este hash identifica únicamente este borrador para revisión; **NO** es el `contentDigest` productivo y deberá recalcularse después de completar campos, revisión humana y asesoría legal.

## Límite de este bloque

Este documento prepara contenido legal para revisión humana de Paula y asesores. No autoriza ni ejecuta:
- materialización de `legalContents` en Firebase/Firestore;
- aceptación por ningún usuario;
- provider write/read;
- activación del browser bridge;
- cambios en `/app/modules` o `/app/core`;
- Auth/HR/Storage/Rules/Make/Gemini/pagos;
- deploy, merge o producción.

El contrato durable ya exige aceptación humana, exact identity, versión/digest inmutables, timestamp del servidor y provider ACK. Este borrador se alinea con ese contrato, pero **no lo satisface todavía**.

## Base normativa verificada para redactar el borrador

La investigación de soporte se realizó sobre fuentes oficiales y se utilizó de forma conservadora.

### Guatemala
- Decreto 47-2008, **Ley para el Reconocimiento de las Comunicaciones y Firmas Electrónicas**.
- Decreto 33-98 y reformas, **Ley de Derecho de Autor y Derechos Conexos**; las reformas contemplan programas de ordenador.
- Decreto 57-2000, **Ley de Propiedad Industrial**, incluida protección de secretos empresariales.
- Decreto 57-2008, **Ley de Acceso a la Información Pública**, incluido su régimen de habeas data dentro de su ámbito.
- A agosto de 2026, las fuentes oficiales del Congreso consultadas muestran iniciativas generales de protección de datos personales todavía en trámite; por ello este borrador no presenta una iniciativa como ley vigente.

### Honduras
- Decreto 149-2013, **Ley sobre Firmas Electrónicas**.
- Acuerdo Ejecutivo 41-2014, **Reglamento de la Ley sobre Firmas Electrónicas**.
- **Ley sobre Justicia Constitucional**, que incluye habeas data entre las acciones constitucionales.
- **Ley del Derecho de Autor y de los Derechos Conexos**, que protege obras de programación y programas de computadora.
- Decreto 12-99, **Ley de Propiedad Industrial**, y reformas.
- Las fuentes oficiales del IAIP consultadas presentan referencias inconsistentes entre “ley” y “anteproyecto” respecto de protección general de datos personales; por prudencia este borrador no afirma una ley general privada específica sin validación de abogado hondureño.

## Advertencia de revisión

Este borrador es una propuesta contractual/técnica para revisión humana y **no sustituye asesoría jurídica profesional**. Antes de publicación deben validarse identidad de la contraparte, foro, retención, proveedores, tratamiento transfronterizo y particularidades de Guatemala/Honduras.

---

# ACUERDO MARCO DE USO DE PLATAFORMA, CONFIDENCIALIDAD, PROTECCIÓN DE INFORMACIÓN, PROPIEDAD INTELECTUAL Y TRATAMIENTO DE DATOS — TyA / CXOrbia

## 1. Identificación y alcance

Este Acuerdo regula el acceso y uso del entorno de **TyA Consultores** operado sobre la plataforma tecnológica **CXOrbia** (la “Plataforma”), por parte de usuarios autorizados, incluidos, según corresponda, personal administrativo u operativo, coordinadores, shoppers/evaluadores de campo, representantes de clientes, aliados y otros perfiles habilitados por TyA (cada uno, el “Usuario”).

Para efectos contractuales deberá incorporarse en la versión aprobada la identificación exacta de la persona individual o jurídica que actúa como operador y contraparte contractual de TyA en cada país, incluyendo razón social o nombre legal, identificación tributaria, domicilio y canal legal de contacto (el “Operador TyA”).

La Plataforma es un medio tecnológico para apoyar la gestión de proyectos de investigación de mercados, mystery shopping, auditoría de experiencia, operaciones de campo, administración de visitas, documentación, evidencias, certificaciones, liquidaciones, pagos, reportes y actividades relacionadas. El acceso a la Plataforma no crea por sí solo una relación laboral, societaria, de agencia, franquicia, representación comercial ni exclusividad. La naturaleza de cualquier relación entre TyA, el Usuario y/o un Cliente se rige por el contrato específico que corresponda.

Este Acuerdo se integra con los anexos por rol, país, proyecto y/o cliente que resulten aplicables. En caso de contradicción, prevalecerá el documento específico para la materia concreta, salvo norma imperativa aplicable.

## 2. Capacidad, cuenta e identidad

El Usuario declara que cuenta con capacidad legal suficiente para aceptar este Acuerdo y que la información proporcionada para crear o validar su cuenta es veraz, actual y correspondiente a su identidad.

La cuenta es personal e intransferible. El Usuario no podrá compartir credenciales, códigos de acceso, sesiones, enlaces privados, mecanismos de autenticación ni dispositivos autenticados con terceros no autorizados.

Cuando una organización cliente designe a un Usuario para actuar en su nombre, dicho Usuario declara que cuenta con autorización suficiente de la organización para acceder al proyecto y realizar las acciones habilitadas para su rol. La organización será responsable de mantener actualizadas sus altas, bajas y cambios de permisos.

TyA podrá aplicar controles de identidad, autenticación, roles, tenant, proyecto, país y alcance para limitar el acceso al mínimo necesario.

## 3. Aceptación electrónica humana y evidencia

La aceptación de este Acuerdo deberá ser realizada **exclusivamente por el Usuario humano autenticado** mediante la acción afirmativa que la interfaz presente para tal efecto. Ningún proceso automatizado, runner de QA, integración, bot, sistema de IA, Make, Gemini, script, administrador técnico ni tercero podrá aceptar en nombre del Usuario.

La aceptación quedará asociada, como mínimo, a:
- la cuenta autenticada exacta;
- tenant y alcance aplicable;
- proyecto cuando corresponda;
- rol;
- identificador estable del contenido legal;
- versión inmutable del contenido;
- huella criptográfica o digest del contenido;
- fecha y hora registradas por el servidor;
- método de aceptación humana;
- estado y referencia de auditoría.

La aceptación será personal: una aceptación de otra cuenta, rol, proyecto, tenant o versión no sustituye la aceptación del Usuario cuando el alcance jurídico sea diferente.

Una nueva versión sustancial del contenido legal podrá requerir una nueva aceptación. Las versiones y aceptaciones históricas deberán preservarse para auditoría y no podrán ser reescritas como si hubieran ocurrido bajo una versión posterior.

La disponibilidad de un botón informativo, aviso de cierre, banner, simple navegación, uso continuado de la Plataforma o marca local del navegador no constituye por sí sola una aceptación legal cuando la Plataforma exija acción afirmativa específica.

## 4. Licencia limitada de uso

Sujeto al cumplimiento de este Acuerdo y de los permisos de su cuenta, se concede al Usuario una licencia limitada, revocable, no exclusiva, no transferible y no sublicenciable para utilizar la Plataforma únicamente para las finalidades autorizadas por TyA, el Cliente y/o el proyecto aplicable.

El Usuario no adquiere derechos de propiedad sobre la Plataforma, su código, arquitectura, interfaces, marcas, diseños, documentación técnica, modelos de datos, reglas de negocio, metodologías tecnológicas ni componentes licenciados.

## 5. Usos permitidos

El Usuario podrá utilizar la Plataforma únicamente para:
- ejecutar funciones habilitadas para su rol;
- consultar información de proyectos para los que tenga autorización;
- registrar actividades, visitas, postulaciones, agenda, evidencias, cuestionarios, certificaciones, liquidaciones u otros datos cuando su rol lo permita;
- colaborar con TyA y/o el Cliente en la ejecución legítima del proyecto;
- consultar manuales, Academia, comunicaciones y documentos autorizados;
- ejercer derechos o cumplir obligaciones derivados de su relación contractual.

## 6. Usos prohibidos

Queda prohibido:
1. acceder o intentar acceder a cuentas, tenants, proyectos, clientes, datos o funciones no autorizados;
2. compartir credenciales o permitir uso de la cuenta por terceros;
3. eludir autenticación, roles, controles de acceso, gates legales, trazabilidad, límites de proyecto o mecanismos de seguridad;
4. alterar, destruir, suprimir, ocultar, falsificar o manipular registros, evidencias, timestamps, estados, resultados o trazas de auditoría;
5. realizar scraping, extracción masiva, descarga, copia o exportación no autorizada de datos;
6. publicar en redes sociales o divulgar públicamente información obtenida por razón de un proyecto;
7. utilizar información de clientes, shoppers, empleados, establecimientos, ubicaciones, visitas, cuestionarios, resultados o contactos para fines ajenos al proyecto;
8. introducir malware, código malicioso o mecanismos destinados a afectar disponibilidad, integridad o confidencialidad;
9. intentar descompilar, desensamblar, evadir medidas técnicas o realizar ingeniería inversa del software, salvo cuando una norma imperativa lo permita expresamente;
10. utilizar la Plataforma para fraude, suplantación, acoso, discriminación, represalias, actividades ilícitas o vulneración de derechos de terceros;
11. usar información confidencial o secretos empresariales para competir deslealmente, beneficiar a terceros o desarrollar productos o servicios derivados sin autorización;
12. utilizar información de un proyecto para contactar directamente a consumidores, empleados, shoppers o representantes de establecimientos fuera del flujo autorizado.

## 7. Información confidencial

Se considerará “Información Confidencial” toda información no pública conocida por el Usuario por razón de su acceso a TyA, CXOrbia, un Cliente o un proyecto, incluyendo, sin limitarse a:
- identidad de clientes, prospectos, shoppers y personal;
- instrucciones, protocolos, cuestionarios, rúbricas, escenarios y criterios de evaluación;
- ubicación, programación, asignación y estado de visitas;
- resultados, hallazgos, fotografías, videos, audios, archivos y demás evidencias;
- reportes, bases de datos, históricos y métricas;
- precios, honorarios, reembolsos, liquidaciones, presupuestos e información financiera;
- credenciales, configuraciones, integraciones, endpoints y datos técnicos;
- código, arquitectura, diseños, metodologías, procesos, know-how y secretos empresariales;
- planes comerciales, propuestas, contratos, comunicaciones internas y documentación no pública;
- datos personales y datos sensibles o de especial protección.

No será confidencial la información que el Usuario pueda demostrar que: (a) era legítimamente pública sin incumplimiento suyo; (b) ya conocía lícitamente antes de recibirla y sin deber de confidencialidad; (c) recibió lícitamente de un tercero autorizado; o (d) desarrolló independientemente sin utilizar Información Confidencial.

## 8. Obligaciones de confidencialidad

El Usuario se obliga a:
- utilizar la Información Confidencial únicamente para la finalidad autorizada;
- aplicar un nivel de cuidado razonable y, al menos, el mismo nivel con que protege su propia información confidencial de similar importancia;
- no revelar Información Confidencial a terceros salvo autorización expresa o necesidad operativa autorizada;
- no hacer copias, capturas, grabaciones o descargas innecesarias;
- mantener seguros los dispositivos y canales usados para acceder a la Plataforma;
- informar sin demora cualquier pérdida, acceso no autorizado, envío erróneo, exposición o sospecha de incidente;
- devolver, eliminar o dejar de utilizar la Información Confidencial cuando termine la autorización, sujeto a retenciones legales o contractuales;
- cumplir cualquier instrucción adicional de seguridad del proyecto.

Si una autoridad competente exige revelar Información Confidencial, el Usuario deberá, cuando la ley lo permita, informar previamente a TyA y limitar la revelación al mínimo legalmente requerido.

Las obligaciones de confidencialidad sobrevivirán al cierre de la cuenta o terminación de la relación mientras la información conserve su carácter confidencial o durante el plazo mayor exigido por la ley o el contrato aplicable.

## 9. Evidencias de campo y conducta durante las visitas

Cuando un Usuario participe en visitas, auditorías o evaluaciones de campo deberá cumplir las instrucciones del proyecto, las normas legales aplicables y los límites de recolección de evidencia.

Las fotografías, videos, audios, comprobantes, formularios, geolocalización u otras evidencias solo podrán recabarse cuando sean necesarias y estén autorizadas por el proyecto. El Usuario no deberá recolectar información excesiva, ajena al objetivo de la evaluación o especialmente sensible sin instrucción y fundamento específicos.

El Usuario deberá evitar exponer públicamente la identidad de personas observadas, la condición de mystery shopping o los resultados de la evaluación, salvo autorización expresa.

La Plataforma no autoriza por sí misma grabaciones clandestinas, tratamiento biométrico, reconocimiento facial ni otras técnicas de alto impacto; si un proyecto requiriera alguna de ellas, deberá existir un análisis y autorización legal específicos antes de habilitarlas.

## 10. Datos personales: principios generales

TyA procurará tratar los datos personales de manera lícita, leal, transparente, proporcional y limitada a finalidades determinadas. La configuración técnica deberá aplicar minimización de datos, control de acceso por rol, trazabilidad, segregación por tenant/proyecto, conservación limitada y medidas razonables de seguridad.

La aceptación de este Acuerdo **no se interpretará como un consentimiento genérico e ilimitado** para cualquier tratamiento de datos. Cuando una operación requiera consentimiento específico por la ley o por la naturaleza del tratamiento, este deberá solicitarse separadamente, de forma informada y sin mezclarlo con finalidades opcionales como marketing.

## 11. Categorías de datos que pueden tratarse

Según el rol y los módulos habilitados, la Plataforma podrá tratar:
- identificación y datos de cuenta;
- nombre, correo, teléfono y otros datos de contacto;
- país, ciudad y datos de perfil profesional u operativo;
- información de roles, permisos, proyectos, asignaciones y actividad;
- postulaciones, certificaciones, cursos y resultados de capacitación;
- agenda, reprogramaciones, cancelaciones y trazas de visita;
- cuestionarios, respuestas, observaciones y reportes;
- fotografías, videos, audios, archivos, comprobantes y otras evidencias autorizadas;
- liquidaciones, reembolsos, estados de pago e información financiera necesaria;
- datos bancarios cuando el flujo autorizado lo requiera;
- documentos de identidad cuando exista una necesidad contractual o legal específica;
- registros técnicos y de seguridad necesarios para autenticación, prevención de abuso, auditoría y soporte;
- comunicaciones relacionadas con el servicio.

No todos estos datos se recolectan para todos los usuarios. Debe aplicarse el principio de necesidad según rol, país, proyecto y finalidad.

## 12. Finalidades del tratamiento

Los datos podrán utilizarse, según corresponda, para:
- crear, autenticar y administrar cuentas;
- asignar roles, proyectos y permisos;
- gestionar postulaciones, certificaciones y elegibilidad;
- planificar, asignar, ejecutar, controlar y auditar visitas;
- procesar evidencias, cuestionarios y resultados;
- gestionar liquidaciones, reembolsos y pagos;
- mantener históricos operativos necesarios;
- brindar soporte y resolver incidencias;
- proteger la seguridad e integridad de la Plataforma;
- investigar fraude, abuso, conflictos o incumplimientos;
- cumplir obligaciones legales, fiscales, contables o contractuales;
- elaborar reportes autorizados para TyA y sus clientes;
- mantener trazabilidad de decisiones y aceptaciones;
- administrar Academia y comunicaciones operativas.

Las finalidades opcionales, promocionales o de marketing deberán manejarse por separado y no condicionarán el acceso operativo cuando no sean necesarias para la prestación del servicio.

## 13. Roles de TyA y de los Clientes frente a los datos

Para datos de cuenta, relación con shoppers, administración interna y operación propia, el Operador TyA podrá actuar como responsable de determinar finalidades y medios del tratamiento.

Cuando un Cliente entregue datos o instruya tratamientos dentro de un proyecto, las responsabilidades entre Cliente y TyA deberán definirse en el contrato o acuerdo de tratamiento correspondiente. TyA no utilizará datos de un Cliente para fines incompatibles con las instrucciones y finalidades autorizadas.

Cada tenant y proyecto deberá mantener separación lógica para evitar accesos cruzados no autorizados.

## 14. Compartición con terceros y subencargados tecnológicos

TyA podrá utilizar proveedores tecnológicos estrictamente necesarios para operar la Plataforma, autenticación, almacenamiento, hosting, automatización, comunicaciones, analítica operativa o soporte. La lista vigente de proveedores relevantes deberá estar disponible en el aviso de privacidad o documentación contractual correspondiente.

Los proveedores deberán recibir únicamente los datos necesarios para la finalidad contratada y estar sujetos a obligaciones adecuadas de confidencialidad, seguridad y uso limitado.

No se autoriza la venta de datos personales por la sola aceptación de este Acuerdo.

La activación futura de servicios como almacenamiento de evidencias, automatizaciones o inteligencia artificial deberá respetar los gates técnicos y legales del proyecto. Un servicio que esté preparado técnicamente pero no activado no deberá describirse como receptor actual de datos.

## 15. Transferencias y procesamiento transfronterizo

Debido a la naturaleza tecnológica de la Plataforma, determinados proveedores podrían procesar datos desde infraestructura ubicada fuera del país del Usuario. Antes de activar un proveedor que implique tratamiento transfronterizo, TyA deberá verificar que el flujo sea compatible con la normativa aplicable, el contrato del Cliente y las medidas de protección acordadas.

Cuando sea legalmente exigible, se informará al Usuario sobre transferencias relevantes y se obtendrán las autorizaciones o garantías correspondientes.

## 16. Conservación y eliminación

Los datos no deberán conservarse indefinidamente por defecto.

La versión final del Aviso de Privacidad deberá incorporar una **tabla de retención aprobada** por categoría de datos y proyecto, considerando como mínimo:
- duración de la cuenta o relación contractual;
- necesidad de histórico operativo;
- obligaciones fiscales, contables o probatorias;
- periodos de reclamación o defensa jurídica;
- requerimientos del Cliente;
- seguridad y prevención de fraude;
- necesidad de conservar evidencia de aceptación legal.

Al cumplirse el plazo aplicable, los datos deberán eliminarse, anonimizarse o archivarse de manera restringida, según corresponda.

Las evidencias legales de aceptación y registros de auditoría podrán conservarse durante el plazo necesario para acreditar derechos y obligaciones, sin reescribir versiones históricas.

## 17. Seguridad

TyA y el operador tecnológico aplicarán controles razonables de seguridad proporcionales al riesgo, incluyendo, según corresponda:
- autenticación y controles de acceso;
- mínimo privilegio;
- segregación tenant/proyecto;
- cifrado en tránsito y, donde corresponda, en reposo;
- protección de secretos y credenciales;
- logs y trazabilidad;
- copias de seguridad y recuperación;
- gestión de incidentes;
- validaciones para impedir escrituras o integraciones no autorizadas;
- revisión humana para conflictos de identidad o datos sensibles.

Ningún sistema puede garantizar seguridad absoluta. El Usuario también deberá proteger sus dispositivos, sesiones y credenciales.

## 18. Incidentes de seguridad y confidencialidad

El Usuario deberá reportar inmediatamente cualquier sospecha de:
- acceso no autorizado;
- credenciales comprometidas;
- evidencia expuesta;
- pérdida o robo de dispositivo con sesión activa;
- envío de información al destinatario equivocado;
- extracción masiva;
- manipulación de datos;
- vulnerabilidad o comportamiento anómalo.

TyA podrá suspender temporalmente accesos para investigar y contener un incidente, preservar evidencia y proteger a terceros.

## 19. Derechos y solicitudes sobre datos

El Usuario podrá solicitar información sobre sus datos, corrección de datos inexactos y, cuando resulte jurídicamente procedente, actualización, oposición, supresión, limitación o revocación de consentimientos opcionales.

Estos derechos no serán absolutos cuando exista una obligación legal, necesidad contractual, retención probatoria, prevención de fraude, defensa de derechos o interés legítimo reconocido por la normativa aplicable que justifique conservar determinada información.

La versión final deberá identificar un canal verificable para solicitudes de privacidad y establecer un procedimiento de validación de identidad antes de entregar o modificar información.

## 20. Datos sensibles y minimización reforzada

Documentos de identidad, datos bancarios, acuerdos legales, información financiera, ubicaciones precisas, evidencias privadas y cualquier otra categoría especialmente sensible deberán quedar sujetas a acceso restringido, finalidad específica y minimización reforzada.

Dichos datos no deberán almacenarse en repositorios de código, documentación pública, logs inseguros, prompts de IA ni canales de soporte no autorizados.

Cuando sea suficiente un identificador, referencia, estado o token protegido, deberá preferirse esa alternativa frente al almacenamiento del dato crudo.

## 21. Propiedad intelectual de la Plataforma

La Plataforma, su código fuente y objeto, interfaces, diseños, documentación, esquemas, componentes, metodologías tecnológicas, marcas y materiales propios se encuentran protegidos por los derechos que correspondan a su titular o licenciante.

El acceso del Usuario no implica cesión, transferencia ni licencia distinta de la autorización limitada de uso establecida en este Acuerdo.

No podrán copiarse, venderse, licenciarse, sublicenciarse, publicarse ni explotarse componentes de la Plataforma fuera del alcance autorizado.

Las referencias a CXOrbia y TyA deberán respetar los derechos del titular correspondiente. La titularidad exacta del software y las licencias entre CXOrbia, TyA y terceros deberá quedar definida en sus contratos corporativos y no depender del texto mostrado al Usuario final.

## 22. Propiedad de contenidos de Clientes y Usuarios

Los contenidos, marcas, instructivos y materiales entregados por un Cliente continuarán perteneciendo al Cliente o a sus legítimos titulares, salvo pacto escrito distinto.

El Usuario conserva los derechos que legalmente le correspondan sobre materiales originales que aporte; sin embargo, concede a TyA y al operador tecnológico una autorización limitada para almacenar, procesar, reproducir y comunicar dichos materiales en la medida necesaria para ejecutar el proyecto, prestar el servicio, mantener trazabilidad y cumplir obligaciones legales.

Los resultados de evaluaciones, reportes consolidados, bases operativas y entregables del proyecto se regirán por el contrato entre TyA y el Cliente.

El Usuario garantiza que no cargará materiales sobre los que carezca de autorización suficiente.

## 23. Secretos empresariales y know-how

Los métodos, modelos operativos, configuraciones, procesos, reglas, estrategias, documentación no pública y demás know-how que tengan carácter de secreto empresarial deberán tratarse como Información Confidencial.

El Usuario no podrá apropiarse, divulgar, explotar o utilizar estos elementos fuera del servicio autorizado, incluso cuando haya tenido acceso legítimo a ellos durante la relación.

## 24. Comunicaciones operativas

TyA podrá enviar comunicaciones necesarias para la operación, seguridad, asignaciones, cambios de proyecto, visitas, certificaciones, pagos, soporte, actualizaciones legales o modificaciones relevantes de la Plataforma.

Las comunicaciones promocionales o comerciales no necesarias deberán distinguirse de las comunicaciones operativas y ofrecer mecanismos de preferencia o baja cuando corresponda.

## 25. Exactitud de información y auditoría

El Usuario es responsable de registrar información veraz y suficientemente completa dentro de su ámbito de conocimiento.

TyA podrá conservar trazabilidad de cambios, versiones, asignaciones, decisiones y estados cuando sea necesario para auditoría, resolución de conflictos, prevención de fraude o cumplimiento contractual.

Las correcciones de información no deberán borrar silenciosamente la historia cuando resulte necesario preservar una pista de auditoría.

## 26. Suspensión y terminación

TyA podrá limitar, suspender o cancelar accesos cuando:
- finalice la relación contractual o el proyecto;
- el Usuario pierda autorización;
- exista riesgo razonable de seguridad;
- se detecte uso indebido, fraude o incumplimiento;
- una organización cliente solicite la baja de su representante;
- sea necesario cumplir una orden legal.

La suspensión técnica no elimina automáticamente obligaciones pendientes, deberes de confidencialidad ni registros que deban conservarse.

## 27. Responsabilidad por uso indebido

Cada parte responderá por sus actos conforme al contrato y la ley aplicables.

El Usuario podrá ser responsable por daños derivados de acceso intencional no autorizado, fraude, divulgación ilícita, falsificación de evidencias, uso indebido de datos o vulneración consciente de derechos de propiedad intelectual.

Nada de este Acuerdo pretende excluir responsabilidades que por ley no puedan limitarse ni renuncias inválidas a derechos obligatorios.

## 28. Cambios al Acuerdo

TyA podrá proponer modificaciones al contenido legal para reflejar cambios normativos, tecnológicos, de seguridad, de proveedores o de operación.

Cuando una modificación sea sustancial o el alcance jurídico cambie, la Plataforma deberá presentar la nueva versión para aceptación humana antes de permitir el acceso a las funciones protegidas que requieran dicha aceptación.

Las versiones anteriores deberán conservarse para fines de auditoría.

## 29. Ley aplicable y resolución de controversias

La versión final deberá incluir un anexo por país y por entidad contratante.

Como principio:
- los derechos imperativos del Usuario no se excluyen por este Acuerdo;
- los contratos B2B con Clientes podrán contener su propia cláusula de ley, foro, mediación o arbitraje;
- para Usuarios individuales deberá utilizarse la ley y jurisdicción válidamente aplicables según el país, la entidad contratante y la naturaleza de la relación;
- ningún texto de interfaz deberá inventar una jurisdicción antes de que el Operador TyA y su asesor legal la confirmen.

## 30. Integridad y separabilidad

Si una disposición se considera inválida o inaplicable, se interpretará o separará en la medida necesaria sin afectar las demás disposiciones, salvo que la disposición sea esencial para la finalidad del Acuerdo.

La falta de ejercicio inmediato de un derecho no constituye renuncia permanente.

## 31. Contacto legal y privacidad

Antes de publicación deberán completarse:

**Operador TyA:** [RAZÓN SOCIAL / NOMBRE LEGAL]  
**Nombre comercial:** TyA Consultores  
**Identificación tributaria:** [NIT / RTN / equivalente]  
**Domicilio legal:** [DIRECCIÓN]  
**Correo legal:** [CORREO]  
**Correo de privacidad:** [CORREO]  
**Canal de incidentes de seguridad:** [CORREO / FORMULARIO]  

---

# ANEXO A — USUARIOS SHOPPER / EVALUADOR DE CAMPO

## A.1 Finalidad del acceso

El Shopper recibe acceso para postularse, certificarse, consultar oportunidades autorizadas, aceptar asignaciones, gestionar agenda, ejecutar visitas, aportar evidencias, contestar cuestionarios, consultar estados, liquidaciones y pagos, y realizar otras funciones habilitadas.

## A.2 Deber de reserva reforzado

El Shopper no deberá revelar:
- que una visita es de mystery shopping antes o durante la ejecución;
- identidad del Cliente cuando el proyecto la trate como confidencial;
- escenarios, preguntas, criterios o protocolos;
- resultados o hallazgos;
- identidad o información de otras personas usuarias;
- fechas futuras de visita que permitan anticipar la evaluación.

## A.3 Evidencias

El Shopper solo podrá capturar y cargar evidencias exigidas por el proyecto. No podrá reutilizarlas para portafolio personal, redes sociales, contenido público, entrenamiento de modelos de IA, publicidad ni otros clientes sin autorización escrita.

## A.4 Conducta y autenticidad

El Shopper no deberá simular una visita no realizada, reutilizar evidencias de otra visita, alterar fechas, falsificar comprobantes, delegar la visita a otra persona ni compartir su cuenta.

## A.5 Certificaciones

Las certificaciones y requisitos de proyecto podrán ser obligatorios antes de postularse o ejecutar una visita. Los resultados históricos válidos deberán preservarse cuando el proyecto así lo permita; una nueva versión material del protocolo podrá requerir actualización o recertificación.

## A.6 Pagos y reembolsos

La Plataforma podrá mostrar honorarios, reembolsos, liquidaciones o estados de pago. La visualización de un estado no sustituye el contrato, orden, liquidación o comprobante aplicable. Una visita ejecutada no debe marcarse automáticamente como pagada.

## A.7 Relación jurídica

El acceso como Shopper no crea por sí solo una relación laboral. La relación concreta, compensación, impuestos, gastos, horarios, independencia y demás condiciones se determinarán en el acuerdo específico aplicable y conforme a la ley.

---

# ANEXO B — ADMINISTRACIÓN, OPERACIONES Y COORDINACIÓN

## B.1 Privilegios y mínimo acceso

Los perfiles administrativos y operativos podrán tener acceso a información de múltiples shoppers, proyectos y clientes. Por ello deberán actuar con mínimo privilegio y utilizar los datos únicamente para funciones autorizadas.

## B.2 Prohibiciones reforzadas

Queda prohibido:
- exportar listados completos por conveniencia personal;
- consultar información sensible sin necesidad funcional;
- compartir datos de shoppers o clientes por canales no autorizados;
- modificar estados para ocultar errores;
- crear o asignar identidades por coincidencia aproximada cuando existan conflictos;
- sobrescribir silenciosamente conflictos de HR/plataforma;
- usar datos bancarios, documentos o evidencias fuera del proceso correspondiente.

## B.3 Altas, bajas y permisos

Las cuentas deben reflejar cambios de puesto, terminación, sustitución o reasignación. Los permisos elevados no deben mantenerse después de que desaparezca la necesidad operativa.

---

# ANEXO C — CLIENTES Y REPRESENTANTES AUTORIZADOS

## C.1 Uso limitado

El Cliente y sus Usuarios podrán acceder únicamente a la información del tenant/proyecto y alcance contratado.

## C.2 Confidencialidad recíproca

El Cliente deberá proteger la identidad de shoppers, métodos de evaluación, resultados no públicos, reportes, información de TyA y datos personales a los que acceda.

## C.3 Contacto con shoppers

El Cliente no deberá utilizar la Plataforma para contactar, contratar, presionar, identificar públicamente o tomar represalias contra shoppers fuera de los mecanismos acordados con TyA.

## C.4 Información proporcionada por el Cliente

El Cliente declara que tiene autoridad para proporcionar a TyA los datos, listados, documentos, protocolos y contenidos que incorpore al proyecto y que instruirá tratamientos compatibles con la ley.

## C.5 Datos personales incluidos en evaluaciones

Cuando el Cliente solicite evaluar a empleados, establecimientos u otras personas, deberá limitar la información personal a la necesaria para la finalidad legítima de la evaluación y evitar categorías sensibles innecesarias.

---

# ANEXO D — SUPERADMIN, CONSULTORA, REPRESENTANTE, FRANQUICIADO, ALIADO O SOCIO

Los usuarios con acceso transversal o de administración de tenant deberán:
- respetar segregación entre tenants;
- evitar acceso por curiosidad o conveniencia;
- gestionar usuarios y permisos con mínimo privilegio;
- documentar excepciones;
- proteger configuraciones, integraciones, claves y datos comerciales;
- no trasladar información de un tenant a otro;
- aplicar reglas de país, proyecto y Cliente sin convertir una lógica particular en regla global.

---

# ANEXO PAÍS — GUATEMALA

## GT.1 Aceptación electrónica

La versión productiva deberá reconocer que Guatemala cuenta con la **Ley para el Reconocimiento de las Comunicaciones y Firmas Electrónicas, Decreto 47-2008**, aplicable a comunicaciones electrónicas, transacciones y actos jurídicos dentro de su ámbito.

La arquitectura de aceptación de la Plataforma está diseñada para fortalecer la evidencia de una aceptación electrónica: identidad autenticada, versión exacta, digest, acción afirmativa humana y timestamp de servidor. La validez jurídica de una aceptación concreta dependerá de la naturaleza del acto y de los requisitos legales que resulten aplicables.

## GT.2 Privacidad

A la fecha de preparación de este borrador, las fuentes oficiales consultadas del Congreso muestran iniciativas de protección integral de datos personales todavía en trámite. Por ello, este Acuerdo no presume la vigencia de una ley general privada que no haya sido confirmada.

TyA deberá aplicar, como mínimo, las garantías contractuales y técnicas de este documento, sin perjuicio de la Constitución, normas sectoriales, obligaciones de confidencialidad, habeas data donde corresponda, legislación de acceso a información pública en su ámbito propio y cualquier nueva norma que entre en vigor.

## GT.3 Propiedad intelectual

La protección contractual de software, contenidos y secretos empresariales se aplicará sin perjuicio de la **Ley de Derecho de Autor y Derechos Conexos, Decreto 33-98 y sus reformas**, y de la **Ley de Propiedad Industrial, Decreto 57-2000**, que contempla, entre otras materias, secretos empresariales.

## GT.4 Foro

[DEFINIR CON ASESOR LEGAL: jurisdicción ordinaria, mediación o arbitraje; ciudad; reglas aplicables; distinción entre Usuario individual y Cliente B2B.]

---

# ANEXO PAÍS — HONDURAS

## HN.1 Aceptación electrónica

Honduras cuenta con la **Ley sobre Firmas Electrónicas, Decreto 149-2013**, y su reglamentación mediante **Acuerdo Ejecutivo 41-2014**.

La aceptación de la Plataforma deberá conservar una evidencia técnicamente verificable de identidad autenticada, versión, digest, acción afirmativa humana y timestamp de servidor. La suficiencia de esa evidencia para cada acto deberá revisarse según la naturaleza de la obligación y la ley aplicable.

## HN.2 Privacidad y habeas data

La Constitución y la legislación de justicia constitucional hondureña reconocen mecanismos de protección relacionados con habeas data. Las fuentes oficiales del IAIP consultadas contienen referencias tanto a protección de datos personales como a anteproyectos; por esa inconsistencia documental, este borrador no afirma una ley general privada específica sin verificación adicional de asesor local.

TyA aplicará las garantías contractuales y técnicas de este documento y cualquier obligación sectorial o nueva norma que resulte vigente al momento de publicación.

## HN.3 Propiedad intelectual

La **Ley del Derecho de Autor y de los Derechos Conexos** hondureña protege, entre otras, las obras de programación y los programas de computadora. La **Ley de Propiedad Industrial, Decreto 12-99**, y sus reformas, se aplicará en lo pertinente.

## HN.4 Foro

[DEFINIR CON ASESOR LEGAL: jurisdicción ordinaria, mediación o arbitraje; ciudad; reglas aplicables; distinción entre Usuario individual y Cliente B2B.]

---

# AVISO DE PRIVACIDAD RESUMIDO PARA PANTALLA

**Quién trata tus datos.** TyA Consultores, a través del Operador TyA identificado en el aviso completo, administra tu cuenta y los datos necesarios para operar los proyectos en los que participas.

**Para qué.** Usamos los datos necesarios para autenticarte, gestionar tu rol, proyectos, visitas, evidencias, certificaciones, liquidaciones/pagos, soporte, seguridad, auditoría y cumplimiento contractual.

**Qué datos.** Según tu rol podemos tratar datos de identificación y contacto, actividad de cuenta, asignaciones, agenda, certificaciones, respuestas, evidencias, información financiera necesaria y registros de seguridad. No todas las categorías se recaban para todos los usuarios.

**Con quién.** Podemos usar proveedores tecnológicos necesarios para prestar el servicio, sujetos a confidencialidad y seguridad. No se autoriza la venta de tus datos por aceptar estos términos.

**Tus opciones.** Puedes solicitar acceso o corrección y ejercer otros derechos que correspondan según la ley aplicable. Los consentimientos opcionales, cuando existan, se pedirán por separado.

**Retención.** Conservamos los datos durante el tiempo necesario para operar el servicio, cumplir obligaciones y preservar evidencia legítima; la versión final publicará una tabla de retención.

**Seguridad.** Protege tus credenciales y reporta cualquier incidente al canal oficial.

---

# TEXTO DE ACEPTACIÓN PARA UI — VERSIÓN PROPUESTA

Antes de entrar al área protegida, la Plataforma deberá mostrar el contenido completo aplicable y, al final, una acción afirmativa no premarcada.

**Casilla obligatoria 1**  
`He leído el Acuerdo de Uso, Confidencialidad y Protección de Información aplicable a mi cuenta, rol, país y proyecto, y acepto obligarme conforme a su versión indicada.`

**Casilla obligatoria 2**  
`He leído el Aviso de Privacidad aplicable y reconozco cómo se tratarán mis datos para operar la plataforma y los proyectos autorizados.`

**Botón**  
`Aceptar y continuar`

Debajo del botón:  
`Tu aceptación queda vinculada a tu cuenta autenticada, a esta versión del documento y a la fecha/hora registrada por el servidor. Si el acuerdo cambia de forma sustancial, podremos solicitarte una nueva aceptación.`

No deben estar premarcadas las casillas. El botón no deberá activarse hasta que el Usuario realice la acción afirmativa requerida.

Los consentimientos opcionales, por ejemplo comunicaciones promocionales o tratamientos no necesarios, deberán aparecer en controles independientes y no premarcados.

---

# MATRIZ DE ALCANCE LEGAL PROPUESTA

| legalContentId | Scope | Audiencia | Reaceptación |
|---|---|---|---|
| `tya-platform-master-terms` | tenant | todos los roles aplicables | cambio material |
| `tya-privacy-notice` | tenant + país | todos los roles aplicables | cambio material de tratamiento |
| `tya-shopper-annex` | tenant/proyecto | shopper | cambio material del anexo/proyecto |
| `tya-staff-annex` | tenant | admin/ops/coordinador/superadmin | cambio material |
| `tya-client-annex` | tenant/proyecto | cliente/representante | cambio material |
| `tya-country-gt` | país | usuarios Guatemala | cambio normativo/material |
| `tya-country-hn` | país | usuarios Honduras | cambio normativo/material |

No deben hardcodearse `cinepolis` ni un país único como arquitectura global. La audiencia y scope se configuran.

---

# CAMPOS QUE FALTAN PARA CONVERTIR ESTE BORRADOR EN CANDIDATA LEGAL APROBABLE

1. **Identidad contractual exacta del Operador TyA en Guatemala:** nombre/razón legal, NIT, domicilio y representante cuando aplique.
2. **Estructura de operación en Honduras:** confirmar si contrata la misma entidad guatemalteca, una sucursal, una entidad local o un tercero/franquiciado.
3. **Canales oficiales:** correo legal, privacidad e incidentes.
4. **Tabla de retención:** aprobar plazos por cuenta, HR/histórico, evidencias, certificaciones, liquidaciones/pagos, datos bancarios/documentos y receipts legales.
5. **Proveedores al go-live:** confirmar cuáles estarán realmente activos al momento de publicación; no listar Make/Gemini/Storage como receptores si siguen gated.
6. **Foro y resolución de controversias por país y relación:** individual vs Cliente B2B.
7. **Titular/licenciante del software CXOrbia:** nombre contractual que debe figurar si se desea identificarlo expresamente.
8. **Política de datos bancarios y documentos:** confirmar si se almacenan dentro de CXOrbia o si solo se conservan referencias/tokens/estados.
9. **Grabaciones/geolocalización:** confirmar qué proyectos las usarán realmente y bajo qué reglas.
10. **Revisión profesional:** abogado de Guatemala y, para operación hondureña, abogado local o revisión específica de Honduras antes de publicación.

---

# CHECKLIST DE APROBACIÓN HUMANA

Antes de materializar:
- [ ] Operador TyA identificado.
- [ ] Países y entidad contratante confirmados.
- [ ] Texto revisado por Paula.
- [ ] Revisión legal profesional completada o riesgo aceptado expresamente.
- [ ] Tabla de retención aprobada.
- [ ] Proveedores activos confirmados.
- [ ] Foro por país confirmado.
- [ ] Titular/licenciante CXOrbia confirmado.
- [ ] Alcance por rol confirmado.
- [ ] Versión final inmutable asignada.
- [ ] Digest SHA-256 calculado sobre contenido canónico final.
- [ ] Ningún consentimiento opcional mezclado con aceptación obligatoria.
- [ ] Ninguna casilla premarcada.
- [ ] Materialización provider-authoritative autorizada expresamente.
- [ ] Aceptación ejecutada solo por humano autenticado.
