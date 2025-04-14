/* импорты для работы с пользователями */
import { avatarManager } from './avatars.js';
import { Message } from './message.js';
import { User } from './user.js';
import { modalWindowHandler } from './modal.js';
import { mobileHandler } from './mobile.js';

/* из main.js для работы с сервером */
import { tryLoadConversation } from './main.js';
import { sendMessage } from './main.js';
import { tryLoadAllConversation } from './main.js';

/* fun =) */
import { admin } from './fun.js';

///////////////////////////////////////////////////////
const MAX_LENGTH = 1500;

export class ChatManager 
{
    constructor() 
    {
        /* ЧТОБЫ НЕ ПУТАТЬ: USERS ЭТО ТЕ ЖЕ ЧАТЫ, ПРОСТО СТАРОЕ НАЗВАНИЕ КОТОРОЕ Я НИКАК НЕ ПОМЕНЯЮ */
        this.users = new Array(); // чаты
        this.usersMem = new Map() // локально зраним всех пользователей чтомы не делать запросы
        this.chats = new Map(); // для хранения html элементов (ключ - convId)
        this.messages = new Map(); 
        this.unreadChats = new Map(); // для хранения не прочитанных чатов

        // переменные для хранения данных
        this.currentUserId = null;
        this.selectedConservationId = null;
        this.selectedChatElement = null

        // элементы DOM
        this.loadingScreen = document.querySelector('.loading-screen');
        this.chatList = document.querySelector('.chat-list');
        this.chatWindow = document.querySelector('.main-chat');
        this.searchBox = document.querySelector("#chat-search");
        this.sendButton = document.querySelector(".send-button");
        this.messageInput = document.querySelector(".message-input");
        this.messagesContainer = document.querySelector(".messages-container");
        this.addChatButton = this.chatList.querySelector('.add-chat-button').parentElement;

        // булевые значения для оптимизации
        this.enabled = false;
        this.inputError = false;
        this.settingsWereOpened = false;

        this.init();
    }

    init() 
    {
        // на всякий чтобы при загрузке не было по ошибке никакого выбранного чата
        this.chatWindow.classList.remove('chat-selected');

        //this.renderUsers();
        this.setupEventListeners();
    }

    /* handlers для обработки информации с сервера */

    handleLoading()
    {
        this.loadingScreen.classList.add('active');

        if (this.users.length == 0)
            tryLoadAllConversation();
        else
            this.renderUsers();

        this._deleteLoadingScreen();
    }

    /**
     * когда в сети появляется новый пользователь
     * @param {Object} user 
     */
    handleNewUser(user)
    {
        this.toggleStatus(user.id, true);
    }

    /**
     * когда пользователь выходит из сети
     * @param {Object} user 
     */
    handleLeaveUser(user)
    {
        this.toggleStatus(user.id, false);
    }

    /**
     * обработка загруженных чатов
     * @param {Object} conversations - объект чатов
     */ 

    handleLoadedConversations(conversations)
    {
        const originalOrder = new Map();

        this.users.forEach((user, index) => originalOrder.set(user.id, index));
        this.users = conversations.map(conversation => this._buildConservation(conversation));
        this.users.sort((a, b) => originalOrder.get(a.id) - originalOrder.get(b.id));
        
        this.renderUsers();
    }

    /**
     * обработка нового чата
     * @param {Object} conversation - объект чата
     */ 
    handleNewConservation(conversation, callback)
    {
        const user = this._buildConservation(conversation);
        this.users.push(user);
        this.searchBox.value = ""; // ресетаем значение searchBox
        this.renderUsers();
        if (callback) callback()
    }

