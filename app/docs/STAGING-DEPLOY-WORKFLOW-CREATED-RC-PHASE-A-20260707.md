# Staging deploy workflow created - RC Phase A

Fecha: 2026-07-07

## Bloque completado

Paula autorizo proceder con preview/staging controlado con integraciones apagadas.

Se creo workflow para ejecutar el movimiento de Hosting preview/staging controlado.

## Archivo creado

- `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`

## Scope del workflow

El workflow ejecuta:

1. Checkout.
2. Node setup.
3. Predeploy gate.
4. Drift gate.
5. Verificacion de secret Firebase.
6. Deploy de Firebase Hosting preview channel si el secret existe.
7. Upload de reportes.

## Seguridad

El workflow despliega solo Hosting preview channel:

- projectId: `cxorbia-backend-dev`
- target: `cxorbia-dev`
- channelId: `rc-phase-a`
- expires: `7d`

No despliega:

- Firestore rules;
- Storage rules;
- Functions;
- imports;
- proveedores externos;
- Make;
- Gemini;
- mensajeria/correo;
- pagos reales.

## Secret requerido

El workflow requiere el secret:

- `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`

Si no existe, el workflow bloquea antes de llamar a Firebase y deja el deploy sin ejecutar.

## Estado esperado

- Si el secret existe: debe crear preview Hosting channel controlado.
- Si el secret no existe: debe fallar de forma segura en `Secret availability check`.

## Claude

No hay pendiente nuevo importante para Claude en este bloque.

Si el preview revela una regresion visual o una inconsistencia importante de Academia, se documentara para Claude.

## Estado seguro

Sin produccion real, sin merge final, sin reglas, sin proveedores reales, sin imports y sin datos sensibles.
