const request = require("supertest");
const chai = require("fix-esm").require("chai");
const server = require("../server");
const expect = chai.expect;

describe("Simple Get requests", () => {
    it("should return status 200 when GET /", (done) => {
        request(server)
            .get("/")
            .end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
    });

    it("should return status 401 when GET/{undefined} while not authenticated", (done) => {
        request(server)
            .get("/junk")
            .end((err, res) => {
                expect(res.status).to.equal(401);
                done();
            });
    });

    it("should return status 401 when requesting tasks resource area without a token", (done) => {
        request(server)
            .get("/tasks")
            .end((err, res) => {
                expect(res.status).to.equal(401);
                done();
            });
    });
});
