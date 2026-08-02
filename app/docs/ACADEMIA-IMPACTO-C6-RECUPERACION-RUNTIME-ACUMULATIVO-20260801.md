# ACADEMIA — IMPACTO C6 RECUPERACIÓN DEL RUNTIME ACUMULATIVO

**Fecha:** 2026-08-02  
**Estado:** DOCUMENTADO · SIN PUBLICACIÓN

## Lección central

Una aplicación puede tener Auth correcto y aun así fallar en la experiencia final si la transición posterior a autenticar no completa la entrada al producto. Del mismo modo, un comando de despliegue puede ser intentado sin producir una release.

El control de calidad debe separar:

1. credencial válida;
2. claims válidos;
3. contexto autenticado;
4. transición visual completada;
5. continuidad después de recargas y nueva pestaña;
6. predeploy aprobado;
7. comando de deploy iniciado;
8. release creada;
9. paridad remota comprobada;
10. validación humana aprobada.

## Contratos que deben enseñarse

1. La fuente viva gobierna periodos históricos y actuales.
2. El reloj del dispositivo nunca crea un periodo operativo.
3. Auth identifica al usuario; HR no autentica.
4. Una tarjeta visible de rol no demuestra que el principal esté autenticado.
5. Un handler DEV no puede saltarse Auth en una ruta protegida.
6. Staff, Shopper y Cliente requieren gates separados.
7. Tres recargas y una nueva pestaña forman parte del gate.
8. HR conserva operación; Firestore enriquece identidad y certificación.
9. KPI, fase, detalle, histórico y Finanzas consumen el mismo read model.
10. Una autorización consumida no se reutiliza.
11. Un PASS técnico parcial no equivale a aprobación humana acumulativa.
12. Una materialización segura requiere snapshot, alcance exacto, idempotencia, readback y rollback.
13. La contraseña no debe aparecer en repo, evidencias o logs.
14. El modelo financiero se obtiene de la configuración del proyecto, no de su nombre.
15. Local, Delegado, Regional y Unconfigured son contratos distintos.
16. Las regalías solo aplican con facturación local y configuración explícita.
17. El honorario del shopper es una obligación, no ingreso delegado.
18. El margen delegado solo se calcula con comisión y distribución exactas.
19. Un intento de deploy no debe registrarse como deploy exitoso.
20. Una release no debe registrarse como validada hasta pasar paridad y gates remotos.
21. La configuración alternativa del CLI debe existir en la raíz que el CLI resuelve.
22. El endpoint dinámico debe aparecer antes del wildcard SPA.
23. Un deploy Hosting no autoriza desplegar Cloud Run.
24. Un fallo después de iniciar el comando exige evidencia y autorización fresca antes de otro intento.

## Caso de aprendizaje Auth C6

El gate comprobó:

- Staff humano autenticado y estable;
- Shopper humano autenticado con identidad exacta;
- Cliente humano autenticado con alcance exclusivo `cinepolis`;
- carril técnico Staff/Shopper aislado;
- HR viva completa;
- tres recargas y nueva pestaña.

La primera materialización Cliente creó correctamente la cuenta y los claims, pero el portal no se abrió. El workflow eliminó la cuenta y restauró el estado previo. Después del root fix, la segunda materialización quedó PASS.

## Caso de aprendizaje Hosting C6

El predeploy comprobó source lock, gate estático y credenciales. El comando de Hosting se inició, pero no creó una release.

Causa:

- el runner escribió `firebase.deploy.json` solo dentro de `.tmp`;
- Firebase CLI resolvió el basename dentro de la raíz del proyecto;
- el archivo raíz no existía;
- la ejecución terminó antes de publicar.

Corrección:

- rewrite HR vivo incorporado a `firebase.json`;
- `firebase.deploy.json` creado en la raíz;
- target, public, región y servicio documentados;
- cero nuevo deploy después de corregir;
- autorización fresca obligatoria.

## Rutas por rol

- Administración: fuente, operación, Shoppers, certificación, configuración, Finanzas y revisión.
- Cliente: Panorama, KPIs, sucursales, detalle y planes de acción; requiere principal Cliente autenticado.
- Shopper: identidad, perfil, certificación, oportunidades, visitas, histórico y pagos; nunca selector DEV en ruta protegida.

## Impacto en manuales y cursos

Los materiales deben explicar:

- diferencia entre principal autenticado y entrada completada;
- cómo probar cada rol, recargas y nueva pestaña;
- cómo distinguir intento, release, paridad y aprobación;
- cómo validar `firebase.json`, target, public y rewrites;
- por qué un endpoint dinámico debe preceder al wildcard;
- cómo materializar credenciales con idempotencia y rollback;
- cómo diferenciar facturación local, coordinación delegada y obligaciones al shopper;
- cuándo una autorización nueva es obligatoria.

## Sin impacto adicional de proveedor

Además de los dos Auth writes previamente autorizados, este bloque no creó release Hosting, no desplegó Cloud Run y no activó Firestore, HR, Rules, Storage, Gemini, Make, pagos, merge ni producción.
