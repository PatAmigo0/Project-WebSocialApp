export class Message
{
    /**
     * @param {string} messageText - текст сообщения
     * @param {string} type - тип сообщения
     * @param {HTMLElement} messagesContainer - контейнер для сообщений
     * @param {HTMLInputElement} messageInput - поле для ввода сообщения
     */ 
    
    constructor(messageText, type, messagesContainer, messageInput)
    {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${type}`;
        messageElement.textContent = messageText;
        
        messagesContainer.append(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
