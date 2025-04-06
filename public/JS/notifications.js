export class NotificationManager
{
    constructor()
    {
        this.notificationToggle = document.getElementById('notifications');
        this.allowed = false;

        this.init();
    }

    init()
    {
        this.setupEventListeners();
    }

    setupEventListeners()
    {
        this.notificationToggle.addEventListener('change', (e) => 
        {
            if (e.target.value)
            {  
                notificationManager.requestNotificationPermission();
            }
        });
    }

    // запрашиваем разрешение у пользователя на отправку уведомлений
    requestNotificationPermission() 
    {
        if ("Notification" in window) 
        {
            Notification.requestPermission().then(permission => 
            {
                // обработка разрешения
            });
        }
    } 
}

export const notificationManager = new NotificationManager();