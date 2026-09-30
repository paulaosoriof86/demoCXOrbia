# DRAFT LEGAL TyA V0.2 — NO-CODE / REBRAND-SAFE · REVISIÓN HUMANA OBLIGATORIA

**Fecha:** 2026-08-15  
**Estado:** `DRAFT_ONLY__NOT_APPROVED__TENANT_VALUES_NOT_HARDCODED__NO_PROVIDER_MATERIALIZATION__NO_ACCEPTANCE__NO_PRODUCTION`  
**Draft version:** `tya-legal-bundle-v0.2-draft-20260815`  
**Relación con V0.1:** este documento incorpora las decisiones humanas recibidas después de V0.1 y reemplaza las secciones indicadas. Las cláusulas de V0.1 no modificadas permanecen como base de redacción. Antes de publicación deberá generarse un texto final consolidado único, inmutable y con SHA-256 final.

## 0. Regla prevalente: tenant no-code y rebranding

La arquitectura legal no puede depender de valores TyA, Honduras, Guatemala, Cinépolis, CXOrbia, Gravicentra, correos, NIT, evidencias o proveedores escritos en código.

Los datos variables deben resolverse desde configuración provider-authoritative administrable desde la Plataforma. El contrato reusable fuente es:

`backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`

Reglas:

1. Los datos específicos de TyA pertenecen únicamente al tenant TyA.
2. Otros tenants reutilizan el mismo esquema con sus propios datos.
3. Los datos legales del tenant se editan desde UI autorizada y generan auditoría de revisión.
4. Un cambio de configuración NO reescribe un documento legal ya publicado ni una aceptación histórica.
5. Un cambio jurídicamente material genera evaluación de impacto y, si corresponde, una nueva versión legal que debe volver a revisarse y aceptarse humanamente.
6. El nombre comercial de la plataforma es dinámico. En el cuerpo contractual debe preferirse “la Plataforma”; el nombre visible se resuelve desde configuración.
7. Ningún texto debe afirmar que una marca está registrada si el estado provider-authoritative no contiene una referencia registral verificada.

## 1. Identidad contractual TyA — decisión resuelta sin hardcodear valores

### 1.1 Modelo jurídico recomendado

Al tratarse de una empresa mercantil individual en Guatemala, la redacción contractual no debe fingir que el nombre comercial constituye por sí solo una persona jurídica separada.

La plantilla recomendada para el tenant TyA es:

`{{tenant.operator.ownerOrContractingPersonName}}, comerciante individual y propietaria de la empresa mercantil {{tenant.operator.legalDisplayName}}, identificada tributariamente con {{tenant.operator.taxId}}, con domicilio comercial/legal en {{tenant.operator.legalDomicile}} (el “Operador TyA”).`

Los valores exactos de nombre comercial, propietaria y NIT fueron confirmados humanamente por Paula en la revisión de 2026-08-15, pero **no se copian a runtime code ni a este contrato reusable**. Deben materializarse únicamente en `tenantLegalProfile` bajo gate provider posterior.

Esta estructura es coherente con el Código de Comercio de Guatemala: el comerciante individual ejerce en nombre propio, mientras la empresa mercantil es una cosa mercantil/organización económica y la personalidad jurídica separada corresponde a sociedades mercantiles constituidas como tales.

### 1.2 Operación Honduras

Para el tenant TyA, Honduras se configura como país de operación del mismo Operador TyA establecido en Guatemala. No se crea ni se presume una entidad hondureña, sucursal, franquiciado local o tercero distinto mientras no exista una decisión y soporte legal específicos.

El anexo Honduras seguirá aplicando a la operación, usuarios, evidencias y normas imperativas que correspondan en Honduras, pero la contraparte contractual por defecto continúa siendo el Operador TyA configurado en Guatemala, salvo contrato específico que disponga otra cosa.

### 1.3 Franquicia

La condición de franquiciada y la gestión regional se registran como atributos del tenant, no como lógica global de la Plataforma. La configuración debe permitir cambiar posteriormente el modelo de franquicia, países operados o entidad contratante sin tocar código.

