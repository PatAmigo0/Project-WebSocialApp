const WebSocket     = require("ws");
const WebSocketData = require("../model/webSocketData");
const userService   = require("../service/userService");
const convService   = require("./convService");
const User          = require("../model/user");
const { ConversationShort, NewMessage } = require("../model/conversation");

const CLIENTS = new Map();



/**
 * 
 * @param {User} user 
 * @param {WebSocketData} webSocketData 
 */
function broadcast(user, webSocketData) {
    CLIENTS.forEach((stream, userId) => {
        if (userId !== user.id && stream.readyState === WebSocket.OPEN) {
            stream.send(JSON.stringify(webSocketData));
        }
    });
}

/**
 * 
 * @param {User} user 
 * @param {Array<String>} toUsers 
 * @param {WebSocketData} webSocketData 
 */
function broadcastToUsers(user, toUsers, webSocketData) {
    toUsers.forEach(e => {
        if (e != user.id && CLIENTS.has(e) && CLIENTS.get(e).readyState === WebSocket.OPEN) {
            CLIENTS.get(e).send(JSON.stringify(webSocketData));
        }
    })
}

/**
 * On user connected to WS
 * @param {WebSocket} stream
 * @param {User} user WS local
 * @param {User} data
 */
function newUserHandler(stream, user, data) {
    const newUser = userService.getById(data.id);

    // close connection if user not exist or online
    if (!newUser || newUser.online) {
        stream.close();
        return;
    }

    // link websocket stream to user id
    CLIENTS.set(newUser.id, stream);
    // change user status to online
    newUser.online = true;
    // save websocket local data for this user
    user.id = newUser.id;

    console.log(`User ${newUser.name} connected via WS`);

    broadcast(user, new WebSocketData(
        WebSocketData.Type.NEW_USER,
        newUser
    ));
}

/**
 * 
 * @param {WebSocket} stream 
 * @param {User} user 
 * @param {ConversationShort} data 
 */
function newConvHandler(stream, user, data) {
    const conv = convService.getById(data.id);

    if (!conv) {
        return;
    }

    broadcastToUsers(user, conv.users, new WebSocketData(
        WebSocketData.Type.NEW_CONV,
        conv
    ));
}

/**
 * 
 * @param {WebSocket} stream 
 * @param {User} user 
 * @param {NewMessage} data 
 */
function newMessHandler(stream, user, data) {
    if (convService.addMessage(data)) {
        const conv = convService.getFullById(data.convId);
        broadcastToUsers(user, conv.users, new WebSocketData(
            WebSocketData.Type.NEW_MESS,
            data
        ));
    }
}



module.exports = {
    onMessage: (stream, user, message) => {
        const wsData = WebSocketData.fromJsonString(message);

        switch (wsData.type) {
            case WebSocketData.Type.NEW_USER:
                newUserHandler(stream, user, wsData.data);
                break;
            case WebSocketData.Type.NEW_CONV:
                newConvHandler(stream, user, wsData.data);
                break;
            case WebSocketData.Type.NEW_MESS:
                newMessHandler(stream, user, wsData.data);
        }
    },

    onClose: (stream, user) => {
        if (!CLIENTS.has(user.id)) {
            return;
        }

        const offlineUser = userService.getById(user.id);

        if (offlineUser && offlineUser.online) {
            CLIENTS.delete(user.id);
            offlineUser.online = false;
            
            console.log(`User ${offlineUser.name} disconnected`);

            broadcast(user, new WebSocketData(
                WebSocketData.Type.REM_USER,
                offlineUser
            ));
        }
    }
}