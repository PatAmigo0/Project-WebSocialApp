import { avatarManager } from './avatars.js';
import { Message } from './message.js';

export class ChatManager 
{
    constructor(users) 
    {
        this.users = users;
        this.currentUser = null;
        this.settingsWereOpened = false;

        this.chatList = document.querySelector('.chat-list');
        this.chatWindow = document.querySelector('.main-chat');
        this.modalWindow = document.querySelector('.modal-window')
        this.modalCloseButton = this.modalWindow.querySelector('.close-button');
        this.settingsPanel = document.querySelector('#settingsPanel');

        console.log(this.modalWindow);

        this.init();
    }

    init() 
    {
        this.renderUsers();
        this.setupEventListeners();
    }

    // рендер всех пользователей
    renderUsers() 
    {
        const addChatButton = this.chatList.querySelector('.add-chat-button').parentElement;
        this.chatList.innerHTML = '';

        // тест рендера всех пользователей
        this.users.forEach(user => 
        {
            this.chatList.append(this.createUserElement(user));
            // устанавливаем аватар через AvatarManager
            avatarManager.setAvatar(user.id, null, user.isGroup);
        });
        this.chatList.append(addChatButton);
    }

    // создание элемента чата (пользователя или группы)
    createUserElement(user) 
    {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${user.isGroup ? 'group' : 'user'}`;
        chatItem.dataset.userId = user.id;

        // разметка профиля пользователя
        chatItem.innerHTML = `
            <div class="profile-info"> 
                <div class="avatar">
                    <img src="images/avatars/default/default-avatar.png" alt="Аватар ${user.isGroup ? 'группы' : 'пользователя'}">
                </div>
                ${!user.isGroup ? '<div class="status"><p>онлайн</p></div>' : ''}
                
            </div>

            <div class="chat-info">
                <div class="chat-header">
                    <div class="chat-name"><p>${user.name}</p></div>
                    <div class="chat-time"><p>${user.time}</p></div>
                </div>

                <div class="chat-preview">
                    <div class="last-message">${user.lastMessage}</div>
                    ${(user.unreadCount > 0) ? `<div class="unread-count"><span>${user.unreadCount}</span></div>` : ''}
                </div>
            </div>
        `;

        // настройка некоторых элементов
        if (!user.isGroup)
        {
            const status = chatItem.querySelector('.status');
            status.classList.add(user.online ? 'online' : 'offline');
            status.querySelector('p').textContent = user.online ? 'онлайн' : 'оффлайн';
        }

        return chatItem;
    }

    // установка слушателей событий (удобно для подписывания на события)
    setupEventListeners() 
    {
        // ОБРАБОТКА КЛИКА ПО ЧАТУ
        this.chatList.addEventListener('click', (e) => 
        {
            const chatItem = e.target.closest('.chat-item');
            if (chatItem && !chatItem.querySelector('.add-chat-button')) 
            {
                if (chatItem.className.includes('active'))
                {
                    this.disableActiveChat(); // если дважды тыкнул по активному чату то выключать его
                    return;
                }

                chatItem.className.includes('group') // если группа то обрабатываем соответствующим образом
                ? this.selectUser(String(chatItem.dataset.userId)) 
                : this.selectUser(parseInt(chatItem.dataset.userId));

                this.updateChatWindow();
            }
            else if (chatItem && chatItem.querySelector('.add-chat-button'))
                this.toggleModalWindow(); // открываем модальное окно (для выбора онлайн пользователей)
            else 
                this.disableActiveChat(); // если попал за пределы конактов и кнопки то закрывать чат
        });


        // ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
        this.modalCloseButton.addEventListener('click', () => 
        {
            this.toggleModalWindow();
        });


    }

    // выбор пользователя
    selectUser(userId) 
    {
        const user = this.users.find((u) => 
        {
            return u.isGroup 
                ? (String(u.id) === String(userId)) 
                : (Number(u.id) === Number(userId));
        });
        
        if (user) 
        {
            this.currentUser = user;
            this.updateChatHeader(user);
            this.updateActiveChat(userId);
            document.querySelector('.main-chat').classList.add('chat-selected');
        }
    }

    // обновление главной страницы с чатом
    updateChatWindow()
    {
        /*TODO: получение последних сообщений и обновление страницы */
    }

    // обновление заголовка чата
    updateChatHeader(user) 
    {
        const chatHeader = document.querySelector('.main-chat .chat-header');
        const avatar = chatHeader.querySelector('.avatar');
        const name = chatHeader.querySelector('.chat-name p');

        avatar.innerHTML = `<img src="${avatarManager.getAvatarPath(user.id, user.isGroup)}" alt="Аватар ${user.isGroup ? 'группы' : 'пользователя'}">`;
        console.log(avatarManager.getAvatarPath(user.id, user.isGroup));
        name.textContent = user.name;
    }

    // обновление активного чата
    updateActiveChat(userId) 
    {
        this.disableActiveChat();

        // добавляем класс active выбранному чату
        const selectedChat = this.chatList.querySelector(`[data-user-id="${userId}"]`);
        if (selectedChat)
            selectedChat.classList.toggle('active');
    }

    // функция для безопасного скрытия текущего чата
    disableActiveChat()
    {
        // убираем класс active у всех чатов и у окна чата
        this.chatList.querySelectorAll('.chat-item').forEach(chat => 
        {
            chat.classList.remove('active');
        });

        this.chatWindow.classList.remove('chat-selected');
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

            // подписываемся на событие на клик мимо экрана

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

    /*TODO: получаем ВСЕХ онлайн пользователей */
    fetchOnlineUsers()
    {

    }

    /*TODO: функция для добавления нового пользователя в список чатов */
    addNewChat() 
    {
        console.log('Добавление нового чата');
    }

    // поиск чатов
    searchChats(query) 
    {
        const searchTerm = query.toLowerCase();
        document.querySelectorAll('.chat-item:not(:has(.add-chat-button))').forEach(item => 
        {
            const chatName = item.querySelector(".chat-name").textContent.toLowerCase();
            const lastMessage = item.querySelector(".last-message").textContent.toLowerCase();

            item.style.display = (chatName.includes(searchTerm) 
            || lastMessage.includes(searchTerm)) ? "grid" : "none";
        });
    }

    searchUsers()
    {

    }
}