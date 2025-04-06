const service = require("../service/userService");

module.exports = {
    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    login: (req, res) => {
        const username = req.body.username;
        if (!username) {
            res.status(400).json({
                error: "Not valid username"
            });
            return;
        }

        const id = service.login(username);

        if (id) {
            req.session.userId = id;
            res.status(200).json({ id: id });
        } else {
            res.status(400).json({
                error: `Username ${username} is logined`
            });
        }
    },

    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    getAll: (req, res) => {
        res.status(200).json(service.getAll(req.session.userId));
    },

    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    getOnline: (req, res) => {
        res.status(200).json(service.getOnline(req.session.userId));
    }
};