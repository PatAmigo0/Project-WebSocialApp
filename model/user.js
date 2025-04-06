class User {
    /**
     * 
     * @param {String} id
     * @param {String} name
     * @param {Boolean} online
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.online = false;
    }
}

module.exports = User;