# Auditoría de componentes compartidos

## Criterio

Un patrón debe convertirse en componente cuando aparece en más de una pantalla, expresa la misma intención y necesita conservar comportamiento, accesibilidad y espaciado. Las diferencias puramente visuales se resuelven primero en el tema de Chakra para evitar componentes que solo reenvían propiedades.

## Implementado

| Patrón | Solución compartida | Uso inicial |
| --- | --- | --- |
| Encabezado de sección administrativa | `components/layout/PageHeader` | Clientes y colaboradores |
| Alta/edición breve en modal | `components/modal/FormModal` | Clientes, colaboradores, pagos, categorías e inventario |
| Contenedor de modal | `components/modal/AppModal` | Todos los diálogos, confirmaciones y videos |
| Divulgación progresiva / listas | `components/modal/ModalSection`, `ModalList` | Detalles de pago y categorías |
| Resultado vacío con acción opcional | `components/dataDisplay/EmptyState` | Clientes y colaboradores |
| Botones | Tema global de Chakra (`theme/components/button.ts`) | Toda la aplicación |
| Inputs y selects | Tema global de Chakra (`theme/components/input.ts`) | Toda la aplicación |
| Labels, texto de ayuda y acordeones | Tema global de Chakra (`theme/components/form.ts`) | Toda la aplicación |
| Búsqueda contextual | `contexts/PageSearchContext` + `SearchBar` | Listados administrativos |
| Barra de filtros | `components/dataDisplay/FilterPanel` | Pedidos y productos |
| Campo de formulario accesible | `components/form/FormField` | Clientes y colaboradores |
| Contenedor semántico de formulario | `components/form/Form` | Formularios administrativos, autenticación, compra pública y modales |
| Acciones cancelar/guardar | `components/form/FormActions` | Clientes y colaboradores |
| Estado de carga/error/vacío | `components/dataDisplay/AsyncContent` | Listados y detalles |
| Tarjeta estadística | `components/dataDisplay/StatCard` | Inventario |
| Estado activo/inactivo | `components/dataDisplay/StatusBadge` | Clientes, colaboradores y productos |
| Interruptor activo | `components/form/ActiveSwitch` | Clientes, colaboradores y productos |
| Encabezado de formulario | `components/layout/FormPageHeader` | Alta y edición de productos |
| Confirmación destructiva | `components/modal/DeleteModal` | Menús de eliminación |

## Aplicación completada

Los candidatos de prioridad alta y media ya cuentan con una implementación compartida y una primera adopción en dos o más flujos cuando corresponde. Las migraciones se hicieron sin mover reglas de negocio: cada vista sigue controlando consultas, validaciones y persistencia; los componentes solo resuelven estructura, estados y accesibilidad.

- `FilterPanel` conserva contenido flexible, acción contextual, contador y limpieza de filtros.
- `FormField` admite cualquier control hijo, `isRequired`, deshabilitado, ayuda, error y asociación por `id`.
- `Form` mantiene el modo declarativo basado en `fields` y también admite contenido personalizado mediante `children` y `onFormSubmit`; todos los flujos con captura de datos usan este contenedor sin trasladar su lógica de negocio.
- `AsyncContent` resuelve carga, error, vacío y contenido.
- `FormActions` unifica cancelar/guardar y sus estados de carga.
- `StatCard` complementa las estadísticas existentes sin absorber lógica del dominio.
- `StatusBadge` y `ActiveSwitch` normalizan etiquetas, colores y nombres accesibles.
- `FormPageHeader` separa encabezados de formularios de los encabezados de listados.
- `DeleteModal` ofrece confirmación consistente, cierre accesible y estado de carga.

### Prioridad baja o no recomendable todavía

- **Cards de dominio** (`ItemCard`, comercio, cliente, colaborador): comparten superficie, pero su información y acciones son diferentes. Deben reutilizar `Card`, `StatusBadge` y tokens, no forzarse dentro de un componente genérico grande.
- **Tablas**: `ComplexTable` no debería absorber las tablas de inventario o balances hasta que compartan selección, paginación y acciones.
- **Modales especializados**: pago, factura, recibo y orden de compra comparten estructura de Chakra, pero representan flujos distintos; extraerlos juntos aumentaría las condiciones internas.

