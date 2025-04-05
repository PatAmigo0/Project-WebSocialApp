export class modalUser 
{
    /**
     * 
     * @param {Array} user 
     * @param {HTMLElement} list 
     */
    constructor(user, list, callback) 
    {
        const newUser = document.createElement('div');
        this.toggled = false;
        newUser.classList.add('modal-element');
        newUser.dataset.userId = String(user.id);

        newUser.innerHTML = `
            <div class="modal-profile-info"> 
                <div class="avatar">
                    <img src="images/avatars/default/default-avatar.png" alt="Аватар пользователя">
                </div>
                <div class="name">${user.name}</div>
            </div>
        `;

        newUser.onclick = () =>
        {
            newUser.classList.toggle("selected");
            this.toggled = !this.toggled;
            callback(this.toggled);
        }

        list.append(newUser);
    }
}
