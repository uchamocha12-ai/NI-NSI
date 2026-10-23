# Eventos ERI · NI y NSI

Herramienta estática para organizar notificaciones y cruzar Excel. Incluye accesos a SIVIGILA en Inmediata y a Reportes SIVIGILA en Super inmediata. Los accesos abren otra pestaña y requieren los permisos habituales de cada plataforma.

## Publicar con GitHub y Netlify

1. Descomprime este ZIP.
2. Crea un repositorio en GitHub (puede ser privado). Sube el contenido de esta carpeta: `public`, `netlify.toml`, `.gitignore` y este README deben quedar en la raíz del repositorio.
3. En Netlify, importa un proyecto desde Git y elige GitHub. Autoriza el repositorio que acabas de crear.
4. Selecciona la rama `main`. Deja el comando de compilación vacío y establece `public` como directorio de publicación. El archivo `netlify.toml` ya contiene esa ruta.
5. Publica y comparte la URL que asigne Netlify. No hace falta redistribuir el HTML.
6. Para futuras modificaciones, edita los archivos en GitHub y guarda los cambios en la rama conectada. Netlify publica la actualización automáticamente. Los usuarios deben terminar su corte, guardar sus resultados y recargar la página para abrir la nueva versión.

No se ha creado un repositorio ni se ha publicado un sitio desde este paquete.

## Qué archivo modificar

| Archivo | Contenido |
|---|---|
| public/index.html | Barra de pestañas y página de entrada |
| public/assets/suite.js | Navegación y envío de resultados al cruce |
| public/modules/eri.html | Pantalla de inmediata y enlace a SIVIGILA |
| public/modules/nsi.html | Pantalla de superinmediata y enlace a SharePoint |
| public/modules/cross.html | Pantalla del cruce |
| public/assets/eri.js | Lógica y reglas de inmediata |
| public/assets/nsi.js | Lógica y reglas de superinmediata |
| public/assets/cross.js | Lógica y reglas del cruce |
| public/assets/*.css | Diseño de cada módulo |
| public/vendor/ | Bibliotecas originales compartidas; conservar sus avisos de licencia |
| netlify.toml | Carpeta a publicar y actualización de caché |

## Uso y datos

Los Excel se leen y procesan en el navegador. El proyecto no incluye un servidor para guardar bases ni las envía a Netlify. Los enlaces institucionales son accesos: no descargan automáticamente las bases ni inician sesión por el usuario. El repositorio contiene solo código, sin bases ni archivos de pacientes. La URL de Netlify tendrá la visibilidad configurada en ese servicio; un repositorio privado no convierte automáticamente el sitio en privado.

La versión web necesita conexión para cargar inicialmente sus archivos. Las bibliotecas están incluidas y no usan CDN. No hay actualizaciones automáticas mientras una sesión está abierta: recargar descarta los datos no exportados.

## Probar en el equipo

Desde esta carpeta, con Python instalado: `python -m http.server 8000 --directory public`. Abre http://localhost:8000. Comprueba las tres pestañas, ambos enlaces, las cargas y las descargas antes de publicar cambios de reglas.

Para usar un solo archivo sin servidor, abre `Eventos_ERI_Portatil.html`. Es una copia de esta entrega; los cambios posteriores de GitHub no actualizan esa copia. La versión recomendada para mantenimiento es la carpeta `public`.

## Referencias de publicación

https://docs.netlify.com/start/quickstarts/deploy-from-repository/
https://docs.netlify.com/build/configure-builds/overview/
https://docs.netlify.com/deploy/create-deploys/
