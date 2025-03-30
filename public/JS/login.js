export class LoginHandler
{
    constructor()
    {
        this.mainWindow = document.querySelector(".modal-login");
        this.loginButton = document.getElementById("loginButton");
        this.loginInput = document.getElementById("login-input");

        this.randomPlaceholders = 
        [
            "ProGamer123",
            "Даник",
            ":(",
            ":)",
            "=)",
            "утка",
            "admin",
            "jslearner",
            "ga...",
            "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
            "lelelelelelelelelelelelellelelelelelelelelelelellelelelelelelelellelelelelelelellelelelelelelelelelelleleelllelelelelelelelelelelelellelelelelelelelelelelelelelellelelelelelelelelelelellelelelelelelellelelelelelelelelelelleleelllelelelelele Ты не должен тут быть..."
        ];

        this.style = "gradient-pattern-rainbow"
        this.init();
    }

    init()
    {
        this.randomizePlaceholder();
        this.setupEventListeners();
    }

    // для случайных надписей на панели ввода
    randomizePlaceholder()
    {
        this.loginInput.placeholder = this.randomPlaceholders[Math.floor(Math.random() * this.randomPlaceholders.length)];
    }
    
    // для управления видом
    setupEventListeners()
    {
        this.loginButton.addEventListener("mouseenter", () => 
        {
            this.loginButton.classList.add(this.style);
        });

        this.loginButton.addEventListener("mouseleave", () =>
        {
            this.loginButton.classList.remove(this.style);
        });

        this.loginInput.addEventListener("input", () => 
        {
            if (this.loginInput.value == "")
                this.randomizePlaceholder();
            this.loginInput.classList.remove("error");
        });
    }

    // обрабатываем поле ввода
    handleInput()
    {

        this.username = this.loginInput.value;
        this.loginInput.value = "";

        if (this.username)
            return this.username;
        else
        {
            this.loginInput.classList.add("error");
            this.loginInput.placeholder = "Поле не должно быть пустым."
        }
    }

    // удаляем окно логина так как оно нам больше не нужно
    hideLoginWindow()
    {
        this.mainWindow.remove();
    }

    async handleLogin()
    {
        return new Promise((res, rej) => 
        {
            // НАЖАТИЕ НА КНОПКУ
            this.loginButton.addEventListener("click", (e) => 
            {
                const val = this.handleInput();
                if (val)
                {
                    this.hideLoginWindow();
                    res(val);
                }
            });

            // НАЖАТИЕ НА ENTER
            this.loginInput.addEventListener("keypress", (e) => 
            {
                if (e.key == "Enter")
                {
                    const val = this.handleInput();
                    if (val)
                    {
                        this.hideLoginWindow();
                        res(val);
                    }
                }
            });

        })
    }
}

export const loginHandler = new LoginHandler();
