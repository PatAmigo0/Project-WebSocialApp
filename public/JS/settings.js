export class SettingsHandler
{
    /**
     * @param {HTMLElement} root - корневой элемент
     * @param {ThemeManager} themeManager - менеджер тем
     */
    constructor(root, themeManager)
    {
        this.root = root;
        this.themeManager = themeManager;
        // chatManager теперь доступен через window.chatManager

        this.settingsPanel = document.getElementById("settingsPanel");
        this.settingsButton = document.querySelector('.settings-button');
        this.settingsCloseButton = this.settingsPanel.querySelector('.settings-close');
        this.notificationToggle = this.settingsPanel.querySelector('#notifications');
        this.themeRadios = this.settingsPanel.querySelectorAll(".theme-radio");
        this.fontSizeSelector = this.settingsPanel.querySelector('#font-size');
        this.avatarsSelector = this.settingsPanel.querySelector('#avatars-images');
        this.onlineStatusToggle = this.settingsPanel.querySelector('#show-online');
        this.clearCookiesButton = this.settingsPanel.querySelector('#clearCookies');
        this.leaveButton = this.settingsPanel.querySelector('#leave');

        this.init();
    }

    init()
    {
        this.setupEventListeners();
    }

    setupEventListeners()
    {
        // КЛИК НА КНОПКУ НАСТРОЕК
        this.settingsButton.addEventListener("click", (e) => 
        {
            e.stopPropagation();
            this.toggleSettings();
        });

        // КЛИК НА КНОПКУ ЗАКРЫТИЯ НА ПАНЕЛИ НАСТРОЕК
        this.settingsCloseButton.addEventListener("click", (e) => 
        {
            e.stopPropagation();
            this.toggleSettings();
        });

        // ВЫБОР ТЕМЫ
        this.themeRadios.forEach((radio) => 
        {
            radio.addEventListener("change", () => 
            { 
                if (radio.checked) 
                {
                    this.themeManager.changeTheme(radio.value);
                    localStorage.setItem("savedCheckedValue", radio.value);
                }
            });
        });

        // ВЫБОР ШРИФТА
        this.fontSizeSelector?.addEventListener('change', () => 
        {
            const fontSize = this.fontSizeSelector.value;

            this.root.style.fontSize = `${fontSize}px`;
            localStorage.setItem('fontSize', fontSize);
        });

        // ВЫБОР АВАТАРОВ
        this.avatarsSelector?.addEventListener('change', (e) => 
        {
            if (window.chatManager)
                window.chatManager.updateUsersAvatars(e.target.value);
            else
                console.warn("chatManager еще не загружен, попробуйте позже");
            
        });

        // ИЗМЕНЕИЕ СТАТУСА В СЕТИ
        this.onlineStatusToggle?.addEventListener('change', () => 
        {
            const value = this.onlineStatusToggle.value;
            if (value)
            {}
        });

        // ОЧИСТКА КУКИ
        this.clearCookiesButton.addEventListener('click', () => 
        {
            localStorage.clear();
            window.addEventListener('beforeunload', () => localStorage.clear());
        });

        // ВЫХОД ИЗ АККАУНТА
        this.leaveButton.addEventListener('click', () => 
        {
            localStorage.removeItem("lastLogin");
            localStorage.setItem("clearCookiesPending", true);
            location.reload();
        });
    }

    // включаем / выключаем панель настроек
    toggleSettings() 
    {
        this.settingsPanel.classList.toggle("active");
        document.body.style.overflow = this.settingsPanel.classList.contains("active") ? "hidden" : "";
    }

    // загружаем сохраненные значения из настроек
    loadSavedSettings()
    {
        const savedFontSize = localStorage.getItem("fontSize");
        const savedCheckedValue = localStorage.getItem("savedCheckedValue");

        if (savedFontSize) 
        {
            this.fontSizeSelector.value = savedFontSize;
            this.root.style.fontSize = `${savedFontSize}px`;
        }

        if (savedCheckedValue)
        {
            this.themeRadios.forEach(radio => 
            {
                radio.value == savedCheckedValue 
                ? radio.checked = true 
                : radio.checked = false;
            });
        }
    }
}