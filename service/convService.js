const db            = require("../db/ramDb");
const conversations = db.getConversations();
const userService   = require("./userService");
const { 
    ConversationShort, 
    ConversationMeta, 
    Message, 
    Conversation, 
    NewMessage, 
    NewConversation 
} = require("../model/conversation");

const MAX_CONVERSATIONS_MEM = 30;
const MAX_MESSAGES_MEM = 50; // вместимость памяти

/**
 * 
 * @param {ConversationShort} convShort 
 * @returns {ConversationMeta}
 */
function shortConvToMeta(convShort) {
    return new ConversationMeta(
        convShort.id,
        convShort.name,
        Array.from(convShort.users.map(e => userService.getById(e))),
        convShort.messages.length > 0 ? shortMessageToFull(convShort.messages.at(-1)) : null
    )
}

/**
 * 
 * @param {ConversationShort} convShort 
 * @returns {Conversation}
 */
function shortConvToFull(convShort) {
    return new Conversation(
        convShort.id,
        convShort.name,
        Array.from(convShort.users.map(e => userService.getById(e))),
        convShort.messages.map(e => shortMessageToFull(e))
    )
}

/**
 * 
 * @param {Message} message 
 */
function shortMessageToFull(message) {
    return new Message(
        userService.getById(message.sender?.id ? message.sender.id : message.sender),
        message.date,
        message.text
    );
}

/**
 * 
 * @param {NewConversation} conversation 
 * @returns {Boolean}
 */
function isUnique(conversation) {
    return conversations.find(e => {
        e.id == conversation.id || e.name == conversation.name
    }) == undefined;
}

/**
 * 
 * @param {NewConversation} conversation 
 * @returns {Boolean}
 */
function checkUsers(conversation) {
    let i = 0;
    while (i < conversation.usersIds.length) {
        if (userService.getById(conversation.usersIds[i]) == null) {
            return false;
        }
        i++;
    }
    return true;
}

function findById(id) {
    return conversations.find(e => e.id == id);
}


module.exports = {
    /**
     * 
     * @param {String} userId 
     * @returns {Array<ConversationMeta>}
     */
    getAllForUser: (userId) => {
        return conversations
            .filter(e => e.users.includes(userId))
            .map(e => shortConvToMeta(e));
    },

    /**
     * 
     * @param {String} id 
     * @returns 
     */
    getById: (id) => {
        return findById(id);
    },

    /**
     * 
     * @param {String} id 
     * @returns {Conversation}
     */
    getFullById: (id) => {
        const conv = findById(id);

        if (conv) {
            return shortConvToFull(conv);
        }

        return null;
    },

    /**
     * 
     * @param {NewConversation} conversation 
     * @returns {String} uuid
     */
    create: (conversation) => {
        if (conversations.length < MAX_CONVERSATIONS_MEM)
            if (isUnique(conversation) && checkUsers(conversation)) {
                const conv = new ConversationShort(
                    db.generateId(),
                    conversation.name,
                    conversation.usersIds,
                    []
                );
                conversations.push(conv);
                return conv.id;
            }

        return null;
    },

    /**
     * @param {String} convId
     * @param {NewMessage} message 
     */
    addMessage: (message) => {
        const conv = findById(message.convId);
        const sender = userService.getById(message.sender);

        if (conv && sender) {
            if (conv.messages.length >= MAX_MESSAGES_MEM)
                conv.messages.shift()

            message.sender = sender;
            const resultM = Message.fromNewMessage(message);
            conv.messages.push(resultM);
            return true;
        }

        return false;
    },

    sort: (conv) =>
    {
        if (!(conversations[0] == conv))
        {
            const index = conversations.indexOf(conv);
            conversations.unshift(conversations[index]);
            conversations.splice(index+1, 1);
        }
    }
}