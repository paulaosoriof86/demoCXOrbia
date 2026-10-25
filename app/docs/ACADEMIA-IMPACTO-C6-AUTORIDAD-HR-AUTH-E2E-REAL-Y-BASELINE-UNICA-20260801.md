# ACADEMIA — Impacto C6: autoridad HR, Auth real y baseline acumulativa única

**Fecha:** 2026-08-01  
**Estado:** VIGENTE

## 1. Concepto central
La autenticación determina quién es el usuario y qué puede hacer, pero no cambia cuál fuente es dueña de la operación. En CXOrbia/TyA:
- HR viva es autoridad de periodos, visitas y estados operativos;
- Auth aporta principal, rol, tenant, proyecto y alcance;
- Firestore protegido aporta perfil, identidad, certificación y facetas exactas;
- el read model canónico compone estas fuentes sin que una reemplace indebidamente a otra.

## 2. Caso real de aprendizaje
Una prueba de navegador superficial mostraba un login correcto, pero no autenticaba cuentas reales. Al probar un shopper real se descubrió que su vista Firestore de una visita sustituía temporalmente la HR completa de 616 visitas.

La lección es que una pantalla correcta no demuestra un flujo correcto. La validación debe cubrir:
`credenciales → claims → hidratación de fuentes → composición → navegación → refresh → nueva pestaña`.

## 3. Identidades que no deben confundirse
- identidad de autenticación: UID y claims;
- identidad operacional: referencia de shopper en HR/visita;
- identidad canónica: perfil único resultante del crosswalk técnico;
- identidad visual: nombre, teléfono o correo mostrado.

Solo las primeras tres pueden vincularse mediante llaves reproducibles. La identidad visual no es una llave segura de deduplicación.

## 4. Least privilege sin pérdida del modelo
El shopper puede ver únicamente su información funcional, pero la aplicación puede conservar internamente el modelo HR necesario para mantener periodos, estados, conteos y consistencia. El filtrado por rol debe ocurrir en las superficies y funciones autorizadas, no destruyendo la fuente canónica compartida.

## 5. Baseline acumulativa
Una plataforma no debe evolucionar como una suma de “mejores pantallas” aisladas. Cada nueva capacidad parte de una baseline única y pasa gates transversales sobre:
- dominio;
- identidad;
- Finanzas;
- Reportes;
- sesión/refresh;
- roles reales.

Un PASS parcial no reemplaza la validación acumulativa.

## 6. Evidencia y trazabilidad
La evidencia autoritativa de C6 es el E2E real local y remoto con usuarios existentes. Un trigger duplicado posterior, bloqueado porque la autorización ya estaba consumida, se clasifica como evento operativo supersedido y no como falla del producto.

Esto enseña a distinguir:
- resultado de producto;
- resultado de pipeline;
- evento duplicado/idempotente;
- autorización consumida;
- evidencia prevalente.

## 7. Aplicación en manuales y cursos
Los materiales deben explicar:
- login único sin pedir rol antes de autenticar;
- claims y namespaces;
- ownership de fuentes;
- crosswalk técnico de identidad;
- overlay protegido;
- pruebas E2E reales;
- refresh y nueva pestaña;
- baseline acumulativa y gates de no-regresión;
- apertura de agosto/postulaciones solo desde fuente real y bajo cutover autorizado.

## 8. Clasificación
- **Reusable CXOrbia:** todos los conceptos arquitectónicos y de QA.
- **Exclusivo TyA:** conteos 14/616 y operación Cinépolis.
- **Claude/prototipo:** consumo de contratos, no recreación de lógica.
- **Academia:** contenido principal del documento.
- **Sin impacto Claude:** credenciales y ejecución privada del runner.
