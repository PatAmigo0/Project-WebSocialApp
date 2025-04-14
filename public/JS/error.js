export class ErrorHandler
{
    constructor()
    {
        this.errorWindow = document.querySelector('.error-window');
        this.contentWindow = this.errorWindow.querySelector('.error-window-content');
        this.button = this.errorWindow.querySelector('#closeErrorWindow');
        this.setupEventListeners();
    }

    setupEventListeners()
    {
        this.button.addEventListener('click', () => 
        {
            this.errorWindow.classList.remove('active');
        });
    }

    toggleErrorWindow(msg = "НЕИЗВЕСТНАЯ ОШИБКА!")
    {
        this.errorWindow.classList.add('active');
        this.setErrorMsg(msg);
    }

    setErrorMsg(msg)
    {
        this.contentWindow.innerHTML = `<span id="closeErrorWindow">X</span>`;
        this.button = this.errorWindow.querySelector('#closeErrorWindow');
        this.setupEventListeners();
        this.contentWindow.append(document.createTextNode(msg));
    }
}

export const errorHandler = new ErrorHandler();