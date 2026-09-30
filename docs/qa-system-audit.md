# Auditoría integral de QA — ProGas

**Fecha:** 30 de septiembre de 2026  
**Versión revisada:** `1.1.0`  
**Alcance:** frontend React/TypeScript, navegación pública y administrativa, autenticación/autorización, acceso a Firestore, reglas de negocio, inventario, cierres, mantenibilidad, accesibilidad, pruebas y cadena de entrega.

> Este documento es un diagnóstico y una hoja de ruta. La primera ronda de correcciones abordó los defectos que podían resolverse de forma segura en el cliente; los hallazgos de seguridad que dependen de Firebase deben confirmarse contra las reglas desplegadas, ya que el repositorio no contiene `firestore.rules`, `storage.rules` ni configuración de emuladores.

## 1. Resumen ejecutivo

La aplicación tiene una base funcional y algunas decisiones positivas: separación parcial por servicios, guardas de ruta por rol, transacciones para confirmar cortes, utilidades de negocio con pruebas y componentes públicos con nombres accesibles. Sin embargo, **no se recomienda liberar a producción sin cerrar los bloqueos de seguridad, privacidad e integridad de inventario**.

Se registraron **17 hallazgos**:

| Severidad | Cantidad | Criterio |
| --- | ---: | --- |
| Bloqueante | 3 | Riesgo de acceso no autorizado, exposición de datos personales o corrupción del inventario |
| Alta | 6 | Flujo principal roto, inconsistencias persistentes o ausencia crítica de control |
| Media | 7 | Defectos de calidad, accesibilidad, observabilidad o mantenibilidad con impacto operativo |
| Baja | 1 | Deuda documental |

### Decisión de salida sugerida

**NO-GO** hasta demostrar reglas de Firebase de mínimo privilegio y corregir `QA-002` y `QA-003`. Después, ejecutar el conjunto de pruebas de regresión propuesto en la sección 5 en un proyecto Firebase aislado.

### Estado de la primera ronda de correcciones

| Hallazgo | Estado | Cambio aplicado |
| --- | --- | --- |
| QA-002 | Parcial | Se eliminó la búsqueda por teléfono, se exige coincidencia exacta del código y ya no se muestra la dirección; sigue pendiente rate limiting/App Check y un token server-side |
| QA-003 | Parcial | Pedido y stock comparten una transacción idempotente por `requestId`, validan disponibilidad y recalculan precios; sigue pendiente mover la autoridad a backend/reglas |
| QA-004 | Corregido en cliente | El registro espera la creación del perfil y retorna el usuario real |
| QA-005 | Corregido | El router superior monta la ruta protegida del dashboard |
| QA-006 | Corregido | La recuperación envía correo desde el formulario y responde sin revelar si la cuenta existe |
| QA-007 | Parcial | La respuesta por teléfono es neutral, el alta pública usa un hash de la cédula como ID transaccional y el formulario valida/captura errores; sigue pendiente OTP y backend |
| QA-008 | Parcial | La UI valida enteros de 1 a 99 y la transacción vuelve a validar cantidad, producto, stock y precio |
| QA-009 | Corregido | Login conserva el formulario, muestra feedback neutral y bloquea envíos duplicados |
| QA-011 | Corregido | Se retiraron todas las exclusiones globales `@ts-nocheck` y `eslint-disable`; typecheck y lint son obligatorios en CI |
| QA-012 | Parcial | La paginación sin filtros devuelve cursor y `hasMore`; las búsquedas se deduplican, ordenan y respetan un límite global |
| QA-013 | Parcial | Se añadió un Error Boundary y `AsyncContent` se adoptó en todas las pantallas con carga remota de página; sigue pendiente telemetría |
| QA-014 | Corregido | Login y registro usan controles de contraseña operables por teclado, con nombre accesible y labels asociados |
| QA-016 | Parcial | El lockfile se sincronizó, Node 20 y `.npmrc` permiten `npm ci`, y CI exige lint/typecheck; faltan E2E/SCA |

Los hallazgos no incluidos en esta tabla continúan pendientes. “Corregido en cliente” no sustituye las pruebas de reglas ni la validación en un entorno Firebase aislado.

## 2. Método y cobertura de la revisión

### Actividades realizadas

