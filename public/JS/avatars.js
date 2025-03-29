// класс для работы с аватарами пользователей
export class AvatarManager 
{
    constructor() 
    {
        this.avatars = new Map();
        this.currentStyle = "default";
        this.avatarsPath = "images/avatars/";
        this.defaultAvatar = "default/default-avatar.png";
        this.defaultGroupAvatar = "default/default-group.png";
    }

    // устанавливаем аватар для пользователя
    setAvatar(userId, avatarPath, isGroup = false) 
    {
        if (!avatarPath) avatarPath = this.avatarsPath + (isGroup 
            ? `${this.currentStyle}/${this.currentStyle}-group.png` 
            : `${this.currentStyle}/${this.currentStyle}-avatar.png`);
        else 
        {
            avatarPath = this.avatarsPath + avatarPath;
        }
        this.avatars.set(userId, avatarPath);
        this._setAvatarsSrc(avatarPath, userId, isGroup);
    }

    // получаем путь к аватару пользователя (на будущее для локальных аватаров)
    getAvatarPath(userId, isGroup = false) 
    {
        return this.avatars.get(userId) || this.avatarsPath + (isGroup ? this.defaultGroupAvatar : this.defaultAvatar);
    }

    getCurrentAvatarsStyle()
    {
        return this.currentStyle;
    }

    changeAvatarsStyle(style)
    {
        this.currentStyle = style;
    }


    // устанавливаем путь для img
    _setAvatarsSrc(avatarPath, userId, isGroup)
    {
        // обновляем все аватары для этого пользователя/группы
        const avatarElements = document.querySelectorAll(`[data-user-id="${userId}"] .avatar img`);
        avatarElements.forEach(img => 
        {
            // добавляем обработчик ошибок загрузки изображения
            img.onerror = () => 
            {
                img.src = this.avatarsPath + (isGroup ? this.defaultGroupAvatar : this.defaultAvatar);
                console.warn("Error in _setAvatrsSrc");
                this.avatars.set(userId, (this.avatarsPath + (isGroup ? this.defaultGroupAvatar : this.defaultAvatar)));
            };
            img.src = avatarPath;
        });
    }
}

// создаем глобальный экземпляр менеджера аватаров
export const avatarManager = new AvatarManager(); 