## 2. Contactos legales y de privacidad — no-code

Los canales `legal`, `privacy` y `securityIncidents` deben ser campos provider-authoritative editables desde Configuración > Legal y cumplimiento.

Para la primera candidata TyA pueden iniciar apuntando al mismo correo oficial confirmado humanamente por Paula. El valor exacto no se hardcodea en fuente. La UI debe permitir cambiar posteriormente uno, dos o los tres canales sin despliegue.

Cambio de correo:
- actualiza el perfil legal del tenant y su auditoría;
- no borra el correo que figuraba en versiones legales históricas;
- si el correo aparece materialmente dentro del aviso publicado, la publicación debe generar una nueva versión o una revisión de metadatos jurídicamente controlada, según determine el asesor.

## 3. Rebranding y propiedad intelectual de la Plataforma

### 3.1 Regla de nombre

Se reemplaza en el texto legal permanente cualquier dependencia del nombre “CXOrbia”. El documento final utilizará principalmente **“la Plataforma”** y podrá mostrar `{{platform.displayName}}` como denominación comercial actual.

Esto permite rebranding sin reescribir código y sin invalidar automáticamente contratos por un cambio puramente de marca.

### 3.2 Marca no registrada

Mientras la marca comercial elegida no esté registrada, la Plataforma puede usarla como nombre comercial si jurídicamente procede, pero **no** deberá mostrar símbolos, textos o declaraciones que indiquen registro marcario inexistente. El estado será configurable como `unregistered`, `application_pending` o `registered`, y una declaración de registro exige referencia verificable.

### 3.3 Titular/licenciante recomendado en esta etapa

Mientras no exista una cesión formal a una sociedad tecnológica u otro vehículo jurídico, la candidata legal debe identificar como titular/licenciante a la persona que pueda acreditar los derechos correspondientes, no a una marca por sí sola.

Recomendación actual:

`{{platformLicensor.licensorName}}`, con fundamento `creator_owner` o el instrumento jurídico que corresponda.

Si posteriormente los derechos se ceden formalmente a Gravicentra o a otra entidad, el campo podrá modificarse mediante configuración legal **solo después de que exista el instrumento de cesión/licencia**. Cambiar el valor en la UI no constituye por sí mismo una transferencia de propiedad intelectual.

El nombre “Gravicentra” puede utilizarse como marca visible futura si así se decide, pero no debe confundirse marca con titularidad del software ni con registro marcario.

## 4. Retención — recomendación V0.2

La preferencia humana indicada fue conservar evidencias por un mínimo de 60 días. Se adopta como piso configurable, pero se recomienda un default operativo mayor para evitar pérdida prematura ante revisiones, disputas, retrabajos y ciclos de pago.

### 4.1 Matriz recomendada

| Categoría | Default recomendado | Configurable | Regla de cierre |
|---|---:|---|---|
| Evidencia cruda de campo: foto/video/audio/comprobante | **90 días** desde aceptación final de la visita/proyecto | Sí, por proyecto, con piso default 60 días | borrar/anonimizar al vencer salvo legal hold, contrato cliente o investigación |
| Geolocalización precisa | **90 días** desde aceptación final | Sí, por proyecto | conservar solo si el proyecto la habilitó; no recolectar globalmente |
| Cuestionario, score, resultado y reporte final | **5 años** | Sí, sujeto a ley/contrato | archivo restringido o eliminación posterior |
| Auditoría operativa relevante, cambios y estados | **5 años** | Sí, sujeto a ley/contrato | preservar integridad histórica |
| Liquidaciones, pagos y registros financieros | **5 años** mínimo de referencia operativa/comercial | Puede ampliarse | conservar soporte exigible; separar del dato bancario completo |
| Cuenta bancaria completa | mientras el Shopper esté activo y hasta **180 días** después del último pago/deactivación | Sí con control legal | después eliminar dato completo y conservar solo referencia enmascarada/fingerprint si se necesita auditoría |
| Documentos de identidad | únicamente mientras exista necesidad contractual/legal | Sí por proceso | eliminar archivo crudo cuando deje de ser necesario; preservar atributos mínimos si procede |
| Receipt de aceptación legal | **5 años** después de terminar la relación o plazo mayor por disputa/ley | Solo ampliar | inmutable, no reescribir versión |

