Deze Homey-app maakt verbinding met:
• Het Gigya Identity Platform (eigendom van SAP) via de NPM @gslender/gigya API
• De Electrolux OCP (OneConnectedPlatform) API op https://api.ocp.electrolux.one/appliance/api/v2
• En ondersteunt zowel Electrolux als AEG

Na een succesvolle inlog zal de Homey-app de OCP API raadplegen en bepalen welke apparaten je hebt geconfigureerd.

Installatiehandleiding

Deze Homey-app vereist dat je je Electrolux- of AEG-apparaten hebt geconfigureerd met het EU-datacenter, aangezien de API-diensten en het productassortiment buiten deze regio niet functioneren. Deze app is getest met het Verenigd Koninkrijk als locatie ingesteld in de iOS Mobile AEG-app, maar zou prima moeten werken in alle delen van de EU.

	1.	Je moet een wachtwoord en e-mailadres hebben ingesteld in je Electrolux- of AEG-mobiele app (zorg ervoor dat je uitlogt en inlogt met een e-mailadres en wachtwoord, en niet met een eenmalig wachtwoord).
	2.	Installeer de Homey-app en configureer de instellingen met je e-mailadres en wachtwoord. Deze inloggegevens worden bewaard, maar worden alleen gebruikt om een JWT-claim te genereren die hergebruikt en vernieuwd wordt wanneer nodig door de app.
	3.	Voeg een apparaat toe met de app en kies het relevante type zoals Wasmachine / Luchtreiniger, etc.
	4.	Als je apparaat niet beschikbaar is, bezoek dan https://github.com/gslender/com.gslender.electrolux-aeg.ocp/issues/new/choose om ondersteuning voor je apparaat aan te vragen.

Dank je wel!

Ik wil graag de oorspronkelijke code van https://github.com/rickardp erkennen, waarvan elementen zijn gebruikt om de ondersteuning voor de Luchtreiniger uit te breiden.