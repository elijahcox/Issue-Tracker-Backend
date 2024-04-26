const request = require("supertest");
const chai = require("fix-esm").require("chai");
const server = require("../server");
const connectDB = require("../config/dbConn.js");
const User = require("../model/User.js");
const expect = chai.expect;

const tempUser = {
    username: "testUser",
    password: "testPassword"
};

describe("Register User", () => {
    before(async () => {
        await connectDB();
    });

    it("should create a test user when posting JSON to /register", (done) => {
        request(server)
            .post("/register")
            .send(tempUser)
            .expect(201)
            .then((res) => {
                expect(res.body.username).to.be.eql(tempUser.username);
                done();
            })
            .catch((err) => done(err));
    });

    it("should return an access token in body when posting JSON to /authenticate", (done) => {
        request(server)
            .post("/authenticate")
            .send(tempUser)
            .expect(200)
            .then((res) => {
                expect(res.body.accessToken).to.not.eql("");
                done();
            })
            .catch((err) => done(err));
    });

    after(async () => {
        try {
            await User.deleteOne({ username: tempUser.username });
        } catch (err) {
            console.error(err);
        }
    });
});
