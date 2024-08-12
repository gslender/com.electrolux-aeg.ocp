Esta App de Homey se conectará a
• la Plataforma de Identidad Gigya (propiedad de SAP) a través de la API @gslender/gigya de NPM
• la API de Electrolux OCP (OneConnectedPlatform) en https://api.ocp.electrolux.one/appliance/api/v2
• y soportará tanto Electrolux como AEG

Después de un inicio de sesión exitoso, la App de Homey interrogará la API de OCP y determinará qué dispositivos has configurado.

Guía de Configuración

Esta App de Homey requerirá que tus electrodomésticos Electrolux o AEG estén configurados con el centro de datos de la UE, ya que los servicios de la API y la gama de productos no funcionan fuera de esa región. Esta app ha sido probada con el Reino Unido como ubicación en la App para iOS de AEG, pero debería funcionar bien en todas partes de la UE.

1. Debes tener una contraseña y un correo electrónico configurados en tu app móvil de Electrolux o AEG (asegúrate de cerrar sesión e iniciar sesión usando un correo electrónico y una contraseña, y no usando OTP).
2. Instala la App de Homey y Configura los Ajustes usando tu correo electrónico y contraseña. Estas credenciales se mantienen, pero solo se usan para generar un JWT Claim que se reutiliza y se actualiza según sea necesario.
3. Añade un Dispositivo usando la App y elige el tipo relevante, Lavandería / Purificador de Aire, etc.
4. Si tu electrodoméstico / dispositivo no está disponible, por favor visita https://github.com/gslender/com.gslender.electrolux-aeg.ocp/issues/new/choose para solicitar soporte para tu dispositivo.

¡Gracias!

Quiero agradecer el código original de https://github.com/rickardp del cual se usaron elementos para desarrollar el soporte del Purificador de Aire.