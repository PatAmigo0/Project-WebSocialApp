import { avatarManager } from "./avatars.js";

const urlRegex = /(https?:\/\/[^\s]+)/g;

function parseUrl(text) 
{
    const parts = text.split(urlRegex);
    const fragment = document.createDocumentFragment();
    
    parts.forEach(part => 
    {
        if (urlRegex.test(part)) 
        {
            const link = document.createElement('a');
            link.href = part;
            link.textContent = part;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            fragment.append(link);
        }
        else 
            fragment.append(document.createTextNode(part));
    });
    
    return fragment;
}

export class Message 
{
    /**
    * @param {string} messageText - текст сообщения
    * @param {string} type - тип сообщения
    * @param {HTMLElement} messagesContainer - контейнер для сообщений
    * @param {HTMLInputElement} messageInput - поле для ввода сообщения
    */ 
    constructor(messageText, type, messagesContainer, callback) 
    {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${type}`;
        
        messageElement.append(parseUrl(messageText));
        messagesContainer.append(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        if (callback)
            callback(messageElement);
    }

    buildHeader(fragment, id)
    {
        const mainDiv = document.createElement("div");
        mainDiv.dataset.senderId = id;
        mainDiv.classList.add("message-container");
        mainDiv.innerHTML = `
            <div class="avatar-info">
                <div class="avatar"> <img src="${avatarManager.getAvatarPath(id)}" alt="Аватар пользователя"> </div>
            </div>
            <div class="message-info">
                <div class="message-name"></div>
                <div class="messages-history"></div>
            </div>`;
            
        fragment.append(mainDiv);
        return mainDiv;
    }
}

