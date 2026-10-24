# Portal INS · Herramientas de vigilancia

## Abrir
Descomprime todo el ZIP. Abre public/index.html en Chrome o Edge. Conserva todas las carpetas. Desde Inicio puedes elegir las cuatro herramientas. Volver al inicio y cambiar de herramienta conserva la sesión mientras la página permanezca abierta.

## Publicar
Sube public (completa), netlify (completa), netlify.toml, .gitignore y README.md a la raíz del repositorio de GitHub. Conecta ese repositorio con Netlify. Directorio de publicación: public. Comando de compilación: vacío. El enlace publicado será el punto de entrada a las cuatro herramientas. Los cambios publicados se reciben al recargar: exporta primero los resultados.

## Organización
- public/index.html: portada.
- public/assets/portal.css: diseño.
- public/assets/portal.js: navegación.
- public/assets/logo-ins.png: imagen suministrada.
- public/herramientas/notificaciones/index.html: NI/NSI con botones de acceso a Sivigila y reportes de SharePoint; procesamiento conservado.
- public/herramientas/sivilab/index.html: archivo SIVILAB original, sin modificaciones.
- public/herramientas/bes/index.html: archivo BES original, sin modificaciones.
- public/herramientas/medios: EIOS, con almacenamiento temporal en memoria.

## Monitoreo de medios
Se retiró el guardado persistente del navegador y el menú de búsquedas guardadas. La revisión se mantiene durante la sesión para permitir filtrar, editar y exportar; al recargar o cerrar se pierde. Cada nueva búsqueda sustituye la anterior en memoria. No se usan IndexedDB, localStorage ni sessionStorage para guardar noticias. Se mantienen los dos filtros, la comparación de capturas y las exportaciones. Se trabaja con archivos exportados de EIOS; el portal no consulta fuentes automáticamente. Exporta Word o Excel antes de cerrar.

## Alcance
Las bases se procesan localmente. En monitoreo de medios se envían título, resumen y observaciones aprobados al servicio Microsoft Translator, a través de Netlify. No se incorporan bases de pacientes al paquete ni al repositorio. El logo corresponde al adjunto del usuario; el portal no añade autenticación institucional. Publicar no garantiza acceso restringido: depende de la configuración del alojamiento. No se ha publicado desde esta entrega.


## Traducción automática corregida
Consulta `TRADUCCION_ESPAÑOL.md`. Ahora existe una alternativa local sin clave para navegadores compatibles. El servicio Microsoft Translator sigue disponible como respaldo si está configurado en Netlify. Las seleccionadas por el filtro y las aprobadas se traducen automáticamente.

## Accesos a plataformas
La cabecera blanca con el logo se muestra solo en Inicio. Los módulos conservan el botón Inicio y su sesión mientras el portal permanezca abierto. Se retiró el texto “Volver al inicio conserva la sesión abierta”.
- Inmediata: botón Abrir Sivigila en su cabecera.
- Superinmediata: botón Abrir reportes SIVIGILA en lugar del aviso de procesamiento local.
- SIVILAB: botón Abrir SIVILAB en la barra superior.
- Monitoreo de medios: botón Abrir EIOS en la barra superior.
Todos los accesos abren otra pestaña, sin sustituir la revisión actual. El inicio de sesión se realiza directamente en cada plataforma.

## Revisión en español
Cada noticia muestra su estado de traducción. El título y resumen traducidos aparecen en campos editables, y el Word utiliza esos mismos campos. El texto original se consulta en “Texto original, coincidencias y trazabilidad”. El contador separa las aprobadas listas en español de las pendientes. Una traducción fallida no descarta la noticia ni impide intentar las demás; una configuración ausente pausa el proceso para no repetir solicitudes inútiles.
