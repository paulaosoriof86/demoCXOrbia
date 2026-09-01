# PENDIENTES PROTOTIPO — V159 DEV ACTUALIZADA

Fecha: 2026-07-18

## Cerrado y no reabrir

- Auditoría V159 y decisión GO sin P0.
- Empalme directo en `docs-tya-v6-v71-audit`.
- Manifest, build-lock y verificador.
- Proyecto y periodo separados.
- Estados canónicos preservados en el adapter.
- Control financiero de junio validado sin inferir pagos.
- Clasificación shopper corregida en la frontera de conexión.
- 215 referencias protegidas mostradas como referencias; 0 activos y 0 perfiles completos inventados.
- Gates locales y remotos posteriores a la corrección.
- Firebase Hosting DEV actualizado.
- Prueba remota del build/commit exactos.
- Smoke remoto Admin, Shopper, Cliente, proyecto/periodo/KPI/histórico y overlays.
- Carril Hosting DEV centralizado, fail-closed y observable.
- Polling de propagación remota.
- Gates V110 retirados del carril automático.
- Firestore drift limitado a evidencia backend/Firestore real.
- Registry y checkpoint actualizados al build corregido pre-freeze.

No solicitar V160 ni reabrir adapters, mapping, importadores, contratos, auditoría, empalme, Hosting DEV, smoke remoto o clasificación shopper.

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
- Shoppers: 215 referencias protegidas, 0 activos, 0 inactivos, 0 completos y 0 incompletos;
- Dashboard, Proyectos, Periodos, Histórico y Visitas;
- rutas Admin, Shopper, Cliente y Academia;
- textos honestos de fuentes e integraciones.

## Pendientes no bloqueantes

- Resolver la deriva shopper 215/216 mediante revisión R11D cuando llegue su corte operativo.
- Mantener visible que HR DEV es snapshot de build y no sincronización runtime live.

## Claude

No existe tarea frontend nueva confirmada. La clasificación shopper quedó corregida sin modificar `app/modules`. Solo se genera una tarea para Claude si la revisión visual demuestra un P0 frontend reproducible y archivo/módulo responsable. P1/P2 no bloquean el freeze.

## Academia

Pendiente revisión visual por rol de manuales, cursos, certificaciones, deep links, notificaciones y estados honestos. Debe explicar que una referencia protegida no equivale a un perfil operativo, activo o completo.

## Estado seguro

Hosting DEV actualizado y validado. Producción, merge, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live y pagos continúan HOLD.
