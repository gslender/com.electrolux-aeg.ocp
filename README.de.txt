Diese Homey App verbindet sich mit
• der offiziellen Electrolux Group Developer API unter https://api.developer.electrolux.one
• und unterstützt sowohl Electrolux- als auch AEG-Geräte

Einrichtungsanleitung

1. Melde dich auf https://developer.electrolux.one mit demselben Konto (E-Mail und Passwort) an, das du in der Electrolux- oder AEG-App verwendest.
2. Erstelle im Dashboard einen API-Schlüssel und klicke dann auf GET ACCESS TOKEN, um ein Access Token und ein Refresh Token zu erzeugen.
3. Öffne die Einstellungen der Homey App und füge API-Schlüssel, Access Token und Refresh Token ein. Die Tokens werden von der App automatisch erneuert - verwende daher ein Token-Paar nur für Homey und teile es nicht mit anderen Apps.
4. Füge ein Gerät über die App hinzu und wähle den entsprechenden Typ (Waschmaschine / Luftreiniger etc.).
5. Wenn dein Gerät nicht verfügbar ist, besuche bitte https://github.com/gslender/com.electrolux-aeg.ocp/issues/new/choose, um Unterstützung für dein Gerät anzufordern.

Der kostenlose Electrolux Developer-Plan erlaubt 5000 API-Aufrufe pro Tag. Bei vielen Geräten wird das Abfrageintervall automatisch erhöht, um dieses Limit einzuhalten.

Upgrade von Version 1.x: Die Anmeldung mit E-Mail und Passwort wird nicht mehr unterstützt. Öffne nach dem Update die App-Einstellungen und gib deine Entwickler-Zugangsdaten ein - deine vorhandenen Geräte bleiben erhalten.

Vielen Dank!

Ich möchte den ursprünglichen Code von https://github.com/rickardp anerkennen, von dem Elemente verwendet wurden, um die Unterstützung für Luftreiniger zu entwickeln.