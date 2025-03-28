function login(username, onSuccess, onError) {
    fetch("/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username })
    }).then(res => {
        if (res.ok) {
            res.json().then(e => onSuccess(e.id));
        } else {
            res.json().then(e => onError(e.error));
        }
    });
}

function createConversation(conversation, onSuccess, onError) {
    fetch("/api/v1/conv/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conversation)
    }).then(res => {
        if (res.ok) {
            res.json().then(e => onSuccess(e.id));
        } else {
            res.json().then(e => onError(e.error));
        }
    });
}

function loadOnlineUsers(onSuccess) {
    loadRequest("/api/v1/users/online", onSuccess, (e) => {});
}

function loadAllUsers(onSuccess) {
    loadRequest("/api/v1/users", onSuccess, (e) => {});
}

function loadAllConversations(onSuccess) {
    loadRequest("/api/v1/convs", onSuccess, (e) => {});
}

function loadConversationById(id, onSuccess, onError) {
    loadRequest(`/api/v1/conv?id=${id}`, onSuccess, onError);
}

function loadRequest(url, onSuccess, onError) {
    fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    }).then(res => {
        if (res.ok) {
            res.json().then(e => onSuccess(e));
        } else {
            res.json().then(e => onError(e.error));
        }
    });
}

class WebSocketConnector {
    #ws;

    static Type = Object.freeze({
        NEW_USER: "new-user",
        REM_USER: "rem-user",
        NEW_CONV: "new-conv",
        NEW_MESS: "new-mess"
    });

    constructor() {}

    register(user, handlers) {
        const host = window.location.hostname;
        this.#ws = new WebSocket(`ws://${host}:3000`);

        this.#ws.onopen = () => {
            console.log("Connected to WebSocket");
    
            this.#ws.send(JSON.stringify({
                type: WebSocketConnector.Type.NEW_USER,
                data: { ...user }
            }));
        };
    
        this.#ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
    
            if (data.type in handlers) {
                handlers[data.type](data.data);
            } else {
                console.error(`WS: wrong type: ${data.type}`);
            }
        }
    
        this.#ws.onclose = () => {
            console.log("WebSocket closed");
        };
    }

    /**
     * 
     * @param {NewMessage} message 
     */
    sendNewMessage(message) {
        this.#ws.send(JSON.stringify({
            type: WebSocketConnector.Type.NEW_MESS,
            data: { ...message }
        }));
    }

    /**
     * 
     * @param {ConversationShort} conversation 
     */
    sendNewConversation(id) {
        this.#ws.send(JSON.stringify({
            type: WebSocketConnector.Type.NEW_CONV,
            data: { id: id }
        }));
    }
}