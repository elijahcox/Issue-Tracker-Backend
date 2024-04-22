const request = require("supertest");
const chai = require("fix-esm").require("chai");
const server = require("../server");
const expect = chai.expect;
const fs = require("fs");
const path = require("path");

function getFileSize(filePath) {
    var logFile;
    try {
        logFile = fs.statSync(filePath);
    } catch (error) {
        return 0; //assume file has not been made pre call and thus has size 0, we do not need to validate that it will get created here
    }
    return logFile.size;
}

describe("Test logEvents.js with simple GET /", () => {
    it("should increase logEvents file size", async () => {
        const filePath = path.join(__dirname, "..", "logs", "reqLog.txt");
        const originalFileSize = getFileSize(filePath); //get original size pre req log
        await request(server).get("/");
        const newFileSize = getFileSize(filePath); //get new size post req log call
        expect(newFileSize).to.not.equal(originalFileSize);
    });
});
