/*TODO: перенести логику модального окна из chat.js сюда */
import { publicLoadOnlineUsers } from "./main.js";

export class ModalWindowHandler
{
    constructor()
    {   
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

            publicLoadOnlineUsers(users => this.fetchOnlineUsers(users));
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

    fetchOnlineUsers(users)
    {
        console.log(users);
    }

    renderOnlineUsers()
    {

    }

    createUserElement()
    {

    }



    searchUsers()
    {

    }
}