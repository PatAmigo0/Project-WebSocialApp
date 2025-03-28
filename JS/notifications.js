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
                console.log(e.target.value);
                notificationManager.requestNotificationPermission();
            }
            else console.log("уведомления выключаются...")
        });
    }

    // запрашиваем разрешение у пользователя на отправку уведомлений
    requestNotificationPermission() 
    {

        console.log("пытаюсь получить доступ к уведомлениям")
        if ("Notification" in window) 
        {
            Notification.requestPermission().then(permission => 
            {
                if (permission === "granted") 
                    console.log("разрешение на уведомления получено.");
                else 
                    console.log("пользователь отказался от получения уведомлений.");
            });
        }
        else
        {
            console.log("браузер не поддерживает уведомления")
        }
    } 
}

export const notificationManager = new NotificationManager();