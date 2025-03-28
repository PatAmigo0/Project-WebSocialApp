/*TODO: перенести логику модального окна из chat.js сюда */
export class ModalWindowHandler
{
    constructor()
    {
        this.users = {};
        
        this.modalWindow = document.querySelector('.modal-window')
        this.modalCloseButton = this.modalWindow.querySelector('.close-button');
        this.settingsPanel = document.querySelector('#settingsPanel');

        this.init()
    }

    init()
    {
        this.setupEventListeners();
    }

    setupEventListeners()
    {
       // ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
       this.modalCloseButton.addEventListener('click', () => 
        {
            console.log("test");
            this.toggleModalWindow();
        });
    }

    // включение / выключение окна с текущими пользователями
    toggleModalWindow()
    {
        this.modalWindow.classList.toggle('active');
        
        if (this.modalWindow.classList.contains('active'))
        {
            // на всякий если пользователь нажмет на настройки и на добавление чата
            if (this.settingsPanel.classList.contains('active'))
            {
                this.settingsPanel.classList.remove('active'); 
                this.settingsWereOpened = true;
            }
                
            document.body.style.overflow = "hidden";

            this.fetchOnlineUsers();
        }
        else 
        {
            if (this.settingsWereOpened) 
                {
                    this.settingsPanel.classList.toggle('active'); 
                    this.settingsWereOpened = false;
                }
            else document.body.style.overflow = "";
        }
    }

    createUserElement()
    {

    }

    /*TODO: получаем ВСЕХ онлайн пользователей */
    fetchOnlineUsers()
    {

    }

    searchUsers()
    {

    }
}