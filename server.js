const express = require('express');
const server = express();
const {logger} = require('./middleware/logEvents.js')
const PORT = process.env.port || 3500;

server.use(logger);//custom middleware logger

server.use('/', require('./routes/root'));

server.listen(PORT, ()=> console.log('Server running on port: ' + PORT))

module.exports = server;