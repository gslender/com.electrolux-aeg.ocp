Deze Homey App maakt verbinding met
• de officiële Electrolux Group Developer API op https://api.developer.electrolux.one
• en ondersteunt zowel Electrolux als AEG apparaten

Installatiehandleiding

1. Log in op https://developer.electrolux.one met hetzelfde account (e-mail en wachtwoord) als in je Electrolux- of AEG-app.
2. Maak op het Dashboard een API-sleutel aan en klik op GET ACCESS TOKEN om een access token en refresh token te genereren.
3. Open de instellingen van de Homey App en plak de API-sleutel, het access token en het refresh token. De tokens worden automatisch door de app vernieuwd, dus gebruik een tokenpaar dat alleen voor Homey is en deel het niet met andere apps.
4. Voeg een apparaat toe via de app en kies het juiste type, zoals Wasmachine / Luchtreiniger enz.
5. Als je apparaat niet beschikbaar is, bezoek dan https://github.com/gslender/com.electrolux-aeg.ocp/issues/new/choose om ondersteuning voor je apparaat aan te vragen.

Het gratis Electrolux developer-abonnement staat 5000 API-aanroepen per dag toe. Met veel apparaten wordt het polling-interval automatisch verhoogd om binnen deze limiet te blijven.

Upgraden vanaf versie 1.x: inloggen met e-mail en wachtwoord wordt niet meer ondersteund. Open na de update de app-instellingen en voer je developer-gegevens in - je bestaande apparaten blijven behouden.

Bedankt!

Ik wil graag de originele code van https://github.com/rickardp erkennen, waarvan elementen zijn gebruikt om de ondersteuning voor luchtreinigers te bouwen.