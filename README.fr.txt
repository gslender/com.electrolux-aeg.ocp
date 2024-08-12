Cette application Homey se connectera à
• la plateforme d'identité Gigya (appartenant à SAP) via l'API NPM @gslender/gigya
• l'API Electrolux OCP (OneConnectedPlatform) à l'adresse https://api.ocp.electrolux.one/appliance/api/v2
• et prendra en charge à la fois Electrolux et AEG

Après une connexion réussie, l'application Homey interrogera l'API OCP pour déterminer quels appareils vous avez configurés.

Guide de Configuration

Cette application Homey nécessitera que vos appareils Electrolux ou AEG soient configurés avec le centre de données de l'UE, car les services API / la gamme de produits ne fonctionnent pas en dehors de cette région. Cette application a été testée avec le Royaume-Uni comme localisation dans l'application mobile AEG pour iOS, mais elle devrait fonctionner correctement dans toute l'UE.

1. Vous devez avoir un mot de passe et un email configurés dans votre application mobile Electrolux ou AEG (assurez-vous de vous déconnecter et de vous reconnecter en utilisant un email et un mot de passe, et non en utilisant un OTP).
2. Installez l'application Homey et configurez les paramètres en utilisant votre email et votre mot de passe. Ces informations d'identification sont persistantes, mais sont uniquement utilisées pour générer une revendication JWT qui est réutilisée et mise à jour au besoin par l'application.
3. Ajoutez un appareil en utilisant l'application et choisissez le type pertinent, Lavage / Purificateur d'air, etc.
4. Si votre appareil / dispositif n'est pas disponible, veuillez visiter https://github.com/gslender/com.gslender.electrolux-aeg.ocp/issues/new/choose pour demander le support de votre appareil.

Merci!

Je souhaite remercier https://github.com/rickardp pour le code original dont certains éléments ont été utilisés pour développer le support du purificateur d'air.