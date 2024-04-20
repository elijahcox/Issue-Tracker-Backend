const express = require('express');
const server = express();
const PORT = process.env.port || 3500;

server.use('/', require('./routes/root'));

server.listen(PORT, ()=> console.log('Server running on port: ' + PORT))

module.exports = server;