    /**
     * обработка полученного сообщения
     * @param {Object} message - объект сообщения
     */ 
    async handleReceivedMessage(message)
    {
        admin.lol(message.text);
        const targetChat = this.users.find(user => user.id === message.convId); // user.id - id чата, message.convId - id чата в который пришло сообщение
        //console.log(targetChat);
        // обновляем последнее сообщение в чате (для отображения в списке)
        if (targetChat) 
        {
            this.addMessage(message); // добавляем сообщение в куки
            targetChat.lastMessage = message.text;
            
            // если этот чат сейчас открыт - добавляем сообщение в контейнер
            if (this.selectedConservationId === message.convId 
                && this.chatWindow.classList.contains('chat-selected'))
                new Message(message.text, "received", this.messagesContainer); 
            else 
            {
                // индикатор непрочитанного сообщения
                this._markUnread(message.convId);
            }
            
            // обновляем список чатов
            this.updateLastMessage(targetChat.id, message.text);
        } 
        else 
        {
            //console.warn("Получено сообщение для неизвестного чата:", message.convId);
            // нужно загрузить информацию о новом чате
            tryLoadConversation(message.convId, (conversation) => this.handleNewConservation(conversation, () => 
                {
                    console.warn("ставлю сообщения...");
                    console.log(conversation);
                    // добавляем индикатор непроч. сообщения после загрузки
                    this.messages.set(message.convId, [conversation.messages]);
                    this._markUnread(message.convId);
                }));
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /* главные функции для работы с сайтом */

    // рендер всех пользователей
    renderUsers() 
    {
        const fragment = document.createDocumentFragment();
        const addChatButton = this.addChatButton;
        this.chatList.innerHTML = '';

        // тест рендера всех пользователей
        this.users.forEach(user => 
        {
            // если чат еще не был создан то создаем
            if (!this.chats.has(user.id))
            {
                // в этой функции (createUserElement) помещается html element чата в словарь
                this.createUserElement(user, (chatElement) => 
                {
                    if (this.unreadChats.has(user.id))
                        chatElement.classList.add('unread-message'); 
                    else if (user.id === this.selectedConservationId)
                    {
                        this.selectedChatElement = chatElement;
                        chatElement.classList.add('active');
                    }
                }, fragment);
            
                const savedMessages = this.messages.get(user.id);
                if (savedMessages) 
                {
                    if (savedMessages.length > 0)
                    {
                        // если длина сохраненных данных равна нулю, значит сообщений просто нет => ничего не нужно загружать
                        user.lastMessage = savedMessages[savedMessages.length - 1].text;
                        this.updateLastMessage(user.id, user.lastMessage);
                    }

                }
                else // ждем пока из базы данных загрузится чат и получаем последнее сообщение
                    this.getLastMessage(user.id).then(lastMessage => 
                    {
                        user.lastMessage = lastMessage;
                        this.updateLastMessage(user.id, lastMessage);
                    });
            }
            else
                fragment.append(this.chats.get(user.id)); // если чат уже был создан, то просто вставляем его
        });

        fragment.append(addChatButton)
        this.chatList.append(fragment);
    }

    renderMessages()
    {

    }

    // установка слушателей событий (удобно для подписывания на события)
    setupEventListeners() 
    {
        // ОБРАБОТКА КЛИКА ПО ЧАТУ
        this.chatList.addEventListener('click', (e) => 
        {
            const chatItem = e.target.closest('.chat-item');
            if (chatItem && !chatItem.querySelector('.add-chat-button')) 
            {
                if (chatItem.className.includes('active'))
                {
                    this.disableActiveChat(); // если дважды тыкнул по активному чату то выключать его
                }
                else
                {
                    this.selectUser(String(chatItem.dataset.userId));
                    mobileHandler.open();
                }
            }
            else if (chatItem && chatItem.querySelector('.add-chat-button'))
                modalWindowHandler.toggleModalWindow(); // открываем модальное окно (для выбора онлайн пользователей)
            else 
            {
                this.disableActiveChat(); // если попал за пределы чатов и кнопки то закрывать чат
            }
        });

        // ОТПРАВКА СООБЩЕНИЯ ПРИ НАЖАТИИ НА КНОПКУ ОТПРАВИТЬ
        this.sendButton.addEventListener('click', () => this.sendMessage());

        // ПОПЫТКА ВВОДА В MESSAGEINPUT
        this.messageInput.addEventListener('input', () =>
        {
            if (this.messageInput.value.length > MAX_LENGTH)
            {
                this.messageInput.value = this.messageInput.value.slice(0, MAX_LENGTH);
                this.messageInput.classList.add("input-error");
                this.inputError = true
            } 
            else
            {
                if (this.inputError)
                {
                    this.messageInput.classList.remove("input-error");
                    this.inputError = false;
                }
                this._resizeInput();
            }
        });

        // ОТПРАВКА СООБЩЕНИЯ ПРИ НАЖАТИИ НА ENTER
        this.messageInput.addEventListener('keypress', (e) => 
        {
            if (e.key === "Enter" && !e.shiftKey) 
            {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // ПОИСК ПОЛЬЗОВАТЕЛЕЙ
        this.searchBox.addEventListener('input', () => this.searchChats(this.searchBox.value));
    }

    /**
     * обновляем последнее сообщение в чате
     * @param {string} chatId - id чата
     */         
    updateLastMessage(chatId, text)
    {
        const chatElement = this.chats.get(chatId);
        if (chatElement)
                chatElement.querySelector(".last-message").textContent = text;
    }

    /**
     * обновляем аватары всех пользователей
     * @param {string} value - значение для аватара
     */     
    updateUsersAvatars(value)
    {
        avatarManager.changeAvatarsStyle(value);
        let check = true // для оптимизации чтобы не проверять на активный чат если мы его уже нашли

        this.users.forEach(user => 
        {
            if (user.isGroup) 
                avatarManager.setAvatar(user.id, `${value}/${value}-group.png`, true);
            else 
                avatarManager.setAvatar(user.id, `${value}/${value}-avatar.png`);

            // на случай если был октрыт чат (нужно изменить аватар пользователя в заголовке чата)
            if (check 
                && this.chats.get(user.id).classList.contains("active"))
            {
                check = false; // больше не проверять
                this.updateChatHeader(user);
            }
        });
    }

    /**
     * изменение статуса пользователя
     * @param {string} userId - ID пользователя
     * @param {boolean} online - статус пользователя
     */ 
    toggleStatus(userId, online)    
    {
        const users = this.chatList.querySelectorAll(`[data-companion-id="${userId}"]`);
        //console.warn(`Найдено чатов с пользователем ${userId}: ${users.length}`);
        
        if (users.length > 0)
            users.forEach(item => this._toggleStatus(item, online));
    }

    /**
     * создание элемента чата (пользователя или группы)
     * @param {Object} user - объект чата
     */     
    createUserElement(user, onSuccess, parent = this.chatList) 
    {
        new User(user, parent, item => 
        {
            this.chats.set(user.id, item);
            onSuccess(item);
        });
    }

    // отправка сообщения
    sendMessage()
    {
        const messageText = this.messageInput.value.trim();
        if (messageText) 
        {
            this._resetChat();
            if (this.selectedConservationId)
            {
                this.updateLastMessage(this.selectedConservationId, messageText);
                sendMessage(this.selectedConservationId, messageText); 
                new Message(messageText, "sent", this.messagesContainer);
                this.pushForward();
            }
            else
                console.warn("Не знаю как это произошло, но сообщение отправилось без выбранного чата, ошибка в sendMessage");
        }
    }

    // меняем местами два элемента
    pushForward()
    {
        if (!(this.chatList.firstElementChild.dataset.userId === this.selectedConservationId))
        {
            const currentEl = this.users.findIndex(us => us.id === this.selectedConservationId);

            this.users.unshift(this.users[currentEl]);
            this.users.splice(currentEl+1, 1);

            this.renderUsers();
        }
    }

    addMessage(message)
    {
        const storage = this.messages.get(message.convId);
        if (storage) storage.push(message);
        else 
        {
            // обычно не вызывается
            console.warn("Сохранение в куки...");
            this.messages.set(message.convId, [message]);
        }
    }

    /**
     * выбор пользователя
     * @param {string} userId - ID пользователя
     */ 
    selectUser(userId) 
    {
        const user = this.users.find((u) => String(u.id) === String(userId));
        
        if (user) 
        {
            this.currentUser = user;
            this.updateActiveChat(userId); // ЗДЕСЬ СТАВИТЬСЯ this.selectedChatElement
            this.updateMarked();
            this.updateReceivedMessageIndicator()
            this.updateChatHeader(user);
            this.updateChatWindow(user);
            document.querySelector('.main-chat').classList.add('chat-selected');
        }
    }

    updateReceivedMessageIndicator()
    {
        this.selectedChatElement.classList.remove("unread-message");
    }

    updateMarked()
    {
        if (this.unreadChats.has(this.selectedConservationId))
        {
            this.unreadChats.delete(this.selectedConservationId);
        }
    }

    /**
     * обновление главной страницы с чатом
     * @param {Object} user - объект чата
     */ 
    updateChatWindow(user)
    {
        this.messagesContainer.innerHTML = "";
        const messages = this.messages.get(user.id);
        if (!messages)
            tryLoadConversation(user.id, (conversation) => 
            {
                console.warn("взял сообщения из базы данных");
                console.log(conversation.messages);
                this.messages.set(user.id, conversation.messages);
                this._onFullConservationLoadSuccess(conversation.messages, conversation.users.length > 2);
            });
        else
        {
            this._onFullConservationLoadSuccess(messages, !this.chats.get(user.id).dataset.companionId); // нет компаньена => группа
        }
    }

    /**
     * обновление заголовка чата
     * @param {Object} user - объект чата
     */ 
    updateChatHeader(user) 
    {
        const chatHeader = document.querySelector('.main-chat .chat-header');
        const avatar = chatHeader.querySelector('.avatar');
        const name = chatHeader.querySelector('.chat-name p');

        avatar.innerHTML = `<img src="${avatarManager.getAvatarPath(user.id, user.isGroup)}" alt="Аватар ${user.isGroup ? 'группы' : 'пользователя'}">`;
        name.textContent = user.name;
    }

    /**
     * обновление активного чата
     * @param {string} userId - ID пользователя
     */ 
    updateActiveChat(userId) 
    {
        this.disableActiveChat();
        this.selectedChatElement = this.chats.get(userId);

        // добавляем класс active выбранному чату
        if (this.selectedChatElement)
        {
            this.selectedChatElement.classList.toggle('active');
            this.selectedConservationId = userId;
        }
    }

    // функция для безопасного скрытия текущего чата
    disableActiveChat()
    {
        if (this.selectedChatElement)
        {
            this.selectedChatElement.classList.remove('active');
            this.selectedChatElement = null;
            this.chatWindow.classList.remove('chat-selected');
            this.currentConservation = null;
            mobileHandler.close();
            this._resetChat();
            
        }
    }

    /**
     * поиск чатов
     * @param {string} query - поисковый запрос
     */ 
    searchChats(query) 
    {
        const searchTerm = query.toLowerCase();
        this.chats.forEach(item => 
        {
            const chatName = item.querySelector(".chat-name").textContent.toLowerCase();
            const lastMessage = item.querySelector(".last-message").textContent.toLowerCase();

            item.style.display = (chatName.includes(searchTerm) 
            || lastMessage.includes(searchTerm)) ? "grid" : "none";
        });
    }

    /**
     * для того чтобы chatManager знал как обрабатывать сообщения и вообще все что связано с текущим пользователем
     * @param {string} userId - ID чата
     */ 
    setCurrentUser(userId)
    {
        this.currentUserId = userId;
    }

    /**
     * обещаем что получим последнее сообщение почти любой ценой
     *  @param {string} convId - ID чата
     */ 
    async getLastMessage(convId)
    {
        return new Promise((res, rej) =>
        {
            tryLoadConversation(convId, (conversation) => 
            {
                // обычно все сообщения в куки сохраняются тут
                console.log("Загружаю сообщения из сервера");
                console.log(conversation.messages);
                this.messages.set(convId, conversation.messages);
                if (conversation)
                    this._getLastMessage(conversation).then(message => res(message));
                else
                    rej("Не получилось получить последнее сообщение");
            });
        });
    }

    // куку...
    cook()
    {
        const chatData =
        {
            unreadChats: this.unreadChats.entries().toArray(),
            messages: this.messages.entries().toArray(),
            chats: this.users,
            secret_data_token: sessionStorage.getItem("server_super_secret_token")
        }
        localStorage.setItem(this.currentUserId, JSON.stringify(chatData));
    }

    loadCookies()
    {
        const currentToken = sessionStorage.getItem("server_super_secret_token");
        const rawChatData = localStorage.getItem(this.currentUserId);
        if (rawChatData)
        {
            const chatData = JSON.parse(rawChatData);
            console.log(`${currentToken} =? ${chatData.secret_data_token}`);
            if (currentToken === chatData.secret_data_token)
            {
                this.unreadChats = new Map(chatData.unreadChats);
                this.messages = new Map(chatData.messages);
                console.log(this.messages);
                if (chatData.chats)
                    this.users = [...chatData.chats];
            }
            else
                console.warn("ВЕРСИИ САЙТОВ НЕ СОВПАДАЮТ!");
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /* функции для создания чего либо (или же просто спрятанные функции) */

    _resizeInput()
    {
        if (this.messageInput.value.length > 0 && this.enabled == false) this._enableChat();
        else if (this.messageInput.value.length == 0) this._resetChat();

        this.messageInput.style.height = 'auto'; // ресет

        this.messageInput.style.height = `${Math.min(
          this.messageInput.scrollHeight, 
          parseInt(window.getComputedStyle(this.messageInput).maxHeight)
        )}px`;
        
        this.messageInput.style.overflow = "auto";
    }

    _enableChat()
    {
        this.messageInput.innerHTML = `.`; 
        this.enabled = true;
    }

    _resetChat()
    {
        this.messageInput.classList.remove("input-error");
        this.messageInput.value = "";
        this.messageInput.innerHTML = "";
        this.enabled = false;
    }

    /**
     * loading messages
     * загрузка сообщений из сервера в чат когда входим в чат
     * @param {Object} conversation - объект чата
     */ 
    _onFullConservationLoadSuccess(messages, isGroup = false)
    {
        console.log(messages);
        /* TODO: оптимизировать чтобы появлялись не все сообщения (сейчас я не понимаю как это сделать) */
        if (isGroup)
            this._handleAsAGroup(messages)
        else
            this._hadnleAsUserConversation(messages);
    }

    /**
     * обработка группового чата
     * @param {Object} conversation - объект чата
     */ 
    _handleAsAGroup(messages)
    {
        console.warn("GROUP");
        // TODO: реализовать обработку группового чата
        const fragment = document.createDocumentFragment();
        messages.forEach(message => 
        {
            new Message(message.text, `${message.sender.id == this.currentUserId ? "sent" : "received"}`, fragment, 
                (messageElement) => 
                {

                });
        });

        this.messagesContainer.append(fragment);
    }

    /**
     * обработка пользовательского чата
     * @param {Object} conversation - объект чата
     */ 
    _hadnleAsUserConversation(messages)
    {
        const fragment = document.createDocumentFragment();
        messages.forEach(message => 
        {
            new Message(message.text, `${message.sender.id == this.currentUserId ? "sent" : "received"}`, fragment, 
                (messageElement) => 
                {

                });
        });

        this.messagesContainer.append(fragment);
    }

    /**
     * изменение статуса пользователя
     * @param {HTMLElement} user - dom объект чата
     * @param {boolean} online - статус пользователя
     */ 
    _toggleStatus(user, online = true)
    {
        const fuser = this.users.find(us => us.companionId === user.dataset.companionId); // пользователь собеседник, я храню его информацию локально чтобы не обращаться к серверу... Поэтому приходится менять ему онлайн ручками
        const statusIndicator = user.querySelector('.status-indicator');
        if (statusIndicator) 
        {
            statusIndicator.classList.remove('online', 'offline');
            statusIndicator.classList.add(online ? 'online' : 'offline');
            fuser.online = online;
            // console.log(`Статус пользователя изменен на ${online ? 'online' : 'offline'}`);
        }
    }

    async _getLastMessage(conversation)
    {
        return new Promise((res) =>
        {
            res(conversation.messages.length - 1 >= 0 ? conversation.messages[conversation.messages.length - 1].text : "");
        })
    }

    /**
     * 
     * @param {string} convId 
     */
    _markUnread(convId)
    {
        const chatElement = this.chats.get(convId);
        if (chatElement) 
        {
            chatElement.classList.add("unread-message");
            
            // проверяем, если в чате уже были непрочитанные сообщения то прибавляем это значение, иначе инициализируем
            this.unreadChats.set(convId, this.unreadChats.has(convId) 
            ? this.unreadChats.get(convId) + 1
            : 1);
        } 
    }

    _loadOnlineStatus(conversation)
    {
        console.log(conversation);
    }

    _deleteLoadingScreen()
    {
        setTimeout(() => 
            {
                this.loadingScreen.classList.add("fade");
                setTimeout(() => this.loadingScreen.remove(), 600);
            }, 2200);
    }

    /**
     * построение объекта чата
     * @param {Object} conversation - объект чата
     * @returns {Object} - объект чата
     */ 
    _buildConservation(conversation)
    {
        const user = 
        {
            id: String(conversation.id),
            companionId: conversation.users.find(us => us.id != this.currentUserId).id,
            name: conversation.name,
            avatar: "",
            messages: conversation.messages,
            lastMessage: "",
            time: "",
            unreadCount: 0,
            isGroup: conversation.users.length > 2 ? true : false,
            online : conversation.users.find(us => us.online == true && us.id != this.currentUserId) ? true : false,
            users : conversation.users
        }
        return user;
    }
}