Denne Homey-appen kobler til
• den offisielle Electrolux Group Developer API på https://api.developer.electrolux.one
• og støtter både Electrolux- og AEG-apparater

Oppsettsveiledning

1. Logg inn på https://developer.electrolux.one med den samme kontoen (e-post og passord) som i Electrolux- eller AEG-appen.
2. Opprett en API-nøkkel på Dashboard, og klikk deretter GET ACCESS TOKEN for å generere et access token og refresh token.
3. Åpne innstillingene for Homey-appen og lim inn API-nøkkelen, access token og refresh token. Tokenene fornyes automatisk av appen, så bruk et tokenpar kun for Homey og ikke del det med andre apper.
4. Legg til en enhet med appen og velg riktig type, Vask / Luftrenser osv.
5. Hvis apparatet ditt ikke er tilgjengelig, besøk https://github.com/gslender/com.electrolux-aeg.ocp/issues/new/choose for å be om støtte for enheten din.

Den gratis Electrolux developer-planen tillater 5000 API-kall per dag. Med mange apparater økes oppdateringsintervallet automatisk for å holde seg innenfor grensen.

Oppgradering fra versjon 1.x: innlogging med e-post og passord støttes ikke lenger. Åpne appinnstillingene etter oppdateringen og skriv inn utviklerinformasjonen din - eksisterende enheter beholdes.

Takk!

Jeg vil anerkjenne den opprinnelige koden av https://github.com/rickardp, som elementer ble brukt fra for å bygge støtten for luftrensere.