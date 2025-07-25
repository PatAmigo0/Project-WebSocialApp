
const elements = 
{
    root: document.documentElement,
    messagesContainer: document.querySelector('.messages-container'),
};

//////////////////////////////////////////////////////////////////////////////////////////

import { ThemeManager } from './theme.js';
import { ChatManager } from './chat.js';
import { SettingsHandler } from './settings.js';
import './chatInfo.js';
//import users from './users.js';


// глобальные переменные для менеджеров
let themeManager;
let chatManager;
let settingsHandler;


function init()
{
    if (localStorage.getItem("clearCookiesPending"))
        localStorage.clear();

    console.log(localStorage);
    //console.log(document.location.protocol);
    themeManager = new ThemeManager(elements.root, elements.messagesContainer);
    // загружаем сохраненную тему и градиент
    themeManager.loadTheme();    
    
    window.chatManager = new ChatManager(); // после загрузки стилей для правильной обработки аватаров
    settingsHandler = new SettingsHandler(elements.root, themeManager, chatManager);
    // загружаем сохраненные настройки
    settingsHandler.loadSavedSettings();
    
    // настраиваем сохранение при закрытии
    initUnload();
    loadIcon();
}

function initUnload() 
{
    window.addEventListener("beforeunload", () => 
    {
        themeManager.saveTheme();
        window.chatManager.cook();
    });
}

function loadIcon()
{
    const icons = ['a.png', 'd.png', 'y.png'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    
    // удаляем существующие favicon чтобы не было наложения
    document.querySelectorAll('link[rel="icon"]').forEach(link => link.remove());

    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = `images/favicons/${randomIcon}`;

    document.head.appendChild(link);
}

if (document.readyState === 'loading')
    document.addEventListener("DOMContentLoaded", init);
else 
    init();
