Questa App Homey si collega a
• l'API ufficiale per sviluppatori di Electrolux Group su https://api.developer.electrolux.one
• e supporta elettrodomestici Electrolux e AEG

Guida alla configurazione

1. Accedi a https://developer.electrolux.one con lo stesso account (e-mail e password) che usi nell'app Electrolux o AEG.
2. Nella Dashboard, crea una chiave API, quindi fai clic su GET ACCESS TOKEN per generare un access token e un refresh token.
3. Apri le impostazioni dell'App Homey e incolla chiave API, access token e refresh token. I token vengono rinnovati automaticamente dall'app, quindi usa una coppia di token dedicata a Homey e non condividerla con altre app.
4. Aggiungi un dispositivo tramite l'app e scegli il tipo corrispondente, Lavatrice / Purificatore d'aria ecc.
5. Se il tuo elettrodomestico non è disponibile, visita https://github.com/gslender/com.electrolux-aeg.ocp/issues/new/choose per richiederne il supporto.

Il piano sviluppatori gratuito di Electrolux consente 5000 chiamate API al giorno. Con molti elettrodomestici, l'intervallo di aggiornamento viene aumentato automaticamente per rispettare questo limite.

Aggiornamento dalla versione 1.x: l'accesso con e-mail e password non è più supportato. Dopo l'aggiornamento, apri le impostazioni dell'app e inserisci le tue credenziali sviluppatore - i dispositivi esistenti vengono mantenuti.

Grazie!

Desidero ringraziare https://github.com/rickardp per il codice originale, i cui elementi sono stati utilizzati per sviluppare il supporto ai purificatori d'aria.