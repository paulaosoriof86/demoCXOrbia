# ACADEMIA — IMPACTO C6 RECUPERACIÓN DEL RUNTIME ACUMULATIVO

**Fecha:** 2026-08-02  
**Estado:** DOCUMENTADO · SIN PUBLICACIÓN

## Lección central

Una plataforma acumulativa debe demostrar por separado autenticación, fuente operativa, overlay protegido, identidad exacta, estabilidad de sesión y coherencia del dominio. Un PASS de login o HR no prueba por sí solo que Finanzas, portales y Reservas consuman una única verdad.

## Caso Shopper nueva pestaña — aprendizaje cerrado

El P0 anterior reproducía:

- sesión Shopper restaurada;
- tenant/proyecto y HR base correctos;
- overlay protegido no aplicado;
- visitas propias 0.

Causa:

`RESTORED_SESSION_NEW_TAB_PROTECTED_AUTHORITY_RECONCILIATION_NOT_RESILIENT`.

El macro-bloque posterior demostró remotamente:

- overlay aplicado;
- identidad exacta;
- 14 periodos y 616 visitas;
- 208 shoppers;
- `ownVisits=1`;
- tres recargas estables;
- nueva pestaña estable.

La lección ya no debe presentarse como fix pendiente: queda como caso resuelto y gate de regresión permanente.

## Caso financiero — nuevo aprendizaje bloqueante

El gate detectó dos verdades simultáneas:

### Objeto canónico consumido por dominio/Finanzas

- modelo directo;
- facturación local;
- regalía 10;
- regalías aplicables.

### Configuración vigente del proyecto

- modelo delegado;
- coordinación delegada;
- regalía 0;
- honorarios Q60 GT y L200 HN;
- comisión/reparto configurables y no inventados.

Causa:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`

## Contratos que deben enseñarse

1. HR viva gobierna periodos, visitas y estados operativos.
2. Firestore protegido enriquece identidad, perfil y certificación.
3. Auth restaurada no equivale a overlay aplicado.
4. Reload y nueva pestaña son gates distintos.
5. El Shopper se resuelve por identidad exacta y debe recuperar visitas propias.
6. El modelo financiero nace de configuración explícita del proyecto.
7. La configuración debe materializarse en objetos canónicos antes de normalizar.
8. Un marcador global no sustituye los campos que consumen módulos y reportes.
9. Las regalías solo aplican con facturación local explícita.
10. El honorario Shopper es una obligación, no ingreso delegado.
11. Comisión y reparto no se inventan cuando falta fuente.
12. Dos verdades simultáneas constituyen un bloqueo.
13. El orden correcto es configuración → materialización → normalización → consumo → gate.
14. Un fallo posterior a deploy exige STOP_RETRY, no segundo deploy automático.
15. Paridad de assets no sustituye coherencia semántica.
16. Producción requiere PASS técnico acumulativo y aprobación humana.

## Checklist de validación por rol y dominio

### Staff

- principal autenticado;
- tenant/proyecto correctos;
- HR y overlay aplicados;
- tres recargas y nueva pestaña;
- KPIs/fases/histórico coherentes;
- modelo financiero canónico coherente con projectConfig.

### Shopper

- identidad exacta;
- visitas propias mayores que cero cuando existen asignaciones;
- perfil, certificación, histórico y pagos dentro del scope;
- tres recargas y nueva pestaña.

### Cliente

- credencial existente;
- alcance exclusivo a proyectos autorizados;
- Panorama y KPIs sin fuga de otros proyectos;
- tres recargas y nueva pestaña.

### Finanzas y Reservas

- configuración y objeto canónico idénticos;
- regalías según modelo;
- honorario separado de ingreso;
- comisión/reparto sin inferencias;
- mutaciones bloqueadas mientras la fuente canónica no esté conectada.

## Impacto en manuales y cursos

Actualizar:

- manual de Auth y recuperación de sesión;
- curso de gates remotos por rol;
- manual de configuración financiera por proyecto;
- lección de precedencia y materialización canónica;
- checklist de coherencia configuración/objeto/reporte;
- caso práctico directo vs delegado vs regional;
- errores frecuentes: marcador correcto con objeto canónico incorrecto;
- protocolo STOP_RETRY y autorización de deploy.

## Estado seguro

El macro-bloque ejecutó un único Hosting DEV deploy. No hubo segundo deploy, Cloud Run, Firestore/Auth/HR/Rules/Storage writes, Make, Gemini, pagos, merge ni producción. El contenido de Academia permanece documental y pendiente de publicación humana.
