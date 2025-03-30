/* импорты для работы с пользователями */
import { avatarManager } from './avatars.js';
import { ModalWindowHandler } from './modal.js';
import { Message } from './message.js';
import { User } from './user.js';

/* из main.js для работы с сервером */
import { tryLoadConversation } from './main.js';
import { sendMessage } from './main.js';

///////////////////////////////////////////////////////

export class ChatManager 
{
    constructor(users) 
    {
        this.users = users; // чаты
        this.currentUserId = null;
        this.selectedConservationId = null;
        this.settingsWereOpened = false;

        this.chatList = document.querySelector('.chat-list');
        this.chatWindow = document.querySelector('.main-chat');
        this.sendButton = document.querySelector(".send-button");
        this.messageInput = document.querySelector(".message-input");
        this.messagesContainer = document.querySelector(".messages-container");
        this.searchBox = document.querySelector(".search-box");

        this.init();
    }

    init() 
    {
        // на всякий чтобы при загрузке не было по ошибке никакого выбранного чата
        this.chatWindow.classList.remove('chat-selected');

        this.modalWindowHandler = new ModalWindowHandler();

        this.renderUsers();
        this.setupEventListeners();
    }

    /* handlers для обработки информации с сервера */

    // при загрузке страницы вызывается этот обработчик для загрузки и последующего рендера всех пользователей
    handleLoadedConversations(conversations)
    {
        conversations.forEach(conversation =>
        {
            /* TODO: оптимизировать чтобы рендер работал на прямую c conservations */
            this.users.push(
                {
                    id: String(conversation.id),
                    online : true,
                    name: conversation.name,
                    avatar: "",
                    messages: conversation.messages,
                    lastMessage: conversation.messages[-1] ? conversation.messages[-1] : "",
                    time: "12:30",
                    unreadCount: 0,
                    isGroup: false
                }
            )
        });
        this.renderUsers();
    }

    // при добавлении нового чата вызывается этот обработчик для ре-рендеринга всех пользователей учитывая новый чат
    handleNewConservation(conversation)
    {
        this.users.push(
            {
                id: String(conversation.id),
                online : true,
                name: conversation.name,
                avatar: "",
                messages: conversation.messages,
                lastMessage: conversation.messages[-1] ? conversation.messages[-1] : "",
                time: "12:30",
                unreadCount: 0,
                isGroup: false
            });
        this.renderUsers();
    }

