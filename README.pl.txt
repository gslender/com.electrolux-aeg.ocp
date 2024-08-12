Ta aplikacja Homey połączy się z
• platformą tożsamości Gigya (należącą do SAP) za pośrednictwem NPM @gslender/gigya API
• API Electrolux OCP (OneConnectedPlatform) pod adresem https://api.ocp.electrolux.one/appliance/api/v2
• i obsłuży zarówno urządzenia Electrolux, jak i AEG

Po pomyślnym zalogowaniu aplikacja Homey przeskanuje API OCP i określi, jakie urządzenia zostały skonfigurowane.

Przewodnik konfiguracji

Ta aplikacja Homey wymaga, aby urządzenia Electrolux lub AEG były skonfigurowane z europejskim centrum danych, ponieważ usługi API / asortyment produktów nie działają poza tym regionem. Aplikacja została przetestowana z ustawieniem lokalizacji jako Wielka Brytania w aplikacji mobilnej AEG na iOS, ale powinna działać dobrze w całej UE.

1. Musisz mieć hasło i e-mail skonfigurowane w mobilnej aplikacji Electrolux lub AEG (upewnij się, że wylogujesz się i zalogujesz za pomocą e-maila i hasła, a nie przy użyciu OTP).
2. Zainstaluj aplikację Homey i skonfiguruj ustawienia, używając swojego e-maila i hasła. Te dane są przechowywane, ale używane tylko do wygenerowania żądania JWT, które jest ponownie używane i odświeżane w razie potrzeby przez aplikację.
3. Dodaj urządzenie za pomocą aplikacji i wybierz odpowiedni typ, np. Pralka / Oczyszczacz powietrza itd.
4. Jeśli Twoje urządzenie nie jest dostępne, prosimy o odwiedzenie strony https://github.com/gslender/com.gslender.electrolux-aeg.ocp/issues/new/choose, aby poprosić o wsparcie dla Twojego urządzenia.

Dziękuję!

Chciałbym podziękować autorowi oryginalnego kodu https://github.com/rickardp, z którego elementy zostały wykorzystane do zbudowania wsparcia dla oczyszczaczy powietrza.