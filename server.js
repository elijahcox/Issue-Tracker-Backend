const express = require('express');

const app = express();
const PORT = process.env.port || 3500;

app.listen(PORT, ()=> console.log('Server running on port: ' + PORT))