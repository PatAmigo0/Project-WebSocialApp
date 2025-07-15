export class MobileHandler
{
    constructor()
    {
        /* стили */
        this.savedCloseStyle = document.createElement('style');
        this.savedCloseStyle.textContent = 
        `
            @media(max-width: 1000px)
            {
                .chat-container 
                {
                    grid-template-columns: 1fr 0px;
                }
            }
        `;

        this.savedOpenStyle = document.createElement('style');
        this.savedOpenStyle.textContent = `
            @media(max-width: 1000px)
            {
                .chat-container 
                {
                    grid-template-columns: 0px 1fr;
                }
            }
        `;

        /* элементы DOM страницы */
        this.returnButton = document.getElementById("Button_back");
        this.setupEventListeners();
    }

    setupEventListeners()
    {
        this.returnButton.addEventListener('click', () => 
        {
            this.close();
        });
    }

    close()
    {
        document.head.appendChild(this.savedCloseStyle);
        window.chatManager.disableActiveChat();
    }

    open()
    {
        document.head.appendChild(this.savedOpenStyle);
    }
}

export const mobileHandler = new MobileHandler();