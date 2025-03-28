const express   = require("express");
const session   = require('express-session');
const http      = require('http');
const WebSocket = require("ws");
const db        = require("./db/ramDb");
const routes    = require("./route/routes");
const User      = require("./model/user");
const wsService = require("./service/wsService");

const PORT = 3000;

const sessionMiddleware = session({
    secret: "its not a secret =(",
    resave: false,
    saveUninitialized: true
});



const app = express();
const httpServer = http.createServer(app);
const wsServer = new WebSocket.Server({ server: httpServer });

db.loadTestData();

app.use(sessionMiddleware);
app.use(express.json());
app.use("/api/v1", routes);
app.use(express.static("public"));



wsServer.on("connection", ws => {
    const user = new User(null, null);

    ws.on("message", (message) => {
        wsService.onMessage(ws, user, message);
    });

    ws.on("close", () => {
        wsService.onClose(ws, user);
    });
});



httpServer.listen(PORT, () => {
    console.log(`Server listening port ${PORT}`);
});