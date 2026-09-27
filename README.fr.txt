Cette application Homey se connecte à
• l'API développeur officielle d'Electrolux Group à l'adresse https://api.developer.electrolux.one
• et prend en charge les appareils Electrolux et AEG

Guide d'installation

1. Connectez-vous sur https://developer.electrolux.one avec le même compte (e-mail et mot de passe) que dans l'application Electrolux ou AEG.
2. Dans le Dashboard, créez une clé API, puis cliquez sur GET ACCESS TOKEN pour générer un access token et un refresh token.
3. Ouvrez les paramètres de l'application Homey et collez la clé API, l'access token et le refresh token. Les jetons sont renouvelés automatiquement par l'application : utilisez une paire de jetons réservée à Homey et ne la partagez pas avec d'autres applications.
4. Ajoutez un appareil via l'application et choisissez le type correspondant : Lave-linge / Purificateur d'air, etc.
5. Si votre appareil n'est pas disponible, veuillez visiter https://github.com/gslender/com.electrolux-aeg.ocp/issues/new/choose pour demander sa prise en charge.

L'offre développeur gratuite d'Electrolux autorise 5000 appels API par jour. Avec de nombreux appareils, l'intervalle d'interrogation est augmenté automatiquement pour respecter cette limite.

Mise à jour depuis la version 1.x : la connexion par e-mail et mot de passe n'est plus prise en charge. Après la mise à jour, ouvrez les paramètres de l'application et saisissez vos identifiants développeur - vos appareils existants sont conservés.

Merci !

Je tiens à remercier https://github.com/rickardp pour son code original, dont certains éléments ont servi à développer la prise en charge des purificateurs d'air.