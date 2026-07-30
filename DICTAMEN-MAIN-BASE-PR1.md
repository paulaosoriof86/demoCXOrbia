# DICTAMEN-MAIN-BASE-PR1.md

## Objetivo

Validar si el `main` actual puede considerarse base aprobada para sincronizar PR #1.

## Resultado

Dictamen técnico: `main` actual parece ser una evolución importante del prototipo frontend y debe tratarse como posible nueva base, pero no debe sincronizarse automáticamente dentro del PR backend sin revisión visual/funcional final.

## Evidencia revisada

En `main`, `app/index.html` mantiene UTF-8 y carga nuevos módulos del prototipo, incluyendo:

```text
modules/academia.js
modules/correo.js
modules/marca.js
```

También mantiene la secuencia general core -> modules -> boot.

En PR #1, `app/index.html` contiene el punto backend nuevo:

```html
<script src="core/backend-config.js"></script>
<script src="core/backend-firebase.js"></script>
```

Ese punto no existe en `main` y debe preservarse al sincronizar.

## Diferencias relevantes

`main` trae cambios amplios en:

```text
app/app.js
app/core/config.js
app/core/router.js
app/core/topbar.js
app/index.html
app/styles/layout.css
app/modules/academia.js
app/modules/correo.js
app/modules/marca.js
app/modules/crm.js
app/modules/configuracion.js
app/modules/importador.js
```

Además, en `main` aparece `modules/academia.js`, mientras que PR #1 aún muestra `modules/aprendizaje.js` en su `app/index.html`. Esto confirma que PR #1 está basado en una versión anterior del frontend.

## Riesgo principal

Si se sincroniza automáticamente, se puede perder o duplicar el punto único backend en `app/index.html`, o mezclar evolución frontend con cambios backend, dificultando auditoría.

## Decisión

No hacer merge automático ni rebase automático desde ChatGPT.

La sincronización debe hacerse solo después de confirmar que `main` actual es la nueva base visual/funcional aprobada. Una vez confirmado, PR #1 debe actualizarse conservando:

```html
<script src="core/backend-config.js"></script>
<script src="core/backend-firebase.js"></script>
```

ubicado después de `core/notif.js` y antes de `core/topbar.js`.

## Checklist posterior a sincronizar

Después de sincronizar PR #1 con `main`, revisar:

1. `app/index.html` conserva scripts backend.
2. `CX.BACKEND.enabled` sigue en `false`.
3. No se modificó `/app/modules` desde el PR backend.
4. `modules/academia.js`, `modules/correo.js` y `modules/marca.js` siguen cargados si son parte de la base aprobada.
5. No hay datos reales.
6. No hay deploy.
7. PR #1 sigue como draft.

## Conclusión

`main` puede ser la base a integrar, pero requiere confirmación de aprobación frontend. Desde backend, la instrucción segura es: no sincronizar todavía hasta que Paula confirme visual/funcionalmente que `main` es la base correcta.
