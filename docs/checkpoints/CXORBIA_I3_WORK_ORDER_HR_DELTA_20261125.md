# CXORBIA RECOVERY — ORDEN CORREGIDA PARA WORK

## 1. Continuar I3 sobre la candidata existente

Esta orden incorpora la instrucción de Paula del 25 de noviembre, posterior al corte `66a1d7dec9abe72657e0ce8a4672dff33490a67c`. Sustituye la instrucción de comprar créditos y relanzar automáticamente el ensayo completo F3 estimado en 1.184 créditos. Ese cálculo describe el ejecutor anterior; no es un requisito funcional ni un presupuesto obligatorio.

Consulta HEAD vivo de `paulaosoriof86/demoCXOrbia`, rama `recovery/cxorbia-phase-a-20260831`, y ejecuta:

```bash
node tools/qa/cxorbia-i3-canonical-candidate-authority-guard.mjs --current
```

La fuente servida comprobada es `d727f3be67a4430f08216dbb37cccba790f934f5`, runtime `cxorbia-live-hr-dev-00393-p54`, Hosting `607182bc22875d48`, despliegue Google `5670f782-19af-47aa-bdda-47cf94c689f2`. Resuelve los recibos posteriores si HEAD avanzó. No despliegues HEAD por rutina ni publiques otra candidata. I3 continúa HOLD y producción requiere el artefacto certificado de I4 y autorización exacta.

## 2. Decisiones operativas congeladas

- La lectura automática comprende mes calendario anterior, actual y siguiente cuando exista, según configuración y zona horaria del proyecto. No busca otro futuro más lejano si el siguiente no existe.
- Los períodos anteriores fuera de esa ventana se refrescan solo por demanda explícita; el histórico confirmado permanece conservado.
- Los módulos deben consumir la misma proyección de HR interna, durable, protegida y vinculada a una revisión externa identificable. Navegar, renderizar o abrir módulos no debe multiplicar lecturas externas.
- Centraliza en el propietario de sincronización existente las lecturas externas necesarias, incluidas las verificaciones estrictas de comandos. La frescura, el retraso y la condición de última lectura confirmada deben permanecer visibles; no presentar una copia antigua como lectura actual.
- La escritura es un evento de un campo/celda dentro del tenant, proyecto, país, período, visita y fila correctos. Envía únicamente el cambio necesario. Conserva ACK remoto, lectura independiente, idempotencia, orden causal, conflictos y protección contra eco.
- Make se reserva a los procesos que realmente necesitan ese transporte. Las publicaciones siguen por Google/GitHub existentes. Una operación manual que modifica Excel directamente no acredita por sí sola que el comando de la plataforma funcione.
- La escritura de un usuario en la plataforma origina un evento conocido. Para cambios hechos directamente en Excel, verifica la capacidad real de detección y su latencia: no inventes un webhook instantáneo por celda ni una credencial Graph disponible.
- No copiar base legacy, no volver al espejo Google obsoleto, no reimportar datos reales, no usar localStorage como autoridad y no introducir hardcodes globales de cliente, país, moneda, período, hoja o columna.

## 3. Evidencia vigente que debes conservar

La ventana anterior/actual/siguiente ya está implementada. La prueba aceptada VRM-375 acreditó octubre y noviembre: 88 visitas; diciembre no estaba disponible. Conservó 836 visitas históricas de 19 períodos y comprobó una lectura explícita de septiembre de 44 visitas. No repetirla salvo deriva reproducible del owner afectado.

La presentación protegida ya solicita el modelo interno `readModel=1`. Sin embargo, el código servido todavía tiene lecturas externas: el observador humano solicita `format=meta&fresh=1` cada cinco minutos por sesión visible; los comandos HR piden observación fresca. Por ello todavía no es correcto afirmar que solo una sincronización central consulta la fuente externa.

El intento F3 `1795653493842440` permanece FAIL: hubo un PATCH real con HTTP 404, sin ACK válido. Las dos expresiones de URL de Make se corrigieron y el runner de roles quedó reparado. Su recuperación posterior terminó: 26 documentos sintéticos más bloqueo temporal, tres cuentas QA y dos claves Make eliminados, con lectura de ausencia. NO repitas esa limpieza. Consulta:

