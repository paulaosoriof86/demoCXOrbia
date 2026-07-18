# PENDIENTES PROTOTIPO — V159 HOSTING DEV PASS

Fecha: 2026-07-18

## Cerrado y no reabrir

- Auditoría V159.
- Decisión GO sin P0.
- Empalme directo en `docs-tya-v6-v71-audit`.
- Manifest, build-lock y verificador.
- Proyecto y periodo separados.
- Estados canónicos preservados en el adapter.
- Control financiero de junio expuesto y validado sin inferir pagos.
- Gates locales.
- Firebase Hosting DEV.
- Prueba remota del build exacto.
- Smoke remoto Admin, Shopper, Cliente, proyecto/periodo/KPI/histórico y overlays.
- Carril Hosting DEV centralizado y endurecido.
- Registry y checkpoint actualizados al estado pre-freeze.

No solicitar V160 ni reabrir adapters, mapping, importadores, contratos, auditoría, empalme, Hosting DEV o smoke remoto.

## Pendiente exacto del Corte 0

1. Paula revisa:
   `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`.
2. Responde `APROBADO` o un hallazgo reproducible con rol, ruta, acción, esperado y observado.
3. Si no existe P0, congelar V159 como `ACTIVE_BASELINE`.
4. Iniciar Corte 1 desde las fuentes, mapping y adapters ya preparados.

## Checklist visual

- login y tenant TyA;
- proyecto Cinépolis separado del periodo;
- mayo, junio y julio cambian filas y KPIs;
- 44 visitas por periodo, GT 34 y HN 10;
- junio ejecutado y pendiente de liquidación/pago;
- cero pagos falsamente confirmados;
- Dashboard, Proyectos, Periodos, Histórico y Visitas;
- rutas Admin, Shopper, Cliente y Academia;
- textos honestos de fuentes e integraciones.

## Pendientes no bloqueantes

- Revisar deriva shopper 215/216 mediante R11D.
- Mantener visible que HR DEV es snapshot de build y no sync runtime live.
- Evaluar como P1 la visibilidad del conteo shopper en módulos donde aporte valor.

## Claude

No existe tarea frontend nueva confirmada. Solo se genera una si la revisión visual demuestra P0 frontend reproducible y archivo/módulo responsable. P1/P2 no bloquean el freeze.

## Academia

Pendiente revisión visual por rol de manuales, cursos, certificaciones, deep links, notificaciones y estados honestos del mismo build.

## Estado seguro

Hosting DEV PASS. Producción, merge, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live y pagos continúan HOLD.
