# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-04  
**Estado frontend:** `CLOUD_V6_EMPALMED__VISUAL_HOLD__CLOUD_V7_DELTA_PENDING__NO_DEPLOY`

## 1. Estado acumulativo

Cloud V6 fue empalmada mecánicamente sobre la rama viva:

- HEAD previo: `a2ccfb0c3709cad6f5e6a9c16dcb7f9293532d6e`;
- commit funcional: `f961253f18c388ae04619bb5175269015c8349c3`;
- SHA-256 del ZIP V6: `0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`;
- candidata acumulativa preservada;
- deploy DEV: 0;
- producción: intacta.

Codex solo realizó el empalme mecánico. No audita ni decide visualmente.

## 2. Decisión visual V6

`HOLD_FRONTEND_VISUAL`.

La versión de escritorio empalmada no reproduce la composición aprobada de Emergent:

- panel derecho con apariencia de portada/demo;
- logo grande CXOrbia y título genérico;
- accesos de validación y pie técnico visibles;
- campos de usuario/contraseña y botón fuera de la composición inicial;
- tarjetas demasiado grandes y redondeadas;
- órbita más rígida y pesada;
- jerarquía distinta de la referencia.

No se solicita reconstruir V6. El siguiente entregable es un delta visual V7 sobre la misma candidata acumulativa.

## 3. Instrucción V7 vigente

Fuente:

`PROMPT-CLOUD-V7-CORRECCION-VISUAL-LOGIN-ORBIT-20260804.md`.

Alcance principal permitido:

- `app/app.js`;
- `app/styles/layout.css`.

Objetivo:

- Emergent como autoridad estricta de composición, proporción, densidad y jerarquía;
- Orbit 360 como autoridad de estilo orbital;
- identidad Gravicentra CX;
- cero cambios backend o funcionales.

## 4. Resultado visual obligatorio

Panel izquierdo:

- marca Gravicentra CX;
- órbita compacta estilo Orbit;
- seis conceptos;
- centro pequeño y elegante;
- tagline aprobado.

Panel derecho, en este orden:

1. `INGRESO`;
2. `Iniciá sesión`;
3. subtítulo corporativo;
4. todos los países del tenant;
5. `PERFIL`;
6. tres tarjetas;
7. usuario;
8. contraseña;
9. botón `Ingresar`;
10. registro Shopper.

No mostrar:

- `Field Operations Platform`;
- `Selecciona un perfil para entrar al demo`;
- accesos de validación;
- Operativo/Coordinador/Aliado;
- `Desarrollado por CXOrbia`;
- instalar como app;
- demo comercial/datos ficticios;
- credenciales de ejemplo o textos técnicos DEV.

## 5. Países

- dinámicos;
- todos los configurados;
- orden recibido;
- bandera + nombre;
- sin `+N`;
- sin multiselect;
- sin selección obligatoria;
- evidencia con 1, 2, 8 y 12 países.

## 6. Evidencia V7

- `1920×1080`;
- `1440×900`;
- `768×1024`;
- `412×915`;
- `390×844`;
- comparación V6/V7 en `1440×900`;
- manifest con path, bytes y SHA-256 de todos los archivos y capturas.

## 7. Fuera del alcance de Cloud

No tocar:

- Firebase Auth;
- claims/memberships;
- `CX.data` o HR;
- cálculos o fuentes financieras;
- permisos/scopes;
- backend/adapters/workflows;
- laboratorio o runner;
- GitHub, gates, deploy o producción;
- Make, Gemini o pagos.

## 8. Gate y laboratorio — sin tarea Cloud

ChatGPT corrigió source-only:

- manifest base + overlay V6;
- asset Auth local fail-closed sin secretos;
- falso positivo del scanner;
- shell del Laboratorio para no declarar escenarios o cleanup inexistentes.

El runner real y las pruebas dentro de la plataforma continúan bajo responsabilidad de ChatGPT después del empalme V7 y del deploy DEV autorizado.

## 9. Secuencia

```text
CLOUD V7 VISUAL DELTA
→ AUDITORÍA VISUAL CHATGPT
→ CODEX SOLO EMPALME
→ SOURCE LOCK Y GATES
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP
→ VALIDACIÓN HUMANA
```

## 10. Estado seguro

- V6 empalmada: sí;
- V6 visual aprobada: no;
- V7 recibida: no;
- deploy: 0;
- producción: intacta.
