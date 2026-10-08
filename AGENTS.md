# Guía de desarrollo de ProGas

Este archivo orienta a los asistentes y desarrolladores al crear o modificar funcionalidades en este repositorio. Leerlo antes de implementar. Las instrucciones explícitas del usuario tienen prioridad. Mantener esta guía actualizada cuando cambien la estructura, los componentes compartidos o los comandos.

## 1. Contexto y tecnologías

ProGas es una aplicación de gestión de pedidos, productos, inventario, clientes, colaboradores, patrocinadores y finanzas. Incluye páginas públicas, compra y consulta de pedidos, centro comercial virtual y portafolio.

- React 17 y TypeScript 4, con Create React App (`react-scripts` 5).
- Chakra UI 1.8 y tema basado en Horizon UI.
- React Router 5: `HashRouter`, `Switch`, `Route`, `Redirect`, `useHistory`.
- Firebase 11: Authentication y Firestore. No hay un backend propio versionado.
- Jest y React Testing Library mediante `react-scripts test`.
- Node 20 según `.nvmrc` y CI; npm con `package-lock.json`.

Conservar estas versiones y APIs al añadir funcionalidades. Una migración de framework, router o biblioteca de UI debe ser una tarea explícita y separada.

## 2. Estructura actual

```text
src/
├── index.tsx             # Arranque, proveedores y rutas de entrada
├── apiConfig.ts          # Firebase y helpers de persistencia
├── assets/               # CSS e imágenes importadas
├── components/           # UI reutilizable, organizada por intención
│   ├── button/           # AddButton, BackButton
│   ├── card/             # Card y tarjetas existentes
│   ├── dataDisplay/      # AsyncContent, EmptyState, filtros, estados
│   ├── exceptions/       # Errores, acceso denegado y error boundary
│   ├── form/             # Formularios, campos, paneles y acciones
│   ├── layout/           # Encabezados de página y formulario
│   ├── modal/            # Confirmación, pago y otros modales
│   └── ...               # Navbar, sidebar, charts, calendar, etc.
├── contexts/             # Auth, búsqueda contextual, refresco de pedidos
├── data/                 # Datos de ubicaciones de Costa Rica
├── hooks/                # Hooks reutilizables (useCategories)
├── interfaces/           # Modelos del dominio y contratos
├── layouts/              # Estructuras de administración y autenticación
├── routes/               # Catálogo de rutas y PrivateRoute
├── services/             # Acceso a datos y operaciones de dominio
├── theme/                # Tokens, estilos y variantes de Chakra
├── types/                # Declaraciones TypeScript
├── utils/                # Funciones de negocio y conversión sin UI
├── variables/            # Configuración de gráficos
└── views/
    ├── admin/            # client, user, product, order, sponsor, closing, dashboard
    ├── auth/             # signIn y signUp
    └── public/           # Páginas públicas y flujo del cliente
public/                   # Recursos servidos directamente
docs/                    # Auditorías de componentes y QA
firestore.rules           # Autorización y validación en Firestore
firestore.indexes.json    # Índices de consultas
firebase.json             # Referencias a reglas e índices
.github/workflows/        # Verificaciones de CI
```

`build/` es la salida generada: modificar el código fuente, no el bundle. Los tests se ubican junto al archivo probado como `Nombre.test.ts` o `Nombre.test.tsx`.

## 3. Antes de crear algo nuevo

1. Revisar el estado de Git y conservar los cambios existentes del usuario.
2. Leer el módulo más parecido y sus tests; buscar servicios, utilidades y componentes que ya resuelvan el problema.
3. Consultar `docs/shared-components-audit.md` para patrones compartidos y `docs/qa-system-audit.md` cuando el cambio afecte permisos, pedidos, inventario o datos personales. La auditoría es histórica: contrastar sus estados con el código actual.
4. Definir qué pantalla, contratos, servicio, rutas y permisos requiere el cambio.
5. Implementar dentro de la estructura existente. Evitar reorganizaciones generales o dependencias nuevas sin una necesidad concreta.

## 4. Responsabilidades y convenciones de código

- **Vistas:** coordinan la interacción, estado de pantalla, validación y llamadas a servicios.
- **Componentes compartidos:** resuelven estructura, presentación y accesibilidad mediante props. No incluir consultas Firebase en componentes visuales genéricos.
- **Servicios:** concentran consultas, persistencia y operaciones del dominio. Reutilizar `apiConfig.ts` y la instancia existente de Firebase.
- **Utilidades:** contienen cálculos, normalización y validaciones reutilizables sin depender de React.
- **Hooks:** extraen comportamiento de React cuando tiene reutilización real.
- **Contextos:** reservar para estado compartido entre pantallas; mantener el estado local cuando sea suficiente.

Usar `.tsx` para JSX y `.ts` para lógica sin JSX. Hay interfaces históricas en `.tsx`; no renombrarlas como parte de una tarea ajena. Componentes y modelos usan PascalCase; funciones y variables, camelCase; hooks empiezan por `use`; servicios siguen `EntidadService.ts`. Los módulos administrativos existentes usan `index.tsx`, `new.tsx`, `edit.tsx`, `details.tsx` o `form.tsx` según su flujo.

