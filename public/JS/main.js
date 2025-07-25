/* ИМПОРТЫ */
import { loginHandler } from "./login.js";
import { modalWindowHandler } from "./modal.js";
import { errorHandler } from "./error.js";

/////////////////////////////////////////

// if (window.innerWidth > 1000)
//     {
//         const button = document.getElementById("Button_back");
    
//         button.style.display = "none";
//     }

/////////////////////////////////////

const USER = {
    id: "",
    name: ""
};

const WS_HANDLERS = {
    [WebSocketConnector.Type.NEW_USER]: onNewUser,
    [WebSocketConnector.Type.REM_USER]: onLeaveUser,
    [WebSocketConnector.Type.NEW_CONV]: onNewConversation,
    [WebSocketConnector.Type.NEW_MESS]: onNewMessage
}

const WS_CONNECTOR = new WebSocketConnector();

window.addEventListener('load', () => 
{
    // Здесь стартуем или Math.PI...
    startLogin(true);
    // Тут может быть какой-нибудь код, не касающийся работы с сервером
});

async function startLogin(check = false)
{
    USER.name = await loginHandler.handleLogin(check);
    login(USER.name, onLoginSuccess, onLoginError);
}

/**
 * Функция, вызываемая автоматически при входе/регистрации 
 * нового пользователя
 * @param {String} userId id пользователя
 */
function onLoginSuccess(userId) {
    loginHandler.hideLoginWindow();
    localStorage.setItem("lastLogin", USER.name);
    window.chatManager.setCurrentUser(userId);
    window.chatManager.loadCookies();
    console.log(`User id: ${userId}`);
    USER.id = userId;

    // loadOnlineUsers(onLoadOnlineUsers);
    window.chatManager.handleLoading();
    WS_CONNECTOR.register(USER, WS_HANDLERS);
}

/**
 * не смог понять как использовать loadOnlineUsers в других скриптах, сделал так
 * @param {*} callback 
 */
export function publicLoadOnlineUsers(callback)
{
    console.log("пытаюсь загрузить онлайн пользователей...");
    loadOnlineUsers(callback);
}

/**
 * Функция, вызываемая автоматически, если пользователь 
 * уже онлайн или имя пользователя пустое
 * @param {String} errorText текст ошибки (для разработчика)
 */
function onLoginError(errorText) {
    console.error(`Login error: ${errorText}`);
    loginHandler.loginError(errorText);
    startLogin();
}

/**
 * Функция, вызываемая автоматически после загрузки
 * списка онлайн пользователей
 * @param {Array<User>} users
 */
function onLoadOnlineUsers(users) 
{
    console.log("Online users:");
    console.log(users);
}

/**
 * Функция, вызываемая автоматически после загрузки
 * бесед для текущего пользователя
 * @param {Array<ConversationMeta>} conversations
 */
function onLoadConversations(conversations, callback) {
    console.log("Conversations:")
    console.log(conversations);
    window.chatManager.handleLoadedConversations(conversations);
        
}

/**
 * Функция, вызываемая автоматически, когда появляется
 * новый онлайн-пользователь
 * @param {User} user
 */
function onNewUser(user) {
    //console.log(`New online user: ${user.name}`);
    modalWindowHandler.handleNewOnlineUser(user)
    window.chatManager.handleNewUser(user);
}

/**
 * Функция, вызываемая автоматически, когда какой-либо
 * пользователь выходит из онлайна
 * @param {User} user
 */
function onLeaveUser(user) {
    //console.log(`User ${user.name} left`);
    modalWindowHandler.handleUserLeft(user.id);
    window.chatManager.handleLeaveUser(user);
}

/**
 * Функция, вызываемая автоматически, когда кто-то создал 
 * новую беседу с текущим пользователем
 * @param {ConversationShort} conversation 
 */
function onNewConversation(conversation) {
    //console.log("New conversation:");
    console.log(conversation);
}

/**
 * Функция, вызываемая автоматически, когда кто-то
 * прислал сообщение
 * @param {NewMessage} message
 */
function onNewMessage(message) {
   // console.log("New message received from server:");
   // console.log(message);
    window.chatManager.handleReceivedMessage(message);
}

/**
 * Функция для создания новой беседы
 * @param {NewConversation} conversation 
 */
export function tryCreateNewConversation(conversation) 
{
    conversation.usersIds.push(USER.id);

    createConversation(
        conversation, 
        onCreateConversationSuccess, 
        onCreateConversationError
    );
}

/**
 * Функция, вызываемая автоматически, если беседа
 * была успешно создана
 * @param {String} convId id новой беседы
 */
function onCreateConversationSuccess(convId) {
    console.log(`Conversation created with id ${convId}`);
    WS_CONNECTOR.sendNewConversation(convId);
    tryLoadConversation(convId, createConversationByIdAfterSuccess);

}

/**
 * Функция, вызываемая автоматически, если беседа
 * не была создана из-за ошибки
 * @param {String} error 
 */
function onCreateConversationError(errorText) {
    console.error(`Create conversation error: ${errorText}`);
    errorHandler.toggleErrorWindow("ЭТОТ ПОЛЬЗОВАТЕЛЬ ИЛИ ВЫ ПРЕВЫСИЛИ МАКСИМУМ ЧАТОВ (30 чатов).");
}

/**
 * Функция для загрузки полной информации о беседе
 * @param {*} convId 
 */
export function tryLoadConversation(convId, callback = onLoadConversationByIdSuccess) 
{
    loadConversationById(convId, callback);
}

export function tryLoadAllConversation(callback)
{
    loadAllConversations(onLoadConversations, callback);
}

/**
 * Функция, вызываемая автоматически после успешной
 * загрузки полной информации о беседе
 * @param {Conversation} conversation 
 */
function onLoadConversationByIdSuccess(conversation) {
    console.log("Conversation by id:");
    console.log(conversation);
}

/**
 * Функция, вызываемая автоматически после успешной
 * загрузки полной информации о беседе для ее последующего создания
 * @param {Conversation} conversation 
 */
function createConversationByIdAfterSuccess(conversation)
{
    window.chatManager.handleNewConservation(conversation);
    console.warn("rerendering users...");
}

/**
 * Функция, вызываемая автоматически, если не удалось
 * загрузить полную информацию о беседе
 * @param {String} errorText 
 */
function onLoadConversationByIdError(errorText) {
    console.error(`Load conversation by id error: ${errorText}`);
}

/**
 * Функция для отправки сообщения
 * @param {String} convId id беседы
 * @param {String} text текст сообщения
 */
export function sendMessage(convId, text) {
    WS_CONNECTOR.sendNewMessage({
        convId: convId,
        sender: USER.id,
        date: new Date(),    // TODO: для даты нужно задать формат + часовой пояс проверить
        text: text
    });
}

function test() 
{
   /* console.log("TEST: create conversation with user 500");
    tryCreateNewConversation({
        name: "TEST",
        usersIds: ["300", "100", "200"]
    });
    */

    console.log("TEST: get full info about conversation 200");
    tryLoadConversation("200");

    console.log("TEST: send message to conv 200");
    sendMessage("200", "EEE");
}