export class User 
{
    constructor(user, chatList)
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

        chatList.append(chatItem);
    }
}