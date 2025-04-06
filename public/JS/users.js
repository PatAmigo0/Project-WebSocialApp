const users = [
    {
        id: 1,
        online : true,
        name: "Пользователь 1",
        avatar: "",
        lastMessage: "Привет! Как дела?",
        time: "12:30",
        unreadCount: 2,
        isGroup: false
    },
    {
        id: 2,
        online : false,
        name: "Пользователь 2",
        avatar: "",
        lastMessage: "Давай встретимся завтра?",
        time: "11:45",
        unreadCount: 1,
        isGroup: false
    },
    {
        id: "group1",
        online : false,
        name: "Группа 1",
        avatar: "",
        lastMessage: "Готовимся к олимпиаде что проходит в БГУИРе?",
        time: "10:15",
        unreadCount: 5,
        isGroup: true
    }
];

export default users; 