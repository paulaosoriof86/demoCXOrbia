# INCIDENCIAS-INTEGRACION-BACKEND-V57.md

## 2026-06-30 - Estado despues de B2/B3

- El ZIP V57 fue localizado en `C:\Users\paula\Downloads` y usado para portar/comparar `/app`.
- La copia V57 no dejo diferencias visuales adicionales en `app/index.html` ni `/app/modules`.
- El preview backend se mantiene separado en `app/index-backend-dev.html`.
- El adapter global no se activo en `app/index.html`.
- Se elimino la ruta de prompt de navegador para credenciales DEV.
- Las reglas para `bulletins`/`bulletinReads` quedaron preparadas localmente, pero no publicadas.
- El emulador Firestore no pudo validar reglas porque Java no esta disponible en PATH.
- No documentar para Claude errores derivados de `index-backend-dev.html`; Claude debe recibir solo errores visuales reales de V57.

Incidencias o riesgos de integración backend/local detectados al recibir V57. No son pendientes de Claude salvo que indiquen error visual/prototipo.

## 1. V57 aún es demo/localStorage

`app/index.html` no carga backend. Esto es correcto para prototipo, pero producción no puede salir desde ahí como operativa real.

Acción backend:

- Crear/portar `app/index-backend-dev.html` sobre V57.
- Cargar backend solo en preview.

## 2. Auth DEV pendiente en preview anterior

Se mantiene regla:

- No pedir datos sensibles temporales a Paula.
- No compartir credenciales en ChatGPT.
- No usar prompt de navegador.
- Resolver con flujo local/no versionado o control seguro.

## 3. Nuevos roles requieren reglas

V57 agrega `coordinador` y `aliado` con `scopeCountry`. Las reglas Firestore y claims deben ampliarse para:

- `countryScope` o países asignados;
- `projectIds`;
- `tenantId`;
- `role`.

## 4. Storage pasa a ser bloqueante

V57 usa logos, recursos, manuales y archivos embebidos. Para producción, localStorage/base64 no basta.

Acción backend:

- Storage para logos, recursos, evidencias, manuales y documentos.
- Firestore guarda metadata/URL.

## 5. Riesgo IA en cliente

`CX.ai.ask` puede hacer llamadas reales desde frontend si se configura así. Para producción comercial, evaluar función backend/proxy para proteger configuración privada.

## 6. Posible carácter roto

Archivo: `app/modules/aprendizaje.js`.

Hallazgo: fallback de icono contiene posible carácter roto.

Acción: revisar con Claude si el archivo se usa. Si se usa, corregir en prototipo V58.
