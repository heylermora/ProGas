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

## Inventario y siguientes candidatos

### Prioridad alta

1. **Barra de filtros**: pedidos, productos y balances combinan campos, selects y una acción para limpiar. Conviene un `FilterPanel` con título, contenido flexible, contador y acción de limpieza.
2. **Campos de formulario**: todavía existen combinaciones repetidas de `FormControl`, `FormLabel`, control y mensaje. Debe crearse un `FormField` solo si admite correctamente `isRequired`, errores, ayuda, IDs y cualquier tipo de control; no debe limitarse a inputs de texto.
3. **Estado de carga/error**: los listados repiten `Center + Spinner` y alternan componentes de error. Un `AsyncContent` puede normalizar los estados `loading`, `error`, `empty` y contenido sin mezclar la carga de datos con la presentación.
4. **Acciones de formulario**: cancelar/guardar con estado de carga se repite en altas y ediciones. Puede extraerse como `FormActions` después de confirmar las variantes de navegación y modal.

### Prioridad media

1. **Tarjetas estadísticas**: clientes, inventario y dashboard repiten icono, cifra, etiqueta y texto auxiliar. `StatCard` debería complementar —no duplicar— `MiniStatistics` cuando este último no cubra la composición requerida.
2. **Estado activo/inactivo**: badge y switch aparecen en clientes, colaboradores, productos y patrocinadores. Un `StatusBadge` y un `ActiveSwitch` evitarían diferencias de texto y color.
3. **Encabezados de formularios completos**: productos, pedidos y patrocinadores tienen páginas dedicadas con volver, título y estado. Pueden compartir un `FormPageHeader`, distinto del encabezado de listados.
4. **Confirmaciones destructivas**: las eliminaciones deben converger en `DeleteModal`, evitando confirmaciones particulares o acciones directas.

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
