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

    /**
     * устанавливаем аватар для пользователя
     * @param {string} userId - ID пользователя
     * @param {string} avatarPath - путь к аватару
     * @param {boolean} isGroup - является ли пользователь группой
     */         
    setAvatar(userId, avatarPath, isGroup = false) 
    {
        if (!avatarPath) avatarPath = this.getAvatarPath(userId);
        else
           avatarPath = this.avatarsPath + avatarPath;
        this.avatars.set(userId, avatarPath);
        this._setAvatarsSrc(avatarPath, userId, isGroup);
    }

    /**
     * получаем путь к аватару пользователя (на будущее для локальных аватаров)
     * @param {string} userId - ID пользователя
     * @param {boolean} isGroup - является ли пользователь группой
     * @returns {string} - путь к аватару
     */     
    getAvatarPath(userId, isGroup = false) 
    {
        return this.avatars.get(userId) || this.avatarsPath + (isGroup 
            ? `${this.currentStyle}/${this.currentStyle}-group.png` 
            : `${this.currentStyle}/${this.currentStyle}-avatar.png`);
    }

    // для других функций вне avatarManager для того чтобы знать какой сейчас стиль
    getCurrentAvatarsStyle()
    {
        return this.currentStyle;
    }

    changeAvatarsStyle(style)
    {
        this.currentStyle = style;
    }

    /**
     * устанавливаем путь для img
     * @param {string} avatarPath - путь к аватару
     * @param {string} userId - ID пользователя
     * @param {boolean} isGroup - является ли пользователь группой
    */     
    _setAvatarsSrc(avatarPath, userId, isGroup = false)
    {
        // обновляем все аватары для этого пользователя/группы
        const avatarElements = document.querySelectorAll(`[data-user-id="${userId}"] .avatar img`);
        avatarElements.forEach(img => 
        {
            // добавляем обработчик ошибок загрузки изображения
            img.onerror = () => 
            {
                console.warn("Error in _setAvatrsSrc");
                const path = this.getAvatarPath(userId, isGroup);
                img.src = this._setAvatarsSrc(path, userId)
                this.avatars.set(userId, path);
            };
            img.src = avatarPath;
        });
    }
}

// создаем глобальный экземпляр менеджера аватаров
export const avatarManager = new AvatarManager(); 