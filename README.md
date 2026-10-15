# CALI 755 · Editor local y consulta pública

Sitio: [CALI 755](https://danvela27.github.io/cali755/). Una persona documenta en su computadora; equipo y clientes consultan el último corte publicado. React + TypeScript + Vite, sin Supabase ni cuentas de clientes.

## Publicar con un botón

1. Abre el editor local en http://127.0.0.1:5173/ con `iniciar-editor.ps1` o `pnpm dev`.
2. Actualiza actividades, estados y notas.
3. Pulsa **Publicar avances**. El editor guarda `public/report.json`, crea un commit que incluye solo ese archivo, lo sube a `main` y espera la confirmación de GitHub Pages.
4. Mantén el editor abierto hasta ver **Avances publicados correctamente**. El enlace público conserva el corte anterior mientras termina el despliegue. No hay descarga ni carga manual del JSON.

La primera vez se necesita conectar Git a GitHub: ejecuta `conectar-github.ps1` y completa la autorización en el navegador. Git Credential Manager guarda las credenciales con el mecanismo de tu sistema; nunca se colocan en React, localStorage, archivos públicos ni variables VITE_. Su autorización estándar puede incluir acceso a repositorios privados, gists y workflows; revisa los permisos que GitHub muestra antes de aceptar. El servidor solo admite publicar a DanVela27/cali755 en main.

Si Git no está disponible, instala Git para Windows con Credential Manager. Puedes indicar un ejecutable mediante CALI_GIT_PATH (variable del proceso local). La conexión de GitHub es independiente de tener sesión abierta en Chrome. Si no hay conexión autorizada, no se informa una publicación exitosa.

## Qué hace la publicación

El endpoint local POST `/__cali/publish` valida el corte, consulta origin/main y exige una actualización fast-forward. Si hay commits de código locales pendientes no los publica. Guarda el reporte y usa `git commit --only -- public/report.json`, respetando otros archivos que tengas preparados. El push es normal, nunca forzado. Si otra persona modifica main durante la operación, Git rechaza la subida y el editor muestra el fallo.

Después consulta GitHub Actions por el SHA del commit y verifica que el JSON público corresponda al corte enviado. Solo entonces muestra éxito. Un fallo de red, falta de credenciales, protección de rama o despliegue fallido se informa explícitamente. Si la subida ya ocurrió y la comprobación falla, el mensaje distingue ese estado; revisa Actions antes de reintentar para evitar versiones innecesarias.

GET `/__cali/status` permite recuperar el progreso después de recargar la página mientras el servidor siga activo. Reiniciar el servidor pierde ese estado de seguimiento, pero conserva los commits, archivos y borradores; consulta Actions si se interrumpió una publicación. El editor evita repetir la aplicación del resultado y no reemplaza borradores que se hayan modificado después.

Los endpoints solo existen en el servidor de desarrollo local; exigen host local, origen permitido y solicitudes JSON. Se rechazan solicitudes desde sitios externos y solo se permite una publicación a la vez. No expongas el editor local a internet. El build de Pages es siempre de solo lectura y no contiene el publicador de servidor.

## Instalar y ejecutar

Node 22.18+, pnpm 11.25.0 y Git:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
pnpm build
pnpm dev
```

En esta computadora `iniciar-editor.ps1` también detecta el runtime de Codex. Usa certificados del sistema mediante NODE_USE_SYSTEM_CA=1 para consultar GitHub; si inicias a mano y tu red usa certificados corporativos, aplica esa variable al proceso Node. No desactives la validación TLS.

`pnpm preview` en 4173 muestra la versión compilada de consulta. Para editar usa el puerto 5173. La vista pública no permite cambiar los datos compartidos; el permiso para publicar lo controla GitHub.

## Datos, códigos e historial

Fuente inicial: conversación Control de Actividades, corte 14/10/2026: **27 actividades, 8 realizadas y 19 pendientes**. CA17 y CA18 incluidas. CA2 completada el 13/10/2026 queda fuera del denominador. Su descripción y mueble no están confirmados. Frentes: Gabriel/carpintería, Josué/general, electricista, pendientes generales, limpieza y herrero. No se inventan tareas de otros frentes.

Navegación: resumen, checklist filtrable, muebles, historial y publicación (solo editor). El 30% inicial es 8/27 redondeado, no avance físico ponderado de toda la obra. Por mueble, realizadas/total: M-01 1/3, M-02 2/4, M-03 0/4, M-04 2/4, M-05 3/9 y piso/Sin mueble 0/3.

Prefijos automáticos: CA carpintería, GE Josué/general, EL electricidad, PG pendientes generales, LI limpieza y HE herrería. Se asigna el mayor número reservado más uno; se conservan subcódigos existentes. Cambiar el frente de una actividad existente conserva su código. Las validaciones comparan mayúsculas y omiten espacios de extremos. CA2, códigos de snapshots históricos y reserved_codes permanecen reservados. Restaurar un respaldo anterior en el mismo editor conserva las reservas actuales. Importa el respaldo más reciente al cambiar de computadora.

`public/report.json` contiene schema_version, prepared_at, tasks, events y reserved_codes. prepared_at es la fecha del corte; el resultado del workflow confirma cuándo quedó publicado. El corte inicial no inventa una hora de publicación. Cambios almacenados en UTC y mostrados en Ciudad de México. Git conserva los cortes por commit; el historial local es trazabilidad operativa editable por su propietario, no auditoría inviolable.

## Respaldos

Las ediciones permanecen en el navegador (cali755-editor-v1, con migración de la demo anterior). Exportar respaldo es opcional y recomendable antes de borrar datos del navegador o cambiar de computadora. Importar valida el archivo, confirma su reemplazo y descarga antes una copia del borrador. Trabaja en una sola pestaña; el editor detecta cambios de otra pestaña antes de guardar.

## GitHub Pages

El código se aloja en la raíz del repositorio; `.github/workflows/pages.yml` prueba, compila y despliega dist al cambiar main. Settings → Pages → Source: GitHub Actions. No hay tokens ni secretos que configurar en Actions. El sitio, JSON, notas e historial son públicos.

La publicación automática supone una rama main con permiso de escritura directa para tu usuario. Si se agregan reglas de revisión, hay que adaptar el flujo a PRs; no se eluden esas reglas.

## Verificación

Pruebas de conteos, muebles, CA2, transiciones, normalización y reserva de códigos, importación de respaldos, commit limitado al reporte, rechazo de commits de código pendientes y fallo de push sin falso éxito. TypeScript y build de producción verificados. Las pruebas del publicador usan Git simulado; una publicación real necesita la conexión autorizada del usuario y se verifica por separado.

`scripts/browser-check.cjs` es una comprobación opcional de interfaz (requiere Playwright/Edge y editor en 5173). Revisa el código automático, los controles de publicación y el diseño móvil sin pulsar Publicar ni escribir en GitHub.

Referencias: [Git Credential Manager](https://github.com/git-ecosystem/git-credential-manager), [GitHub Pages y Actions](https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically).

