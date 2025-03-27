export class NotificationManager
{
    constructor(notificationToggle)
    {
        this.button = notificationToggle;
        this.allowed = false;
        this.init()
        console.log("INITIALIZED");
    }

    init()
    {
        console.log(this.button);
        // настраиваем уведомления
        if (this.button) 
        {
            this.button.addEventListener("change", (e) => 
            {
                if (e.target.checked) 
                    this.requestNotificationPermission();
            });
        }
    }

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
