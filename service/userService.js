const db    = require("../db/ramDb");
const users = db.getUsers();
const User  = require("../model/user");



module.exports = {
    /**
     * Find or create user with given name.
     * Returns user uuid or empty string if user already logined
     * @param {String} username
     * @returns {String} user uuid or empty string if user already logined
     */
    login: (username) => {
        let user = users.find(e => e.name == username);

        if (!user) {
            user = new User(db.generateId(), username);
            users.push(user);
        } else if (user.online) {
            return "";
        }

        return user.id;
    },

    /**
     * 
     * @param {String} id 
     * @returns {User}
     */
    getById: (id) => {
        return users.find(e => e.id == id);
    },

    /**
     * 
     * @param {String} exceptId 
     * @returns {Array<User>}
     */
    getAll: (exceptId) => {
        return Array.from(users.filter(e => e.id != exceptId));
    },

    /**
     * 
     * @param {String} exceptId 
     * @returns {Array<User>}
     */
    getOnline: (exceptId) => {
        return Array.from(users.filter(e => e.id != exceptId && e.online));
    }
}