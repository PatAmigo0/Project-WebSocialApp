function login(username, onSuccess, onError) {
    fetch("/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username })
    }).then(res => {
        if (res.ok) {
            res.json().then(e => {
                onSuccess(e.id);
            });

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
        const protocol = window.location.protocol.endsWith("s:") ? "wss:" : "ws:";
        const port = window.location.port;

        this.#ws = new WebSocket(`${protocol}//${host}${port ? `:${port}` : ""}`);

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
            } else if(data.type === 'server_instance_token') 
            {
                console.log(`secret token: ${data.token}`);  
                sessionStorage.setItem("server_super_secret_token", data.token);  
            }
            else
            {
                console.error(`WS: wrong type: ${data.type}`);
            }
        }
    
        this.#ws.onclose = () => {
            location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            console.log("WebSocket closed");
        };
    }

    /**
     * 
     * @param {NewMessage} message 
     */
    sendNewMessage(message) {
        if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket не подключен. Невозможно отправить сообщение.");
            return;
        }
        
        try {
            this.#ws.send(JSON.stringify({
                type: WebSocketConnector.Type.NEW_MESS,
                data: { ...message }
            }));
            window.chatManager.addMessage({
                convId: message.convId,
                date: message.date,
                sender: {id: message.sender},
                text: message.text
            });
            //console.log("Сообщение успешно отправлено через WebSocket");
        } catch (error) {
            console.error("Ошибка при отправке сообщения через WebSocket:", error);
        }
    }

    /**
     * 
     * @param {ConversationShort} conversation 
     */
    sendNewConversation(id) {
        if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket не подключен. Невозможно отправить информацию о новой беседе.");
            return;
        }
        
        try {
            this.#ws.send(JSON.stringify({
                type: WebSocketConnector.Type.NEW_CONV,
                data: { id: id }
            }));
            //console.log("Информация о новой беседе успешно отправлена через WebSocket");
        } catch (error) {
            console.error("Ошибка при отправке информации о новой беседе через WebSocket:", error);
        }
    }
}