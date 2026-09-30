# ACADEMIA — ADDENDUM C6 P0 DATOS Y GATE ACUMULATIVO

**Fecha:** 2026-08-01  
**Estado técnico:** root fix aplicado; gates y redeploy DEV pendientes de evidencia.  
**Publicación de contenido:** pendiente de incorporación por Claude/prototipo y revisión humana.

## 1. Aprendizaje principal
Una plataforma no puede declararse funcional solo porque:
- carga una pantalla;
- permite seleccionar un rol;
- activa una sesión;
- muestra un menú o shell.

El acceso debe validarse junto con el contenido y el alcance que ese perfil necesita. En CXOrbia/TyA, Administración no está operativa si entra a una interfaz sin proyectos, periodos o visitas, aunque el botón de acceso haya funcionado.

## 2. Conceptos que deben explicarse por separado
1. **Selección de perfil:** elección visual de Administración, Cliente o Shopper.
2. **Autenticación:** confirmación de identidad mediante Auth.
3. **Autorización:** tenant, proyecto, rol y shopperId permitidos por claims.
4. **Fuente operacional:** HR viva y read model canónico.
5. **Estado de carga:** proceso transitorio; nunca debe convertirse silenciosamente en estado vacío.
6. **Overlay protegido:** enriquecimiento de perfil e identidad; no reemplaza la fuente operacional.

## 3. Caso de estudio de regresión
La entrada directa fue restaurada, pero la URL humana conservó parámetros del carril protegido. Como consecuencia:
- el watcher HR dejó de actualizar;
- el overlay protegido no pudo iniciar;
- el guard de seguridad vació el modelo;
- el smoke aprobó la carcasa sin revisar los datos posteriores.

La corrección no consiste en ocultar el mensaje vacío. Consiste en separar los carriles, conservar la autoridad HR y ampliar el gate.

## 4. Regla formativa reusable
`LOGIN PASS ≠ PRODUCT PASS`.

Un gate de acceso debe comprobar, al menos:
- identidad o rol correcto;
- fuente correcta;
- proyecto y periodo activos;
- datos mínimos esperados;
- permisos correspondientes;
- estabilidad después de recargar;
- ausencia de información de otro perfil;
- cero mutaciones no autorizadas.

## 5. Validación por rol
### Administración / Coordinación
- entrada directa;
- proyecto y periodo visibles;
- Dashboard y hoja de ruta con fuente canónica;
- histórico, Shoppers, Finanzas y Reportes disponibles según contrato.

### Cliente
- entrada al portal correcto;
- proyecto asignado;
- indicadores autorizados;
- sin herramientas administrativas no permitidas.

### Shopper
- identidad canónica exacta;
- visitas propias y disponibles según alcance;
- certificación, historial y beneficios coherentes;
- cero selección técnica de namespace.

### Soporte técnico
- carril E2E aislado;
- Auth/claims/Rules comprobados;
- fuente HR preservada después de Auth;
- evidencia sin usuarios, contraseñas, tokens ni PII.

## 6. Gate acumulativo que debe enseñarse
Para esta baseline, la prueba humana automatizada exige:
- 14 periodos;
- 616 visitas;
- 208 shoppers;
- proyecto y periodo activos;
- datasource listo;
- cero shell vacío;
- entrada directa sin credenciales técnicas;
- tres recargas consecutivas sin pérdida, crecimiento o cambio de contexto.

Después se ejecuta el E2E técnico de Auth. Ninguno de los dos gates sustituye al otro.

## 7. Manuales y cursos a actualizar
- Manual de acceso por rol.
- Lección sobre fuente operacional y overlays.
- Checklist de soporte post-login.
- Curso de QA funcional acumulativo.
- Glosario de perfil, Auth, claims, fuente, estado de carga y fallback.
- Procedimiento de reporte de una regresión de datos.

## 8. Notificación futura
Solo después del PASS remoto y aprobación humana se comunica que Corte 6 está estable. Antes de eso, el material debe indicar “validación técnica en curso”, no “resuelto” ni “publicado”.

## 9. Seguridad
Este documento no autoriza publicación automática, Gemini, Make, writes, merge, deploy adicional ni producción.
