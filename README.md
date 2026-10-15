# CALI 755 · Editor local y consulta pública

MVP React + TypeScript + Vite. Una persona documenta; equipo y clientes consultan cortes publicados en GitHub Pages. No usa Supabase, cuentas de clientes ni base de datos. Sitio publicado: [CALI 755](https://danvela27.github.io/cali755/).

## Uso diario

1. Inicia el editor con `pnpm dev` y abre http://127.0.0.1:5173/. En esta computadora también puedes ejecutar `iniciar-editor.ps1` desde PowerShell.
2. Completa/reabre tareas, añade actividades y edita notas en Actividades. El borrador queda en ese navegador; no cambia la información compartida.
3. En **Publicar avances**, pulsa **Preparar corte para publicar**. Guarda el estado y todo el historial en `public/report.json`, con hora del corte. Revisa **Abrir vista de consulta**.
4. Sube `public/report.json` al repositorio GitHub (ver abajo). Cuando el workflow termine correctamente, el enlace del sitio mostrará el nuevo corte. Preparar un corte local NO significa que se publicó en internet.
5. Exporta respaldos regularmente. La sección Publicación permite importar respaldos; valida el archivo y pide confirmar el reemplazo del borrador, descargando antes una copia del estado actual.

La vista pública no ofrece edición: producción siempre es solo lectura, aunque se añadan parámetros a la URL. Solo el servidor de desarrollo local tiene el editor y el endpoint para preparar archivos. Modificar una página en herramientas del navegador no modifica GitHub ni los datos compartidos. El permiso para publicar depende del acceso a tu repositorio GitHub.

## Instalación

Node 22.18+ y pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
pnpm build
pnpm dev
```

`pnpm preview` en el puerto 4173 muestra el sitio compilado de solo lectura. Para editar usa `pnpm dev` en el 5173. No publicar el servidor de desarrollo ni exponerlo a internet.

## Primera publicación en GitHub Pages

1. Crea un repositorio GitHub y sube **el contenido de dashboard a su raíz**, incluyendo como`.github/workflows/pages.yml`, `public/` y `pnpm-lock.yaml`. No subas `node_modules`, respaldos personales ni `.env`.
2. Settings → Pages → Source: **GitHub Actions**. No hacen falta variables, tokens dentro de la aplicación ni Supabase.
3. Haz push a `main` o ejecuta el workflow manual. Valida datos, corre pruebas, compila y despliega `dist/`.
4. GitHub proporciona la URL de Pages. Compártela con equipo y clientes.

Para actualizaciones posteriores, después de preparar el corte:

```sh
git add public/report.json
git commit -m "Actualiza avance CALI 755"
git push origin main
```

Alternativa sin terminal: descarga `report.json` desde Publicación; en GitHub abre la carpeta `public`, usa Add file → Upload files y reemplaza el archivo. Confirma el cambio en `main`. Si la rama requiere revisión, crea el cambio en otra rama y fusiónalo según las reglas del repositorio. Espera a que Actions termine y actualiza la página compartida.

El workflow supone que dashboard es la raíz del repositorio. Para un monorepo hay que adaptar los directorios de ejecución y el path del artefacto. `base: './'` admite Pages bajo `/repositorio/`.

**El enlace será público**, y los archivos JSON, notas e historial también. El editor no añade contraseñas ni promete privacidad. La publicación de un corte comparte TODO su contenido. El historial local se puede modificar por el propietario; es trazabilidad operativa, no una auditoría inviolable.

## Datos y navegación

- Resumen: avance de las actividades registradas y frentes.
- Actividades: búsqueda, filtros de frente/estado/mueble, checklist y detalles.
- Muebles: conteos y porcentaje de carpintería por M-01 a M-05 y piso (Sin mueble).
- Historial: corte inicial y cambios antes/después.
- Publicación: solo en el editor, con preparación de corte, vista de consulta y respaldos.

La fuente inicial es la conversación Control de Actividades, corte 14/10/2026: **27 tareas vigentes, 8 realizadas y 19 pendientes**. CA17 y CA18 incluidas. CA2 completada el 13/10/2026 está fuera del denominador, sin inventar descripción o mueble. Los otros frentes (Josué, electricista, pendientes generales, limpieza) están disponibles sin actividades inventadas. El 30% es 8/27 redondeado; no es avance físico ponderado de toda la obra.

| Mueble | Realizadas | Total |
|---|---:|---:|
| M-01 | 1 | 3 |
| M-02 | 2 | 4 |
| M-03 | 0 | 4 |
| M-04 | 2 | 4 |
| M-05 | 3 | 9 |
| Sin mueble | 0 | 3 |

`public/report.json` contiene `schema_version`, `prepared_at`, `tasks` y `events`. `prepared_at` es la hora de preparación del corte, no una confirmación de despliegue; el workflow de GitHub confirma la publicación. La semilla inicial tiene fecha de reporte 14/10/2026 y no inventa una hora de publicación. Fechas de cambios en UTC; visualización en Ciudad de México.

Los borradores usan localStorage (`cali755-editor-v1`) y migran la demo anterior (`cali755-demo-v1`) si existe. La consulta pública ignora ambos. Borrar datos del navegador elimina borradores no respaldados. Abrir desde otra dirección/puerto o navegador usa otro almacenamiento: importa un respaldo para continuar. La edición simultánea en varias pestañas no está soportada; trabaja en una sola para evitar sobrescribir borradores. Git conserva cortes anteriores después de cada commit.

## Verificación

`pnpm test`: conteos iniciales, CA2, muebles, transiciones de estado, formato del corte, compatibilidad de respaldos anteriores y rechazo de datos inválidos. El build valida `report.json` antes de compilar. El lector y el endpoint local validan los datos; un corte ilegible da un error y no se sustituye por una demo.

El script opcional `scripts/browser-check.cjs` requiere Playwright y Edge. Con `pnpm dev` en 5173 y `pnpm preview` en 4173 verifica persistencia, aislamiento del borrador, preparación de publicación, consulta de producción, importación/restauración y móvil. `CALI_PLAYWRIGHT_MODULE` permite usar una instalación externa de Playwright. Guarda/restaura el archivo de corte durante la prueba. No hace push ni despliega.

Referencias: [publicación automática con GitHub Actions](https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically), [modos de Vite](https://vite.dev/guide/env-and-mode).

Validación local completada: 5 pruebas aprobadas, TypeScript y compilación de producción correctos. Edge verificó borradores aislados, persistencia tras recarga, preparación de corte, importación/restauración, historial, modo de producción solo lectura y diseño móvil. El endpoint rechazó una solicitud con origen externo. Publicación verificada en GitHub Pages: https://danvela27.github.io/cali755/ . Compilación y despliegue aprobados en GitHub Actions; consulta pública verificada con 27 actividades, 8 realizadas, 19 pendientes y CA2 separada.



## Códigos de actividades
Las nuevas actividades reciben un código automático: CA carpintería, GE Josué/general, EL electricidad, PG pendientes generales, LI limpieza y HE herrería. Se toma el mayor número ya reservado más uno (CA18 → CA19); los subcódigos existentes se conservan. Cambiar el frente de una actividad existente conserva su código para mantener la referencia histórica.
Los códigos se comparan sin espacios en extremos y en mayúsculas. Guardar, importar y preparar el corte valida la unicidad global, incluyendo CA2 y snapshots del historial. reserved_codes conserva reservas aunque se restaure un respaldo anterior en el mismo editor. Al cambiar de computadora importa el respaldo más reciente para conservar todas las reservas. No borrar ni editar manualmente este registro. La edición en otra pestaña requiere recargar antes de guardar.

