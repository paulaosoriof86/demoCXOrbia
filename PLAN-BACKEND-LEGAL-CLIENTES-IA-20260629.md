# PLAN-BACKEND-LEGAL-CLIENTES-IA-20260629

## Decision

Los clientes del portal cliente tambien deben aceptar condiciones robustas cuando acceden al prototipo, demos, reportes, metodologias, dashboards, configuraciones o funcionalidades de CXOrbia.

Esto no reemplaza el contrato comercial principal. Es una capa digital de aceptacion dentro de la plataforma.

## Alcance para clientes

Los clientes deben aceptar documentos que cubran:

- confidencialidad de informacion de CXOrbia;
- confidencialidad de metodologia;
- confidencialidad de dashboards, reportes, flujos, configuraciones y prototipo;
- no copia ni reproduccion del software;
- no desarrollo de plataforma sustancialmente similar usando informacion recibida;
- no revision tecnica no autorizada del software;
- no redistribucion de reportes o materiales sin autorizacion;
- uso restringido del portal cliente;
- responsabilidad por usuarios internos invitados por el cliente;
- tratamiento de datos personales;
- limites razonables sobre resultados generados con IA.

## Diferencia entre cliente y socio/aliado

### Cliente

- Accede como usuario de servicio o prospecto.
- Ve reportes, dashboards, propuestas, prototipo, demos y resultados.
- Debe proteger la informacion y no copiar plataforma o metodologia.
- Su obligacion puede estar ligada al uso del portal, demo, propuesta o contrato comercial.

### Socio / aliado / franquiciado

- Puede conocer informacion comercial, operativa, financiera o estrategica mas sensible.
- Puede acceder a know-how, estructura de negocio, pricing, procesos internos y roadmap.
- Debe tener documentos mas estrictos y plazos posteriores definidos en contrato.

## IA: uso responsable

Agregar documento o clausula especifica para funcionalidades de inteligencia artificial.

Puntos minimos:

- La IA genera recomendaciones, analisis, resumenes, clasificaciones, textos, sugerencias y predicciones como apoyo operativo.
- Los resultados de IA no son garantia de exactitud, completitud, oportunidad ni resultado comercial especifico.
- El usuario debe revisar, validar y usar criterio profesional antes de tomar decisiones.
- La responsabilidad final de decisiones operativas, comerciales, legales, financieras o estrategicas corresponde al usuario o cliente que las adopta.
- CXOrbia no sustituye asesoria legal, financiera, contable, laboral o profesional especializada.
- Los modelos de IA pueden depender de proveedores externos configurados por el tenant o cliente.
- Los resultados pueden variar segun datos de entrada, configuracion, calidad de informacion, proveedor y modelo usado.
- Debe quedar registro de aceptacion de esta limitacion antes de usar modulos IA criticos.

## Tipos de documento adicionales

```text
clientPrototypeNda
clientSoftwareProtectionAgreement
clientAiUsageDisclaimer
clientPortalTerms
clientDataProcessingAuthorization
partnerAiUsageDisclaimer
```

## Reglas funcionales

- Cliente no entra al portal cliente si faltan documentos obligatorios.
- Cliente no puede abrir demo/prototipo si falta clientPrototypeNda.
- Cliente no puede usar recomendaciones IA si falta clientAiUsageDisclaimer.
- Socio, aliado o franquiciado no puede entrar si falta documento reforzado.
- Cada aceptacion se guarda por version y pais.
- Cada documento debe ser imprimible.
- Cada cambio de version debe solicitar nueva aceptacion.

## Backend

Se integra con el modelo ya creado:

```text
tenants/{tenantId}/legalTemplates/{templateId}
tenants/{tenantId}/legalDocuments/{documentId}
tenants/{tenantId}/legalAcceptances/{acceptanceId}
tenants/{tenantId}/legalAcceptanceRequirements/{requirementId}
tenants/{tenantId}/legalPrintJobs/{printJobId}
tenants/{tenantId}/legalAuditLogs/{auditId}
```

## Campos adicionales recomendados

```text
relationshipType: client|prospect|strategicPartner|franchisee|businessPartner
accessContext: portal|prototype|demo|proposal|contract|aiModule
aiProvider: gemini|openai|anthropic|custom|null
aiFeature: string|null
requiresHumanReview: boolean
liabilityNoticeAccepted: boolean
```

## Nota para Claude

En Configuracion > Legal / NDA / Documentos debe existir una matriz por pais, rol, tipo de relacion, tipo de acceso, documento obligatorio, version vigente, bloqueo de login, bloqueo de portal cliente, bloqueo de modulos IA e impresion.

## Nota juridica

Los textos deben ser plantillas administrables, pero la version final debe revisarla abogado local antes de produccion en Colombia y Guatemala.
