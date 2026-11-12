# Versionamiento de ProGas

ProGas usa SemVer (`MAYOR.MENOR.PARCHE`) y Release Please. `package.json`
es la fuente de la versión visible en el pie. No editar esa versión en componentes.

## Flujo automático

1. Titular cada PR con Conventional Commits y fusionarlo con **Squash and merge**,
   conservando ese título en el commit final:

   | Título | Próxima versión |
   | --- | --- |
   | `fix: corregir categorías` | Parche: 1.3.1 → 1.3.2 |
   | `feat: agregar filtros` | Menor: 1.3.1 → 1.4.0 |
   | `feat!: cambiar contrato` | Mayor: 1.3.1 → 2.0.0 |
   | `docs:`, `ci:`, `test:`, `chore:` | Sin versión nueva por sí solos |

   `perf:` y `revert:` también pueden producir parches. Un `!` o una nota
   `BREAKING CHANGE:` señala un cambio incompatible. CI valida el formato del título.
2. Después de cada push a `main`, `.github/workflows/release-please.yml` crea o
   actualiza un único PR de versión. Agrupa los cambios pendientes, calcula SemVer
   y sincroniza `package.json`, ambas versiones raíz de `package-lock.json`,
   `.release-please-manifest.json` y `CHANGELOG.md`.
3. Revisar y fusionar ese PR cuando la entrega esté lista. El siguiente run crea
   la etiqueta `vX.Y.Z` y la GitHub Release sobre el commit de la entrega.
   No se fusionan automáticamente los PR de versión.
4. La GitHub Release identifica el código entregado; no confirma que el sitio
   esté desplegado. La publicación del sitio sigue su flujo independiente.

No subir manualmente la versión en cada PR funcional. Las correcciones de un PR
actualizan el mismo PR de versión hasta fusionarlo. No mover etiquetas existentes.
Las entradas históricas pendientes del changelog conservan su estado: no son
prueba de despliegue. Las fechas generadas por Release Please corresponden a su
registro de release, no a una comprobación de publicación del sitio.

## Configuración inicial de GitHub

En **Settings → Actions → General → Workflow permissions**, habilitar
**Allow GitHub Actions to create and approve pull requests**. El workflow solicita
`contents: write`, `pull-requests: write` y `actions: write` y usa el `GITHUB_TOKEN`
del repositorio; no requiere token personal ni secretos adicionales.

Los eventos creados con `GITHUB_TOKEN` no disparan otros workflows automáticamente.
Por eso el workflow de releases ejecuta explícitamente `main.yml` mediante
`workflow_dispatch` sobre la rama del PR del bot. CI comprueba esa rama completa.
Si se exige un check de `pull_request` mediante protección de ramas, comprobar
que el check de CI despachado esté admitido por esa configuración.

El workflow de releases admite **Run workflow** para reintentar después de habilitar
permisos. Los bloqueos de una política de organización deben resolverse allí;
no usar un token personal como sustitución silenciosa.

## Validación

```bash
npm run check:version
npm run test:version
```

CI ejecuta ambos antes de instalar dependencias. La validación exige que las
versiones de npm y el manifiesto coincidan y que la primera entrada versionada de
`CHANGELOG.md` tenga esa misma versión. Después se ejecutan tipos, lint, pruebas
y compilación habituales.

`release-please-config.json` usa el releaser `node` y notas en español.
El manifiesto parte de `1.3.1`; `bootstrap-sha` delimita el historial anterior a la
automatización. La primera corrección convencional posterior prepara `1.3.2`.
La versión del historial de Horizon UI no pertenece al historial de ProGas.
