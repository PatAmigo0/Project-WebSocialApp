export class Message
{
    /**
     * @param {string} messageText - текст сообщения
     * @param {string} type - тип сообщения
     * @param {HTMLElement} messagesContainer - контейнер для сообщений
     * @param {HTMLInputElement} messageInput - поле для ввода сообщения
     * @param {HTMLInputElement} name - имя пользователя
     */ 
    
    constructor(messageText, type, messagesContainer, messageInput, name)
    {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${type}`;
        messageElement.textContent = messageText;

        if (type === "received") 
            {
                console.log("received_massege");
                const message_name = document.createElement("div");
                message_name.className = `messege-received_name`;
                message_name.textContent = name;
                messagesContainer.append(message_name);
            }
        
        messagesContainer.append(messageElement);
        messageInput.value = "";
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
