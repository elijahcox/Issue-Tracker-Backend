const {format} = require('date-fns');
const {v4:uuid} = require('uuid');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const logEvents = async(message,logName) => {

}

const logger = (req,res,next)=>{
    logEvents(req.method + " " + req.headers.origin + " " + req.url + "\n", 'reqLog.txt');
    next();
}