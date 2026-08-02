# ACADEMIA — IMPACTO C6 RECUPERACIÓN DEL RUNTIME ACUMULATIVO

**Fecha:** 2026-08-01  
**Estado:** DOCUMENTADO · SIN PUBLICACIÓN

## Lección central

Una aplicación puede contener todos los archivos correctos y aun así ejecutar una experiencia incorrecta si el bootstrap, el orden de carga o un handler directo activa otro carril. El control de calidad debe validar la composición ejecutada, el principal autenticado y la continuidad después de recargas.

También debe distinguir configuración global de configuración por proyecto. Una regla financiera válida para facturación local no puede trasladarse a un proyecto delegado o regional.

## Contratos que deben enseñarse

1. La fuente viva gobierna periodos históricos y actuales.
2. El reloj del dispositivo nunca crea un periodo operativo.
3. Auth identifica al usuario; HR no autentica.
4. Una tarjeta visible de rol no demuestra que el principal esté autenticado.
5. Un handler DEV no puede saltarse Auth en una ruta protegida.
6. Los clics tempranos antes del wrapper oficial deben permanecer fail-closed.
7. Staff, Shopper y Cliente requieren gates separados.
8. El Shopper debe tener identidad exacta y datos propios; no basta con abrir el portal.
9. Tres recargas y una nueva pestaña forman parte del gate, no son pruebas opcionales.
10. Un carril técnico puede existir solo si está aislado y no reemplaza la entrada humana.
11. HR conserva operación; Firestore enriquece identidad y certificación.
12. KPI, fase, detalle, histórico y Finanzas consumen el mismo read model.
13. Una autorización consumida no se reutiliza.
14. Un PASS técnico parcial no equivale a aprobación humana acumulativa.
15. Las configuraciones del proyecto forman parte del read model aunque la HR no repita cada valor.
16. El modelo financiero se obtiene de la configuración del proyecto, no de su nombre.
17. Los modelos reusables son Local, Delegado, Regional y Unconfigured fail-closed.
18. Las regalías solo aplican con facturación local y configuración explícita.
19. Delegado/Regional no tienen regalías locales; registran comisión y distribución configurables.
20. El honorario del shopper es una obligación, no un fallback de ingreso delegado.
21. El margen delegado solo se calcula con comisión y distribución exactas.
22. Montos, participantes, porcentajes y credenciales no se inventan para completar una pantalla o un gate.
23. Cinépolis es configuración delegada: Q60 GT/L200 HN al shopper, regalías 0 y comisión compartida configurable.
24. La ausencia de una credencial Cliente válida es un HOLD real, no permiso para crearla o resetearla.

## Caso de aprendizaje C6

El gate comprobó:

- Staff humano autenticado y estable;
- Shopper humano autenticado con identidad exacta y una visita propia;
- carril técnico Staff/Shopper aislado;
- HR viva completa;
- tres recargas y nueva pestaña;
- ruta Cliente integrada.

La búsqueda read-only no encontró una cuenta Cliente con claims válidos para `tya/cinepolis`. El proceso se detuvo con Auth writes, cambios y resets de contraseña en cero.

## Rutas por rol

- Administración: fuente, operación, Shoppers, certificación, configuración, Finanzas y revisión.
- Cliente: Panorama, KPIs, sucursales, detalle y planes de acción; requiere principal Cliente autenticado.
- Shopper: identidad, perfil, certificación, oportunidades, visitas, histórico y pagos; nunca selector DEV en ruta protegida.

## Impacto en manuales y cursos

Los materiales deben explicar:

- diferencia entre rol visible, principal autenticado y claims efectivos;
- por qué un modo DEV no permite bypass de Auth;
- cómo probar cada rol, recargas y nueva pestaña;
- cómo seleccionar Local, Delegado o Regional;
- por qué regalías no se descuentan en delegado/regional;
- cómo registrar comisión y distribución con fuente real;
- cómo diferenciar ingreso de coordinación de honorarios/reembolsos al shopper;
- cuándo un HOLD exige una autorización nueva.

## Sin impacto de proveedor

Este documento no activa cursos, notificaciones, Gemini, Make, writes, deploy ni producción.
