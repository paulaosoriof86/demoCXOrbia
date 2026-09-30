# Auditoría de verificación del empalme — última fuente V105(1) / identidad interna V106

Fecha: 2026-07-11

## Decisión

La última fuente entregada por Paula continúa siendo `Prototype development request CXOrbia V105(1).zip`.

El repo no volvió a una baseline anterior. La línea activa sigue siendo:

- fuente recibida: V105;
- identidad interna del paquete: V106;
- estado: **baseline auditada de continuidad empalmada**;
- backend preservado: R5;
- plan materialización source-safe: R6;
- executor fail-closed: R8;
- readiness operativo: R9;
- smoke visual source-safe TyA: R10.

No se declara source lock final ni producción.

## Verificaciones acumuladas ya cerradas

La verificación no se limita a documentación. Ya existen y pasaron los siguientes controles sobre la baseline empalmada:

1. auditoría forense del paquete V105 con identidad interna V106;
2. validación de scripts cargados, sintaxis y estructura modular;
3. source-lock runtime externo por hashes;
4. RC smoke y predeploy gate;
5. drift gate reanclado al commit runtime V106 validado;
6. visual smoke de seis perfiles;
7. preservación de snapshot/adapters TyA;
8. 14 periodos, 616 visitas, 213 shoppers y 572 liquidaciones;
9. plan source-safe de 1,418 operaciones create-only;
10. 0 escrituras, 0 import real, 0 pagos, 0 deploy y 0 producción.

Por tanto, el empalme estructural de V105/V106 queda **confirmado para continuidad backend**. No se reinicia sobre V104 ni sobre una candidata anterior.

## Qué todavía impide source lock final

No se confunde empalme con cierre total. Siguen abiertos:

- manifest interno de la candidata V106 y smoke interno completo pendiente Claude;
- smoke visual que consuma la carga TyA source-safe, no únicamente demo/localStorage;
- evidencia read-only de que Firebase DEV sea realmente nueva y vacía;
- export limpio de pagos/movimientos;
- export limpio de certificaciones presentadas;
- revisión humana separada antes de cualquier autorización de materialización.

## Verificación adicional R10

Se agregó un smoke operacional visual dedicado que:

- construye el payload HR TyA sanitizado;
- valida tenant `tya` y proyecto `cinepolis`;
- exige 14 periodos, 616 visitas y 213 shoppers;
- verifica cobertura GT/HN y monedas por país;
- controla que las visitas sean source-safe y no expongan nombres crudos;
- entra como Admin, Cliente y Shopper;
- intenta rutas operativas de proyectos, visitas, postulaciones, certificaciones, finanzas, beneficios y Academia;
- captura pantallas y errores de consola;
- bloquea copy que afirme envío, sincronización o pago real sin evidencia;
- no escribe en Firebase, HR, Storage, Make, Gemini ni producción.

Este smoke es la comprobación visual que faltaba para no depender únicamente del smoke demo.

## Regla de continuidad

La siguiente candidata de Claude, cuando corresponda, debe construirse sobre esta V106 empalmada. No debe reconstruir desde cero, revertir archivos ya validados ni tocar backend, contratos, adapters, importadores, gates o datos TyA.

## Estado seguro

- PR #7 draft/open/no merge;
- sin deploy;
- sin producción;
- sin import real;
- sin Firebase/HR writes;
- sin pagos;
- sin activación Make/Gemini/Auth/Storage.