### 4.2 Fundamento de la recomendación

El default de 90 días para evidencia cruda **no se presenta como plazo legal obligatorio**; es una decisión de minimización/operación más prudente que 60 días y debe poder cambiarse por proyecto.

Para documentación mercantil relevante se toma como referencia conservadora el artículo 382 del Código de Comercio de Guatemala, que exige al comerciante conservar los documentos de su empresa por no menos de cinco años, salvo ley especial. Por ello no debe aplicarse la regla de 60/90 días a registros comerciales, financieros o probatorios que deban conservarse más tiempo.

Un `legalHold` debe suspender cualquier borrado automático relacionado con una disputa, investigación, reclamación, auditoría o requerimiento de autoridad.

## 5. Datos bancarios y documentos sensibles

Se acepta que el flujo TyA pueda conservar **números de cuenta completos** cuando sean necesarios para liquidar/pagar al Shopper.

Esto solo será válido si el backend implementa:
- cifrado en tránsito;
- cifrado en reposo o protección equivalente a nivel de campo;
- acceso por mínimo privilegio;
- UI enmascarada por defecto;
- revelado completo solo a roles autorizados y con trazabilidad;
- cero datos bancarios en repo, logs, prompts IA o exports no aprobados;
- eliminación del dato completo conforme a la política de retención, conservando únicamente referencia enmascarada/fingerprint cuando sea suficiente.

Para documentos, la regla será **mínimo indispensable**: no almacenar un documento completo si el proceso puede resolverse con un atributo verificado, estado, referencia o archivo menos sensible.

## 6. Evidencias por proyecto — no-code obligatorio

Foto, video, audio, geolocalización, comprobantes y otros tipos de evidencia **no son una regla global del tenant ni del producto**.

En `Crear proyecto` y `Editar proyecto` debe existir una sección no-code `Evidencias y privacidad`, con al menos:
- foto: no / opcional / obligatoria;
- video: no / opcional / obligatorio;
- audio: no / opcional / obligatorio;
- geolocalización: no / opcional / obligatoria;
- comprobante/recibo: no / opcional / obligatorio;
- otros tipos configurables;
- instrucciones de captura;
- retención específica del proyecto o herencia del default del tenant;
- referencia de autorización/criterio legal cuando corresponda.

Biometría, reconocimiento facial u otros tratamientos de alto impacto **no** pueden habilitarse desde una simple selección normal; requieren gate legal separado.

Así, Cinépolis, IQOS, indumentaria, Maple Bear o cualquier cliente futuro pueden tener reglas distintas sin convertirse en lógica global.

## 7. Proveedores e integraciones — política decidida por arquitectura

Paula no debe mantener manualmente en un documento jurídico una lista técnica que puede cambiar.

La lista de proveedores se obtiene de un **Provider Registry** provider-authoritative:

- `technicalActiveState`: derivado del estado real de la infraestructura/integración;
- `displayName`, propósito, categorías de datos y referencias contractuales: administrables desde UI;
- un proveedor deshabilitado no se describe como receptor actual de datos;
- activar un proveedor con flujo nuevo de datos dispara evaluación legal y puede generar nueva versión del aviso de privacidad.

### 7.1 Go-live inicial

Make y Gemini permanecen **no activos** mientras sigan gated; no se listarán como receptores actuales al publicar.

El proveedor de infraestructura core que efectivamente soporte Auth/Firestore/Storage/Hosting o equivalentes deberá ser incorporado automáticamente al registro cuando el entorno productivo esté definido y activado. No se fija su estado jurídico actual por anticipado en este borrador.

