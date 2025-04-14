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
    lol(text)
    {
        if (text.toLocaleLowerCase() == "rickrolxd")
        {
            location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        }
    }
}

export const admin = new AdminHandler();