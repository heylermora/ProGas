# Historial de cambios de ProGas

Reglas de versiones y publicación: [VERSIONAMIENTO.md](VERSIONAMIENTO.md).

## [1.3.1] — Pendiente de publicación

### Corregido
- Eliminación confirmada de categorías generales vacías y específicas sin comercios asociados, con advertencia y validación al guardar; se conservan IDs, alias y categorías múltiples.
- WhatsApp usa máscara telefónica y muestra el prefijo del enlace al ingresar el número.
- Validación del número de WhatsApp y del dominio real de las URLs de redes sociales.
- Conservación de enlaces de WhatsApp existentes mientras no se editen.

## [1.3.0] — Pendiente de publicación

### Agregado
- Varias categorías específicas por negocio, con compatibilidad para los registros actuales.
- Nombre comercial obligatorio al crear y actualizar negocios, validado en formulario, servicio y reglas de Firestore.

### Cambiado
- Estadísticas con ranking por negocio, distribución por canal y URLs completas desplegables.
- Carrusel de movimiento continuo, con ancho para tres tarjetas en móvil y más negocios visibles en escritorio, sin barra inferior.
- Controles de regreso integrados en el juego y retiro de la navegación de categorías duplicada.

### Corregido
- Icono original de la pestaña enlazado explícitamente en formato PNG.
- Espacio reservado y título de la barra superior administrativa.

## [1.2.0] — Pendiente de publicación

Preparada el 2026-10-30. Esta entrada no confirma un despliegue en producción.

### Agregado
- Categorías generales y específicas para explorar el centro comercial en dos niveles.
- Página administrativa de categorías con pestañas, renombrado y selección de un emoji por ícono.
- IDs estables para categorías de comercios y productos, con compatibilidad para nombres históricos.
- Reglas de versionamiento semántico y registro de entregas de ProGas.
- Botón para compartir un negocio mediante el menú nativo, copiar su enlace directo o seleccionarlo manualmente cuando el navegador no permite copiarlo.

### Cambiado
- Listas y selectores de categorías en orden alfabético en español.
- Mapa con distribución equilibrada, nombres completos y sectores de hasta ocho categorías.
- Carrusel con arrastre táctil o con ratón, pausa y reanudación del avance automático.
- Contactos del negocio en una franja independiente, con sombras pequeñas y sin barra de desplazamiento visible.
- Pie de página con el morado de la marca y disposición adaptada a móvil.
- Íconos diferentes para «Visitas y clics» y «Patrocinadores» en el menú.
- Logos grandes y centrados como elemento principal de las tarjetas del carrusel.
- Retiro del bloque exclusivo de pedidos y redes de Gas Memo en la portada.

### Corregido
- Pérdida de asignaciones al cambiar el nombre de una categoría.
- Recorte de nombres y distribución incompleta de categorías en el mapa.
- Detención del avance automático del carrusel por redondeo de posiciones.
- Espacio reservado innecesariamente para contactos cerrados y sombras recortadas.
- Navegación de regreso por niveles y conservación de la categoría al cambiar de vista, incluso al entrar desde un negocio compartido.

## [1.1.0] — Versión de partida

Versión declarada en los archivos de npm antes de iniciar este registro.
No se reconstruyeron fechas ni notas de despliegues anteriores de ProGas.

## Historial de la plantilla Horizon UI

Las entradas siguientes se conservan como documentación original de la plantilla.
Sus versiones y fechas no corresponden a entregas de ProGas.

### [1.1.1] 2022-11-01

🚀 Feature:
-Added TimelineRow

### [1.1.0] 2022-09-21
#### React Tables V8
🚀 Feature: Now Horizon UI Typescript comes in V8 version for React Tables. You can clone the repository [here](https://github.com/horizon-ui/horizon-ui-chakra-ts/tree/feature/react-table-v8) !

### [1.1.0] 2022-09-21
#### React Tables V8
🚀 Feature: Now Horizon UI Typescript comes in V8 version for React Tables. You can clone the repository [here](https://github.com/horizon-ui/horizon-ui-chakra-ts/tree/feature/react-table-v8) !

### [1.0.1] 2022-09-7
#### Bug Fixing
Mapbox bug when using `yarn` fixed.

### [1.0.0] 2022-08-31
#### Official Release
- Added TypeScript!
