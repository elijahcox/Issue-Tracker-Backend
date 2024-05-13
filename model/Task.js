const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    userID: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        required: true
    },
    completedDate: {
        type: Date
    }
});

module.exports = mongoose.model("Task", taskSchema);
