/*TODO: сделать класс для работы с настройками (перенести из script.js) */ 
import { notificationManager } from "./notifications.js";

export class SettingsHandler
{
    constructor(root, themeManager)
    {
        this.root = root;
        this.themeManager = themeManager;

        this.settingsPanel = document.getElementById("settingsPanel");
        this.settingsButton = document.querySelector('.settings-button');
        this.settingsCloseButton = document.querySelector('.settings-close');
        this.notificationToggle = document.getElementById('notifications');
        this.themeRadios = document.querySelectorAll(".theme-radio");
        this.fontSizeSelector = document.getElementById('font-size');

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