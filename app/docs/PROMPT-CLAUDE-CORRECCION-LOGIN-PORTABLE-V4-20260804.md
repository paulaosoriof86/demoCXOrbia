# Prompt para Claude · corrección focal Login portable v4

Trabajá únicamente sobre el paquete portable `gravicentra-login-portable`. No tocar GitHub, backend, Auth real, `data.js`, HR adapters, módulos legacy, Firebase, deploy ni producción.

## Fuente de decisión

La auditoría focal de ChatGPT clasificó la versión v4 como:

```text
HOLD_CLAUDE_LOGIN_PORTABLE_V4__NOT_READY_FOR_APPLY_DELTA_DIRECTLY
```

No abras una nueva metodología ni rediseñes libremente. Corregí exclusivamente los puntos siguientes.

## 1. Responsive y evidencia real

La imagen `docs/preview-mobile.png` entregada mide `924 × 540`, por lo que no demuestra comportamiento móvil.

Debés generar evidencia real en:

- 390 × 844;
- 412 × 915;
- tablet vertical;
- desktop 1440 × 900 o equivalente.

Criterios:

- la franja superior no se solapa;
- la órbita permanece visible;
- la órbita no queda recortada;
- el formulario usa el ancho disponible;
- países y roles no forman una columna excesivamente angosta;
- se puede recorrer y enviar el formulario con teclado;
- no hay scroll horizontal;
- no hay texto cortado.

## 2. Selector multi-país

El README afirma `Todos los países`, pero la implementación mantiene un único `country` y solo muestra chips.

Implementar el contrato aprobado:

### 1 país

- mostrar contexto fijo;
- sin selector innecesario.

### 2–3 países

- chips rápidos;
- opción `Todos mis países` únicamente cuando el flujo permita vista agregada.

### 4–12+ países

- tres recientes;
- botón `+N`;
- panel/multiselect buscable;
- selección de todos los países autorizados;
- agrupación por región opcional;
- móvil mediante bottom sheet;
- comparación máxima de tres cuando el modo sea comparativo.

El componente sigue sin conceder permisos. Solo devuelve selección mediante callback. Proponer una API portable como:

```js
onCountryScopeChange({ mode, countryIds })
```

No enviar PII ni rol por URL.

## 3. Tokens CSS

`Login.css` usa `--gcx-navy-2`, pero el token no está definido.

Corregir de una de estas maneras:

- definir `--gcx-navy-2` en `gravicentra-tokens.css`; o
- sustituirlo por un token ya definido.

Entregar un gate o comprobación que falle si cualquier `var(--gcx-*)` usado no está definido.

## 4. Baseline

Eliminar del README el HEAD fijo `3be7763`.

Usar:

```text
TARGET_HEAD_RESOLVED_BY_CHATGPT_AT_INTEGRATION_TIME
```

El paquete es portable y no decide la autoridad de integración.

## 5. Rebranding

Mantener:

- producto visible `Gravicentra CX`;
- tenant/consultora dinámico;
- `window.CX`, `CX.*`, constantes `CXORBIA_*`, storage keys, IDs, rutas y nombres técnicos sin renombrar.

No afirmar que el árbol canónico está rebrandeado. El inventario debe distinguir claramente:

- portable ya rebrandeado;
- árbol canónico propuesto/no aplicado.

## 6. Entregables acumulativos

Devolver un único paquete que contenga:

- `Login.jsx` corregido;
- `Login.css` corregido;
- `gravicentra-tokens.css` corregido;
- i18n/flags;
- FAB portable;
- especificación ficha shopper;
- inventario de marca;
- README actualizado;
- manifest JSON con path, bytes y SHA-256;
- capturas reales desktop/tablet/móvil;
- resumen de pruebas y viewports.

## 7. Prohibiciones

- no integrar Auth;
- no crear JWT;
- no usar localStorage/sessionStorage para tokens;
- no PII/rol en URL;
- no endpoint inventado;
- no copiar código Emergent inseguro;
- no tocar `app/modules`, `app/core`, adapters actuales ni backend;
- no nueva rama/PR/deploy;
- no afirmar GO o integración.

## 8. Criterio de aceptación

ChatGPT solo podrá aplicar el delta cuando:

1. no haya token CSS huérfano;
2. el selector cumpla 1 / 2–3 / 4–12+ países;
3. las capturas sean realmente de los viewports declarados;
4. la órbita sea visible y usable en móvil;
5. el paquete no fije un HEAD histórico;
6. el manifest de hashes coincida;
7. no existan Auth, PII, storage o endpoint inseguros.
