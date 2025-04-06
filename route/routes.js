const express = require("express");
const router  = express.Router();

const userController = require("../controller/userController");
const convController = require("../controller/convController");



router.get("/users", userController.getAll);
router.get("/users/online", userController.getOnline);
router.get("/convs", convController.getAll);
router.get("/conv", convController.getById);

router.post("/login", userController.login);
router.post("/conv/create", convController.create);

module.exports = router;