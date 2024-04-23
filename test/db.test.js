const request = require("supertest");
const chai = require("fix-esm").require("chai");
const server = require("../server");
const connectDB = require("../config/dbConn.js");
const expect = chai.expect;

describe("connect to db", () => {
    before(async () => {
        await connectDB();
    });
});
