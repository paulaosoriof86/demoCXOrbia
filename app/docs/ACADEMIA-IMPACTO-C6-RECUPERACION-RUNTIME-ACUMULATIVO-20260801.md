# ACADEMIA — IMPACTO C6 RECUPERACIÓN DEL RUNTIME ACUMULATIVO

**Fecha:** 2026-08-02  
**Estado:** DOCUMENTADO · SIN PUBLICACIÓN

## Lección central

Una solución no está corregida solo porque el cambio exista en el repositorio o esté documentado. Debe estar conectado al carril ejecutable que realmente usa el sistema.

El control de calidad debe separar:

1. acceso válido;
2. contexto correcto por rol;
3. transición visual completada;
4. continuidad después de recargas y nueva pestaña;
5. predeploy aprobado;
6. configuración exacta usada por el runner;
7. comando iniciado;
8. release creada;
9. paridad remota;
10. validación humana.

## Contratos que deben enseñarse

1. La fuente viva gobierna periodos históricos y actuales.
2. El reloj del dispositivo nunca crea un periodo operativo.
3. HR conserva operación; el sistema de acceso no la sustituye.
4. Staff, Shopper y Cliente requieren gates separados.
5. Tres recargas y una nueva pestaña forman parte del gate.
6. KPI, fase, detalle, histórico y Finanzas consumen el mismo read model.
7. Una autorización consumida no se reutiliza.
8. Un PASS técnico parcial no equivale a aprobación humana acumulativa.
9. Un intento de deploy no equivale a release creada.
10. Una release no equivale a paridad remota ni aprobación humana.
11. Un fix documentado no equivale a un fix conectado al runner.
12. El runner debe validar la configuración autorizada antes del comando.
13. La configuración raíz debe coincidir con target, public y rewrites esperados.
14. El endpoint dinámico debe preceder al wildcard SPA.
15. Un deploy Hosting no autoriza desplegar Cloud Run.
16. Ante un fallo deben persistirse versión de CLI y logs sanitizados.
17. Un segundo deploy requiere una nueva autorización.
18. El modelo financiero se obtiene de la configuración del proyecto, no de su nombre.
19. Local, Delegado, Regional y Unconfigured son contratos distintos.
20. Las regalías solo aplican con facturación local y configuración explícita.
21. El honorario del shopper es una obligación, no ingreso delegado.
22. El margen delegado solo se calcula con comisión y distribución exactas.

## Caso de aprendizaje Auth C6

El gate comprobó:

- Staff humano estable;
- Shopper con identidad exacta;
- Cliente con alcance exclusivo `cinepolis`;
- carril técnico Staff/Shopper aislado;
- HR viva completa;
- tres recargas y nueva pestaña.

La materialización Cliente quedó idempotente, con readback y rollback exacto.

## Caso de aprendizaje Hosting C6

El segundo intento autorizado comprobó source lock, gate estático, acceso read-only y destino DEV. El comando se inició, pero no creó una release.

La autorización exigía `firebase.deploy.json` en la raíz. Sin embargo, el workflow todavía generaba una copia en `.tmp` y ejecutaba el comando con esa ruta temporal.

Conclusión:

`RUNNER_AUTHORIZED_ROOT_CONFIG_NOT_APPLIED`.

El fix existía en documentación y archivos, pero no estaba conectado al paso ejecutable.

## Correctivo incorporado

El workflow existente ahora:

- valida la configuración raíz autorizada;
- valida target, public y orden de rewrites;
- ejecutará `--config firebase.deploy.json`;
- valida la prohibición de un segundo deploy automático;
- registra la versión de Firebase CLI;
- persiste logs sanitizados ante cualquier fallo.

No se creó otro workflow ni se ejecutó otro deploy.

## Rutas por rol

- Administración: fuente, operación, Shoppers, certificación, configuración, Finanzas y revisión.
- Cliente: Panorama, KPIs, sucursales, detalle y planes de acción.
- Shopper: identidad, perfil, certificación, oportunidades, visitas, histórico y pagos.

## Impacto en manuales y cursos

Los materiales deben explicar:

- diferencia entre fix documentado y fix ejecutable;
- diferencia entre intento, release, paridad y aprobación;
- cómo probar cada rol, recargas y nueva pestaña;
- cómo validar configuración raíz, target, public y rewrites;
- por qué un endpoint dinámico debe preceder al wildcard;
- cómo diferenciar facturación local, coordinación delegada y obligaciones al shopper;
- cuándo una autorización nueva es obligatoria.

## Sin impacto adicional de proveedor

Además de los dos Auth writes previamente autorizados, este bloque no creó release Hosting, no desplegó Cloud Run y no activó Firestore, HR, Rules, Storage, Gemini, Make, pagos, merge ni producción.
