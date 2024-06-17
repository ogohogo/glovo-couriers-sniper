module.exports = {

    refreshToken: "", //Uzupełnij refresh tokenem z aplikacji Glovo Kurwiers
    refreshTokenTime: 1080, //Kiedy ma odświeżyć token w sekundach, najlepiej zostawić domyślnie

    refreshSlotsTime: 5, //Co ile sekund ma sprawdzać dostępne sloty, jeżeli dasz poniżej 5, to możesz zostać zbanowany
    minStartTime: 3, //Ile godzin przed rozpoczęciem ma rezerwować slot, np jak jest ustawione na 3 godziny, a jest 12:00, to nie będzie rezerwować slotów przed 15:00

    discordWebhookURL: "", //Webhook do kanału Discord, gdzie ma wysyłać informacje o dostępnych slotach

    acceptedHours: [
        //Jakie godziny ma rezerwować dla danego dnia
        //Możesz dodać więcej godzin, np. [11,12,13,14]

        //Niedziela
        [11,12],
        //Poniedziałek
        [11,12],
        //Wtorek
        [11,12],
        //Środa
        [11,12,],
        //Czwartek
        [11,12],
        //Piątek
        [11,12],
        //Sobota
        [11,12]
    ],

    defaultHeaders: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "user-agent": "Glover/15854 CFNetwork/1408.0.4 Darwin/22.5.0", //W przyszłości może być wymagana zmiana, na ten moment (17.06.2024) nie trzeba.
        "glovo-language-code": "pl",
        "glovo-app-platform": "iOS",
        "glovo-app-type": "courier",
        "glovo-app-source": "app-store",
        "accept-language": "pl-PL,pl;q=0.9",
        "glovo-app-version": "2.231.0", //Co jaki czas trzeba zmieniać wersję aplikacji, bo inaczej nie będzie działać
	    "glovo-api-version": "8"
    }

}
