export function requestNotificationPermission() 
{
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
} 