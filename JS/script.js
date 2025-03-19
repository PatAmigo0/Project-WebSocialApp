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
import { changeTheme } from './theme.js';
import { requestNotificationPermission } from './notifications.js';
import { ChatManager } from './chat.js';
import users from './users.js';
import { avatarManager } from './avatars.js';

// список возможных ответов для тестирования
const randomResponses = 
[
    "Привет!",
    "Пока!",
    "Секретка",
    "Умри пожалуйста",
    "Тестовое сообщение"
];

function initMain() 
{
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

    // Настройка обработчиков событий
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
                changeTheme(radio.value, elements.root);
            }
        });
    });
    
    elements.searchBox.addEventListener("input", (e) => 
    {
        chatManager.searchChats(e.target.value);
    });
    
    elements.chatItems.forEach(item => 
    {
        item.addEventListener("click", () => 
        {
            const chatName = item.querySelector(".chat-name");
            if (!chatName) return;
    
            elements.chatItems.forEach(chat => chat.classList.remove("active"));
            item.classList.add("active");
            document.querySelector(".chat-header .chat-name").textContent = chatName.textContent;
        });
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
    // загружаем сохраненный размер текста
    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize) 
    {
        elements.fontSizeSelect.value = savedFontSize;
        elements.root.style.fontSize = `${savedFontSize}px`;
    }
}

function initUnload() 
{
    window.addEventListener("beforeunload", () => 
    {
        localStorage.setItem("theme", JSON.stringify(elements.root.style));
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
document.addEventListener("DOMContentLoaded", () => 
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
});

// настраиваем уведомления
if (elements.notificationToggle) 
{
    elements.notificationToggle.addEventListener("change", (e) => 
    {
        if (e.target.checked) 
        {
            requestNotificationPermission();
        }
    });
}

// создаем менеджер чата
const chatManager = new ChatManager(users);
