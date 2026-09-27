Denne Homey App forbinder til
• den officielle Electrolux Group Developer API på https://api.developer.electrolux.one
• og understøtter både Electrolux og AEG apparater

Opsætningsguide

1. Log ind på https://developer.electrolux.one med den samme konto (e-mail og adgangskode) som i din Electrolux- eller AEG-app.
2. Opret en API-nøgle på Dashboard, og klik derefter på GET ACCESS TOKEN for at generere et access token og refresh token.
3. Åbn Homey App'ens indstillinger og indsæt API-nøglen, access token og refresh token. Tokens fornyes automatisk af app'en, så brug et tokenpar kun til Homey og del det ikke med andre apps.
4. Tilføj en enhed ved hjælp af app'en og vælg den relevante type Vaskeri / Luftrenser osv.
5. Hvis dit apparat / din enhed ikke er tilgængelig, bedes du besøge https://github.com/gslender/com.electrolux-aeg.ocp/issues/new/choose for at anmode om support for din enhed.

Den gratis Electrolux developer-plan tillader 5000 API-kald om dagen. Med mange apparater øges opdateringsintervallet automatisk for at holde sig inden for grænsen.

Opgradering fra version 1.x: login med e-mail og adgangskode understøttes ikke længere. Åbn app-indstillingerne efter opdateringen og indtast dine udvikleroplysninger - dine eksisterende enheder bevares.

Tak!

Jeg ønsker at anerkende den oprindelige kode af https://github.com/rickardp, hvorfra elementer blev brugt til at opbygge understøttelsen af luftrensere.