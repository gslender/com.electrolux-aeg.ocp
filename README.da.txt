Denne Homey App forbinder til 
• Gigya Identity Platform (ejet af SAP) via NPM @gslender/gigya API
• Electrolux OCP (OneConnectedPlatform) API på https://api.ocp.electrolux.one/appliance/api/v2
• og understøtter både Electrolux og AEG

Efter succesfuld login vil Homey App'en interagere med OCP API'et og afgøre, hvilke enheder du har konfigureret.

Opsætningsguide

Denne Homey App kræver, at du har dine Electrolux eller AEG apparater konfigureret med EU-datacenteret, da API-tjenesterne og produktudvalget ikke fungerer uden for dette område. Denne app er testet med Storbritannien indstillet som lokation i iOS Mobile AEG App'en, men bør fungere fint i hele EU.

1. Du skal have en adgangskode og e-mail opsat i din Electrolux eller AEG mobilapp (sørg for at logge ud og logge ind ved hjælp af en e-mail og adgangskode og ikke ved hjælp af OTP).
2. Installer Homey App'en og konfigurer indstillingerne ved hjælp af din e-mail og adgangskode. Disse legitimationsoplysninger gemmes, men bruges kun til at generere et JWT-krav, der genbruges og fornyes efter behov af app'en.
3. Tilføj en enhed ved hjælp af app'en og vælg den relevante type Vaskeri / Luftrenser osv.
4. Hvis dit apparat / din enhed ikke er tilgængelig, bedes du besøge https://github.com/gslender/com.gslender.electrolux-aeg.ocp/issues/new/choose for at anmode om support for din enhed.

Tak!

Jeg ønsker at anerkende den oprindelige kode af https://github.com/rickardp, hvorfra elementer blev brugt til at opbygge understøttelsen af luftrensere.