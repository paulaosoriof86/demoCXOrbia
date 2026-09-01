# CAMBIOS BACKEND — periodos/histórico V103

- Creado `app/core/tya-phase-a-period-history-integrity.js`.
- Actualizada únicamente la entrada backend local `index-tya-phase-a-source-safe.html` para cargar el guard dentro del runtime empalmado.
- Creados contrato, snapshot sanitizado, validador reproducible y workflow CI en GitHub.
- No se tocaron `app/modules` ni `app/index.html` genérico.
- Recupera el trabajo previo de HR multi-tab y evita que una separación ya sanitizada vuelva a mostrarse mezclada por defaults locales.
- Estado: runtime source-safe operativo local, CI contractual en GitHub, predeploy HOLD.
