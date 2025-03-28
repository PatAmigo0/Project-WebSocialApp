// trim() убирает лишние пробелы в начале и конце строки

// основные элементы интерфейса
const elements = 
{
    root: document.documentElement,
    //chatItems: document.querySelectorAll(".chat-item:not(:has(.add-chat-button))"),
    //chatContainer: document.querySelector('.chat-container'),
};

//////////////////////////////////////////////////////////////////////////////////////////

import { ThemeManager } from './theme.js';
import { NotificationManager } from './notifications.js';
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
    
    initSaved();
    initUnload();
    themeManager.updateGradient();

}


function initSaved() 
{
    // загружаем сохраненные настройки для элементов выбора
    settingsHandler.loadSavedSettings();
    
    // загружаем сохраненную тему
    themeManager.loadTheme();
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


// настраиваем обработчики событий при загрузке страницы
document.addEventListener("DOMContentLoaded", () => init());

// инициализируем классы для работы с пользователем и
const chatManager = new ChatManager(users);
