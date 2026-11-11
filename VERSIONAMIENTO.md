# Versionamiento de ProGas

ProGas usa versionamiento semántico: `MAYOR.MENOR.PARCHE`.

La versión de esta entrega es **1.2.0**, pendiente de publicación. La versión de
partida del proyecto era `1.1.0`. Los números del historial de Horizon UI pertenecen
a la plantilla y no representan entregas de ProGas.

## Cuándo cambiar la versión

| Tipo | Cuándo corresponde | Ejemplo desde 1.2.0 |
| --- | --- | --- |
| PARCHE | Correcciones y ajustes visuales que mantienen el comportamiento compatible. | 1.2.1 |
| MENOR | Funcionalidades nuevas compatibles con los datos y flujos existentes. | 1.3.0 |
| MAYOR | Cambios incompatibles que requieren adaptar consumidores, datos o flujos. | 2.0.0 |

Se asigna una versión por entrega agrupada, no por cada commit. Las correcciones
de un PR que todavía no se ha publicado mantienen la versión de esa entrega.
Por ejemplo, las categorías por niveles, su gestión y el carrusel interactivo se
agrupan en `1.2.0`; sus ajustes durante la revisión no generan nuevas versiones.

## Archivos que deben coincidir

- `package.json`: fuente de verdad para la versión de la aplicación.
- `package-lock.json`: deben coincidir tanto `version` como `packages[""].version`.
- `CHANGELOG.md`: una entrada de ProGas para la versión, con sus cambios y estado.

El pie de página ya lee `package.json`; no escribir otra versión fija en los
componentes. Las versiones de las dependencias y los comentarios históricos de
Horizon UI son independientes de la versión de ProGas.

## Preparar una entrega

1. Revisar la versión actual y elegir PARCHE, MENOR o MAYOR según el alcance final.
2. Actualizar los archivos de npm sin crear un commit o etiqueta automáticamente:

   ```bash
   npm version patch --no-git-tag-version
   # Para funcionalidades compatibles: npm version minor --no-git-tag-version
   # Para cambios incompatibles: npm version major --no-git-tag-version
   ```

   Para fijar un número acordado, usar por ejemplo:

   ```bash
   npm version 1.2.0 --no-git-tag-version
   ```

3. Agregar al inicio de `CHANGELOG.md` una entrada con el estado **Pendiente de
   publicación**. Usar las secciones Agregado, Cambiado y Corregido que apliquen.
   Describir el resultado para el usuario y cualquier migración necesaria.
4. Incluir versión, lockfile e historial en el mismo PR que entrega los cambios.
   Actualizar la versión mencionada en este documento al preparar otra entrega.
5. Ejecutar las verificaciones pertinentes al alcance. Un cambio de versión
   requiere comprobar la coincidencia de los tres campos de npm y que el pie
   muestre la versión nueva. Las funcionalidades requieren además los controles
   de tipos, lint, pruebas y compilación indicados en `AGENTS.md`.

## Publicar y etiquetar

Una versión en el código o un PR aprobado no confirma que esté desplegada.

1. Integrar el PR y publicar la entrega mediante el flujo de despliegue del proyecto.
2. Comprobar la versión visible y el commit exacto que se publicó.
3. Marcar la entrada del historial con su fecha real de publicación en formato
   `AAAA-MM-DD`, usando la fecha de Costa Rica. No cambiar retrospectivamente la
   versión o los cambios de una entrega publicada: registrar otra entrega.
4. Crear la etiqueta anotada sobre el commit publicado y subirla. Sustituir
   `COMMIT_PUBLICADO` por su SHA verificado:

   ```bash
   git tag -a v1.2.0 COMMIT_PUBLICADO -m "ProGas 1.2.0"
   git push origin v1.2.0
   ```

5. Si se crea una GitHub Release, usar esa etiqueta y las notas de `CHANGELOG.md`.

Las etiquetas siguen el formato `vMAYOR.MENOR.PARCHE`. No crear etiquetas ni
releases para un PR pendiente de publicación, ni mover una etiqueta publicada
para incluir correcciones posteriores.

## Plantilla de entrada

```markdown
## [X.Y.Z] — Pendiente de publicación

### Agregado
- Nueva funcionalidad y su utilidad.

### Cambiado
- Comportamiento actualizado y compatibilidad.

### Corregido
- Problema resuelto y resultado esperado.
```

Al publicarse, reemplazar «Pendiente de publicación» por la fecha real de entrega.
