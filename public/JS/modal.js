import { publicLoadOnlineUsers } from "./main.js";
import { tryCreateNewConversation } from "./main.js";
import { modalUser } from "./modalUser.js";

export class ModalWindowHandler
{
    constructor()
    {   
        this.users = new Array();

        this.modalWindow = document.querySelector('.modal-window')
        this.modalContent = this.modalWindow.querySelector('.modal-content');
        this.modalElements = this.modalContent.querySelector('.modal-elements');
        this.modalCloseButton = this.modalWindow.querySelector('.close-button');
        this.settingsPanel = document.querySelector('#settingsPanel');


        this.addButton = this.modalWindow.querySelector(".add-user-button");
        this.nameInput = this.modalContent.querySelector("#chat-name-input");
        this.searchUsersBox = this.modalContent.querySelector(".search-box");
        console.log(this.searchUsersBox);

        this.init()
    }

    init()
    {
        this.setupEventListeners();
    }

    // когда новый пользователь входит в сеть
    handleNewOnlineUser(user) 
    {
        if (this.modalWindow.classList.contains("active"))
        {
            if (!this.modalElements.querySelector(`[data-user-id="${user.id}"]`))
                new modalUser(user, this.modalElements, (toggled) => this.handleToggledUser(user.id, toggled));
            else
                console.warn("Пользователь уже в списке на добавление");
        }
    }

    handleUserLeft(userId)
    {
        this.modalElements.querySelector(`[data-user-id="${userId}"]`)?.remove();
    }

    /**
     * 
     * @param {string} userId 
     * @param {boolean} toggled
     */
    handleToggledUser(userId, toggled)
    {
        if (toggled)
            this.users.push(userId);
        else
        {
            const indexToDelete = this.users.indexOf(userId);
            if (indexToDelete != -1)
                this.users.splice(indexToDelete, 1);
        }

        if (this.users.length > 0)
            this.addButton.classList.add("active");
        else
            this.addButton.classList.remove("active");
    }

    // инициализация событий
    setupEventListeners()
    {
       // ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
       this.modalCloseButton.addEventListener('click', () => 
        {
            this.toggleModalWindow();
        });

        this.addButton.addEventListener('click', () => 
        {
            this.toggleModalWindow();
            tryCreateNewConversation({
                name: this.nameInput.value.length > 0 ? this.nameInput.value : "gay",
                usersIds: this.users
            });
            this.users = new Array();
        });

        this.searchUsersBox.addEventListener('input', (e) => 
        {
            this.searchUsers(e.target.value);
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
            this.nameInput.value = "";
            this.modalElements.innerHTML = ""; // ресетаем
            if (this.settingsWereOpened) 
            {
                this.settingsPanel.classList.toggle('active'); 
                this.settingsWereOpened = false;
            }
            else document.body.style.overflow = "";
        }
    }

    // событие которое запускается автоматически при загрузке пользователей в modalWindowHandler.toggleModalWindow
    fetchOnlineUsers(users)
    {
        console.log(users);
        users.forEach(user => 
        {
            if (user.id != window.chatManager.currentUserId)
                new modalUser(user, this.modalElements, (toggled) => this.handleToggledUser(user.id, toggled));
        });
    }

    /**
     * 
     * @param {string} query 
     */
    searchUsers(query)
    {
        const searchTerm = query.toLowerCase();

        console.log(this.modalElements.querySelectorAll(".modal-element"));
        this.modalElements.querySelectorAll(".modal-element").forEach(element => 
        {
            const userName = element.querySelector(".name").textContent;
            
            element.style.display = userName.includes(searchTerm) ? "grid" : "none";
        });
        //this._handleList()
    }

    /**
     * @param {string} text 
     *  функция которая будет проверять есть ли что-то в списке
     * */
    _handleList(text = "В данный момент никто не в сети... :(")
    {
        console.log(this.modalElements.childNodes.length);
    }
}

export const modalWindowHandler = new ModalWindowHandler();