- Inventario de las **168** unidades `.ts/.tsx` de producción y **16** archivos de prueba.
- Revisión estática de rutas, layouts, contextos, servicios, vistas públicas/administrativas, utilidades e interfaces.
- Trazabilidad manual de estos recorridos:
  1. registro e inicio de sesión;
  2. verificación/alta de cliente;
  3. creación y consulta pública de pedido;
  4. alta y actualización administrativa de pedidos;
  5. inventario;
  6. roles y colaboradores;
  7. patrocinadores/centro comercial;
  8. gastos y cierres.
- Revisión de pruebas existentes: **43 casos declarados**. Predominan utilidades y componentes; no hay pruebas de integración reales con Firebase ni E2E.
- Intentos de instalación reproducible, test, auditoría de dependencias y revisión del árbol de Git.

### Limitaciones

1. `npm ci` no puede reproducir el entorno porque `package.json` y `package-lock.json` no están sincronizados para npm 11 (`@types/react` y `yaml` faltan en el lockfile).
2. Sin dependencias instaladas, Jest, TypeScript y el build no pudieron ejecutarse.
3. `npm audit --package-lock-only` recibió HTTP 403 del endpoint del registro; no se pudo validar la exposición real a CVE.
4. No hay credenciales, proyecto Firebase de QA, reglas de seguridad ni datos semilla. Por ello no se hicieron operaciones destructivas ni validaciones dinámicas de permisos.
5. La revisión no incluyó backend: la aplicación accede a Firebase directamente y no hay funciones/cloud backend versionadas.

## 3. Aspectos positivos observados

- `AuthContext` invalida el acceso de perfiles desactivados y actualiza roles mediante snapshot en tiempo real (`src/contexts/AuthContext.tsx:38-68`).
- Las rutas administrativas principales declaran roles en el router superior (`src/index.tsx:35-40`) y vuelven a filtrarse en el layout (`src/layouts/admin/index.tsx:34-47`). Esto aporta defensa visual, aunque no sustituye reglas del servidor.
- La confirmación de cortes usa una transacción, huellas de pedidos y bloqueo de pedidos/gastos para prevenir dobles liquidaciones (`src/services/ClosingService.ts:12-44`).
- Las pruebas de `closing` y `order` cubren estados históricos, métodos de pago, costo al momento de venta y pedidos liquidados.
- Enlaces externos recientes incluyen generalmente `rel="noopener noreferrer"`, y varios controles públicos tienen etiquetas ARIA.

## 4. Hallazgos priorizados

## Bloqueantes

### QA-001 — No existe evidencia versionada de autorización en Firestore

**Área:** seguridad / autorización  
**Evidencia:** `src/apiConfig.ts:12-25`, `src/apiConfig.ts:28-224`, `src/services/UserService.ts:29-75`; no existen `firestore.rules`, `storage.rules`, `firebase.json` ni pruebas de reglas en el repositorio.

**Resultado actual:** el navegador contiene utilidades genéricas para leer, crear, editar y borrar cualquier colección indicada. Los roles de React solo ocultan páginas; un usuario puede invocar el SDK sin pasar por `PrivateRoute`. Incluso la creación de cuentas de colaboradores y su documento de rol se ejecuta desde el cliente.

**Riesgo:** si las reglas desplegadas son permisivas o confían en el documento escrito por el usuario, se podrían leer datos personales, alterar inventario/pedidos, asignar roles o borrar registros. La API key de Firebase en frontend es normal para Firebase y **no es por sí sola un secreto**; la barrera efectiva son las reglas, que aquí no son auditables.

**Corrección propuesta:**

1. Versionar `firebase.json`, `firestore.rules`, índices y tests del emulador.
2. Denegar por defecto y validar por colección: identidad, rol obtenido de claims o documento no editable por el propio usuario, esquema, campos mutables y transiciones de estado.
3. Mover alta de colaboradores, asignación de roles, cierres e inventario a Cloud Functions/Admin SDK o a operaciones protegidas por reglas estrictas.
4. Impedir que una cuenta pública cree o modifique `users.roles`, `Products`, `Closings`, `Expenses` o pedidos de terceros.

**Pruebas de aceptación:** tests de emulador con matriz anónimo/customer/colaborador/admin para cada `get/list/create/update/delete`, incluyendo escalada de rol y campos adicionales inesperados.

---

### QA-002 — La consulta pública por teléfono expone datos de pedidos y dirección

**Área:** privacidad / control de acceso  
**Evidencia:** `src/index.tsx:27`, `src/views/public/ViewOrder.tsx:41-62`, `src/views/public/ViewOrder.tsx:89-112`, `src/services/OrderService.ts:6-18`.

**Pasos para reproducir:**

