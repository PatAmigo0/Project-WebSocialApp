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
}