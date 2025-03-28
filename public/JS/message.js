export class Message
{
    constructor(messageText, type, messagesContainer, messageInput)
    {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${type}`;
        messageElement.textContent = messageText;
        
        messagesContainer.append(messageElement);
        messageInput.value = "";
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendMesage()
    {
        
    }
}
