Diese Homey App wird eine Verbindung herstellen zu:
• der Gigya Identity Platform (im Besitz von SAP) über die NPM @gslender/gigya API
• der Electrolux OCP (OneConnectedPlatform) API unter https://api.ocp.electrolux.one/appliance/api/v2
• und sowohl Electrolux als auch AEG unterstützen.

Nach erfolgreicher Anmeldung wird die Homey App die OCP API abfragen und feststellen, welche Geräte Sie konfiguriert haben.

Einrichtungsanleitung

Diese Homey App erfordert, dass Ihre Electrolux- oder AEG-Geräte im EU-Rechenzentrum konfiguriert sind, da die API-Dienste und das Produktsortiment außerhalb dieser Region nicht funktionieren. Diese App wurde mit dem Vereinigten Königreich als Standort in der iOS Mobile AEG App getestet, sollte jedoch in allen Teilen der EU einwandfrei funktionieren.

	1.	Sie müssen ein Passwort und eine E-Mail-Adresse in Ihrer Electrolux- oder AEG-Mobile App eingerichtet haben (stellen Sie sicher, dass Sie sich abmelden und mit einer E-Mail-Adresse und einem Passwort anmelden und nicht mit einer Einmal-PIN).
	2.	Installieren Sie die Homey App und konfigurieren Sie die Einstellungen mit Ihrer E-Mail-Adresse und Ihrem Passwort. Diese Anmeldedaten werden gespeichert, aber nur verwendet, um einen JWT-Claim zu erstellen, der von der App nach Bedarf wiederverwendet und aktualisiert wird.
	3.	Fügen Sie ein Gerät über die App hinzu und wählen Sie den entsprechenden Typ (Waschmaschine / Luftreiniger etc.).
	4.	Wenn Ihr Gerät nicht verfügbar ist, besuchen Sie bitte https://github.com/gslender/com.gslender.electrolux-aeg.ocp/issues/new/choose, um Unterstützung für Ihr Gerät anzufordern.

Vielen Dank!

Ich möchte den ursprünglichen Code von https://github.com/rickardp anerkennen, von dem Elemente verwendet wurden, um die Unterstützung für Luftreiniger zu entwickeln.