1. Abrir `#/customer/view-order` sin iniciar sesión.
2. Escribir un teléfono conocido o susceptible de adivinación.
3. La aplicación consulta `Orders` por `orderCode` **o teléfono**.
4. La vista presenta código, estado, fecha/hora, productos, total y dirección completa de todos los resultados devueltos.

**Resultado esperado:** solo el titular debe consultar un pedido usando un factor difícil de adivinar y con protección contra abuso; el dato devuelto debe ser el mínimo necesario.

**Riesgo:** enumeración de pedidos y exposición de PII/hábitos de compra. Un teléfono de ocho dígitos no es un secreto y no existe rate limiting en el cliente.

**Corrección propuesta:** retirar la búsqueda directa por teléfono. Crear un endpoint/Callable Function con token aleatorio de alta entropía por pedido, respuesta minimizada, expiración o verificación OTP y rate limiting/App Check. No retornar dirección completa en la consulta pública.

**Pruebas de aceptación:** intentos masivos y por teléfonos ajenos devuelven respuesta indistinguible; token incorrecto no filtra existencia; token correcto solo devuelve campos permitidos; logs no contienen PII.

---

### QA-003 — El stock no es atómico y el flujo público no lo descuenta

**Área:** integridad transaccional / inventario  
**Evidencia:** `src/services/ProductService.ts:44-79`, `src/views/admin/order/new.tsx:349-368`, `src/views/customer/order/new.tsx:353-371`, `src/views/public/Products.tsx:97-145`.

**Resultado actual:**

- `discountStock` lee todos los productos, valida y luego ejecuta actualizaciones independientes en paralelo. Dos pedidos concurrentes pueden superar la existencia.
- En los formularios antiguo administrativo/customer se crea primero el pedido y después se descuenta stock. Si el descuento falla, queda un pedido persistido sin reserva; si una actualización intermedia falla, queda descuento parcial.
- El recorrido público activo (`/customer/products`) crea el pedido pero nunca llama a `discountStock`.
- `adjustStock` también implementa read-modify-write fuera de transacción.

**Riesgo:** sobreventa, stock negativo lógico, divergencia entre ventas e inventario y corrección manual no trazable.

**Corrección propuesta:** una única operación de servidor/transacción que lea existencias, valide productos activos/cantidades/precios, cree el pedido y actualice cada stock. El cliente nunca debe enviar como autoridad `price` ni `unitCost`. Añadir idempotency key para reintentos.

**Pruebas de aceptación:** 20 pedidos concurrentes sobre 10 unidades producen como máximo 10 ventas; un fallo no crea pedido ni modifica stock; reintentar la misma solicitud no duplica pedido/descuento; el flujo público y administrativo comparten la misma operación.

## Severidad alta

### QA-004 — Alta pública de usuario no espera la creación del perfil

**Área:** autenticación / consistencia  
**Evidencia:** `src/services/AuthService.ts:5-27`, `src/views/auth/signUp/index.tsx:66-78`.

`registerUser` no retorna ni espera `addData("users", ...)`. La promesa exterior puede resolverse y navegar aunque el perfil falle; además resuelve `undefined`. `AuthContext` exige que el perfil exista, por lo que se genera una cuenta autenticada sin acceso habilitado.

**Corrección:** reescribir con `async/await`, esperar el documento y definir rollback o recuperación idempotente. No mostrar éxito hasta completar ambas etapas. Idealmente crear el perfil mediante trigger/función de servidor.

### QA-005 — El dashboard definido no es alcanzable desde el router superior

**Área:** navegación / funcionalidad  
**Evidencia:** `src/routes/routes.tsx:198-206`, `src/index.tsx:35-43`.

Existe `/admin/dashboard/index`, pero `index.tsx` solo monta `AdminLayout` para `order`, `product`, `sponsor`, `client`, `user` y `closing`. Al navegar al dashboard, ninguna ruta coincide y el redirect final lleva a `/`.

**Corrección:** montar una única ruta protegida `/admin` y hacer la autorización por metadatos de ruta, o agregar explícitamente dashboard con rol. Añadir prueba de navegación directa y refresh.

### QA-006 — “¿Contraseña olvidada?” dirige a una ruta inexistente

**Área:** autenticación / recuperación  
**Evidencia:** `src/views/auth/signIn/index.tsx:167-175`, `src/routes/routes.tsx:208-218`.

