Denna Homey App kommer att ansluta till
• Gigya Identity Platform (ägd av SAP) via NPM @gslender/gigya API
• Electrolux OCP (OneConnectedPlatform) API på https://api.ocp.electrolux.one/appliance/api/v2
• och stödjer både Electrolux och AEG

Efter en lyckad inloggning, kommer Homey App att fråga OCP API och fastställa vilka enheter du har konfigurerat.

Installationsguide

Denna Homey App kräver att du har dina Electrolux eller AEG apparater konfigurerade med EU datacenter, eftersom API-tjänsterna / utbudet av produkter inte fungerar utanför denna region. Denna app har testats med Storbritannien inställt som plats i iOS Mobile AEG App, men bör fungera bra i hela EU.

1. Du måste ha ett lösenord och en email konfigurerad i din Electrolux eller AEG mobilapp (se till att du loggar ut och loggar in med e-post och lösenord, och inte använder OTP).
2. Installera Homey App och konfigurera inställningarna med din e-post och lösenord. Dessa uppgifter sparas, men används bara för att generera en JWT Claim som återanvänds och uppdateras vid behov av appen.
3. Lägg till en enhet med appen och välj relevant typ tvätt / luftrenare etc.
4. Om din apparat / enhet inte är tillgänglig, vänligen besök https://github.com/gslender/com.gslender.electrolux-aeg.ocp/issues/new/choose för att begära stöd för din enhet.

Tack!

Jag vill tacka https://github.com/rickardp för den ursprungliga koden varav element användes för att bygga ut stöd för luftrenare.