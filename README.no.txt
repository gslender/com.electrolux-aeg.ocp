Denne Homey-appen vil koble til 
• Gigya Identity Platform (eid av SAP) via NPM @gslender/gigya API
• Electrolux OCP (OneConnectedPlatform) API på https://api.ocp.electrolux.one/appliance/api/v2
• og støtte både Electrolux og AEG

Etter innlogging vil Homey-appen undersøke OCP API-en og finne ut hvilke enheter du har konfigurert.

Installeringsguide

Denne Homey-appen krever at du har dine Electrolux eller AEG-apparater konfigurert med EU-datasenteret, da API-tjenestene / produktutvalget ikke fungerer utenfor denne regionen. Denne appen er testet med Storbritannia satt som lokasjon i iOS Mobile AEG-appen, men bør fungere fint i hele EU.

1. Du må ha et passord og e-postoppsett i din Electrolux eller AEG mobilapp (pass på å logge ut og logge inn med e-post og passord, ikke bruke OTP).
2. Installer Homey-appen og konfigurer innstillingene med din e-post og passord. Disse legitimasjonene lagres, men brukes kun til å generere et JWT-krav som gjenbrukes og fornyes etter behov av appen.
3. Legg til en enhet ved å bruke appen og velge relevant type Vaskemaskin / Luftrenser osv.
4. Hvis apparatet / enheten din ikke er tilgjengelig, vennligst besøk https://github.com/gslender/com.gslender.electrolux-aeg.ocp/issues/new/choose for å be om støtte for enheten din.

Takk!

Jeg ønsker å anerkjenne den opprinnelige koden av https://github.com/rickardp hvor elementer ble brukt til å bygge ut støtte for luftrenser.