La UI enlaza `/auth/forgot-password`, pero no hay ruta ni vista correspondiente. El layout termina redirigiendo al inicio de sesión, sin explicación ni correo de recuperación.

**Corrección:** implementar `sendPasswordResetEmail` con confirmación neutral y rate limiting de Firebase, o retirar el enlace hasta tener el flujo.

### QA-007 — La verificación de cliente permite enumerar cédulas/teléfonos y crear duplicados

**Área:** privacidad / datos maestros  
**Evidencia:** `src/views/public/CustomerData.tsx:22-73`, `src/services/ClientService.ts:7-24`, `src/views/public/CustomerInfo.tsx:89-121`.

Mensajes distintos revelan si una cédula tiene otro teléfono. Para un cliente nuevo, el alta se hace desde un flujo anónimo con comprobación previa no atómica; dos sesiones pueden crear duplicados de la misma cédula. La UI tampoco obliga técnicamente nombre y señas antes de escribir: `isRequired` no valida porque no hay submit HTML ni chequeo programático.

**Corrección:** verificación OTP/respuesta neutral, unicidad mediante ID normalizado o transacción/función, validación server-side de esquema y estados loading/error en el alta.

### QA-008 — Cantidades públicas inválidas alteran totales y stock esperado

**Área:** validación / precios  
**Evidencia:** `src/views/public/Products.tsx:69-90`, `src/views/public/Products.tsx:113-145`.

El atributo `min="1"` del input no protege `addItem`: al pulsar el botón se aceptan `0`, negativos, decimales, valores enormes o `NaN` según el texto convertido. Los precios y costos se copian del catálogo al payload del navegador y el total se calcula en cliente.

**Corrección:** validar enteros positivos y límites tanto en UI como servidor; recalcular precio, costo, disponibilidad y total desde datos confiables al confirmar.

### QA-009 — Los errores de login se manejan contra una forma incorrecta y bloquean toda la pantalla

**Área:** manejo de errores / UX  
**Evidencia:** `src/services/AuthService.ts:30-44`, `src/views/auth/signIn/index.tsx:62-75`.

El servicio transforma el error de Firebase en `Error`, pero la vista busca `error.response.status`, propiedad de Axios. En prácticamente cualquier fallo marca `isError` y reemplaza el formulario completo con una excepción genérica, sin distinguir credenciales, red o demasiados intentos. No hay estado de carga ni prevención de doble clic.

**Corrección:** conservar/mapear `FirebaseError.code`, presentar mensaje neutral inline, mantener formulario operativo, deshabilitar durante envío y probar Enter/doble clic/offline.

## Severidad media

### QA-010 — Cobertura automatizada insuficiente para recorridos críticos

**Área:** estrategia de pruebas  
**Evidencia:** 16 archivos de test y 43 casos para 168 archivos TS/TSX de producción; no hay configuración Cypress/Playwright ni tests de reglas.

No existen pruebas de AuthContext/PrivateRoute, servicios Firebase, creación/consulta de pedidos, inventario concurrente, clientes, roles, cierres integrados ni navegación real. La cifra no pretende ser cobertura de líneas (no pudo medirse), sino una señal de superficie no protegida.

**Corrección:** pirámide con unit tests de reglas de dominio, integration tests contra Firebase Emulator y E2E de smoke/regresión en Chromium + viewport móvil.

### QA-011 — TypeScript y ESLint están desactivados en pantallas de mayor riesgo

**Área:** mantenibilidad / prevención de defectos  
**Evidencia:** directivas `@ts-nocheck` en pedidos públicos y administrativos, clientes, mapas, patrocinadores, modales de pago y navegación; `eslint-disable` completo en autenticación/navbar.

Se retiraron todas las directivas `@ts-nocheck` y desactivaciones globales de ESLint. Los módulos críticos vuelven a participar en los quality gates del repositorio.

**Corrección aplicada:** tipar DTOs/formularios/errores y ejecutar `typecheck`/`lint` obligatoriamente en CI. `noUncheckedIndexedAccess` queda como endurecimiento futuro.

### QA-012 — La búsqueda/paginación genérica puede omitir resultados y no pagina filtros

**Área:** datos / búsqueda  
**Evidencia:** `src/apiConfig.ts:28-100`, `src/services/ClientService.ts:10-20`, `src/views/public/ViewOrder.tsx:54-61`.

La consulta sin filtros ahora expone `lastVisible` y `hasMore`; las búsquedas por varios campos se deduplican, ordenan por ID y aplican un límite global. Todavía falta un cursor compuesto para continuar búsquedas OR muy grandes y normalización server-side de campos.

