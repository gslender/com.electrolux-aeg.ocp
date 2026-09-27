Esta App de Homey se conectará a
• la API oficial para desarrolladores de Electrolux Group en https://api.developer.electrolux.one
• y es compatible con electrodomésticos Electrolux y AEG

Guía de Configuración

1. Inicia sesión en https://developer.electrolux.one con la misma cuenta (correo y contraseña) que usas en la app de Electrolux o AEG.
2. En el Dashboard, crea una clave API y luego pulsa GET ACCESS TOKEN para generar un access token y un refresh token.
3. Abre los ajustes de la App de Homey y pega la clave API, el access token y el refresh token. La app renueva los tokens automáticamente, así que usa un par de tokens exclusivo para Homey y no lo compartas con otras apps.
4. Añade un Dispositivo usando la App y elige el tipo relevante, Lavandería / Purificador de Aire, etc.
5. Si tu electrodoméstico / dispositivo no está disponible, por favor visita https://github.com/gslender/com.electrolux-aeg.ocp/issues/new/choose para solicitar soporte para tu dispositivo.

El plan gratuito para desarrolladores de Electrolux permite 5000 llamadas API al día. Con muchos electrodomésticos, el intervalo de consulta se aumenta automáticamente para no superar este límite.

Actualización desde la versión 1.x: el inicio de sesión con correo y contraseña ya no es compatible. Tras actualizar, abre los ajustes de la app e introduce tus credenciales de desarrollador - tus dispositivos existentes se conservan.

¡Gracias!

Quiero agradecer el código original de https://github.com/rickardp del cual se usaron elementos para desarrollar el soporte del Purificador de Aire.