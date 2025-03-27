// trim() убирает лишние пробелы в начале и конце строки

// основные элементы интерфейса
const elements = 
{
    root: document.documentElement,
    settingsPanel: document.getElementById("settingsPanel"),
    messageInput: document.querySelector(".message-input"),
    sendButton: document.querySelector(".send-button"),
    messagesContainer: document.querySelector(".messages-container"),
    themeRadios: document.querySelectorAll(".theme-radio"),
    chatItems: document.querySelectorAll(".chat-item:not(:has(.add-chat-button))"),
    fontSizeSelector: document.querySelector(".font-size"),
    searchBox: document.querySelector(".search-box"),
    mainChat: document.querySelector(".main-chat"),
    addChatButton: document.querySelector(".add-chat-button"),
    chatContainer: document.querySelector('.chat-container'),
    chatList: document.querySelector(".chat-list"),
    settingsButton: document.querySelector('.settings-button'),
    closeSettings: document.querySelector('.settings-close'),
    notificationToggle: document.getElementById('notifications'),
    fontSizeSelect: document.getElementById('font-size')
};

//////////////////////////////////////////////////////////////////////////////////////////

import { Message } from './message.js';
import { ThemeManager } from './theme.js';
import { NotificationManager } from './notifications.js';
import { ChatManager } from './chat.js';
import users from './users.js';
import { avatarManager } from './avatars.js';

// список возможных ответов для тестирования
const randomResponses = 
[
    "Привет!",
    "Пока!",
    "Секретка",
    "Тестовое сообщение"
];

// создаем менеджер темы
const themeManager = new ThemeManager(elements.root);

function init()
{
    
    initMain();
    initSaved();
    initUnload();
    
    // загружаем аватары для всех пользователей
    users.forEach(user => 
    {
        console.log(user);
        avatarManager.setAvatar(user.id, user.avatar, user.isGroup);
    });

    // обновляем градиент фона
    if (elements.messagesContainer) 
    {
        const computedStyle = window.getComputedStyle(elements.messagesContainer);
        const bgImage = computedStyle.backgroundImage;
        elements.messagesContainer.style.backgroundImage = 'none';
        elements.messagesContainer.offsetHeight; // принудительно обновляем стили
        elements.messagesContainer.style.backgroundImage = bgImage;
    }

}

function initMain() 
{

    // на всякий чтобы при загрузке не было по ошибке никакого выбранного чата
    elements.mainChat.classList.remove('chat-selected');

    // обработчики событий инициализация
    const eventHandlers = 
    {
        settings: (e) => 
        {
            e.stopPropagation();
            toggleSettings();
        },

        sendMessage: () => 
        {
            const messageText = elements.messageInput.value.trim();
            if (messageText) 
            {
                new Message(messageText, "sent", elements.messagesContainer, elements.messageInput);
                setTimeout(() => 
                {
                    new Message(getRandomResponse(), "received", elements.messagesContainer, elements.messageInput);
                }, 1000);
            }
        },

        handleKeyPress: (e) => 
        {
            if (e.key === "Enter" && !e.shiftKey) 
            {
                e.preventDefault();
                eventHandlers.sendMessage();
            }
        }
    };

    // присвойка обработчиков событий
    elements.settingsButton.addEventListener("click", eventHandlers.settings);
    elements.closeSettings.addEventListener("click", eventHandlers.settings);
    elements.sendButton.addEventListener("click", eventHandlers.sendMessage);
    elements.messageInput.addEventListener("keypress", eventHandlers.handleKeyPress);

    
    elements.themeRadios.forEach(radio => 
    {
        radio.addEventListener("change", () => 
        { 
            if (radio.checked) 
            {
                themeManager.changeTheme(radio.value);
                localStorage.setItem("savedChecked", radio.value);
            }
        });
    });
    
    elements.searchBox.addEventListener("input", (e) => 
    {
        chatManager.searchChats(e.target.value);
    });
    
    elements.fontSizeSelect?.addEventListener('change', () => 
    {
        const fontSize = elements.fontSizeSelect.value;
        elements.root.style.fontSize = `${fontSize}px`;
        localStorage.setItem('fontSize', fontSize);
    });
}

function initSaved() 
{
    // загружаем сохраненные настройки для элементов выбора
    const savedFontSize = localStorage.getItem("fontSize");
    const savedChecked = localStorage.getItem("savedChecked");
    if (savedFontSize) 
    {
        elements.fontSizeSelect.value = savedFontSize;
        elements.root.style.fontSize = `${savedFontSize}px`;
    }

    if (savedChecked)
    {
        elements.themeRadios.forEach(radio => 
        {
            radio.value == savedChecked 
            ? radio.checked = true 
            : radio.checked = false;
        });
    }
    
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

// получаем случайный ответ из списка
function getRandomResponse() 
{
    return randomResponses[Math.floor(Math.random() * randomResponses.length)];
}

// переключаем видимость панели настроек
function toggleSettings() 
{
    elements.settingsPanel.classList.toggle("active");
    document.body.style.overflow = elements.settingsPanel.classList.contains("active") ? "hidden" : "";
}

// настраиваем обработчики событий при загрузке страницы
document.addEventListener("DOMContentLoaded", () => init());


const chatManager = new ChatManager(users);
const notificationManager = new NotificationManager(elements.notificationToggle);