**Corrección:** definir búsquedas por caso de uso con campos normalizados e índices, igualdad cuando aplique, orden estable, paginación real y contrato que retorne cursor/total aproximado.

### QA-013 — Los estados de carga/error todavía no son consistentes

**Área:** resiliencia / UX  
**Evidencia:** `src/components/exceptions/AppErrorBoundary.tsx`, `src/components/dataDisplay/AsyncContent.tsx` y múltiples cargas ad hoc todavía presentes.

La aplicación ya recupera errores de render y la carga de autorización es accesible. Sin embargo, otras vistas todavía alternan spinner, mensaje genérico o reemplazo total, y varias escrituras no presentan reintento seguro ni correlación.

**Corrección:** Error Boundary con ID de correlación, componente común `AsyncContent`, toasts/mensajes accionables y telemetría sin PII.

### QA-014 — Controles de contraseña no eran accesibles por teclado

**Área:** accesibilidad  
**Evidencia:** `src/views/auth/signIn/index.tsx:143-154` y patrón equivalente en sign-up.

El login y el registro ya usan botones con nombre accesible y asociación `label/id`. Queda pendiente verificar el flujo completo mediante axe, teclado y lectores de pantalla.

**Corrección:** usar `IconButton` con `aria-label` dinámico, foco visible y asociación `label/id`. Ejecutar axe y navegación solo teclado.

### QA-015 — Códigos de pedido cortos y colisiones no gestionadas

**Área:** identidad / robustez  
**Evidencia:** `src/views/public/Products.tsx:20`, `src/views/public/Products.tsx:120-145`.

El código aleatorio se amplió a doce caracteres y la búsqueda exige coincidencia exacta, pero todavía no se comprueba como único ni es un token de acceso server-side. Una colisión seguiría mezclando resultados visuales.

**Corrección:** token criptográfico de al menos 128 bits para acceso; si se conserva un código humano, imponer unicidad en servidor y combinarlo con un segundo factor, sin usarlo como credencial única.

### QA-016 — Dependencias y build no son reproducibles

**Área:** CI/CD / supply chain  
**Evidencia:** `package.json`, `package-lock.json`, `.github/workflows/main.yml`.

El lockfile se sincronizó y `.npmrc` fija la resolución de peers heredados para que el comando estándar sea `npm ci`. El workflow fija Node 20, ejecuta lint y typecheck, y conserva el modo CI durante el build. El entorno de esta auditoría no pudo descargar el árbol completo por restricciones HTTP del registro; todavía faltan reglas de Firebase, E2E y SCA. El repositorio incluye `build/`, lo que facilita desplegar artefactos obsoletos respecto del código fuente.

**Corrección:** regenerar lockfile con una versión de Node/npm fijada (`.nvmrc`/Volta), resolver peer dependencies sin `--legacy-peer-deps`, ejecutar audit/SCA en CI y construir artefactos desde commit, no versionarlos salvo requisito explícito.

## Severidad baja

### QA-017 — README no describe el producto ni su operación

**Área:** documentación  
**Evidencia:** `README.md` conserva íntegramente la documentación genérica de Horizon UI.

Faltan arquitectura, variables/configuración Firebase, entornos, roles, scripts de calidad, despliegue, respaldo, datos semilla y procedimientos de incidentes.

**Corrección:** reemplazar por documentación de ProGas, matriz de entornos y runbooks; nunca incluir credenciales privadas.

## 5. Matriz mínima de regresión funcional

