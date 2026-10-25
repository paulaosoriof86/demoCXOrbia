# INCIDENCIAS-INTEGRACION-BACKEND.md

Registro separado de incidencias de integración backend/local. No deben convertirse automáticamente en pendientes para Claude/prototipo.

## 2026-06-30 — Preview backend RC

### Incidencia 1: badge no prueba conexión real

Observación:

- El preview mostró una insignia de backend DEV conectado.
- Sin embargo, también mostró proyecto `banca`, 3 proyectos, 108 visitas, 16 shoppers, 48 postulaciones y Auth pendiente.

Interpretación:

- La página backend DEV está cargando, pero esos conteos parecen venir de demo/localStorage, no de TyA Firestore real.
- El badge debe distinguir entre script cargado, Auth OK, fuente Firestore y fuente localStorage/demo.

Acción requerida backend:

- Corregir/verificar `app/core/backend-preview-status.js` y archivos relacionados para mostrar fuente real de datos.
- El diagnóstico debe decir claramente si está usando Firestore o localStorage/demo.

### Incidencia 2: Auth DEV pendiente en preview

Observación:

- El preview backend muestra Auth pendiente.

Regla:

- No pedir clave temporal a Paula.
- No pedir que pegue contraseñas en ChatGPT.
- No usar prompts del navegador para clave DEV.
- No versionar credenciales.

Acción requerida backend:

- Resolver un flujo DEV seguro, local/no versionado o controlado, sin exponer claves.

### Incidencia 3: bloque PowerShell frágil

Observación:

- Se intentó crear un archivo local para inyectar clave DEV.
- Paula recibió errores como `location.replace no reconocido`, `</script> no reconocido` y `<body...> no reconocido`.

Interpretación:

- El bloque era propenso a error por pegar HTML/script en PowerShell.

Acción requerida:

- Evitar bloques largos de PowerShell.
- Si se necesita algo local, usar un bloque corto y seguro.
- Priorizar cambios directos en GitHub o prompt completo para Codex.

### Incidencia 4: riesgo de confundir demo con Firestore

Observación:

- El preview backend abre y puede parecer válido visualmente.
- Pero si aparecen `banca` y conteos demo, no debe considerarse validación Firestore TyA.

Gate mínimo:

1. Auth OK.
2. Fuente Firestore.
3. Tenant TyA.
4. Conteos TyA reales.
5. Admin lee datos TyA.
6. Shopper lee solo datos propios.
7. No aparece `banca` ni conteos demo.

## Estado

Estas incidencias siguen abiertas hasta que el preview backend muestre explícitamente Auth OK + Firestore + TyA.
