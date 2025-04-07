import { avatarManager } from "./avatars.js";

export class User 
{
    /**
     * @param {Object} user - объект чата
     * @param {HTMLElement} chatList - контейнер для чатов
     * @param {HTMLElement} sibling 
     */

    constructor(user, chatList, sibling = null)
    {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${user.isGroup ? 'group' : 'user'}`;
        chatItem.dataset.userId = String(user.id);
        
        // ищем ID собеседника
        if (!user.isGroup && user.users && user.users.length > 0) 
        {
            // получаем ID текущего пользователя от ChatManager
            const currentUserId = window.chatManager?.currentUserId;
            if (currentUserId) 
            {
                // ищем пользователя, который НЕ является текущим
                const companion = user.users.find(us => String(us.id) !== String(currentUserId));
                if (companion) 
                {
                    chatItem.dataset.companionId = String(companion.id);
                    //console.log(`Установлен companionId: ${companion.id} для чата ${user.id}`);
                }
            }
        }
        //console.log(user);

        // разметка профиля пользователя
        chatItem.innerHTML = `
            <div class="profile-info"> 
                <div class="avatar">
                    <img src="${avatarManager.getAvatarPath(user.id)}" alt="Аватар ${user.isGroup ? 'группы' : 'пользователя'}">
                </div>
                ${!user.isGroup ? '<div class="status-indicator"></div>' : ''}
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
            const statusIndicator = chatItem.querySelector('.status-indicator');
            //console.log(user);
            //console.log(user.online);
            statusIndicator.classList.add(user.online ? 'online' : 'offline');
        }
        if (sibling)
            document.body.insertBefore(chatItem, sibling)
        else
            chatList.append(chatItem);
    }
}