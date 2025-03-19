import { avatarManager } from './avatars.js';

export class ChatManager 
{
    constructor(users) 
    {
        this.users = users;
        this.currentUser = null;
        this.chatList = document.querySelector('.chat-list');
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
            // Устанавливаем аватар через AvatarManager
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

        chatItem.innerHTML = `
            <div class="avatar">
                <img src="images/avatars/default/default-avatar.png" alt="Аватар ${user.isGroup ? 'группы' : 'пользователя'}">
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
                chatItem.className.includes('group') // если группа то обрабатываем соответствующим образом
                ? this.selectUser(String(chatItem.dataset.userId)) 
                : this.selectUser(parseInt(chatItem.dataset.userId));
            }
            else if (chatItem && chatItem.querySelector('.add-chat-button'))
            {
                this.addNewChat();
            }
        });
    }

    // выбор пользователя
    selectUser(userId) 
    {
        const user = this.users.find(u => {
            if (u.isGroup) {
                return String(u.id) === String(userId);
            } else {
                return Number(u.id) === Number(userId);
            }
        });
        
        if (user) 
        {
            this.currentUser = user;
            this.updateChatHeader(user);
        }
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
            item.style.display = (chatName.includes(searchTerm) || lastMessage.includes(searchTerm)) ? "grid" : "none";
        });
    }
}