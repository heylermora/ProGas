# Identidad y orden de categorías

Los documentos `CategorySettings/products` y `CategorySettings/sponsors` guardan un
`catalog` de `{ id, name, aliases }`. El ID es la referencia estable; `name` es la
etiqueta actual y `aliases` conserva los nombres históricos. Renombrar no crea otra
categoría. No se permite que otra categoría tome un nombre histórico, para evitar
reasignar registros antiguos que aún no guardan un ID.

En comercios, cada general tiene su propio `id`; `businessSettings.groups` guarda
sus referencias a específicas en `categoryIds`. Los íconos también se guardan por
ID de específica, no por nombre. La capa de presentación resuelve
estos IDs a etiquetas para mostrar el mapa, las pestañas y los formularios.

`Sponsors` y `Products` guardan `categoryId` al crearse o editarse. El campo
`category` se conserva como etiqueta compatible con consumidores anteriores. Los
servicios resuelven primero `categoryId` y muestran el nombre actual del catálogo;
una etiqueta antigua nunca cambia la asignación de un registro que ya tiene ID.
Al seleccionar otra categoría en un formulario se descarta la referencia anterior
antes de resolver la nueva.

## Compatibilidad sin escrituras desde páginas públicas

Las configuraciones antiguas con `values` y grupos por nombre se leen sin una
migración masiva. Sus IDs iniciales se derivan de forma determinista con UUID v5,
separados por dominio (productos, comercios y generales). Después se conservan en
el catálogo incluso al cambiar el nombre.

Los registros sin `categoryId` se resuelven por nombre o alias histórico. Al guardar
la configuración se persisten el catálogo y las referencias por ID; al editar un
producto o comercio se persiste también su `categoryId`. Leer una página pública
no escribe ni modifica documentos. No se han ejecutado migraciones ni escrituras
en datos de producción como parte de las pruebas.

Las colecciones y sus permisos se conservan: categorías y comercios requieren
administrador; los productos conservan sus permisos de personal. No hacen falta
consultas ni índices adicionales de Firestore.

## Orden visible

`utils/categories` centraliza el orden mediante `Intl.Collator('es-CR')`, con
comparación insensible a mayúsculas y acentos y orden numérico. El catálogo,
las generales y sus específicas, los gestores de categorías y los selectores de
productos/comercios usan este criterio, incluyendo las categorías históricas y
la selección actual. La opción global «Todas las categorías» permanece al inicio.
Las opciones de gastos también se muestran alfabéticamente.
