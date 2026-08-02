# ACADEMIA — IMPACTO C6 RECUPERACIÓN DEL RUNTIME ACUMULATIVO

**Fecha:** 2026-08-01  
**Estado:** DOCUMENTADO · SIN PUBLICACIÓN

## Lección central

Una aplicación puede contener todos los archivos correctos y aun así publicar una experiencia incorrecta si el bootstrap activa un carril distinto. El control de calidad debe validar la composición ejecutada, no solo la presencia del código.

También debe distinguir configuración global de configuración por proyecto. Una regla financiera válida para un proyecto facturado localmente no puede trasladarse automáticamente a un proyecto delegado o regional.

## Contratos que deben enseñarse

1. La fuente viva gobierna periodos históricos y actuales.
2. El reloj del dispositivo nunca crea un periodo operativo.
3. Auth identifica al usuario; HR no autentica.
4. HR conserva operación; Firestore enriquece identidad y certificación.
5. KPI, fase, detalle, histórico y Finanzas consumen el mismo read model.
6. Una autorización consumida no se reutiliza.
7. Un PASS técnico parcial no equivale a aprobación humana acumulativa.
8. Las configuraciones del proyecto forman parte del read model aunque la HR no repita cada valor.
9. El modelo financiero se obtiene de la configuración del proyecto, no de su nombre.
10. Los modelos reusables son Local, Delegado y Regional.
11. Las regalías solo pueden aplicarse cuando existe facturación local y una configuración explícita.
12. Delegado/Regional no tienen regalías locales; registran comisión y distribución configurables.
13. El honorario del shopper es una obligación, no un fallback de ingreso delegado.
14. El margen delegado solo puede calcularse con comisión y distribución exactas.
15. Montos, participantes y porcentajes no se inventan para completar una pantalla.
16. Cinépolis es ejemplo de configuración delegada: Q60 GT/L200 HN al shopper, regalías 0 y comisión compartida configurable.

## Rutas por rol

- Administración: fuente, operación, Shoppers, certificación, configuración del modelo, Finanzas y revisión.
- Cliente: Panorama, KPIs, sucursales, detalle y planes de acción.
- Shopper: identidad, perfil, certificación, oportunidades, visitas, histórico y pagos.

## Impacto en manuales y cursos

Los materiales deben explicar:

- cómo seleccionar Local, Delegado o Regional al crear un proyecto;
- qué campos aparecen para facturación local;
- por qué regalías no se muestran ni descuentan en delegado/regional;
- cómo registrar comisión y distribución cuando exista fuente real;
- cómo diferenciar ingreso por coordinación de honorarios/reembolsos al shopper;
- cómo verificar que Dashboard, Finanzas y reportes usan el mismo modelo.

## Sin impacto de proveedor

Este documento no activa cursos, notificaciones, Gemini, Make, writes, deploy ni producción.
