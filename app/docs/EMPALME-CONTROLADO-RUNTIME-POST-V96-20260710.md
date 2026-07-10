# Empalme controlado del runtime post-V96

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Autorización

Paula autorizó explícitamente proceder con el empalme del runtime del source lock operativo post-V96. Esta autorización cubre únicamente el empalme controlado en la rama y sus validaciones; no autoriza deploy, producción, Auth/Firestore real, imports, writes, HR writeback, Make, Gemini, Storage ni pagos.

## Ejecución

Se aplicó el source lock `Prototype development request.zip` post-V96 mediante un orquestador one-shot y verificaciones criptográficas.

- SHA-256 del ZIP auditado: `80feb7c7809d28657b5eec243aa187f678c023ecd471a9f9404e52d285bd2663`.
- Commit de runtime empalmado: `86e592db3f9f8016080302a852bfd194097b2074`.
- Mensaje: `feat(cxorbia): empalma runtime source lock post-V96`.
- Archivos runtime reemplazados/controlados: 37.
- Archivos adicionales backend/patch preservados: 27.

El proceso restauró desde el commit V96 conocido los archivos cuyo source lock no cambió y superpuso únicamente los 10 archivos que sí cambiaron en la candidata post-V96. No se sustituyó la rama a ciegas ni se eliminaron archivos adicionales.

## Validaciones previas al commit

El orquestador solo permitió crear el commit después de:

1. verificar el SHA-256 del paquete delta reconstruido;
2. verificar el SHA-256 del archivo comprimido;
3. ejecutar el gate de los 67 hashes del source lock;
4. validar sintaxis de todos los JavaScript bajo `app`;
5. comprobar scripts locales de `index.html`, sin faltantes ni duplicados;
6. validar `manifest.webmanifest`;
7. comprobar service worker y charset UTF-8;
8. confirmar que el workflow de deploy DEV continúa manual-only;
9. confirmar que los 27 archivos adicionales permanecen presentes;
10. confirmar que el conjunto de cambios runtime era exactamente el conjunto esperado de 37 archivos.

## Estado de CI

El commit fue generado por GitHub Actions. Los runs de `pull_request` asociados a ese commit quedaron como `action_required` sin jobs, por la protección de GitHub frente a ejecuciones encadenadas creadas con `GITHUB_TOKEN`.

Este documento se agrega mediante un commit independiente para provocar una nueva evaluación normal de los gates del PR. Hasta obtener esos resultados no se actualizará el SHA runtime validado.

## Impacto Phase A TyA

El empalme alinea la rama con el prototipo post-V96 que cerró el P0 de permisos, cliente multi-proyecto y copy honesto. Permite continuar después con Auth/Firestore DEV limpio, pero no los activa.

Protege los dominios ya trabajados:

- HR como fuente operacional;
- shoppers históricos;
- certificaciones carryover;
- liquidaciones y pagos de junio;
- proyecto Cinépolis configurable dentro del tenant TyA;
- reviewQueue y auditEvents;
- futuro switch único de `CX.data`.

## Adiciones preservadas

Los 27 archivos adicionales de backend/patch permanecen en la rama, pero el `index.html` del source lock no los activa automáticamente. Deben revisarse y consolidarse después, sin romper la identidad del source lock.

Incluyen adapters/bridges backend deshabilitados o preview, guards, source-safe preview, módulos V91, rutas y patches incrementales de Academia.

## Clasificación

- **Reusable CXOrbia:** orquestador de empalme con hashes, conjunto exacto de archivos, preservación de extras y validaciones fail-closed.
- **Exclusivo cliente:** reglas y contenido TyA/Cinépolis contenidos en el source lock.
- **Claude/prototipo:** consolidación futura de patches, P1 de permisos/copy y smoke visual por rol.
- **Academia:** revisar manuales, cursos y rutas por rol contra el runtime empalmado; preservar acciones administrativas/Crear con IA como pendientes de consolidación.
- **Sin impacto Claude:** empaquetado, hashes, CI, verificación de sintaxis y control de deploy manual-only.

## Estado seguro

- sin merge;
- sin deploy nuevo;
- sin producción;
- sin Auth real, usuarios o claims;
- sin Firestore reads/writes;
- sin import real;
- sin `CX.data` runtime switch;
- sin HR writeback;
- sin Make/Gemini/Storage;
- sin pagos reales;
- sin datos sensibles crudos.

## Siguiente paso

Esperar la evaluación normal de los gates sobre el commit documental actual. Si source lock, sintaxis, smoke y readiness pasan, se actualizará el SHA validado al commit runtime `86e592db3f9f8016080302a852bfd194097b2074`, sin desplegar. Si algún gate falla, se corregirá antes de avanzar.
