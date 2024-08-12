Questa app Homey si collegherà a
• la Piattaforma di Identità Gigya (di proprietà di SAP) tramite l'API NPM @gslender/gigya
• l'API di Electrolux OCP (OneConnectedPlatform) su https://api.ocp.electrolux.one/appliance/api/v2
• e supporterà sia Electrolux che AEG

Dopo un accesso riuscito, l'app Homey interrogherà l'API OCP e determinerà quali dispositivi hai configurato.

Guida alla Configurazione

Questa app Homey richiede che tu abbia i tuoi elettrodomestici Electrolux o AEG configurati con il centro dati EU, poiché i servizi API / la gamma di prodotti non funzionano al di fuori di quella regione. Questa app è stata testata con il Regno Unito impostato come posizione nell'app mobile AEG per iOS, ma dovrebbe funzionare bene in tutte le parti dell'UE.

1. Devi avere una password e un'email configurate nella tua app mobile Electrolux o AEG (assicurati di logout e login utilizzando un'email e una password, e non un OTP).
2. Installa l'app Homey e configura le Impostazioni utilizzando la tua email e password. Queste credenziali sono conservate, ma sono usate solo per generare un JWT Claim che viene riutilizzato e aggiornato quando necessario dall'app.
3. Aggiungi un dispositivo utilizzando l'app e scegli il tipo rilevante Lavanderia / Purificatore d'Aria ecc.
4. Se il tuo elettrodomestico / dispositivo non è disponibile, visita https://github.com/gslender/com.gslender.electrolux-aeg.ocp/issues/new/choose per richiedere supporto per il tuo dispositivo.

Grazie!

Vorrei riconoscere il codice originale di https://github.com/rickardp di cui sono stati utilizzati elementi per sviluppare il supporto per il Purificatore d'Aria.