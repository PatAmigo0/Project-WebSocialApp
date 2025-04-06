const service = require("../service/convService");

module.exports = {
    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    create: (req, res) => {
        const convObj = req.body;
        let id = null;
        
        try {
            id = service.create(convObj);
        } catch(e) {
            // PASS
        }

        if (id) {
            res.status(200).json({ id: id });
        } else {
            res.status(400).json({
                error: `Error with creating a new conversation`
            });
        }
    },

    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    getAll: (req, res) => {
        res.status(200).json(service.getAllForUser(req.session.userId));
    },

    getById: (req, res) => {
        const { id } = req.query;
        const conv = service.getFullById(id);

        if (conv) {
            res.status(200).json(conv);
        } else {
            res.status(400).json({
                error: `Conversation with id ${id} not found`
            });
        }
    }
};