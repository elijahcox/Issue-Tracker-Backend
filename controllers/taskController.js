const Task = require("../model/Task");
const { format } = require("date-fns");
const jwt = require("jsonwebtoken");

//place to create tasks, read tasks, update tasks, delete them, return

//need to only get tasks associated with userID, and we only get token from here along with request
function getDate() {
    return format(new Date(), "yyyy-MM-dd\tHH:MM:ss");
}

const getUserIDFromReq = (req) => {
    let retVal;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err || decoded.userID == "") return -1;
        retVal = decoded.UserInfo.userID;
    });
    return retVal;
};

////////////////////////////// Helper functions ^ //////////////////////////////

const createTask = async (req, res) => {
    const uid = getUserIDFromReq(req);
    let errorArray = [];
    let errorString;

    if (uid == -1) {
        return res.sendStatus(403);
    }

    if (!req.body.title) {
        errorArray.push("title");
    }
    if (!req.body.size) {
        errorArray.push("size");
    }
    if (!req.body.priority) {
        errorArray.push("priority");
    }
    if (errorArray.length > 0) {
        errorString = errorArray.join(", ");
        return res.status(400).json({ "message": errorString + " required to create task" });
    }
    try {
        const result = await Task.create({
            title: req.body.title,
            status: "To Do",
            priority: req.body.priority,
            size: req.body.size,
            description: req.body.description,
            userID: uid,
            createdDate: getDate() //REQUIRED
        });

        return res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
};

const getTask = async (req, res) => {
    const uid = getUserIDFromReq(req);
    if (uid == -1) {
        return res.sendStatus(403);
    }

    const taskID = req.params.id;
    if (taskID == "") {
        return res.status(400).json({ "message": "task id required" });
    }

    const foundTask = await Task.findOne({ _id: taskID, userID: uid }).exec();

    if (!foundTask) {
        return res.status(404).json({ "message": "no task matching id " + taskID });
    }
    res.json(foundTask);
};

const getAllTasks = async (req, res) => {
    const uid = getUserIDFromReq(req);
    if (uid == -1) {
        return res.sendStatus(403);
    }

    if (req.body.status) {
        return getTasksByStatus(req, res);
    }
    if (req.body.priority) {
        return getTasksByPriority(req, res);
    }

    const foundTask = await Task.find({ userID: uid }).exec();

    if (foundTask.length == 0) {
        return res.status(404).json({ "message": "no tasks found" });
    }

    return res.status(200).json(foundTask);
};

const getTasksByStatus = async (req, res) => {
    const uid = getUserIDFromReq(req);

    const foundTask = await Task.find({ userID: uid, status: req.body.status }).exec();

    if (foundTask.length == 0) {
        return res.status(404).json({ "message": "no tasks found" });
    }

    return res.status(200).json(foundTask);
};

const getTasksByPriority = async (req, res) => {
    const uid = getUserIDFromReq(req);

    const foundTask = await Task.find({ userID: uid, priority: req.body.priority }).exec();

    if (foundTask.length == 0) {
        return res.status(404).json({ "message": "no tasks found" });
    }

    return res.status(200).json(foundTask);
};

const updateTask = async (req, res) => {
    const uid = getUserIDFromReq(req);
    if (uid == -1) {
        return res.sendStatus(403);
    }

    const taskID = req.params.id;
    if (taskID == "") {
        return res.status(400).json({ "message": "task id required" });
    }

    const foundTask = await Task.findOne({ _id: taskID, userID: uid }).exec();

    if (!foundTask) {
        return res.status(204).json({ "message": "no task matching id " + taskID });
    }

    if (req.body?.title) foundTask.title = req.body.title;
    if (req.body?.priority) foundTask.priority = req.body.priority;
    if (req.body?.size) foundTask.size = req.body.size;
    if (req.body?.description) foundTask.description = req.body.description;
    if (req.body?.status) {
        foundTask.status = req.body.status;
        if (req.body.status == "Done") foundTask.completedDate = getDate();
    }

    const result = await foundTask.save();
    return res.status(204).json(result);
};

const deleteTask = async (req, res) => {
    const uid = getUserIDFromReq(req);
    if (uid == -1) {
        return res.sendStatus(403);
    }

    const taskID = req.params.id;
    if (taskID == "") {
        return res.status(400).json({ "message": "task id required" });
    }

    const foundTask = await Task.findOne({ _id: taskID, userID: uid }).exec();

    if (!foundTask) {
        return res.status(204).json({ "message": "no task matching id " + taskID });
    }

    const result = await foundTask.deleteOne();
    return res.status(204).json(result);
};

module.exports = {
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getAllTasks
};
