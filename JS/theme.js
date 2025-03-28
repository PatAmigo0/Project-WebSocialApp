export class ThemeManager 
{
    constructor(root, messagesContainer) 
    {
        this.root = root;
        this.messagesContainer = messagesContainer;
        this.gradientPatternSelector = document.getElementById("gradient-pattern");
        this.currentPattern = 'blue'; // значение по умолчанию
        this.themes = 
        {
            dark: 
            {
                "--bg-primary": "#2f3136",
                "--bg-secondary": "#36393f",
                "--text-primary": "#ffffff",
                "--text-secondary": "#b9bbbe",
                "--border-color": "#202225",
                "--bg-message-received": "rgba(64, 68, 75, 0.95)",
                "--bg-message-sent": "rgba(88, 101, 242, 0.95)",
                "--close-button-color-hover": "rgba(16, 12, 12, 0.95)"
            },
            blue: 
            {
                "--bg-primary": "#e3f2fd",
                "--bg-secondary": "#bbdefb",
                "--text-primary": "#1976d2",
                "--text-secondary": "#2196f3",
                "--border-color": "#90caf9",
                "--bg-message-received": "rgba(255, 255, 255, 0.95)",
                "--bg-message-sent": "rgba(33, 150, 243, 0.95)",
                "--close-button-color-hover": "rgba(12, 10, 10, 0.95)"
            },
            light: 
            {
                "--bg-primary": "#f0f2f5",
                "--bg-secondary": "#f8f9fa",
                "--text-primary": "#222",
                "--text-secondary": "#666",
                "--border-color": "#e0e0e0",
                "--bg-message-received": "rgba(255, 255, 255, 0.95)",
                "--bg-message-sent": "rgba(227, 242, 253, 0.95)",
                "--close-button-color-hover": "rgba(78, 72, 198, 0.95)"
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
            localStorage.setItem('gradientPattern', pattern);
        });
    }

    // меняем тему (все элементы) согласно новой выбранной теме
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
        localStorage.setItem("theme", JSON.stringify(this.getCurrentTheme()));
    }

    // загружаем сохраненную тему из куки
    loadTheme() 
    {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme)
        {
            const styles = JSON.parse(savedTheme);
            Object.keys(styles).forEach((prop) =>
            {
                this.root.style.setProperty(prop, styles[prop]);
            });
        }

        // Загружаем сохраненный градиент
        const savedGradientPattern = localStorage.getItem("gradientPattern");
        if (savedGradientPattern)
        {
            this.currentPattern = savedGradientPattern;
            this.gradientPatternSelector.value = savedGradientPattern;
            this.changeGradientPattern(savedGradientPattern);
        }
        else
        {
            // По умолчанию используем синий паттерн
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
        // Принудительно обновляем стили
        this.messagesContainer.style.backgroundImage = 'none';
        this.messagesContainer.offsetHeight; // принудительный reflow
        this.messagesContainer.style.backgroundImage = '';
    }

    // меняем паттерн градиента
    changeGradientPattern(pattern)
    {
        this.currentPattern = pattern;
        
        // Удаляем все классы градиентов
        this.messagesContainer.classList.remove(
            'gradient-pattern-blue', 
            'gradient-pattern-light', 
            'gradient-pattern-color',
            'gradient-pattern-rainbow'
        );
        
        // Добавляем выбранный класс градиента
        this.messagesContainer.classList.add(`gradient-pattern-${pattern}`);
        
        // Обновляем градиент
        this.updateGradient();
    }
} 