    // когда наш текущий пользователь получает сообщение вызывается этот обработчик
    handleReceivedMessage(message)
    {
        new Message(message.text, "reveived", this.messagesContainer, this.messageInput);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // рендер всех пользователей
    renderUsers() 
    {
        const addChatButton = this.chatList.querySelector('.add-chat-button').parentElement;
        this.chatList.innerHTML = '';

        // тест рендера всех пользователей
        this.users.forEach(user => 
        {
            this.createUserElement(user);
            
            // устанавливаем аватар через AvatarManager
            avatarManager.setAvatar(user.id, null, user.isGroup);
        });
        this.chatList.append(addChatButton);
    }

    // обновляем аватары всех пользователей
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
                && this.chatList.querySelector(`[data-user-id="${user.id}"]`).classList.contains("active"))
            {
                check = false; // больше не проверять
                this.updateChatHeader(user);
            }
        });

    }

    // создание элемента чата (пользователя или группы)
    createUserElement(user) 
    {
        new User(user, this.chatList);
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
                    return;
                }

                this.selectUser(String(chatItem.dataset.userId));
            }
            else if (chatItem && chatItem.querySelector('.add-chat-button'))
                this.modalWindowHandler.toggleModalWindow(); // открываем модальное окно (для выбора онлайн пользователей)
            else 
                this.disableActiveChat(); // если попал за пределы конактов и кнопки то закрывать чат
        });

        // ОТПРАВКА СООБЩЕНИЯ ПРИ НАЖАТИИ НА КНОПКУ ОТПРАВИТЬ
        this.sendButton.addEventListener('click', () => 
        {
            this.sendMessage()
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
        this.searchBox.addEventListener("input", (e) => 
        {
            this.searchChats(e.target.value);
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
                sendMessage(this.selectedConservationId, messageText);
                new Message(messageText, "sent", this.messagesContainer, this.messageInput);
            }
            else
                console.warn("Не знаю как это произошло, но сообщение отправилось без выбранного чата, ошибка в sendMessage");
        }
    }

    // выбор пользователя
    selectUser(userId) 
    {
        const user = this.users.find((u) => 
        {
            return String(u.id) === String(userId);
        });
        
        if (user) 
        {
            this.currentUser = user;
            this.updateChatHeader(user);
            this.updateActiveChat(userId);
            this.updateChatWindow(user);
            document.querySelector('.main-chat').classList.add('chat-selected');
        }
    }

    // обновление главной страницы с чатом
    updateChatWindow(user)
    {
        this.messagesContainer.innerHTML = "";
        tryLoadConversation(user.id, (conservation) => this._onFullConservationLoadSuccess(conservation)); // у стрелочной функции нет сообственного this поэтому он не теряется при передаче функции через него, передавать ТАК!
    }


    // обновление заголовка чата
    updateChatHeader(user) 
    {
        const chatHeader = document.querySelector('.main-chat .chat-header');
        const avatar = chatHeader.querySelector('.avatar');
        const name = chatHeader.querySelector('.chat-name p');

        avatar.innerHTML = `<img src="${avatarManager.getAvatarPath(user.id, user.isGroup)}" alt="Аватар ${user.isGroup ? 'группы' : 'пользователя'}">`;
        name.textContent = user.name;
    }

    // обновление активного чата
    updateActiveChat(userId) 
    {
        this.disableActiveChat();

        // добавляем класс active выбранному чату
        const selectedChat = this.chatList.querySelector(`[data-user-id="${userId}"]`);
        if (selectedChat)
        {
            selectedChat.classList.toggle('active');
            this.selectedConservationId = userId;
        }
    }

    // функция для безопасного скрытия текущего чата
    disableActiveChat()
    {
        // убираем класс active у всех чатов и у окна чата
        this.chatList.querySelectorAll('.chat-item').forEach(chat => 
        {
            chat.classList.remove('active');
        });

        this.chatWindow.classList.remove('chat-selected');
        this.currentConservation = null;
    }

    /*TODO: получаем ВСЕХ онлайн пользователей */
    fetchOnlineUsers()
    {

    }

    /*TODO: функция для добавления нового пользователя в список чатов */
    addNewChat() 
    {
        // TODO: реализовать добавление нового чата
    }

    // поиск чатов
    searchChats(query) 
    {
        const searchTerm = query.toLowerCase();
        document.querySelectorAll('.chat-item:not(:has(.add-chat-button))').forEach(item => 
        {
            const chatName = item.querySelector(".chat-name").textContent.toLowerCase();
            const lastMessage = item.querySelector(".last-message").textContent.toLowerCase();

            item.style.display = (chatName.includes(searchTerm) 
            || lastMessage.includes(searchTerm)) ? "grid" : "none";
        });
    }

    // для того чтобы chatManager знал как обрабатывать сообщения и вообще все что связано с текущим пользователем
    setCurrentUser(userId)
    {
        console.warn(`Current user id: ${userId}`);
        this.currentUserId = userId;
    }

    // загрузка сообщений из сервера в чат
    _onFullConservationLoadSuccess(conservation)
    {
        /* TODO: оптимизировать чтобы появлялись не все сообщения (сейчас я не понимаю как это сделать) */
        conservation.messages.forEach(message =>
        {
            new Message(message.text, `${message.sender.id == this.currentUserId ? "sent" : "received"}`, this.messagesContainer, this.messageInput);
        });
    }
}