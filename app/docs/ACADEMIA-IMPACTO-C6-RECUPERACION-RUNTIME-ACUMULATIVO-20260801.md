# ACADEMIA — IMPACTO C6 RECUPERACIÓN DEL RUNTIME ACUMULATIVO

**Fecha:** 2026-08-02  
**Estado:** DOCUMENTADO · SIN PUBLICACIÓN

## Lección central

Una plataforma acumulativa debe demostrar autenticación, fuente operativa, overlay protegido, identidad exacta, coherencia financiera y cierre semántico. Un root fix puede pasar remotamente y aun así un gate combinado detenerse después; ambos resultados deben separarse.

## Caso Shopper nueva pestaña — cerrado

Queda como gate permanente de regresión:

- overlay protegido aplicado;
- identidad exacta;
- `ownVisits=1`;
- tres recargas y nueva pestaña estables.

## Caso financiero — cerrado remotamente

Causa corregida:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`.

El Hosting DEV vigente demuestra:

- `period`, `project` y `currentById` con modelo delegado;
- `delegated_coordination`;
- facturación local false;
- regalía 0;
- 14 periodos delegados;
- 0 directos;
- 0 sin configurar;
- 0 violaciones de regalías;
- Q60 GT / L200 HN;
- comisión y reparto configurables;
- honorario Shopper separado del ingreso.

El caso ya no debe presentarse como root fix pendiente. Queda como ejemplo de precedencia correcta:

`CONFIGURACIÓN → MATERIALIZACIÓN → NORMALIZACIÓN → CONSUMO`.

## Caso semántico — STOP_RETRY vigente

El gate combinado de dominio, Finanzas, portales y Reservas terminó antes de generar su JSON final. La evidencia persistida contiene `semantic=null` y no conserva el stdout/stderr del script.

No existe soporte para afirmar cuál aserción posterior falló. La enseñanza correcta es:

- no inferir el punto de fallo;
- no reabrir una causa ya cerrada;
- no usar un segundo deploy para diagnosticar;
- persistir etapa, aserción y snapshots parciales antes de cada validación;
- conservar logs sanitizados aun ante excepción.

## Contratos que deben enseñarse

1. HR viva gobierna periodos, visitas y estados.
2. Firestore protegido enriquece identidad, perfil y certificación.
3. Auth restaurada no equivale a overlay aplicado.
4. Reload y nueva pestaña son gates distintos.
5. La configuración financiera nace de una llave técnica exacta.
6. No se clasifica un proyecto por nombre visible.
7. La materialización ocurre antes de normalizar.
8. Las regalías solo aplican a facturación local explícita.
9. El honorario Shopper es obligación, no ingreso delegado.
10. Comisión y reparto no se inventan.
11. Un diagnóstico focalizado PASS puede cerrar una causa aunque el macro-gate falle después.
12. Un gate combinado debe publicar evidencia parcial por etapa.
13. `semantic=null` no autoriza a inventar la aserción fallida.
14. STOP_RETRY impide redeploy automático.
15. Producción requiere PASS acumulativo y aprobación humana.

## Checklist de evidencia resiliente

Antes de cada aserción registrar:

- etapa;
- principal y scope;
- snapshot mínimo sanitizado;
- contrato evaluado;
- código de aserción;
- resultado;
- cero writes;
- siguiente etapa.

Ante fallo conservar:

- stdout/stderr sanitizado;
- último checkpoint;
- snapshots ya obtenidos;
- deploys ejecutados;
- proveedores no tocados.

## Impacto en manuales y cursos

Actualizar:

- manual de configuración financiera por proyecto;
- caso práctico de root fix remoto PASS;
- diferencia entre diagnóstico focalizado y gate combinado;
- diseño de evidencia parcial;
- logs sanitizados y códigos de aserción;
- protocolo de diagnóstico remoto sin deploy;
- STOP_RETRY y autorización por gates.

## Estado seguro

El macro-bloque ejecutó un único Hosting DEV deploy. No hubo segundo deploy, Cloud Run, Firestore/Auth/HR/Rules/Storage writes, Make, Gemini, pagos, merge o producción. La publicación de Academia requiere revisión humana posterior.
