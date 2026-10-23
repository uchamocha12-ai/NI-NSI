# Portal INS · Herramientas de vigilancia

## Abrir
Descomprime todo el ZIP. Abre public/index.html en Chrome o Edge. Conserva todas las carpetas. Desde Inicio puedes elegir las cuatro herramientas. Volver al inicio y cambiar de herramienta conserva la sesión mientras la página permanezca abierta.

## Publicar
Sube public (completa), netlify.toml, .gitignore y README.md a la raíz del repositorio de GitHub. Conecta ese repositorio con Netlify. Directorio de publicación: public. Comando de compilación: vacío. El enlace publicado será el punto de entrada a las cuatro herramientas. Los cambios publicados se reciben al recargar: exporta primero los resultados.

## Organización
- public/index.html: portada.
- public/assets/portal.css: diseño.
- public/assets/portal.js: navegación.
- public/assets/logo-ins.png: imagen suministrada.
- public/herramientas/notificaciones/index.html: archivo NI/NSI original, sin modificaciones.
- public/herramientas/sivilab/index.html: archivo SIVILAB original, sin modificaciones.
- public/herramientas/bes/index.html: archivo BES original, sin modificaciones.
- public/herramientas/medios: EIOS, con almacenamiento temporal en memoria.

## Monitoreo de medios
Se retiró el guardado persistente del navegador y el menú de búsquedas guardadas. La revisión se mantiene durante la sesión para permitir filtrar, editar y exportar; al recargar o cerrar se pierde. Cada nueva búsqueda sustituye la anterior en memoria. No se usan IndexedDB, localStorage ni sessionStorage para guardar noticias. Se mantienen los dos filtros, la comparación de capturas y las exportaciones. Se trabaja con archivos exportados de EIOS; el portal no consulta fuentes automáticamente. Exporta Word o Excel antes de cerrar.

## Alcance
Las bases se procesan localmente. No se incorporan bases de pacientes al paquete ni al repositorio. El logo corresponde al adjunto del usuario; el portal no añade autenticación institucional. Publicar no garantiza acceso restringido: depende de la configuración del alojamiento. No se ha publicado desde esta entrega.