| ID | Flujo | Casos imprescindibles | Prioridad |
| --- | --- | --- | --- |
| RF-01 | Login/logout | válido, inválido, usuario sin perfil, inactivo, offline, doble clic, logout y back | P0 |
| RF-02 | Roles | anónimo/customer/colaborador/admin por ruta y por operación Firestore | P0 |
| RF-03 | Alta cliente | nuevo, existente, teléfono distinto, cédula inválida, duplicidad concurrente, API de cédula caída | P0 |
| RF-04 | Pedido público | draft ausente/corrupto, catálogo vacío, cantidades límite, producto inactivo, precio cambia, reintento | P0 |
| RF-05 | Inventario | concurrencia, rollback, stock exacto/cero, múltiples productos, idempotencia | P0 |
| RF-06 | Consulta pedido | token correcto/incorrecto/expirado, rate limit, minimización de datos, cero/múltiples resultados | P0 |
| RF-07 | Pedido admin | alta, edición, transiciones permitidas, pago, cierre bloqueado, eliminación | P1 |
| RF-08 | Cierres | rangos horarios, pago dividido, vuelto, gasto ya usado, pedido modificado, dos cierres simultáneos | P0 |
| RF-09 | Colaboradores | alta, rollback Auth/Firestore, activar/desactivar en sesión, no escalar rol | P0 |
| RF-10 | Productos | CRUD, categorías, stock/costo/precio, bajo inventario, ajuste concurrente | P1 |
| RF-11 | Patrocinadores | CRUD, capacidad, enlaces/video inválidos, activo/inactivo, vista móvil | P2 |
| RF-12 | Navegación | deep link/refresh de toda ruta, 404, dashboard, recuperación de contraseña | P1 |
| RF-13 | Accesibilidad | teclado, foco, labels, contraste, zoom 200 %, reduced motion, axe | P1 |
| RF-14 | Compatibilidad | últimas Chrome/Firefox/Safari; 360 px, tablet y desktop | P2 |

## 6. Requisitos no funcionales recomendados

- **Seguridad:** OWASP ASVS nivel 2 adaptado, Firebase App Check, CSP, reglas testeadas y secretos únicamente en servidor.
- **Privacidad:** inventario de PII, retención/borrado, consentimiento para ubicación, logs redactados y principio de minimización.
- **Rendimiento:** LCP < 2.5 s, INP < 200 ms y CLS < 0.1 en p75 móvil; budgets de bundle e imágenes.
- **Disponibilidad:** reintentos idempotentes, timeout explícito para APIs externas y degradación del mapa/consulta de cédula.
- **Observabilidad:** captura de errores y métricas por flujo con correlation ID; nunca registrar cédula, teléfono, dirección, token o payload de pago.
- **Recuperación:** export/backup de Firestore probado y runbook para reconciliar pedido–stock–cierre.

## 7. Plan de corrección por fases

### Fase 0 — Contención (antes de la próxima publicación)

1. Auditar y versionar reglas Firebase; cerrar permisos anónimos no imprescindibles.
2. Deshabilitar consulta por teléfono y minimizar el detalle público.
3. Centralizar creación de pedido + descuento de inventario en una transacción server-side.
4. Respaldar Firestore y reconciliar pedidos públicos contra movimientos de stock actuales.

### Fase 1 — Integridad de recorridos críticos

1. Corregir alta de perfil, verificación de cliente, validación de cantidades y códigos/token.
2. Reparar dashboard y recuperación de contraseña.
3. Añadir emulator tests de reglas y E2E de RF-01 a RF-09.
4. Agregar estados loading/error e idempotencia.

### Fase 2 — Calidad de entrega

1. Sincronizar lockfile y fijar runtime.
2. Endurecer el CI existente: install limpio → lint → typecheck → unit/integration → build → E2E smoke → SCA.
3. Retirar `@ts-nocheck`/`eslint-disable` en módulos críticos.
4. Completar telemetría redactada, estados asíncronos comunes y axe alrededor del Error Boundary ya incorporado.

### Fase 3 — Mantenibilidad y producto

1. Evitar artefactos generados obsoletos.
2. Actualizar README/runbooks.
3. Establecer SLO, budgets de performance y regresión cross-browser periódica.

## 8. Criterios de salida (Definition of Done)

Una corrección se considera terminada solo si:

- incluye test automatizado que falla antes y pasa después;
- valida autorización en servidor/reglas, no únicamente en React;
- contempla error, concurrencia, reintento e idempotencia cuando escribe dinero/stock;
- no expone PII en UI, URL, analytics ni logs;
- tiene estados accesibles de carga/error/éxito;
- pasa install limpio, lint, typecheck, tests, build, emulator rules tests y E2E smoke en CI;
- incluye evidencia de QA y plan de rollback.

## 9. Comandos sugeridos después de reparar el entorno

```bash
npm ci
npm test -- --watchAll=false --runInBand --coverage
npx tsc --noEmit
npx eslint src --ext .ts,.tsx
npm run build
npm audit --omit=dev
# Añadir al package.json según la herramienta elegida:
npm run test:rules
npm run test:e2e
```

## 10. Orden recomendado del backlog

`QA-001` → `QA-002` → `QA-003` → `QA-004` → `QA-007` → `QA-008` → `QA-005`/`QA-006`/`QA-009` → automatización (`QA-010`, `QA-016`) → deuda técnica y accesibilidad restante.
