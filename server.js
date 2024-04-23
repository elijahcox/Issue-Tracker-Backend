require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const server = express();
const { logger, errorLogger } = require("./middleware/logEvents.js");
const connectDB = require("./config/dbConn.js");
const PORT = process.env.port || 3500;

connectDB();

server.use(logger); //custom middleware logger

server.use("/", require("./routes/root"));

server.all("*", (req, res) => {
    res.status(404); //set response status to 404
    if (req.accepts("html")) {
        //for browser based requests
        res.sendFile(path.join(__dirname, "views", "404.html"));
    } else if (req.accepts("json")) {
        //for api calls
        res.json({ error: "404 Not Found" });
    } else {
        //other
        res.type("txt").send("404 not found");
    }
});

server.use(errorLogger); //custom middleware logger

mongoose.connection.once("open", () => {
    console.log("Db connected");
    server.listen(PORT, () => console.log("Server running on port: " + PORT));
});

module.exports = server;
