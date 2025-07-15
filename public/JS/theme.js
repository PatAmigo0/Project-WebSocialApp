import { avatarManager } from "./avatars.js";

export class ThemeManager 
{
    /**
     * @param {HTMLElement} root - корневой элемент
     * @param {HTMLElement} messagesContainer - контейнер для сообщений
     */
    constructor(root, messagesContainer) 
    {
        this.root = root;
        this.messagesContainer = messagesContainer;

        this.gradientPatternSelector = document.getElementById("gradient-pattern");
        this.avatarsSelector = document.getElementById('avatars-images');

        this.currentPattern = 'light'; // значение по умолчанию
        this.currentAvatarsStyle = 'default';
        this.themes = 
        {
            dark: 
            {
                "--bg-primary": "rgba(47, 49, 54, 1)",
                "--bg-secondary": "rgba(54, 57, 63, 1)",
                "--text-primary": "rgba(255, 255, 255, 1)",
                "--text-secondary": "rgba(185, 187, 190, 1)",
                "--border-color": "rgba(32, 34, 37, 1)",
                "--bg-message-received": "rgba(64, 68, 75, 0.95)",
                "--bg-message-sent": "rgba(88, 101, 242, 0.95)",
                "--close-button-color-hover": "rgba(16, 12, 12, 0.95)"
            },
            blue: 
            {
                "--bg-primary": "rgba(227, 242, 253, 1)",
                "--bg-secondary": "rgba(187, 222, 251, 1)",
                "--text-primary": "rgba(25, 118, 210, 1)",
                "--text-secondary": "rgba(33, 150, 243, 1)",
                "--border-color": "rgba(144, 202, 249, 1)",
                "--bg-message-received": "rgba(255, 255, 255, 0.95)",
                "--bg-message-sent": "rgba(33, 150, 243, 0.95)",
                "--close-button-color-hover": "rgba(12, 10, 10, 0.95)"
            },
            light: 
            {
                "--bg-primary": "rgba(240, 242, 245, 1)",
                "--bg-secondary": "rgba(248, 249, 250, 1)",
                "--text-primary": "rgba(34, 34, 34, 1)",
                "--text-secondary": "rgba(102, 102, 102, 1)",
                "--border-color": "rgba(224, 224, 224, 1)",
                "--bg-message-received": "rgba(255, 255, 255, 0.95)",
                "--bg-message-sent": "rgba(227, 242, 253, 0.95)",
                "--close-button-color-hover": "rgba(78, 72, 198, 0.95)"
            },
            green: 
            {
                "--bg-primary": "rgba(232, 245, 233, 1)",
                "--bg-secondary": "rgba(200, 230, 201, 1)",
                "--text-primary": "rgba(46, 125, 50, 1)",
                "--text-secondary": "rgba(76, 175, 80, 1)",
                "--border-color": "rgba(165, 214, 167, 1)",
                "--bg-message-received": "rgba(255, 255, 255, 0.95)",
                "--bg-message-sent": "rgba(76, 175, 80, 0.95)",
                "--close-button-color-hover": "rgba(12, 10, 10, 0.95)"
            },
            abstract: 
            {
                "--bg-primary": "rgba(48, 35, 174, 1)",
                "--bg-secondary": "rgba(200, 109, 215, 1)",
                "--text-primary": "rgba(255, 255, 255, 1)",
                "--text-secondary": "rgba(224, 203, 245, 1)",
                "--border-color": "rgba(128, 87, 197, 1)",
                "--bg-message-received": "rgba(64, 45, 120, 0.95)",
                "--bg-message-sent": "rgba(200, 109, 215, 0.95)",
                "--close-button-color-hover": "rgba(30, 23, 50, 0.95)"
            }
        };

        this.setupGradientListener();
    }

    setupGradientListener()
    {
        // ВЫБОР ГРАДИЕНТА
        this.gradientPatternSelector?.addEventListener('change', () => 
        {
            const pattern = this.gradientPatternSelector.value;
            this.changeGradientPattern(pattern);
        });
    }

    // меняем тему (все элементы) согласно новой выбранной теме
    /**
     * @param {string} theme - название темы
     */
    changeTheme(theme) 
    {
        if (!this.themes[theme]) 
            theme = 'light';

        const themeStyles = this.themes[theme];
        Object.entries(themeStyles).forEach(([property, value]) => 
        {
            this.root.style.setProperty(property, value);
        });

        // При смене темы обновляем текущий градиент
        this.changeGradientPattern(this.currentPattern);
    }

    // сохраняем все стили сайта в куки
    saveTheme()
    {
        const themeData =
        {
            styles: this.getCurrentTheme(),
            gradientPattern: this.currentPattern,
            avatarsStyle: avatarManager.getCurrentAvatarsStyle()
        };
        localStorage.setItem("theme", JSON.stringify(themeData));
    }

    // загружаем сохраненную тему из куки
    loadTheme() 
    {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme)
        {
            const parsedSavedTheme = JSON.parse(savedTheme);
            Object.keys(parsedSavedTheme.styles).forEach((prop) =>
            {
                this.root.style.setProperty(prop, parsedSavedTheme.styles[prop]);
            });

            const savedGradientPattern = parsedSavedTheme.gradientPattern;
            if (savedGradientPattern)
            {
                this.currentPattern = savedGradientPattern;
                this.gradientPatternSelector.value = savedGradientPattern;
                this.changeGradientPattern(savedGradientPattern);
            }

            const savedAvatarsStyle = parsedSavedTheme.avatarsStyle;
            if (savedAvatarsStyle)
            {
                this.avatarsSelector.value = savedAvatarsStyle;
                this.currentAvatarsStyle = savedAvatarsStyle;
                avatarManager.changeAvatarsStyle(this.currentAvatarsStyle);
            }
        }
        else
        {
            // по умолчанию используем белый паттерн
            this.changeTheme('light');
            this.changeGradientPattern('blue');
        }
    }
    
    // получаем ВЕСЬ текущий стиль сайта
    getCurrentTheme() 
    {
        const styles = {};
        Array.from(this.root.style).forEach((prop) => 
        {
            styles[prop] = this.root.style.getPropertyValue(prop);
        });
        return styles;
    }

    // обновляем градиент фона
    updateGradient()
    {
        // принудительно обновляем стили
        this.messagesContainer.style.backgroundImage = 'none';
        this.messagesContainer.offsetHeight; // принудительный reflow
        this.messagesContainer.style.backgroundImage = '';
    }

    /**
     * меняем паттерн градиента
     * @param {string} pattern - название паттерна
     */
    changeGradientPattern(pattern)
    {
        this.currentPattern = pattern;
        
        // удаляем все классы градиентов
        this.messagesContainer.classList.remove(
            'gradient-pattern-blue', 
            'gradient-pattern-light', 
            'gradient-pattern-color',
            'gradient-pattern-rainbow',
            'gradient-pattern-abstract'
        );
        
        // добавляем выбранный класс градиента
        this.messagesContainer.classList.add(`gradient-pattern-${pattern}`);
        
        // обновляем градиент
        this.updateGradient();
    }
} 