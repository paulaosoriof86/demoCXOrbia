# Academia — impacto R15C a R15F

Fecha: 2026-07-13

## Objetivo de aprendizaje

Academia debe explicar el ciclo completo sin confundir infraestructura con operación:

1. **Firebase DEV existente:** proyecto técnico ya utilizado por CXOrbia; no significa producción.
2. **Procedencia confirmada:** Auth/Firestore/rules conocidos pueden conservarse sin borrarlos.
3. **Lectura read-only:** permite inspeccionar y comparar, pero no crea, actualiza ni importa registros.
4. **Fuente canónica:** la información que manda actualmente es HR viva multi-tab source-safe y R14C.
5. **Materialización:** futuro proceso controlado para llevar la fuente canónica a Firestore con create/update/noop/review.
6. **Binding de build:** el payload source-safe se conecta en una copia de build sin alterar el source lock V110.
7. **Deploy:** requiere autorización distinta; predeploy verde no equivale a deploy autorizado.
8. **Producción:** permanece bloqueada hasta cerrar Auth, materialización, colas y smoke operativo autenticado.

## Contenido por rol

### Superadmin/Admin

- reconocer fuente canónica y fuente de referencia;
- interpretar gaps y reviewQueue;
- no borrar datos por diferencias de conteo;
- revisar materialización antes de escribir;
- distinguir liquidada, planificada y pagada.

### Operativo/coordinador

- usar HR como fuente operacional;
- interpretar 210/213 shoppers sin fusionar por nombre;
- entender 196 enlaces financieros exactos y 51 filas en revisión;
- no repetir visitas de junio.

### Shopper

- sus visitas, certificaciones y liquidaciones deben mostrarse solo cuando la fuente correspondiente esté confirmada;
- no interpretar un registro de control como pago confirmado.

### Cliente

- el preview source-safe no expone PII;
- los datos protegidos requieren Auth y reglas por rol.

## Checklist interactivo sugerido

- ¿La fuente mostrada es HR source-safe, Firestore read-only o materializada?
- ¿El proyecto es `cinepolis` configurable dentro de TyA?
- ¿El conteo coincide con la fuente canónica?
- ¿Existe reviewQueue?
- ¿La acción es solo lectura?
- ¿Hay autorización de import/write/deploy?
- ¿El pago está confirmado o solo controlado?

## Errores frecuentes

- asumir que un Firebase con datos es ajeno sin revisar procedencia;
- crear otro proyecto innecesariamente;
- considerar Firestore canónico solo porque responde;
- unir shoppers por nombre;
- convertir `liquidada` en `paid`;
- presentar un predeploy verde como producción habilitada.

## Estado editorial

Este documento es contenido de referencia para backfill de Academia. No publica cursos, no activa Gemini y no modifica el módulo Academia.
