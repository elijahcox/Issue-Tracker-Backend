const request = require("supertest");
const chai = require("fix-esm").require("chai");
const server = require("../server");
const connectDB = require("../config/dbConn.js");
const User = require("../model/User.js");
const Task = require("../model/Task.js");
const expect = chai.expect;

const tempUser = {
    username: "testUser",
    password: "testPassword"
};

const tempTask = {
    title: "Test Task",
    size: "3",
    priority: "small"
};

let accessToken;
let uid;
let tid;

describe("Standard CRUD Lifecycle Flow for Users and Tasks", () => {
    before(async () => {
        await connectDB();
    });

    it("should create a test user when posting JSON to /register", async () => {
        await request(server)
            .post("/register")
            .send(tempUser)
            .expect(201)
            .then((res) => {
                expect(res.body.username).to.be.eql(tempUser.username);
            })
            .catch((err) => done(err));
        const foundUser = await User.findOne({ username: tempUser.username }).exec();
        expect(foundUser).to.not.eql(null);
        uid = foundUser._id.toString();
    });

    it("should return an access token in body and upload refresh to DB when posting valid JSON credentials to /authenticate", async () => {
        await request(server)
            .post("/authenticate")
            .send(tempUser)
            .expect(200)
            .then((res) => {
                expect(res.body.accessToken).to.not.eql("");
                accessToken = res.body.accessToken;
            });
        const foundUser = await User.findOne({ username: tempUser.username }).exec();
        expect(foundUser.refreshToken).to.not.eql(null);
    });

    it("should NOT create a new task when posting a task to /tasks WITHOUT AT in body", async () => {
        await request(server)
            .post("/tasks")
            .send(tempTask)
            .expect(401)
            .then((res) => {
                expect(res.body).to.eql({});
            });
    });

    it("should create a new task when posting a task to /tasks with AT in body", async () => {
        await request(server)
            .post("/tasks")
            .send(tempTask)
            .set("Authorization", "Bearer " + accessToken)
            .expect(201)
            .then((res) => {
                tid = res.body._id;
                expect(res.body).to.not.eql("");
            });
        const foundTask = await Task.findOne({ _id: tid, userID: uid }).exec();
        expect(foundTask).to.not.eql(null);
    });

    it("should update existing task object when posting updated field to /tasks, including ID", async () => {
        /**/
    });

    it("should return the correct task when querying /tasks with GET by ID", async () => {
        /**/
    });

    it("should return the correct number of tasks when querying /tasks with GET ALL", async () => {
        /**/
    });

    it("should successfully delete tasks when posting valid ID to /delete", async () => {
        /**/
    });

    it("should clear a refresh token from cookie and user database upon request to /logout", (done) => {
        request(server)
            .post("/logout")
            .send()
            .expect(204)
            .then((res) => {
                expect(res.cookies.jwt).to.eql("");
                done();
            });
        const foundUser = User.findOne({ username: tempUser.username }).exec();
        expect(foundUser.refreshToken).to.eql(undefined);
        done();
    });

    it("should not return an access token when posting invalid JSON credentials to /authenticate", (done) => {
        tempUser.password = "x"; //Problem, I thought this needed to be async
        request(server)
            .post("/authenticate")
            .send(tempUser)
            .expect(401)
            .then((res) => {
                expect(res.text).to.contain("Unauthorized");
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
