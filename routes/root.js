const express = require('express');
const router = express.Router();
const path = require('path');

router.get('^/$|/index(.html)?',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','views','index.html'));
});

module.exports = router; //we always do this with routes as they are mini servers to be imported in the main file