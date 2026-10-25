# Hosting deploy readiness V91

Fecha: 2026-07-08  
Baseline viva: V91 incremental  
Estado: verificacion de configuracion, no deploy ejecutado por este documento.

## 1. Decision metodologica

No se pedira visualizacion a Paula hasta tener evidencia verificable de deploy o hasta que sea estrictamente necesario.

La URL `https://cxorbia-backend-dev.web.app` no debe asumirse como valida hasta que un runner de deploy la verifique.

## 2. Archivo creado

- `tools/release/tya-hosting-deploy-readiness.mjs`

## 3. Que valida el script

El script revisa configuracion local del repo:

- `.firebaserc`;
- `firebase.json`;
- workflow de deploy DEV root;
- proyecto DEV esperado;
- target de hosting;
- site esperado;
- URL DEV esperada;
- URL final de produccion esperada.

## 4. URLs

URL DEV esperada por configuracion:

`https://cxorbia-backend-dev.web.app`

URL final de produccion/cutover:

`https://tya-plataforma.web.app`

## 5. Punto critico

El readiness solo confirma configuracion. No confirma que Firebase haya recibido un deploy.

Antes de pedir smoke visual a Paula debe existir evidencia de:

- deploy success;
- URL exacta;
- respuesta HTTP valida;
- index con CXOrbia o Plataforma Operativa de Campo.

## 6. Siguiente bloque recomendado

Prioridad del plan:

1. Obtener evidencia real de deploy DEV root o confirmar bloqueo del runner.
2. Si hay bloqueo por secret/workflow, documentarlo y resolver solo esa causa.
3. Si deploy queda verificado, pedir smoke visual a Paula.
4. Si no hay deploy verificable, continuar backend/contratos sin pedir visualizacion.

## 7. Estado seguro

- Sin produccion final.
- Sin merge final.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
