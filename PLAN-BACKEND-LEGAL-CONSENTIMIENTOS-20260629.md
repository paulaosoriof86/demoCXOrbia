# PLAN-BACKEND-LEGAL-CONSENTIMIENTOS-20260629

## Objetivo

Agregar una capa legal persistente para documentos aceptados por usuarios, clientes, aliados y socios.

## Alcance

- Confidencialidad por tipo de usuario.
- Aviso y permiso de tratamiento de datos.
- Condiciones del portal de clientes.
- Documentos reforzados para aliados y socios.
- Versiones imprimibles.
- Aceptación digital persistente.
- País aplicable: Colombia y Guatemala.

## Nota

El sistema debe administrar versiones, aceptación y evidencia técnica. El texto jurídico final debe ser revisado por abogado local antes de uso productivo.

## Documentos base

```text
termsOfUse
privacyNotice
dataProcessingAuthorization
confidentialityAgreement
nda
softwareProtectionAgreement
partnerAgreementAddendum
clientPortalTerms
shopperOperationalNda
supplierConfidentiality
```

## Roles o relaciones

```text
superAdmin
admin
ops
coordinador
aliado
shopper
clientUser
financeUser
supportUser
externalSupplier
strategicPartner
franchisee
businessPartner
```

## Reglas de acceso

- Si un documento obligatorio no está aceptado, el usuario no entra al dashboard.
- La aceptación es por versión, país, rol y tenant.
- Si cambia la versión, se debe pedir nueva aceptación.
- Cada aceptación debe guardar evidencia técnica.
- Debe poder imprimirse o descargarse una versión del documento aceptado.

## Datos mínimos de aceptación

```text
tenantId
userId
role
country
documentType
documentId
version
documentHash
acceptedAt
acceptedFrom
language
status
```

## Colecciones propuestas

```text
tenants/{tenantId}/legalTemplates/{templateId}
tenants/{tenantId}/legalDocuments/{documentId}
tenants/{tenantId}/legalAcceptances/{acceptanceId}
tenants/{tenantId}/legalAcceptanceRequirements/{requirementId}
tenants/{tenantId}/legalPrintJobs/{printJobId}
tenants/{tenantId}/legalAuditLogs/{auditId}
```

## Integración con login

1. Auth valida usuario.
2. Backend calcula documentos obligatorios según tenant, país, rol y relación.
3. Si falta aceptación, se muestra pantalla legal obligatoria.
4. Si acepta, se guarda legalAcceptance.
5. Si no acepta, no ingresa.

## Integración con Configuración

Configuración debe administrar plantillas, documentos, vigencia, país, rol, obligatoriedad, idioma, publicación, archivo y reaceptación.

## Colombia

Contemplar Ley 1581 de 2012 y Habeas Data: finalidad, autorización, derechos del titular, responsable del tratamiento, datos sensibles cuando aplique y canales de consultas/reclamos.

## Guatemala

Contemplar artículo 31 constitucional sobre acceso a archivos y registros con datos de la persona, Decreto 57-2008 como referencia en acceso a información pública y reforzar relaciones privadas por aceptación contractual.

## Socios, aliados y franquiciados

Deben tener documentos separados y más robustos que los usuarios operativos, con protección de información comercial, técnica, financiera, operativa, know-how, software, metodologías y uso posterior de información recibida.

## Prioridad

P0/P1 antes de habilitar clientes, aliados, franquiciados o socios externos.