Después de producción, las integraciones podrán configurarse desde la Plataforma sin tocar código, pero su activación técnica seguirá sujeta a sus gates de seguridad/proveedor y a la evaluación legal correspondiente.

## 8. Resolución de controversias — recomendación

La preferencia humana es arbitraje. Se adopta de forma diferenciada, evitando convertir una cláusula B2B en una renuncia indiscriminada para usuarios individuales.

### 8.1 Clientes y relaciones B2B

Recomendación base TyA:
1. negociación directa de buena fe;
2. si no se resuelve, conciliación opcional/institucional;
3. arbitraje institucional en Guatemala cuando el contrato lo permita, con sede en Ciudad de Guatemala y español, conforme a la Ley de Arbitraje, Decreto 67-95, y reglamento de la institución arbitral elegida en el contrato.

Para la candidata contractual se recomienda **CRECIG** como opción institucional por su especialización y reglamento arbitral vigente, sin impedir que un contrato de Cliente adopte CENAC u otra institución válida.

La cláusula B2B específica debe quedar en el contrato comercial del Cliente; el Acuerdo de plataforma puede remitir a ella.

### 8.2 Usuarios individuales / Shoppers

No se recomienda imponer todavía una cláusula arbitral universal a todos los Shoppers desde la UI. La relación concreta puede involucrar derechos imperativos o materias no arbitrables y debe revisarse por país.

Default recomendado:
- gestión de reclamación directa con TyA;
- conciliación cuando sea apropiada;
- tribunales competentes para materias no arbitrables o cuando la cláusula arbitral no sea jurídicamente válida;
- arbitraje solo si el abogado local confirma que es válido para esa relación y se acepta expresamente en un documento adecuado.

### 8.3 Honduras

La operación hondureña sigue siendo gestionada por el Operador TyA de Guatemala. En contratos B2B transfronterizos puede mantenerse una sede arbitral en Guatemala si el contrato lo establece válidamente. Esto no elimina normas imperativas hondureñas aplicables a actividades o usuarios en Honduras. La Ley de Conciliación y Arbitraje hondureña, Decreto 161-2000, queda como referencia del anexo local.

## 9. Reemplazo de cláusula de identificación en el documento final

Reemplazar en V0.1 cualquier frase que presente `TyA / CXOrbia` como nombres jurídicos rígidos por:

`Este Acuerdo regula el acceso y uso del entorno configurado para {{tenant.operator.legalDisplayName}} sobre {{platform.genericLegalReference}}, actualmente identificada comercialmente como {{platform.displayName}} cuando corresponda (la “Plataforma”).`

La identificación contractual del operador se resolverá desde el tenant legal profile y se mostrará en el encabezado/aviso aplicable.

## 10. Reemplazo de cláusula de propiedad intelectual

Texto recomendado:

`La Plataforma, su software, código, arquitectura, interfaces, diseños, documentación, esquemas, componentes y metodologías tecnológicas están protegidos por los derechos de propiedad intelectual que correspondan a su titular o licenciante identificado en la configuración legal vigente y respaldado por el título, creación, cesión o licencia aplicable. El nombre comercial o marca visible de la Plataforma puede cambiar sin que ello implique por sí mismo una transferencia de los derechos sobre el software. Ningún cambio en la configuración constituye una cesión de propiedad intelectual.`

`Mientras una marca no conste como registrada mediante referencia verificable, la Plataforma no afirmará que existe registro marcario.`

## 11. Reemplazo de cláusula de proveedores

Texto recomendado:

`TyA utiliza únicamente los proveedores tecnológicos que se encuentren efectivamente habilitados para la operación del tenant y de los proyectos aplicables. La lista vigente, finalidad y categorías de datos se obtiene del registro de proveedores de la Plataforma. Un proveedor técnicamente preparado pero deshabilitado no se considera receptor actual de datos. La activación de un nuevo proveedor que implique un cambio material en el tratamiento será evaluada antes de su uso y podrá requerir actualización del aviso de privacidad.`

## 12. Reemplazo de cláusula de retención resumida para UI

Texto recomendado:

