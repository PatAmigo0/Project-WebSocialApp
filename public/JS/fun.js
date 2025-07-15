/* ПРИКОЛЬЧИКИ АДМИНОВ МУХАХАХХАХАХАХАХ */
export class AdminHandler
{
    constructor()
    {
        this.admins = new Map();
        this.admins.set('0', true).set('69', true).set('1000', true);
    }

    /**
     * 
     * @param {string} text 
     */
    lol(text, sender)
    {
        if (this.admins.has(sender) && text.toLocaleLowerCase() == "rickrolxd")
        {
            location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        }
        else if (this.admins.has(sender) && text.toLocaleLowerCase() == "kick!")
        {
            localStorage.clear();
            location.reload();
        }
    }
}

export const admin = new AdminHandler();