const request = require("supertest");
const chai = require("fix-esm").require("chai");
const server = require("../server");
const expect = chai.expect;

before(function (done) {
    connectDB(done);
});

describe("connect to db", () => {
    it("should successfully connect", (done) => {});
});
