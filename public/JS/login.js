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
            "lelelelelelelelelelelelellelelelelelelelelelelellelelelelelelelellelelelelelelellelelelelelelelelelelleleelllelelelelelelelelelelelellelelelelelelelelelelelelelellelelelelelelelele Если ты можешь это читать то у тебя большой экран!"
        ];

        this.style = "gradient-pattern-rainbow"
        this.init();
    }

    init()
    {
        this.randomizePlaceholder();
        this.setupEventListeners();
    }


    randomizePlaceholder()
    {
        this.loginInput.placeholder = this.randomPlaceholders[Math.floor(Math.random() * this.randomPlaceholders.length)];
    }
    
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

    hideLoginWindow()
    {
        this.mainWindow.remove();
    }

    async handleLogin()
    {
        return new Promise((res, rej) => 
        {
            
            this.loginButton.addEventListener("click", (e) => 
            {
                const val = this.handleInput();
                if (val)
                {
                    this.hideLoginWindow();
                    res(val);
                }
            });
        

        })
    }
}

export const loginHandler = new LoginHandler();
