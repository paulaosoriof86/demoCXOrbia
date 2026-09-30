# Resumen para Claude/backend — empalme runtime post-V96

Fecha: 2026-07-10

## Decisión vigente

El runtime del source lock post-V96 quedó empalmado y validado en la rama activa. No volver a V96/V95 como baseline salvo rollback justificado. No rehacer el P0 que la candidata ya resolvió.

Runtime validado:

`86e592db3f9f8016080302a852bfd194097b2074`

## Lo que debe preservarse

- `CX.MOD_CAT` cubriendo `hrsource`, `novedades`, `saas`, `diagnostico` y `administrabilidad`;
- módulos desconocidos sin apertura total;
- coordinador/aliado/custom gobernados por matriz;
- cliente multi-proyecto y proyecto activo preservado;
- selector cliente cuando existe más de un proyecto;
- copy manual/WhatsApp más honesto;
- Cinépolis como proyecto configurable TyA, no lógica global;
- separación entre prototipo y backend real;
- deploy DEV manual-only;
- gates de Auth/Firestore, imports, providers y pagos apagados.

## Lo que Claude no debe hacer

- no sustituir a ciegas el runtime por una versión anterior;
- no borrar los 27 archivos adicionales sin revisión;
- no activar bridges/adapters backend desde `index.html`;
- no representar Auth, Firestore, Make, Gemini, Storage, HR sync o pagos como conectados;
- no hardcodear TyA/Cinépolis como arquitectura global;
- no reactivar deploy automático;
- no publicar contenido IA sin revisión humana.

## P1 quirúrgico pendiente

1. Categorizar/allowlistear `cli_*` para permisos cliente granulares.
2. Convertir módulo desconocido a `false` salvo allowlist explícita antes de producción.
3. Rotular copy residual de Soporte y Mis Visitas como borrador/fallback manual.
4. Mejorar HR Source de `Conectado` a `Conectado por backend` cuando aplique.
5. Clasificar las 36 coincidencias del scanner histórico de copy; corregir únicamente promesas engañosas reales.
6. Validar por ruta/acción los scopes de coordinador, aliado y custom antes de materializar claims.
7. Revisar los 27 archivos adicionales y decidir: preservar disabled/preview, reubicar o consolidar.
8. Preservar o consolidar deliberadamente `academia-admin-actions.js` y `academia-create-ai-stable.js`.

## Evidencia técnica

- 67/67 hashes del source lock;
- 91 JavaScript sin errores de sintaxis;
- 61 scripts locales, sin faltantes ni duplicados;
- 49 módulos activos, sin duplicados;
- 9/9 requisitos semánticos post-V96;
- seis roles abrieron shell/vista en smoke automatizado;
- todos los gates técnicos quedaron en success;
- no hubo deploy nuevo.

## Observación de permisos

El smoke visual mostró `Admin del proyecto` para coordinador y aliado. Puede ser coherente con `projectAdmin`, pero debe confirmarse contra la matriz funcional antes de crear claims reales. El rol custom mostró solo Academia en captura, aunque el contador genérico detectó 30 botones descendientes. No convertir ese conteo en diagnóstico de acceso administrativo sin una prueba por rutas y acciones.

## Academia

Cada ajuste de permisos debe reflejarse en:

- ruta de aprendizaje por rol;
- manual de navegación y permisos;
- checklist de acceso esperado;
- errores frecuentes de acceso denegado;
- notificación cuando cambie una regla/rol;
- glosario de tenant, proyecto, scope y rol;
- estados de contenido IA con revisión humana.

## Estado seguro

El empalme no autoriza merge, deploy, producción, Auth/Firestore real, imports, writes, HR writeback, Make, Gemini, Storage ni pagos.