`Conservamos cada categoría de información durante el plazo configurado para su finalidad y proyecto. Como regla inicial, las evidencias crudas de campo se conservan normalmente 90 días después de su aceptación final, sin bajar del mínimo operativo configurado de 60 días salvo decisión legal/contractual aprobada. Los registros comerciales, financieros, de auditoría y de aceptación pueden conservarse por plazos mayores, incluyendo cinco años cuando corresponda. Una investigación, reclamación o obligación legal puede suspender temporalmente la eliminación.`

## 13. Contrato de configuración para Claude/prototipo — sin parchar UI desde backend

No se modifica `/app/modules` en este bloque. Claude/prototipo deberá incorporar, por archivo/módulo correspondiente, superficies no-code que consuman el contrato provider-authoritative:

1. `configuracion.js`: sustituir la semántica local “Guardar NDA” por `Legal y cumplimiento`, con perfil legal, contactos, retención, controversias y publicación/versionado; no persistir autoridad en localStorage.
2. `administrabilidad.js`: retirar cuando corresponda el lenguaje de “demo local” después de que provider legal esté realmente activado.
3. módulo de proyectos: `Crear/Editar proyecto > Evidencias y privacidad`, con reglas de foto/video/audio/geolocalización/comprobante/retención por proyecto.
4. integraciones: Provider Registry, donde el estado técnico real no pueda falsificarse manualmente.
5. marca/white-label: nombre visible, identidad visual y estado de registro marcario, separados del titular/licenciante jurídico.

Todo lo anterior debe ser reusable multi-tenant. Ningún valor TyA debe convertirse en constante global.

## 14. Datos TyA ya resueltos humanamente, pendientes solo de materialización provider

Quedan resueltos conceptualmente y no deben volver a preguntarse:

- operador: empresa mercantil individual gestionada por su propietaria/comerciante individual en Guatemala;
- país de establecimiento contractual: Guatemala;
- Honduras: operación administrada desde Guatemala por el mismo Operador TyA;
- nombre legal/comercial exacto y NIT: confirmados por Paula y por la documentación mercantil localizada;
- correo inicial legal/privacidad/incidentes: confirmado por Paula y debe ser editable;
- retención cruda: mínimo deseado 60 días; recomendación default 90 días;
- controversias: preferencia arbitraje, aplicada con diferenciación B2B/individual;
- titular/licenciante: mantener persona que acredita derechos hasta que exista cesión formal a entidad futura;
- datos bancarios: número completo permitido bajo controles reforzados;
- evidencias: configurables por proyecto;
- revisión profesional final: sí, antes de publicación.

Los valores exactos de NIT, correo y demás datos personales/empresariales no se replican como constantes en este archivo; el gate provider posterior los tomará de la aprobación humana y los almacenará en el tenant legal profile.

## 15. Pendientes reales antes de candidata legal final

1. Recuperar/confirmar **domicilio comercial/legal** que deba mostrarse públicamente; preferir domicilio mercantil/comercial registrado y evitar exponer domicilio residencial si no es necesario.
2. Definir el nombre visible de la plataforma para el primer go-live o permitir que el campo rebrand-safe se publique temporalmente con el nombre vigente sin afirmar registro de marca.
3. Revisión por abogado Guatemala y revisión específica de Honduras.
4. Consolidar V0.1 + V0.2 en un único texto final.
5. Calcular SHA-256 sobre el contenido canónico final.
6. Obtener aprobación humana expresa del texto consolidado.
7. Solo después autorizar materialización provider-authoritative y aceptación humana real.

## 16. Efectos reales de este bloque

Tenant/provider writes: `0`; legalContent writes: `0`; legalAcceptance writes: `0`; Auth/Firestore/HR/Storage/Rules/Make/Gemini/pagos writes: `0`; product entrypoint activation: `0`; `/app/modules` changes: `0`; `/app/core` changes: `0`; deploy: `0`; merge=false; producción=false.

**GO-LIVE formal permanece 35% completado / 65% pendiente; I3 = 0/25 hasta cierre integral.**