- `CXORBIA_I3_F3_NATIVE_1795653493842440_COMPLETE_QA_RECOVERY_20261125.json`.
- `CXORBIA_I3_F3_GOOGLE_NATIVE_READINESS_20261125.md`.
- `CXORBIA_I3_F3_BOUNDED_PROBE_PLAN_20261125.json`.

F3 nativo dispone de autenticación por contraseña para identidades sintéticas desechables; ese camino no necesita renovar signBlob. No atribuyas esa prueba al acceso ordinario de usuarios reales.

## 4. Primera ejecución: certificar una celda con alcance explícito

Adapta el runner F3 existente para un modo focal, sin crear otro ejecutor, workflow, transporte ni candidata. Este modo todavía no está implementado: prepáralo y prueba su recuperación antes de lanzarlo. Mantén el modo completo histórico como evidencia y capacidad disponible, pero no lo uses como condición para empezar ni lo relances automáticamente después de la prueba focal.

Usa una sola celda sintética GT/escenario del fixture ya autorizado: valor original A → valor B → restauración A. Conserva el mismo backend servido, propietario Make, registro causal y comprobaciones de identidad. El resultado debe demostrar:

1. Línea base remota y propiedad exacta del fixture, con revisión y celda identificadas.
2. Comando autenticado desde la aplicación y una sola escritura física para A → B.
3. ACK remoto y lectura independiente de B.
4. Pérdida real de la respuesta al cliente y repetición de la misma clave, sin otro PATCH ni duplicación durable.
5. Rechazo del mismo identificador con contenido alterado y de la base obsoleta, sin escritura.
6. Restauración B → A con un evento distinto, ACK y lectura independiente.
7. Repetición del evento antiguo sin retroceder el estado restaurado.
8. Limpieza comprobada de los recursos exactos del intento, con evidencia sellada antes de borrarlos.

Dos PATCH legítimos como máximo para este alcance: cambio y restauración; cero PATCH por repetición o rechazo. Cada resultado debe contener las ejecuciones reales del proveedor y el consumo observado, sin inferir escritura a partir del estado SUCCESS del escenario.

Integra el resultado mediante el consumidor existente como evidencia parcial tipada de esa celda y esos casos. Adapta de forma acotada el esquema/validador si exige los ocho campos del ensayo completo; no fabriques casos ni señales de cobertura. La prueba focal no cierra automáticamente B14, los otros campos, países, roles o todo F3. Sus cláusulas aprobadas se conservan para completar después únicamente lo no cubierto; no repetir el circuito entero para volver a acreditarlas.

El diseño conservador estima aproximadamente 200 créditos y reserva 350 incluyendo comprobación y recuperación. Es estimación, no factura ni garantía. Separa 250 para el recorrido y 100 reservados a restauración/limpieza; detén nuevos cambios antes de consumir esa reserva. El límite no autoriza abandonar una celda ya modificada: completa o recupera su restauración antes de cualquier otra prueba. Verifica saldo y exclusión de otro escritor antes de arrancar. El saldo observado de 1.040 permite preparar esta prueba sin comprar créditos. No compres ni actives compras automáticas para ejecutar el ensayo anterior.

## 5. Corrección de lectura: owners exactos y prueba reproducible

Existe un P0 reproducido sin red: con inventario frío y recuperación durable disponible simulada, `buildSnapshot` resuelve el inventario externo antes de intentar recuperar la HR interna; un fallo del proveedor impide llegar a esa recuperación. Con el mismo fixture e inventario caliente, sí recupera el modelo interno. Consulta el script y resultado `CXORBIA_I3_HR_DURABLE_COLD_INVENTORY_REPRO_20261125.*`. La reproducción usa las funciones reales con fronteras de proveedor/almacenamiento simuladas; no afirma una caída nueva en vivo. Ejecútala sin red:

```bash
node docs/checkpoints/CXORBIA_I3_HR_DURABLE_COLD_INVENTORY_REPRO_20261125.mjs .
```

Owners comprobados:

- `backend/runtime/hr-live-service/server.mjs`: `buildSnapshot`, `resolveProjectHrReadBinding`, `recoverHrReadModel` y la invocación de inventario.
- `backend/runtime/cxorbia-excel-operational-snapshot-v1.mjs`: resolución del plan y la ventana.
- `app/adapters/tya-live-source-refresh-watch-v2.js`: observación automática con `fresh=1`.

Registra MODULE_TRUTH con el defecto, fuente aprobada/servida, hashes y reproducción antes de cambiar producto. Corrige la recuperación fría para que pueda validar de forma local la identidad, configuración, mapping y huella de owners del snapshot durable, antes de necesitar inventario externo. No omitas esas validaciones ni reutilices un binding distinto. Comandos y certificación mantienen verificación externa estricta cuando sea necesaria.

Para eliminar la multiplicación de lecturas, mide los disparadores exactos y centraliza la actualización compartida en el owner existente. La caché actual dura 5–15 segundos y `fresh=1` la omite; `inFlight` solo comparte solicitudes simultáneas dentro del mismo proceso. No basta aumentar el intervalo del navegador ni retirar la frescura. Verifica que dos sesiones y varios módulos reciben la misma revisión sin generar por separado el mismo refresh externo, conservando actualización por cambios y frescura visible.

Si se sustituye la lectura Make por Graph directo, exige primero transporte y credenciales delegadas realmente disponibles y autorizados. No extraigas tokens de Make, no supongas que un permiso de aplicación permite la API Excel y no uses legacy como base. Si falta esa capacidad, conserva temporalmente el proveedor válido mientras eliminas llamadas redundantes y publica la limitación concreta. No conviertas una migración de autenticación en un requisito general para cerrar todo lo demás.

## 6. Pruebas, publicación y trabajo paralelo

Prueba los defects exactos, incluyendo snapshot durable con inventario frío/proveedor caído, binding modificado, separación de proyectos, períodos por demanda, revisión compartida, autenticación, lectura fresca antes del write e invalidación posterior al ACK. Conserva los casos negativos existentes.

Las modificaciones solo de QA/consumo se publican como controles y no obligan a reconstruir el producto. Los cambios de producto se incorporan incrementalmente a la única candidata mediante su mecanismo actual, se prueban y se publican por el único despliegue DEV emparejado. No reconstruir entre la certificación final del artefacto y su despliegue productivo. Coordina el cambio de source servido con cualquier ensayo activo: termina y sella su resultado antes de cambiarlo.

En paralelo, completa Academia Shopper/Cliente y E10 autenticado donde no dependan de este writer ni consuman su reserva. Conserva Finance, Academia Admin, los seis módulos MATCH y B4/B5/B6/B7. No reasignes a pendiente pruebas ya acreditadas. Las comprobaciones independientes pueden paralelizarse; los cambios y la publicación del mismo owner se serializan con HEAD fresco, lease y readback. No iniciar dos escritores F3.

No parar ante un FAIL para abrir una auditoría general: clasifica el fallo con la taxonomía vigente, reproduce, corrige el owner probado y repite solo el alcance afectado. Conserva los demás avances y publica cada correctivo completo sin acumularlo indefinidamente.

## 7. Entrega y continuidad obligatorias

Publica y vuelve a leer desde GitHub cada corrección, resultado y siguiente acción en el mismo carril. Distingue siempre fuente servida, fuente sucesora aprobada, cambios solo QA y alcance funcional certificado.

En cada corte informa: iteración y GO/HOLD/NO_GO; cambios publicados; prueba ejecutada y no ejecutada; celda/campo y revisión; ACK e idempotencia observados; número real de PATCH y consumo Make; restauración/limpieza; cláusulas cerradas y residuales; P0 exacto; siguiente acción y autorización realmente pendiente. No usar porcentajes ni SUCCESS del proveedor para sustituir esos hechos.

Objetivo inmediato: demostrar la escritura focal con restauración completa y resolver el acoplamiento de la lectura interna al inventario externo. Después avanzar acumulativamente las cláusulas faltantes, Gate20/Gate21 e I4, sin reiniciar I0–I3 ni crear una I5.
