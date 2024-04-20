const {format} = require('date-fns');
const {v4:uuid} = require('uuid');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

async function logEvents(message,logName){
    const dateTime = format(new Date(),'yyyy-MM-dd\tHH:MM:ss');
    const logItem = dateTime + '\t' + uuid() + message + '\n';
    try{
        if (!fs.existsSync(path.join(__dirname,'..',logName))){
            await fsPromises.mkdir(path.join(__dirname,'..',logName));
        }
        await fsPromises.appendFile(path.join(__dirname,'..',logName),logItem);
    }catch(error){
        console.error(error);
    }
}

const logger = (req,res,next)=>{
    logEvents(req.method + " " + req.headers.origin + " " + req.url + "\n", 'reqLog.txt');
    next();
}