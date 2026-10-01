# Auditoría de componentes compartidos

## Criterio

Un patrón debe convertirse en componente cuando aparece en más de una pantalla, expresa la misma intención y necesita conservar comportamiento, accesibilidad y espaciado. Las diferencias puramente visuales se resuelven primero en el tema de Chakra para evitar componentes que solo reenvían propiedades.

## Implementado

| Patrón | Solución compartida | Uso inicial |
| --- | --- | --- |
| Encabezado de sección administrativa | `components/layout/PageHeader` | Clientes y colaboradores |
| Panel de alta/edición | `components/form/FormPanel` | Clientes y colaboradores |
| Resultado vacío con acción opcional | `components/dataDisplay/EmptyState` | Clientes y colaboradores |
| Botones | Tema global de Chakra (`theme/components/button.ts`) | Toda la aplicación |
| Inputs y selects | Tema global de Chakra (`theme/components/input.ts`) | Toda la aplicación |
| Labels, texto de ayuda y acordeones | Tema global de Chakra (`theme/components/form.ts`) | Toda la aplicación |
| Búsqueda contextual | `contexts/PageSearchContext` + `SearchBar` | Listados administrativos |
| Barra de filtros | `components/dataDisplay/FilterPanel` | Pedidos y productos |
| Campo de formulario accesible | `components/form/FormField` | Clientes y colaboradores |
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
