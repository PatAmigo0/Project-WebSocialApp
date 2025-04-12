/* импорты для работы с пользователями */
import { avatarManager } from './avatars.js';
import { Message } from './message.js';
import { User } from './user.js';
import { modalWindowHandler } from './modal.js';

/* из main.js для работы с сервером */
import { tryLoadConversation } from './main.js';
import { sendMessage } from './main.js';

///////////////////////////////////////////////////////

export class ChatManager 
{
    constructor() 
    {
        /* ЧТОБЫ НЕ ПУТАТЬ: USERS ЭТО ТЕ ЖЕ ЧАТЫ, ПРОСТО СТАРОЕ НАЗВАНИЕ КОТОРОЕ Я НИКАК НЕ ПОМЕНЯЮ */
        this.users = new Array(); // чаты
        this.chats = new Map(); // для хранения html элементов (ключ - convId)
        this.unreadChats = new Map(); // для хранения не прочитанных чатов

        this.currentUserId = null;
        this.selectedConservationId = null;
        this.selectedChatElement = null

        this.settingsWereOpened = false;
        this.chatList = document.querySelector('.chat-list');
        this.chatWindow = document.querySelector('.main-chat');
        this.sendButton = document.querySelector(".send-button");
        this.messageInput = document.querySelector(".message-input");
        this.messagesContainer = document.querySelector(".messages-container");
        this.searchBox = document.querySelector("#chat-search");

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

    /**
     * обработка загруженных чатов
     * @param {Object} conversations - объект чатов
     */ 
    handleLoadedConversations(conversations)
    {
        conversations.forEach(conversation =>
        {
            /* TODO: оптимизировать чтобы рендер работал на прямую c conservations */
            this.users.push(this._buildConservation(conversation));
        });
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
        /* TODO: переделать систему добавление нового чата чтобы не ререндерить раз за разом...*/
        //new User(user, this.chatList);
        if (callback) callback()
    }

    /**
     * обработка полученного сообщения
     * @param {Object} message - объект сообщения
     */ 
    handleReceivedMessage(message)
    {
        //console.log(`новое сообщение: ${message}`);
        
        const targetChat = this.users.find(user => user.id === message.convId); // user.id - id чата, message.convId - id чата в который пришло сообщение
        //console.log(targetChat);
        // обновляем последнее сообщение в чате (для отображения в списке)
        if (targetChat) 
        {
            targetChat.lastMessage = message.text;
            
            // если этот чат сейчас открыт - добавляем сообщение в контейнер
            if (this.selectedConservationId === message.convId 
                && this.chatWindow.classList.contains('chat-selected'))
                new Message(message.text, "received", this.messagesContainer, this.messageInput); 
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
                    // добавляем индикатор непроч. сообщения после загрузки
                    this._markUnread(message.convId);
                }));
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /* главные функции для работы с сайтом */

    // рендер всех пользователей
    renderUsers() 
    {
        const addChatButton = this.chatList.querySelector('.add-chat-button').parentElement;
        this.chatList.innerHTML = '';
        this.chats.clear();

        // тест рендера всех пользователей
        this.users.forEach(user => 
        {
            // в этой функции помещается html element чата в словарь
            this.createUserElement(user, (chatElement) => 
            {
                if (this.unreadChats.has(user.id))
                    chatElement.classList.add('unread-message');
                    
            });
            // ждем пока из базы данных загрузится чат и получаем последнее сообщение
            this.getLastMessage(user.id).then(lastMessage => 
            {
                user.lastMessage = lastMessage;
                this.updateLastMessage(user.id, lastMessage);
            }); 
            
            // устанавливаем аватар через AvatarManager DEPRECATED
            //avatarManager.setAvatar(user.id, null, user.isGroup);
        });

        this.chatList.append(addChatButton);
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
                console.log("///////Arsenii///////");
                const style = document.createElement('style');
                style.textContent = `
                    @media(max-width: 1000px)
                    {
                        .chat-container 
                        {
                            grid-template-columns: 0px 1fr;
                        }
                    }
                `;
                document.head.appendChild(style);
                if (chatItem.className.includes('active'))
                {
                    // провввверка для мобилок
                    if (window.innerWidth > 1000) 
                    {
                        this.disableActiveChat(); // если дважды тыкнул по активному чату то выключать его
                        return;
                    }
                }

                this.selectUser(String(chatItem.dataset.userId));
            }
            else if (chatItem && chatItem.querySelector('.add-chat-button'))
                modalWindowHandler.toggleModalWindow(); // открываем модальное окно (для выбора онлайн пользователей)
            else 
                this.disableActiveChat(); // если попал за пределы конактов и кнопки то закрывать чат
        });

        // ОТПРАВКА СООБЩЕНИЯ ПРИ НАЖАТИИ НА КНОПКУ ОТПРАВИТЬ
        this.sendButton.addEventListener('click', () => this.sendMessage());

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
        else
            console.warn(`Пользователь ${userId} не найден в списке чатов`);
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
            if (this.selectedConservationId)
            {
                this.updateLastMessage(this.selectedConservationId, messageText);
                sendMessage(this.selectedConservationId, messageText); // функция из main.js не путать с this.sendMessage
                new Message(messageText, "sent", this.messagesContainer, this.messageInput);
            }
            else
                console.warn("Не знаю как это произошло, но сообщение отправилось без выбранного чата, ошибка в sendMessage");
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
        tryLoadConversation(user.id, (conservation) => this._onFullConservationLoadSuccess(conservation)); // у стрелочной функции нет сообственного this поэтому он не теряется при передаче функции через него, передавать ТАК!
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
        /* ОПТИМЗИРОВАНО :)
        // убираем класс active у всех чатов и у окна чата
        this.chatList.querySelectorAll('.chat-item').forEach(chat => 
        {
            chat.classList.remove('active');
        });
        */
        if (this.selectedChatElement)
        {
            this.selectedChatElement.classList.remove('active');
            this.selectedChatElement = null;
            this.chatWindow.classList.remove('chat-selected');
            this.currentConservation = null;
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
            unreadChats: this.unreadChats.entries().toArray()
        }
        localStorage.setItem(this.currentUserId, JSON.stringify(chatData));
    }

    loadCookies()
    {
        const rawChatData = localStorage.getItem(this.currentUserId);
        if (rawChatData)
        {
            const chatData = JSON.parse(rawChatData);
            this.unreadChats = new Map(chatData.unreadChats)
        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /* функции для создания чего либо (или же просто спрятанные функции) */

    /**
     * загрузка сообщений из сервера в чат
     * @param {Object} conversation - объект чата
     */ 
    _onFullConservationLoadSuccess(conversation)
    {
        /* TODO: оптимизировать чтобы появлялись не все сообщения (сейчас я не понимаю как это сделать) */
        this._hadnleAsUserConversation(conversation);
    }

    /**
     * обработка группового чата
     * @param {Object} conversation - объект чата
     */ 
    _handleAsAGroup(conversation)
    {
        // TODO: реализовать обработку группового чата
    }

    /**
     * обработка пользовательского чата
     * @param {Object} conversation - объект чата
     */ 
    _hadnleAsUserConversation(conversation)
    {
        conversation.messages.forEach(message =>
        {
            //console.warn(message);
            new Message(message.text, `${message.sender.id == this.currentUserId ? "sent" : "received"}`, this.messagesContainer, this.messageInput);
        });
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