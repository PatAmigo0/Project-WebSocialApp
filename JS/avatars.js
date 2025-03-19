// класс для работы с аватарами пользователей
export class AvatarManager 
{
    constructor() 
    {
        this.avatars = new Map();
        this.avatarsPath = "images/avatars/";
        this.defaultAvatar = "default/default-avatar.png";
        this.defaultGroupAvatar = "default/default-group.png";
    }

    // устанавливаем аватар для пользователя
    setAvatar(userId, avatarPath, isGroup = false) 
    {
        if (!avatarPath) 
        {
            avatarPath = this.avatarsPath + (isGroup ? this.defaultGroupAvatar : this.defaultAvatar);
        }
        this.avatars.set(userId, avatarPath);
        this._setAvatarsSrc(avatarPath, userId);
    }

    // получаем путь к аватару пользователя
    getAvatarPath(userId, isGroup = false) 
    {
        return this.avatars.get(userId) || this.avatarsPath + (isGroup ? this.defaultGroupAvatar : this.defaultAvatar);
    }

    // обновляем отображение аватара в интерфейсе
    updateAvatarDisplay(userId) 
    {
        // получаем элемент пользователя для определения, является ли он группой
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (!userElement) return;

        const isGroup = userElement.querySelector('.avatar img').alt.includes('группы');
        const avatarPath = this.getAvatarPath(userId, isGroup);
        this._setAvatarsSrc(avatarPath, userId);
    }

    _setAvatarsSrc(avatarPath, userId)
    {
        // обновляем все аватары для этого пользователя/группы
        const avatarElements = document.querySelectorAll(`[data-user-id="${userId}"] .avatar img`);
        avatarElements.forEach(img => 
        {
            // добавляем обработчик ошибок загрузки изображения
            img.onerror = () => 
            {
                img.src = this.avatarsPath + (isGroup ? this.defaultGroupAvatar : this.defaultAvatar);
            };
            img.src = avatarPath;
        });
    }
}

// создаем глобальный экземпляр менеджера аватаров
export const avatarManager = new AvatarManager(); 