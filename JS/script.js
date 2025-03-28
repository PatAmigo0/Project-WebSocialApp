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
import users from './users.js';

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

// создаем менеджер темы
const themeManager = new ThemeManager(elements.root, elements.messagesContainer);
const settingsHandler = new SettingsHandler(elements.root, themeManager);

function init()
{
    // загружаем сохраненные настройки
    settingsHandler.loadSavedSettings();
    
    // загружаем сохраненную тему и градиент
    themeManager.loadTheme();
    
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

// инициализируем классы для работы с пользователем
const chatManager = new ChatManager(users);

// настраиваем обработчики событий при загрузке страницы
document.addEventListener("DOMContentLoaded", () => init());
