# ACADEMIA — Impacto C6 Crosswalk Root Fix Source/Static PASS

**Fecha:** 2026-08-05

## Impacto confirmado

El correctivo fortalece el contenido formativo sobre identidad y migración:

- una persona se identifica por llaves técnicas, no por coincidencia visual de nombre;
- HR, visitas, certificaciones y liquidaciones pueden aportar linaje técnico reutilizable;
- un crosswalk debe conservar y propagar los identificadores de las fuentes enlazadas;
- una cifra agregada no se acepta como baseline cuando existe drift en la cobertura de fuentes;
- `readyForAuthRepair` requiere paridad demostrada y ausencia de holds;
- la desambiguación visible mediante sufijo no PII no reemplaza la identidad canónica por `shopperId`.

## Material que puede actualizarse ya

- patrón reusable de crosswalk técnico;
- gate de paridad y hard stop;
- fixture de propagación de llaves;
- diferencia entre prueba source/static y validación provider;
- manejo de evidencia y request one-shot.

## Material que debe esperar

No actualizar todavía cifras, ejemplos de usuarios ni rutas finales con:

- 65 grupos;
- 142 identidades;
- 12 apellidos pendientes;
- un empate multi-Auth;
- distribución observada del plan de 340 filas.

Esos resultados son provisionales hasta nueva revalidación provider read-only.

## Seguridad y privacidad

Los manuales deben conservar:

- cero exposición del shopperId en el login visible;
- cero exportación de nombres, emails, UIDs o contraseñas crudos en evidencias;
- revisión humana ante empate;
- prohibición de fusionar perfiles solo por `nombre.apellido`;
- separación entre planeación read-only y ejecución de Auth.
