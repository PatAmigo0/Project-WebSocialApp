const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const User = require('../model/user');
const { ConversationShort, Message } = require('../model/conversation');

const USERS = [];    // User
const CONVS = [];    // ConversationShort


function readJsonFile(filename) {
    const filePath = path.join(__dirname, filename);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

module.exports = {
    /**
     * 
     * @returns {Array<User>}
     */
    getUsers: () => {
        return USERS;
    },

    /**
     * 
     * @returns {Array<ConversationShort>}
     */
    getConversations: () => {
        return CONVS;
    },

    /**
     * 
     * @returns {String} uuid
     */
    generateId: () => {
        return crypto.randomUUID();
    },

    loadTestData: () => {
        const users = readJsonFile("test-users.json");
        users.forEach(e => {
            const u = new User(e.id, e.name);
            u.online = e.online;
            USERS.push(u);
        });

        const convs = readJsonFile("test-conv.json");
        convs.forEach(e => {
            const ms = [];
            e.messages.forEach(m => {
                ms.push(new Message(m.sender, null, m.text))
            });
            CONVS.push(new ConversationShort(e.id, e.name, e.users, ms));
        });
    }
};