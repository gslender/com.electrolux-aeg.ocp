Denna Homey-app ansluter till
• Electrolux Groups officiella Developer API på https://api.developer.electrolux.one
• och stöder både Electrolux- och AEG-apparater

Installationsguide

1. Logga in på https://developer.electrolux.one med samma konto (e-post och lösenord) som i Electrolux- eller AEG-appen.
2. Skapa en API-nyckel på Dashboard och klicka sedan på GET ACCESS TOKEN för att generera en access token och refresh token.
3. Öppna inställningarna för Homey-appen och klistra in API-nyckeln, access token och refresh token. Tokens förnyas automatiskt av appen, så använd ett tokenpar enbart för Homey och dela det inte med andra appar.
4. Lägg till en enhet med appen och välj rätt typ, Tvätt / Luftrenare osv.
5. Om din apparat inte är tillgänglig, besök https://github.com/gslender/com.electrolux-aeg.ocp/issues/new/choose för att begära stöd för din enhet.

Electrolux kostnadsfria developer-plan tillåter 5000 API-anrop per dag. Med många apparater ökas uppdateringsintervallet automatiskt för att hålla sig inom gränsen.

Uppgradering från version 1.x: inloggning med e-post och lösenord stöds inte längre. Öppna appinställningarna efter uppdateringen och ange dina utvecklaruppgifter - dina befintliga enheter behålls.

Tack!

Jag vill uppmärksamma den ursprungliga koden av https://github.com/rickardp, vars delar användes för att bygga stödet för luftrenare.