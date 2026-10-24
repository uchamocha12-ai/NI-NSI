# Noticias en español

## Ruta sin clave de Azure
1. Publica el proyecto actualizado y abre su enlace HTTPS en Chrome de escritorio compatible.
2. En Monitoreo de medios, pulsa **Activar traducción local**. Espera la descarga de los modelos; este primer paso necesita Internet. La disponibilidad depende del navegador, el equipo y sus políticas.
3. Carga tu exportación EIOS. Se traducen automáticamente las noticias seleccionadas por el filtro, además de las aprobadas. Puedes aprobar o descartar mientras se procesan.
4. Si se detecta otro idioma sin modelo preparado, pulsa **Preparar idiomas pendientes**. Después continuará la traducción. Se detecta el idioma de cada campo por separado para permitir títulos y resúmenes en idiomas distintos.
5. Revisa título y resumen en español. Puedes editarlos y consultar el texto original en los detalles. Word utiliza exactamente los campos finales de revisión.

La traducción local no envía las noticias al servicio de Azure. La aplicación no guarda noticias en el navegador; los modelos de idiomas sí son administrados por el navegador. No se garantiza esta opción en móviles, Safari, Firefox o equipos con restricciones institucionales. No es la opción “Traducir página” del navegador: los resultados se incorporan al informe.

## Alternativa con Microsoft Translator
Si el navegador no permite traducción local, la función Netlify incluida utiliza `AZURE_TRANSLATOR_KEY` y `AZURE_TRANSLATOR_REGION`. Configúralas en las variables de entorno de Netlify y vuelve a desplegar. Nunca pongas la clave en el código público.
En esta modalidad se envían título, resumen y observaciones al servicio para traducir. Revisa cuotas y condiciones de tu recurso Azure. Subir solo la carpeta public por arrastre no despliega la función; usa el repositorio con netlify/functions.

## Comprobaciones y límites
- Un resultado fallido no se etiqueta como español y no reemplaza el original.
- Las ediciones hechas durante una solicitud no se sobrescriben.
- La selección para Word se conserva. No se exporta un informe con traducciones pendientes.
- La traducción no inventa un resumen si el archivo no contiene texto suficiente. Comprueba nombres, cifras y términos de salud en la fuente.
- Se probaron con servicios simulados la traducción local, idiomas pendientes, conservación de textos españoles, errores, edición concurrente, selección automática y exportación. No se ha ejecutado una traducción real en tu navegador ni con una clave Azure.

Documentación oficial: https://developer.chrome.com/docs/ai/translator-api y https://developer.chrome.com/docs/ai/language-detection
