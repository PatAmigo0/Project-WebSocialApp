import { publicLoadOnlineUsers } from "./main.js";
import { tryCreateNewConversation } from "./main.js";
import { modalUser } from "./modalUser.js";

/* Слова */
import { wordsFirst } from "./words.js";
import { wordsSecond } from "./words.js";

export class ModalWindowHandler
{
    constructor()
    {   
        this.users = new Set();
        this.elements = new Map();

        this.modalWindow = document.querySelector('.modal-window')
        this.modalContent = this.modalWindow.querySelector('.modal-content');
        this.modalElements = this.modalContent.querySelector('.modal-elements');
        this.modalCloseButton = this.modalWindow.querySelector('.close-button');
        this.settingsPanel = document.querySelector('#settingsPanel');

        this.addButton = this.modalWindow.querySelector(".add-user-button");
        this.nameInput = this.modalContent.querySelector("#chat-name-input");
        this.searchUsersBox = this.modalContent.querySelector("#user-search");

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
            if (!this.elements.get(user.id))
                new modalUser(user, this.modalElements, 
                    (userElement) => this.elements.set(user.id, userElement), 
                    (toggled) => this.handleToggledUser(user.id, toggled)
                );
        }
    }

    handleUserLeft(userId)
    {
        const us = this.elements.get(userId);
        if (us)
        {
            us.remove();
            console.log(this.elements)
            this.elements.delete(userId);
        }

        if (this.users.size > 0)
            this.addButton.classList.add("active");
        else
            this.addButton.classList.remove("active");
    }

    /**
     * 
     * @param {string} userId 
     * @param {boolean} toggled
     */
    handleToggledUser(userId, toggled)
    {
        if (toggled)
            this.users.add(userId);
        else
            this.users.delete(userId);

        if (this.users.size > 0)
            this.addButton.classList.add("active");
        else
            this.addButton.classList.remove("active");
    }

    // инициализация событий
    setupEventListeners()
    {
       // ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
       this.modalCloseButton.addEventListener('click', () => this.toggleModalWindow());

        this.addButton.addEventListener('click', () => 
        {
            tryCreateNewConversation({
                name: this.nameInput.value.length > 0 ? this.nameInput.value : this.generateRandomName(),
                usersIds: this.users.values().toArray()
            });
            this.toggleModalWindow();
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
            this._reset();
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
                new modalUser(user, this.modalElements, 
                    (userElement) => this.elements.set(user.id, userElement), 
                    (toggled) => this.handleToggledUser(user.id, toggled)
                );
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

    generateRandomName()
    {
        const firstWord = wordsFirst[Math.floor(Math.random() * wordsFirst.length)];
        const secondWord = wordsSecond[Math.floor(Math.random() * wordsSecond.length)];

        return `${firstWord} ${secondWord}`;
    }

    _reset()
    {
        this.nameInput.value = "";
        this.modalElements.innerHTML = ""; // ресетаем
        this.addButton.classList.remove("active");
        this.users.clear();
        this.elements.clear();
    }
}

export const modalWindowHandler = new ModalWindowHandler();