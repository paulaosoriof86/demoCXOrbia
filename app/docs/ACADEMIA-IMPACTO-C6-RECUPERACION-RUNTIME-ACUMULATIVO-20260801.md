# ACADEMIA — IMPACTO C6 RECUPERACIÓN DEL RUNTIME ACUMULATIVO

**Fecha:** 2026-08-02  
**Estado:** DOCUMENTADO · SIN PUBLICACIÓN

## Lección central

Una sesión autenticada y una pantalla con datos operativos no prueban por sí solas que el contexto protegido esté completo. En un sistema con fuente HR más overlay de identidad, el gate debe demostrar ambos componentes.

El control de calidad debe separar:

1. principal autenticado;
2. tenant y proyecto correctos;
3. HR base cargada;
4. overlay protegido aplicado;
5. identidad exacta resuelta;
6. visitas propias visibles;
7. tres recargas;
8. nueva pestaña;
9. paridad remota;
10. aprobación humana.

## Contratos que deben enseñarse

1. HR viva gobierna periodos, visitas y estados.
2. Firestore protegido enriquece identidad, perfil y certificación.
3. Auth restaurada no equivale a overlay aplicado.
4. `appOn=true` no equivale a runtime acumulativo completo.
5. Una nueva pestaña es un gate distinto de una recarga.
6. Un Shopper debe recuperar sus visitas por identidad exacta.
7. `ownVisits=0` con visitas asignadas es un bloqueo, no un estado aceptable.
8. Una conciliación de arranque debe ser idempotente.
9. Los eventos puntuales requieren recuperación independiente cuando el orden de carga puede variar.
10. Las lecturas externas transitorias deben reintentarse de forma acotada y fail-closed.
11. Un reintento nunca debe convertirse en write o deploy automático.
12. Una release publicada no equivale a gate remoto completo.
13. La paridad de assets no sustituye la prueba por rol.
14. El modelo financiero se obtiene de la configuración del proyecto.
15. Las regalías solo aplican con facturación local explícita.
16. El honorario Shopper no es ingreso delegado.

## Caso de aprendizaje Hosting C6

Se publicó correctamente una release DEV usando `firebase.deploy.json` raíz:

- 2,293 archivos;
- paridad exacta de 16 assets;
- endpoint HR remoto PASS;
- cero Cloud Run y cero writes adicionales.

## Caso de aprendizaje Shopper nueva pestaña

El gate reprodujo dos veces:

- principal Shopper restaurado;
- tenant y proyecto correctos;
- HR base con 14 periodos, 616 visitas y 208 shoppers;
- aplicación activa;
- overlay protegido no aplicado;
- visitas propias 0.

Causa:

`RESTORED_SESSION_NEW_TAB_PROTECTED_AUTHORITY_RECONCILIATION_NOT_RESILIENT`.

## Correctivo incorporado

El bridge protegido ahora:

- reintenta HR viva de forma acotada;
- espera principal, Firestore y composer canónico;
- se activa por Auth, backend, DOM, foco, visibilidad y refresh;
- impide conciliaciones simultáneas;
- publica metadata de recuperación;
- permanece read-only.

El fix no se considera validado remotamente hasta un deploy autorizado y un nuevo gate Shopper.

## Rutas por rol

- Administración: fuente, operación, Shoppers, certificación, configuración, Finanzas y revisión.
- Cliente: Panorama, KPIs, sucursales, detalle y planes de acción.
- Shopper: identidad, perfil, certificación, oportunidades, visitas, histórico y pagos.

## Impacto en manuales y cursos

Los materiales deben explicar:

- diferencia entre HR base y overlay protegido;
- diferencia entre reload y nueva pestaña;
- cómo comprobar identidad exacta y visitas propias;
- cómo diseñar recuperación idempotente ante carreras de inicialización;
- por qué un error transitorio no autoriza writes ni redeploy;
- diferencia entre release, paridad, gate por rol y aprobación humana;
- cómo diferenciar facturación local, coordinación delegada y obligaciones al shopper.

## Sin impacto adicional de proveedor

Después de aplicar el root fix en fuente no se ejecutó otro deploy ni se activaron Firestore, Auth, HR, Rules, Storage, Cloud Run, Gemini, Make, pagos, merge o producción.
