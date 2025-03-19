// класс для работы с аватарами пользователей
export class AvatarManager 
{
    constructor() 
    {
        this.avatars = new Map();
        this.avatarsPath = "images/avatars/";
        this.defaultAvatar = "default/default-avatar.png";
    }

    // устанавливаем аватар для пользователя
    setAvatar(userId, avatarPath) 
    {
        if (!avatarPath) 
        {
            avatarPath = this.avatarsPath + this.defaultAvatar;
        }
        this.avatars.set(userId, avatarPath);
        this.updateAvatarDisplay(userId);
    }

    // получаем путь к аватару пользователя
    getAvatarPath(userId) 
    {
        return this.avatars.get(userId) || this.avatarsPath + this.defaultAvatar;
    }

    // обновляем отображение аватара в интерфейсе
    updateAvatarDisplay(userId) 
    {
        const avatarPath = this.getAvatarPath(userId);
        const avatarElements = document.querySelectorAll(`[data-user-id="${userId}"] .avatar img`);
        
        avatarElements.forEach(img => 
        {
            // добавляем обработчик ошибок загрузки изображения
            img.onerror = () => 
            {
                img.src = this.avatarsPath + this.defaultAvatar;
            };
            img.src = avatarPath;
        });
    }

    // загружаем аватар из файла
    loadAvatarFromFile(userId, file) 
    {
        if (!file.type.startsWith('image/')) 
        {
            console.error('выбранный файл не является изображением');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => 
        {
            const avatarPath = e.target.result;
            this.setAvatar(userId, avatarPath);
        };
        reader.readAsDataURL(file);
    }
}

// создаем глобальный экземпляр менеджера аватаров
export const avatarManager = new AvatarManager(); 