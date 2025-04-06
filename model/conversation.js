const User = require("./user");

/**
 * Сообщение чата.
 * Для хранения в БД. В таком случае поле sender
 * хранит id пользователя-отправителя.
 */
class Message {
    /**
     * 
     * @param {User|String} sender
     * @param {Date} date
     * @param {String} text
     */
    constructor(sender, date, text) {
        this.sender = sender;
        this.date = date;
        this.text = text;
    }

    /**
     * 
     * @param {NewMessage} message 
     */
    static fromNewMessage(message) {
        return new Message(
            message.sender,
            message.date,
            message.text
        );
    }
}

/**
 * Сообщение чата.
 * Для передачи по WebSocket.
 * Если клиент отправляет сообщение, то в поле sender
 * он подставляет свой id.
 * Если сервер отправляет сообщение получателям, то в
 * поле sender он помещает объект User отправителя.
 */
class NewMessage extends Message {
    /**
     * 
     * @param {String} convId
     * @param {User|String} sender
     * @param {Date} date 
     * @param {String} text 
     */
    constructor(convId, sender, date, text) {
        super(sender, date, text);
        this.convId = convId;
    }
}

/**
 * Беседа.
 * Отправляется сервером по запросу клиента. Содержит
 * полную информацию о беседе (включая историю сообщений).
 */
class Conversation {
    /**
     * 
     * @param {String} id
     * @param {String} name
     * @param {Array<User>} users
     * @param {Array<Message} messages
     */
    constructor(id, name, users, messages) {
        this.id = id;
        this.name = name;
        this.users = users;
        this.messages = messages;
    }

    /**
     * 
     * @returns {ConversationMeta}
     */
    getMeta() {
        return new ConversationMeta(this.id, this.name, this.users, this.messages.at(-1));
    }
}

/**
 * Беседа. Чуть краткий вариант.
 * Отправляется сервером по запросу клиента. Содержит
 * информацию о беседе без истории сообщений (только последнее
 * отправленное).
 */
class ConversationMeta extends Conversation {
    /**
     * 
     * @param {String} id
     * @param {String} name
     * @param {Array<User>} users
     * @param {Message} lastMessage
     */
    constructor(id, name, users, lastMessage) {
        super(id, name, users, Array.of(lastMessage ? [lastMessage] : []));
    }
}

/**
 * Беседа. Краткий вариант.
 * Используется для хранения в БД.
 */
class ConversationShort {
    /**
     * 
     * @param {String} id
     * @param {String} name
     * @param {Array<String>} usersIds
     * @param {Array<Message>} messages
     */
    constructor(id, name, usersIds, messages) {
        this.id = id;
        this.name = name;
        this.users = usersIds;
        this.messages = messages;
    }
}

/**
 * Для создания новой беседы.
 * Используется клиентом.
 */
class NewConversation {
    /**
     * 
     * @param {String} name 
     * @param {Array<String>} usersIds id участников беседы
     */
    constructor(name, usersIds) {
        this.name = name;
        this.usersIds = usersIds;
    }
}

module.exports = { Message, NewMessage, Conversation, ConversationMeta, ConversationShort, NewConversation };