Ta aplikacja Homey łączy się z
• oficjalnym API dla deweloperów Electrolux Group pod adresem https://api.developer.electrolux.one
• i obsługuje urządzenia Electrolux oraz AEG

Instrukcja konfiguracji

1. Zaloguj się na https://developer.electrolux.one tym samym kontem (e-mail i hasło), którego używasz w aplikacji Electrolux lub AEG.
2. W panelu Dashboard utwórz klucz API, a następnie kliknij GET ACCESS TOKEN, aby wygenerować access token i refresh token.
3. Otwórz ustawienia aplikacji Homey i wklej klucz API, access token i refresh token. Tokeny są automatycznie odnawiane przez aplikację, więc używaj pary tokenów tylko dla Homey i nie udostępniaj jej innym aplikacjom.
4. Dodaj urządzenie za pomocą aplikacji i wybierz odpowiedni typ: Pralka / Oczyszczacz powietrza itp.
5. Jeśli Twoje urządzenie nie jest dostępne, odwiedź https://github.com/gslender/com.electrolux-aeg.ocp/issues/new/choose, aby poprosić o jego obsługę.

Darmowy plan deweloperski Electrolux pozwala na 5000 wywołań API dziennie. Przy wielu urządzeniach interwał odpytywania jest automatycznie zwiększany, aby nie przekroczyć tego limitu.

Aktualizacja z wersji 1.x: logowanie e-mailem i hasłem nie jest już obsługiwane. Po aktualizacji otwórz ustawienia aplikacji i wprowadź dane deweloperskie - istniejące urządzenia zostaną zachowane.

Dziękuję!

Chciałbym podziękować https://github.com/rickardp za oryginalny kod, którego elementy wykorzystano do stworzenia obsługi oczyszczaczy powietrza.