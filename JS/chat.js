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

    renderUsers() 
    {
        const addChatButton = this.chatList.querySelector('.add-chat-button').parentElement;
        this.chatList.innerHTML = '';
        
        this.users.forEach(user => 
        {
            this.chatList.append(this.createUserElement(user));
        });
        this.chatList.append(addChatButton);
    }

    createUserElement(user) 
    {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.userId = user.id;

        chatItem.innerHTML = `
            <div class="avatar">
                <img src="${user.avatar}" alt="Аватар ${user.isGroup ? 'группы' : 'пользователя'}">
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

    setupEventListeners() 
    {
        this.chatList.addEventListener('click', (e) => 
        {
            const chatItem = e.target.closest('.chat-item');
            if (chatItem && !chatItem.querySelector('.add-chat-button')) 
            {
                this.selectUser(parseInt(chatItem.dataset.userId));
            }
        });

        document.querySelector('.add-chat-button')?.addEventListener('click', () => 
        {
            this.addNewChat();
        });
    }

    selectUser(userId) 
    {
        const user = this.users.find(u => u.id === userId);
        if (user) 
        {
            this.currentUser = user;
            this.updateChatHeader(user);
        }
    }

    updateChatHeader(user) 
    {
        const chatHeader = document.querySelector('.main-chat .chat-header');
        const avatar = chatHeader.querySelector('.avatar');
        const name = chatHeader.querySelector('.chat-name p');

        avatar.innerHTML = `<img src="${user.avatar}" alt="Аватар ${user.isGroup ? 'группы' : 'пользователя'}">`;
        name.textContent = user.name;
    }

    addNewChat() 
    {
        console.log('Добавление нового чата');
    }

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