## Reglas de mantenimiento

- Usar el tema para `Button`, `Input`, `Select`, `Textarea`, `FormLabel`, `FormHelperText`, `Switch` y `Accordion`.
- Usar componentes compartidos para patrones con estructura y semántica, no para aliases visuales de una sola línea.
- Mantener el contenido y las reglas de negocio en la vista; los componentes compartidos reciben datos, acciones y estados mediante propiedades.
- Todo componente interactivo nuevo debe tener nombre accesible, foco visible, estado deshabilitado y prueba de su comportamiento principal.
- Adoptar los componentes gradualmente al tocar cada módulo; evitar una migración masiva que mezcle cambios visuales con cambios de lógica.

## Unificación de modales — 7 de octubre de 2026

`AppModal` centraliza superficie, borde, radios, cierre, foco, bloqueo del fondo y altura máxima dinámica. Solo el cuerpo se desplaza; encabezado y pie permanecen visibles. `FormModal` agrega formulario semántico, validación del flujo mediante callback, guardado y acciones compartidas, sin botones Volver ni formularios anidados.

- Clientes y colaboradores: formularios breves dentro del modal, sin desplazar ni reiniciar el listado.
- Pagos: resumen de importes, un método expandido a la vez, referencias obligatorias visibles y fecha/nota general plegables. Los errores abren el método o la sección correspondiente.
- Categorías: lista de cuatro elementos por página en móvil y cinco en escritorio, con edición y eliminación; no hay scroll interno adicional.
- Copiar información: área de texto de altura acotada y acciones en el pie; no crece con el documento completo.
- Inventario y confirmaciones: contenido breve, misma base; eliminar da foco inicial a Cancelar.
- Videos: misma estructura en variante oscura, con tamaño y reproductor limitados al viewport.

Los paneles laterales de navegación (`Drawer`) conservan su patrón porque no son diálogos de contenido o formularios.

## Patrocinadores — 8 de octubre de 2026

Crear y editar reutilizan `SponsorForm` como página con layout administrativo amplio. Mantener un solo flujo de campos, sin una previsualización lateral que reduzca el ancho disponible. Se reutilizan `Form`, `FormField`, una única `Card` y `FormSection` para títulos/divisores sin tarjetas por sección. `SocialNetworkLabel` agrega iconos decorativos y conserva los nombres accesibles. El campo de video permanece visible; `ModalSection` reserva las instrucciones extensas para «Cómo agregar el video». El GPS compacto usa estilo secundario y Maps/Waze comparten fila en escritorio. El orden no se solicita: crear agrega al final de la categoría, editar conserva la posición y cambiar de categoría agrega al final de la nueva; el listado permite reordenar.

`utils/sponsor` define los campos opcionales por red, reconoce contactos históricos y conserva los enlaces adicionales. El contrato mantiene `links` para consumidores anteriores y agrega `socialLinks` por nombre. `SponsorLocation` presenta las señas y enlaces a Maps/Waze tanto en el formulario como en las dos vistas del directorio. `SponsorLocationFields` pide enlaces compartidos de Google Maps/Waze y señas, sin campos de coordenadas. El GPS completa los destinos desde el local. Se conservan coordenadas históricas y se reconoce un destino explícito en Maps; los enlaces cortos se guardan sin inventar un destino de Waze a partir de las señas o del centro del mapa. `DeviceLocationMap` admite mensajes contextuales sin cambiar el flujo de pedidos.

El video se configura mediante enlace compartido de YouTube/Vimeo o archivo público MP4/WebM/OGG. No ofrecer carga directa de nuevos videos a Firestore: su límite documental no sirve para videos habituales. Los videos históricos se conservan y pueden quitarse o reemplazarse. La configuración del espacio disponible se retiró del listado administrativo porque correspondía a `SponsorStrip`, que ya no se monta en el directorio actual; se mantienen servicio y documentos históricos.
