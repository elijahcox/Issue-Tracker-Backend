const express = require("express");
const router = express.Router();
const taskController = require("../../controllers/taskController");

router.route("/").get(taskController.getAllTasks).post(taskController.createTask);

router.route("/:id").get(taskController.getTask).delete(taskController.deleteTask).patch(taskController.updateTask);

module.exports = router;