Los imports pueden partir de `src` (`components/...`, `services/...`, `utils/...`) gracias a `baseUrl`. Usar imports relativos para archivos cercanos cuando resulte más claro. No asumir que el alias `@assets` está operativo: su configuración actual requiere revisión.

Seguir el formato del archivo editado; evitar reformatearlo completo. Preferir tipos explícitos en contratos públicos y `unknown` con validación para datos externos. No reproducir `any` ni envoltorios `new Promise(async ...)` de código antiguo en nuevas implementaciones: usar `async/await` y retornos tipados. La configuración activa `strict`, pero desactiva `strictNullChecks`; validar igualmente los valores ausentes.

Mantener los textos de interfaz en español y los nombres técnicos coherentes con el módulo existente.

## 5. Componentes que se deben reutilizar

| Necesidad | Implementación existente |
| --- | --- |
| Encabezado de listado/página | `components/layout/PageHeader` |
| Encabezado de alta o edición | `components/layout/FormPageHeader` |
| Formulario declarativo o personalizado | `components/form/Form` |
| Panel de formulario | `components/form/FormPanel` |
| Label, ayuda y error de campo | `components/form/FormField` |
| Acciones principales y cancelar en modales | `components/form/FormActions` |
| Dirección y ubicación | `DeliveryAddressField`, `DeviceLocationMap` |
| Carga, error y resultado vacío | `components/dataDisplay/AsyncContent` |
| Estado vacío con acción | `components/dataDisplay/EmptyState` |
| Filtros | `components/dataDisplay/FilterPanel` |
| Estadísticas y estado | `StatCard`, `StatusBadge`, `ActiveSwitch` |
| Superficie de tarjeta | `components/card/Card` |
| Modal general | `components/modal/AppModal` |
| Modal de formulario | `components/modal/FormModal` |
| Detalles opcionales / listas acotadas | `components/modal/ModalSection`, `ModalList` |
| Confirmación de eliminación | `components/modal/DeleteModal` |
| Estructura de páginas públicas | `views/public/PublicPage`, `PublicHeader`, `PublicFooter` |
| Búsqueda de listados administrativos | `PageSearchContext` y `SearchBar` |

Revisar las props reales antes de utilizar un componente. `components/form/FormField` es el componente visual; `interfaces/FormField` es el contrato del formulario declarativo.

Las diferencias de apariencia se resuelven primero en `src/theme/`. Usar tokens y variantes existentes para colores, controles y espaciado, con valores responsive de Chakra. Evitar repetir estilos de botones, inputs o labels en cada página.

Extraer un componente cuando varias pantallas compartan intención, estructura y comportamiento. Mantener separados los modales y tarjetas de dominios distintos si unificarlos exige muchas condiciones.

## 6. Formularios y experiencia de uso

- Seguir la línea visual de Pedidos: encabezado simple, separador, controles y ayudas uniformes y acción principal a ancho completo al final.
- Usar `AppModal` para todos los diálogos y `FormModal` para captura de datos. No repetir `ModalContent`, encabezados o pies en las vistas. Clientes y colaboradores crean/editan en modales; Pedidos y Producto conservan páginas propias.
- El modal tiene altura limitada al viewport, encabezado y pie fijos y un único cuerpo desplazable. No agregar contenedores con scroll dentro del cuerpo, salvo controles de texto que lo necesitan.
- Mantener datos obligatorios visibles en el bloque que se está editando; plegar información opcional con `ModalSection` y paginar listas repetitivas con `ModalList`. Si un error está plegado, abrir su sección para corregirlo.
- `FormModal` contiene el formulario semántico y las acciones: no anidar `Form` ni formularios HTML en sus hijos. Bloquear cierre y envíos mientras se guarda; conservar valores si falla.
- En páginas y paneles mostrar «Volver» con flecha arriba mediante `FormPageHeader`; en modales usar la X de cierre, sin «Volver».
- Reutilizar `PasswordField` para contraseñas y `OrderProductFields` para los campos de productos del pedido. Los controles se definen en `theme/components/formControls.ts`.
- Reutilizar `Form`, que admite `fields` o contenido personalizado mediante `children` y `onFormSubmit`. Evitar formularios HTML anidados.
- Asociar cada label con el `id` de su control. Mostrar errores junto al campo y ayuda comprensible.
- Cubrir carga inicial, error, vacío, contenido y guardado. Bloquear envíos duplicados mientras se persiste.
- Usar nombres accesibles para botones de icono, foco visible y navegación por teclado.
- Mantener presentación usable en móvil y escritorio; comprobar modo claro/oscuro si la pantalla lo soporta.
- Confirmar acciones destructivas con el patrón existente y mostrar el resultado de la operación.
- Reutilizar validadores de teléfono, cédula, dirección, ubicación e importes en `utils/`. Separar el valor mostrado del valor numérico persistido.

