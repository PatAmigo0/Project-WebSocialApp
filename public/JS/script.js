// trim() убирает лишние пробелы в начале и конце строки

// основные элементы интерфейса
const elements = 
{
    root: document.documentElement,
    messagesContainer: document.querySelector('.messages-container'),
    //chatItems: document.querySelectorAll(".chat-item:not(:has(.add-chat-button))"),
    //chatContainer: document.querySelector('.chat-container'),
};

//////////////////////////////////////////////////////////////////////////////////////////

import { ThemeManager } from './theme.js';
import { ChatManager } from './chat.js';
import { SettingsHandler } from './settings.js';
//import users from './users.js';

// Глобальные переменные для менеджеров
let themeManager;
let chatManager;
let settingsHandler;

/*
// список возможных ответов для тестирования
const randomResponses = 
[
    "Привет!",
    "Пока!",
    "Секретка",
    "Тестовое сообщение"
];
*/

function init()
{

    console.log(document.location.protocol);
    themeManager = new ThemeManager(elements.root, elements.messagesContainer);
    // загружаем сохраненную тему и градиент
    themeManager.loadTheme();    
    
    window.chatManager = new ChatManager(new Array()); // после загрузки стилей для правильной обработки аватаров
    settingsHandler = new SettingsHandler(elements.root, themeManager, chatManager);
    // загружаем сохраненные настройки
    settingsHandler.loadSavedSettings();
    
    // настраиваем сохранение при закрытии
    initUnload();
}

function initUnload() 
{
    window.addEventListener("beforeunload", () => 
    {
        themeManager.saveTheme();
    });
}

/*
// получаем случайный ответ из списка
function getRandomResponse() 
{
    return randomResponses[Math.floor(Math.random() * randomResponses.length)];
}
*/

// ES modules are executed when imported, so we can call init directly
// or check if the document is already loaded

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", init);
} else {
    // DOM already loaded, run the init function directly
    init();
}

const back_chat = () => 
    {
        const style = document.createElement('style');
        style.textContent = `
            @media(max-width: 1000px)
            {
                .chat-container 
                {
                    grid-template-columns: 1fr 0px;
                }
            }
        `;
        document.head.appendChild(style);
    };
    
    const button_back = document.getElementById("Button_back");
    button_back.addEventListener("click", back_chat);
