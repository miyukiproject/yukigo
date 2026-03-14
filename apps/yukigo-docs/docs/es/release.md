# Proceso de Release

Este documento describe el proceso de release de este monorepo, que contiene varios paquetes npm versionados de forma independiente y administrados con [Nx](https://nx.dev).

---

## Descripción general

Los paquetes se encuentran bajo `packages/*` y se publican de forma **independiente** — solo los paquetes con cambios detectados desde el último release son versionados y publicados. Los releases se ejecutan **manualmente** desde la rama `main` corriendo `nx release`.

El pipeline de release incluye:

1. Detectar qué paquetes tienen cambios
2. Determinar la próxima versión de cada paquete modificado en base al historial de commits
3. Actualizar las versiones en `package.json` y generar un `CHANGELOG.md` por paquete
4. Crear un GitHub Release a partir del changelog del workspace
5. Publicar los paquetes modificados en el registro público de npm

---

## Requisitos previos

Antes de ejecutar un release, asegurate de:

- Estar en la rama `main` con el working tree limpio
- Tener acceso de lectura y escritura al repositorio
- Estar autenticado en npm (`npm whoami` debe devolver tu usuario)
- Tener la variable de entorno `GITHUB_TOKEN` configurada con permisos para crear releases (necesaria para el paso de GitHub Release)

---

## Convención de commits

Este proyecto utiliza **Conventional Commits** para determinar el tipo de bump de versión automáticamente. Cada mensaje de commit debe seguir el siguiente formato:

```
<tipo>(<scope opcional>): <descripción>
```

| Tipo | Bump de versión |
|------|----------------|
| `feat` | Minor (`1.0.0` → `1.1.0`) |
| `fix` | Patch (`1.0.0` → `1.0.1`) |
| `chore`, `docs`, `refactor`, `test`, `style`, `ci` | Patch (`1.0.0` → `1.0.1`) |
| `feat!` o footer `BREAKING CHANGE` | Major (`1.0.0` → `2.0.0`) |

> Los commits que no afectan ningún paquete dentro de `packages/*` son ignorados durante el cálculo de versiones.

---

## Release paso a paso

### 1. Cambiarse a `main` y traer los últimos cambios

```bash
git checkout main
git pull origin main
```

### 2. Dry run — previsualizar qué se va a publicar

Siempre ejecutar un dry run primero para revisar qué paquetes van a tener un bump de versión, cuáles serán las nuevas versiones y qué entradas se van a generar en el changelog — sin realizar ningún cambio real.

```bash
nx release --dry-run
```

Revisá el output con atención:

- Qué paquetes fueron detectados como modificados
- El tipo de bump propuesto para cada paquete (patch / minor / major)
- Las entradas del changelog que se van a escribir
- Los git tags que se van a crear

Si algo no parece correcto, detené el proceso e investigá el historial de commits antes de continuar.

### 3. Ejecutar el release

Una vez que estés conforme con el output del dry run, ejecutá el release real:

```bash
nx release
```

Este único comando ejecuta el pipeline completo en orden:

1. **Version** — actualiza el campo `version` en el `package.json` de cada paquete modificado según el historial de conventional commits
2. **Changelog** — genera o actualiza el `CHANGELOG.md` dentro de cada paquete modificado, y crea un GitHub Release a partir del changelog agregado del workspace
3. **Publish** — publica cada paquete modificado en el registro público de npm

Nx va a commitear los bumps de versión y las actualizaciones de changelog, crear un git tag por paquete (ej. `my-package@1.2.0`), y pushear todo a `origin/main`.

---

## Referencia de configuración

El comportamiento del release está definido en `nx.json`:

```json
"release": {
  "projects": ["packages/*"],
  "projectsRelationship": "independent",
  "changelog": {
    "projectChangelogs": true,
    "workspaceChangelog": {
      "createRelease": "github"
    }
  }
}
```

| Opción | Valor | Efecto |
|--------|-------|--------|
| `projects` | `packages/*` | Solo los paquetes bajo este glob son considerados para el release |
| `projectsRelationship` | `independent` | Cada paquete se versiona de forma independiente |
| `projectChangelogs` | `true` | Se genera un `CHANGELOG.md` dentro de cada paquete |
| `workspaceChangelog.createRelease` | `github` | Se crea un GitHub Release a partir del changelog agregado del workspace |

---

## Resultados de cada release

Por cada paquete que tenga cambios detectados, se produce:

- Un `package.json` actualizado con la nueva versión
- Un `CHANGELOG.md` actualizado dentro del directorio del paquete
- Un git tag con el formato `<nombre-del-paquete>@<versión>` (ej. `ui-kit@2.1.0`)
- Una versión publicada en el registro público de npm

Además, se crea un único **GitHub Release** a nivel workspace que agrega todos los cambios de todos los paquetes.

---

## Resolución de problemas

**No se detectan paquetes con cambios**
Nx calcula los cambios en base al historial de git desde el último tag de release. Asegurate de que tus commits sigan el formato de Conventional Commits y que afecten archivos dentro de `packages/*`.

**Bump de versión inesperado**
Revisá el historial de commits en busca de algún `feat` o breaking change no intencional. Usá `--dry-run` para inspeccionar antes de cada release.

**Falla el npm publish**
Verificá que estás logueado con `npm whoami`. Si estás usando un token, comprobá que tenga permisos de `publish` para los paquetes correspondientes.

**No se crea el GitHub Release**
Asegurate de que la variable de entorno `GITHUB_TOKEN` esté configurada y que el token tenga el permiso `contents: write` en el repositorio.