## 7. Navegación y permisos

La navegación se reparte entre `src/index.tsx`, `src/routes/routes.tsx`, los layouts y el sidebar. Una entrada en el catálogo de rutas no garantiza por sí sola que la pantalla esté accesible.

Al añadir una página administrativa, registrar su ruta en `routes.tsx` y comprobar que el prefijo tiene cobertura en `index.tsx` mediante `PrivateRoute`. Alinear los roles del catálogo, layout y punto de entrada. Usar `secondary` para pantallas que no deben aparecer como entradas principales del menú.

Para páginas públicas, revisar las rutas de `index.tsx` y los enlaces del encabezado público. Mantener compatibilidad con React Router 5 y URLs con hash.

Los roles actuales son `admin`, `colaborador` y `customer`, definidos en `AuthContext`. Reutilizar `useAuth` y `PrivateRoute`. Ocultar una acción o proteger una ruta no sustituye la autorización en Firestore.

Si un nuevo listado usa la búsqueda global, añadir su ruta a `SEARCHABLE_PAGES` de `PageSearchContext` y consumir `usePageSearch` dentro de su proveedor.

## 8. Datos, Firestore y reglas de negocio

- Mantener nombres y campos de colecciones existentes; respetar mayúsculas/minúsculas y normalización de búsquedas.
- Revisar los límites de consulta: `getAll` puede devolver un conjunto limitado. Usar paginación o el mecanismo existente de todas las páginas cuando el caso requiera el conjunto completo.
- Propagar errores útiles; no convertir un fallo de lectura en éxito o lista vacía silenciosa.
- Limpiar listeners, efectos y recursos al desmontar. Evitar resultados obsoletos al cambiar filtros o navegar.
- Conservar las transacciones de stock, pedidos y cierres. Las operaciones que modifican documentos relacionados deben mantener consistencia y validar cantidades, precios y disponibilidad.
- Respetar la idempotencia por `requestId` del alta de pedidos: un reintento de la misma operación debe reutilizar el identificador.
- No confiar en totales, roles o disponibilidad enviados desde la interfaz. Aplicar la validación también en la frontera de persistencia/autorización que corresponda.
- Si cambian colecciones o consultas, revisar `firestore.rules` y `firestore.indexes.json`. Versionar una regla no implica que esté desplegada.
- No exponer datos personales en vistas públicas, logs o mensajes de error. Usar datos ficticios en pruebas.

Las variables `REACT_APP_*` son públicas en el bundle. Usar `.env.example` como referencia y archivos locales ignorados para configuración; nunca incluir credenciales privadas. Las pruebas de persistencia deben usar mocks o un entorno aislado, sin modificar datos de producción.

## 9. Flujo para añadir un módulo

1. Definir o extender el modelo en `interfaces/`.
2. Crear o extender el servicio correspondiente en `services/`.
3. Extraer cálculos y validaciones compartidas a `utils/` si corresponde.
4. Crear vistas en `views/admin/<modulo>/` o `views/public/`, reutilizando los patrones visuales anteriores.
5. Registrar rutas, navegación y permisos; añadir búsqueda contextual si aplica.
6. Revisar reglas e índices si cambia el acceso a Firestore.
7. Añadir pruebas del comportamiento nuevo y de regresiones relevantes.
8. Ejecutar las comprobaciones correspondientes y actualizar documentación si cambia un patrón.

## 10. Comandos y validación

Ejecutar desde la raíz del proyecto:

```bash
npm ci
npm start
npm run typecheck
npm run lint
npm test -- --watchAll=false --runInBand
npm run build
```

`npm ci` instala a partir del lockfile; ejecutarlo cuando sea necesario preparar dependencias. CI usa Node 20 y ejecuta tipos, lint, tests, cobertura y build. `npm run deploy` publica mediante `gh-pages`; reservarlo para una solicitud de publicación.

Para cambios de lógica, cubrir casos normales, errores y límites, especialmente importes, stock, reintentos y permisos. Para UI interactiva nueva, probar su comportamiento principal y accesibilidad con React Testing Library. Preferir consultas por rol y nombre accesible a detalles internos.

Un cambio exclusivamente documental requiere revisar exactitud, rutas y Markdown; no necesita ejecutar toda la aplicación. Para código, ejecutar tipos, lint y pruebas pertinentes; verificar build y la suite completa cuando el alcance o las comprobaciones del proyecto lo requieran. No afirmar que una comprobación pasó si no se ejecutó.

## 11. Criterio de finalización

- La funcionalidad encaja en la estructura y reutiliza los patrones existentes.
- Los estados de error, vacío y carga están resueltos.
- Las rutas y permisos son coherentes y la persistencia conserva las reglas del dominio.
- Las comprobaciones pertinentes pasan, o se explican los fallos y sus límites.
- No se incluyen cambios ajenos, secretos ni ediciones manuales del build.
- El resumen final indica qué cambió, cómo se verificó y cualquier limitación pendiente.
