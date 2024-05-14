const express = require("express");
const router = express.Router();
const authenticateController = require("../controllers/authenticateController");

router.route("/").post(authenticateController.handleLogin);

module.exports = router;
