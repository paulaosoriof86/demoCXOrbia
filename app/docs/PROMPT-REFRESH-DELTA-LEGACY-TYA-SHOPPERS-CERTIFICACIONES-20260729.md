# Prompt de refresh legacy TyA — shoppers + certificaciones solamente

**Fecha:** 2026-07-29  
**Objetivo:** actualizar el carryover útil desde la plataforma TyA Consultores legacy que sigue operativa, sin copiar código, fixes, dashboard, arquitectura ni visitas ya cubiertas por HR.

## Cómo usar
Ejecutar este prompt **en la conversación/proyecto de la plataforma TyA Consultores actualmente operativa**, la que será retirada cuando CXOrbia entre en producción.

No ejecutar sobre `cxorbia-backend-dev` ni sobre el sandbox `cxorbia-tya-dev-260729-c4`.

## Prompt

```text
Necesito preparar un REFRESH DE DATOS ÚTILES para migrar a CXOrbia.

CONTEXTO OBLIGATORIO
- Esta plataforma es la TyA Consultores legacy actualmente operativa y será retirada.
- NO vamos a migrar su código, arquitectura, dashboard, parches, fixes, configuraciones internas ni lógicas defectuosas.
- NO debes modificar esta plataforma ni su base.
- NO debes enviar datos a otra base ni conectarte al backend nuevo.
- Solo debes LEER y EXPORTAR un snapshot limpio de SHoppers y CERTIFICACIONES para que el sistema nuevo calcule el delta.
- Las VISITAS no forman parte de este refresh porque su fuente principal en CXOrbia es la HR viva.

ALCANCE EXACTO
Exporta el universo actual completo de:

1. SHOPPERS
Por cada shopper incluye únicamente, si existe:
- legacyShopperId / id estable;
- código estable de shopper;
- nombre y apellidos;
- email;
- teléfono;
- país;
- ciudad;
- estado activo/inactivo;
- fecha de creación;
- fecha de última actualización;
- cualquier ID técnico estable necesario para enlazar sus certificaciones.

NO incluir:
- contraseñas ni hashes de contraseña;
- DPI/cédula/documentos de identidad;
- cuentas bancarias o información de pago;
- NDA/documentos firmados;
- archivos adjuntos;
- notas internas sensibles;
- tokens, secretos, API keys o credenciales.

2. CERTIFICACIONES / EXÁMENES YA PRESENTADOS
Exporta TODA certificación o evaluación que un shopper ya haya presentado, no solo las aprobadas, para no obligarlo a repetir por pérdida de historial.

Por cada registro incluye únicamente, si existe:
- certificationId / attemptId estable;
- legacyShopperId o código estable que permita enlazar con shoppers;
- projectId/proyecto o programa al que pertenece;
- courseId / certificationType / nombre de certificación;
- presentedAt / fecha de presentación;
- approvedAt si aplica;
- status (presentada, aprobada, reprobada, pendiente de revisión, etc.);
- score/resultado si existe;
- attemptNumber si existe;
- vigencia/fecha de expiración si existe;
- createdAt y updatedAt;
- sourceKey estable si existe.

NO incluir respuestas pregunta por pregunta ni contenido sensible que no sea necesario para reconocer que la certificación fue presentada y su resultado.

3. METADATOS DEL SNAPSHOT
Incluye:
- generatedAt en ISO 8601;
- nombre/identificador de esta plataforma legacy;
- conteo total de shoppers exportados;
- conteo total de certificaciones/attempts exportados;
- colecciones/tablas de origen utilizadas;
- campos descartados por seguridad;
- cualquier limitación conocida del export.

CONTROL DE CALIDAD
- No deduplicar solo por nombre.
- Preservar IDs estables.
- Si detectas dos registros que parecen la misma persona pero no puedes demostrarlo por llave estable, NO fusionarlos: colócalos en REVIEW_REQUIRED.
- No inventar emails, teléfonos, fechas, scores, estados ni IDs.
- No convertir una certificación “presentada” en “aprobada” si la fuente no lo dice.
- No descartar certificaciones reprobadas/presentadas: son parte del historial útil.
- Si existe un shopper sin ID estable suficiente, colócalo en REVIEW_REQUIRED.
- Si una certificación no puede enlazarse con certeza a un shopper, colócala en REVIEW_REQUIRED.

ENTREGABLE
Genera un único JSON UTF-8 con esta estructura:

{
  "schemaVersion": "tya.legacy.shoppers-certifications-refresh.v1",
  "generatedAt": "...",
  "source": {
    "system": "TyA Consultores legacy",
    "readOnly": true,
    "tablesOrCollections": []
  },
  "shoppers": [],
  "certifications": [],
  "reviewRequired": [],
  "discarded": [],
  "summary": {
    "shoppers": 0,
    "certifications": 0,
    "reviewRequired": 0,
    "discarded": 0
  },
  "security": {
    "passwordsExcluded": true,
    "identityDocumentsExcluded": true,
    "bankDataExcluded": true,
    "ndaExcluded": true,
    "secretsExcluded": true
  }
}

IMPORTANTE
- Este archivo NO se importa automáticamente.
- NO hagas writes.
- NO cambies usuarios ni Auth.
- NO exportes visitas, finanzas, pagos, dashboard, notificaciones o lógica de negocio salvo que sea estrictamente necesario como llave de una certificación; si ocurre, explica el motivo sin incluir datos extra.
- Entrega además un resumen corto con los conteos y cualquier conflicto encontrado.
```

## Uso posterior en CXOrbia
1. Validar schema y seguridad.
2. Comparar shoppers contra los ya existentes en `cxorbia-backend-dev` por llaves estables.
3. Crear únicamente shoppers faltantes o updates demostrables.
4. Materializar certificaciones faltantes conservando presentadas/aprobadas/reprobadas según fuente.
5. Conflictos a revisión humana.
6. Cero import automático hasta gate/autorización expresa.

## Clasificación
- Reusable CXOrbia: patrón de refresh incremental legacy.
- Exclusivo TyA: campos/origen de TyA legacy.
- Claude/prototipo: sin impacto inmediato.
- Academia: conservar historial de certificación evita repetir cursos/evaluaciones injustificadamente.

## Estado seguro
Documento/prompt únicamente. No ejecuta export, import, Firestore/Auth/Storage/HR writes, Hosting, Make/Gemini, pagos, merge ni producción.
