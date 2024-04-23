require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const server = express();
const { logger, errorLogger } = require("./middleware/logEvents.js");
const connectDB = require("./config/dbConn.js");
const PORT = process.env.port || 3500;

connectDB();

server.use(logger); //custom middleware logger

server.use("/", require("./routes/root"));

server.use(errorLogger); //custom middleware logger

mongoose.connection.once("open", () => {
    console.log("Db connected");
    server.listen(PORT, () => console.log("Server running on port: " + PORT));
});

module.exports = server;
