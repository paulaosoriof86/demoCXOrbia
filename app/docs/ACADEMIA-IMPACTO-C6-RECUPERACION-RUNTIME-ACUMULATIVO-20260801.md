# ACADEMIA — IMPACTO C6 RECUPERACIÓN DEL RUNTIME ACUMULATIVO

**Fecha:** 2026-08-02  
**Estado:** DOCUMENTADO · SIN PUBLICACIÓN

## Lección central

Una aplicación puede tener Auth correcto y aun así fallar en la experiencia final si la transición posterior a autenticar no completa la entrada al producto. El control de calidad debe separar:

1. credencial válida;
2. claims válidos;
3. contexto autenticado;
4. transición visual completada;
5. continuidad después de recargas y nueva pestaña.

También debe distinguir configuración global de configuración por proyecto. Una regla financiera válida para facturación local no puede trasladarse a un proyecto delegado o regional.

## Contratos que deben enseñarse

1. La fuente viva gobierna periodos históricos y actuales.
2. El reloj del dispositivo nunca crea un periodo operativo.
3. Auth identifica al usuario; HR no autentica.
4. Una tarjeta visible de rol no demuestra que el principal esté autenticado.
5. Un handler DEV no puede saltarse Auth en una ruta protegida.
6. Los clics tempranos antes del wrapper oficial deben permanecer fail-closed.
7. Staff, Shopper y Cliente requieren gates separados.
8. El Shopper debe tener identidad exacta y datos propios.
9. El Cliente debe tener tenant y proyecto explícitos.
10. Autenticar con éxito no equivale a completar `enter()`.
11. Tres recargas y una nueva pestaña forman parte del gate.
12. Un carril técnico solo es válido si está aislado y no reemplaza la entrada humana.
13. HR conserva operación; Firestore enriquece identidad y certificación.
14. KPI, fase, detalle, histórico y Finanzas consumen el mismo read model.
15. Una autorización consumida no se reutiliza.
16. Un PASS técnico parcial no equivale a aprobación humana acumulativa.
17. Una materialización segura requiere snapshot, alcance exacto, idempotencia, readback y rollback.
18. La contraseña no debe aparecer en repo, evidencias o logs.
19. El rollback debe restaurar el preestado real, no solo declarar que podría hacerlo.
20. El modelo financiero se obtiene de la configuración del proyecto, no de su nombre.
21. Local, Delegado, Regional y Unconfigured son contratos distintos.
22. Las regalías solo aplican con facturación local y configuración explícita.
23. Delegado/Regional no tienen regalías locales.
24. El honorario del shopper es una obligación, no ingreso delegado.
25. El margen delegado solo se calcula con comisión y distribución exactas.
26. Cinépolis es configuración delegada: Q60 GT/L200 HN, regalías 0 y comisión compartida configurable.

## Caso de aprendizaje C6

El gate comprobó:

- Staff humano autenticado y estable;
- Shopper humano autenticado con identidad exacta;
- Cliente humano autenticado con alcance exclusivo `cinepolis`;
- carril técnico Staff/Shopper aislado;
- HR viva completa;
- tres recargas y nueva pestaña.

La primera materialización Cliente creó correctamente la cuenta y los claims, pero el portal no se abrió porque faltaba completar la transición visual. El workflow eliminó la cuenta y restauró el estado previo. Después del root fix, la segunda materialización quedó PASS.

Resultados:

- una credencial creada;
- dos Auth writes autorizados;
- segunda aplicación idempotente con cero writes;
- readback y sign-in PASS;
- password changes/resets 0;
- secretos expuestos 0;
- rollback exacto probado.

## Rutas por rol

- Administración: fuente, operación, Shoppers, certificación, configuración, Finanzas y revisión.
- Cliente: Panorama, KPIs, sucursales, detalle y planes de acción; requiere principal Cliente autenticado y transición completa.
- Shopper: identidad, perfil, certificación, oportunidades, visitas, histórico y pagos; nunca selector DEV en ruta protegida.

## Impacto en manuales y cursos

Los materiales deben explicar:

- diferencia entre rol visible, principal autenticado y entrada completada;
- por qué DEV no permite bypass de Auth;
- cómo probar cada rol, recargas y nueva pestaña;
- cómo materializar una credencial con idempotencia y rollback;
- cómo seleccionar Local, Delegado o Regional;
- por qué regalías no se descuentan en delegado/regional;
- cómo diferenciar ingreso de coordinación de honorarios/reembolsos al shopper;
- cuándo una autorización nueva es obligatoria.

## Sin impacto adicional de proveedor

Además de los dos Auth writes expresamente autorizados, este bloque no activó cursos, notificaciones, Firestore, HR, Rules, Storage, Hosting, Cloud Run, Gemini, Make, pagos, merge ni producción.
