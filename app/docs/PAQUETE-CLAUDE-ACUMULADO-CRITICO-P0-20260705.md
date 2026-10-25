# Paquete Claude acumulado critico P0 - CXOrbia TyA

Fecha: 2026-07-05

## Contexto para Claude

Paula indica que tienes poca capacidad semanal. Prioriza solo lo critico P0. No redisenar. No avanzar P1. No tocar backend.

## Objetivo unico

Entregar una candidata minima que corrija textos y avisos que hoy prometen envios, sincronias o automatizaciones reales aunque el backend real todavia no este activo.

## Archivos prioritarios

Trabajar solo si es necesario en estos archivos:

1. `app/modules/postulaciones.js`
2. `app/modules/dashboard.js`
3. `app/core/topbar.js`
4. `app/modules/correo.js`
5. `app/core/automations.js`
6. `app/core/manuales-data.js`
7. `app/modules/academia.js`
8. `app/core/liquidacion.js`

## Cambios criticos requeridos

### 1. WhatsApp

No usar textos que afirmen envio real si no hay envio real.

Reemplazar frases como:

- `WhatsApp enviado`
- `WA enviado al shopper`
- `notificado por WhatsApp`
- `Solicitud enviada ... WhatsApp`

Por frases tipo:

- `plantilla WhatsApp lista`
- `notificacion preparada`
- `pendiente backend`
- `WhatsApp Web listo para abrir manualmente`

### 2. Correo

No usar `Correo enviado` en modo demo/local.

Usar:

- `correo preparado`
- `correo guardado en demo`
- `envio real pendiente backend`
- `se enviara al conectar cuenta real`

### 3. HR / Google Sheets

No usar:

- `HR sincronizada`
- `HR actualizada`
- `sincronizado a la HR`
- `sincroniza la HR externa`

Usar:

- `pendiente de sincronizacion backend`
- `se reflejara en HR cuando el sync este activo`
- `cambio preparado para sincronizacion`

### 4. Cuestionario

No usar `cuestionario enviado` como etapa operativa general.

Usar:

- `cuestionario realizado`
- `cuestionario completado`
- `pendiente de revision`
- `submitido` solo cuando ya corresponda a submit/revision final.

### 5. Academia/manuales

Mantener profundidad, pero ajustar promesas. Puede decir que el flujo esta preparado o configurado, pero no que ya ejecuta integraciones reales.

## No tocar

- No tocar backend.
- No crear contracts/tools.
- No activar Firebase/Auth/Storage/Make/Gemini.
- No cambiar rutas principales.
- No redisenar UI.
- No reescribir modulos completos.
- No cambiar reglas Phase A.
- No mover source lock.
- No hacer deploy.

## Pruebas minimas esperadas

1. `node --check` en JS modificados.
2. Confirmar que `index.html` no queda con scripts faltantes.
3. Confirmar que no quedan nuevas promesas falsas de envio/sync.
4. Documentar archivos tocados.

## Entrega esperada

Enviar ZIP nuevo y resumen breve:

- archivos tocados;
- frases corregidas;
- pruebas ejecutadas;
- pendientes no abordados por capacidad;
- confirmacion de que no se toco backend.

## Decision

Este paquete no autoriza source lock. ChatGPT auditara la candidata antes de empalmar.
