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

    it("should return status 404 when GET/{undefined}", (done) => {
        request(server)
            .get("/junk")
            .end((err, res) => {
                expect(res.status).to.equal(404);
                expect(res.text).to.contain("The requested resource could not be found");
                done();
            });
    });
});
