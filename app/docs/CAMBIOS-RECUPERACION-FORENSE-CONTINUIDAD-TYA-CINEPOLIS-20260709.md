# Cambios - Recuperacion forense continuidad TyA / Cinepolis

Fecha: 2026-07-09  
Bloque: recuperacion de trabajo previo real para retomar produccion Phase A  
Estado: documentado.

## Archivos creados

1. `app/docs/RECUPERACION-FORENSE-CONTINUIDAD-TYA-CINEPOLIS-20260709.md`
   - Recupera documentos fuente ya existentes sobre HR viva, logicas TyA/Cinepolis, dry-run, shoppers, plataforma actual/legacy y cutover.
   - Corrige la conclusion anterior: no se debe pedir HR de nuevo; se debe recuperar y usar lo ya documentado.
   - Define el siguiente bloque exacto: staging canonico HR source-safe.

2. `app/docs/CAMBIOS-RECUPERACION-FORENSE-CONTINUIDAD-TYA-CINEPOLIS-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Reenfoca el trabajo hacia datos reales/sanitizados TyA y evita seguir con infraestructura abstracta.

## Trabajo previo recuperado

- HR viva Google Sheets confirmada.
- 30 tabs: 28 operativos y 2 dashboards.
- Columnas canonicas y variaciones de encabezado.
- Lectura multi-tab XLSX probada localmente.
- Dry-run V6/V7.1 exitoso sin writes.
- Logicas Q1/Q2, estados HR, submitido, liquidaciones y junio.
- Shoppers/referencias en review_required.
- Uso de plataforma actual/RTDB como complemento util, no base a copiar.

## Claude/prototipo

Pendientes derivados:

- Proyecto debe incluir Fuente de Hoja de Ruta configurable.
- Cinepolis debe mostrarse como proyecto normal, no hardcodeado.
- UI debe distinguir demo/preview real/staging/importado/produccion.
- Academia debe explicar configuracion HR y errores de columnas.

## Siguiente bloque

Crear runbook y validador/runner de staging canonico HR TyA/Cinepolis source-safe, sin PII, sin import real y sin writes.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin import real.
- Sin Firestore writes.
- Sin Auth real.
- Sin Storage real.
- Sin Make real.
- Sin Gemini real.
- Sin base vieja conectada.
- Sin datos sensibles en repo.
