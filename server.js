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

server.use(express.json()); //without a route specified, app use will be called with any request, they follow the chained order layed out here

server.use("/", require("./routes/root"));
server.use("/register", require("./routes/api/register.js"));

server.all("*", (req, res) => {
    res.status(404); //set response status to 404
    if (req.accepts("html")) {
        res.sendFile(path.join(__dirname, "views", "404.html")); //for browser based requests
    } else if (req.accepts("json")) {
        res.json({ error: "404 Not Found" }); //for api calls
    } else {
        res.type("txt").send("404 not found"); //other
    }
});

server.use(errorLogger); //custom middleware logger

mongoose.connection.once("open", () => {
    console.log("Db connected");
    server.listen(PORT, () => console.log("Server running on port: " + PORT));
});

module.exports = server;
