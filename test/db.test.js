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
    size: "medium",
    priority: "low"
};

let accessToken;
let uid;
let tid;
let tid2;

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
                expect(res.body).to.not.eql("");
                tid = res.body._id;
            });
        const foundTask = await Task.findOne({ _id: tid, userID: uid }).exec();
        expect(foundTask).to.not.eql(null);
    });

    it("should return the correct task when querying /tasks with GET by ID", async () => {
        await request(server)
            .get("/tasks/" + tid)
            .set("Authorization", "Bearer " + accessToken)
            .expect(200)
            .then((res) => {
                expect(res.body.title).to.be.eql("Test Task");
            });
    });

    it("should successfully call patch on /tasks/:id", async () => {
        tempTask.title = "Updated Title";
        await request(server)
            .patch("/tasks/" + tid)
            .send(tempTask)
            .set("Authorization", "Bearer " + accessToken)
            .expect(204)
            .then((res) => {
                expect(res.body).to.not.eql("");
            });
        const foundTask = await Task.findOne({ _id: tid, userID: uid }).exec();
        expect(foundTask.title).to.eql("Updated Title");
    });

    it("should return the correct number of tasks when querying /tasks with GET ALL", async () => {
        await request(server) //create second task
            .post("/tasks")
            .send(tempTask)
            .set("Authorization", "Bearer " + accessToken)
            .expect(201)
            .then((res) => {
                expect(res.body).to.not.eql("");
                tid2 = res.body._id;
            });

        await request(server) //create second task
            .get("/tasks")
            .set("Authorization", "Bearer " + accessToken)
            .expect(200)
            .then((res) => {
                expect(res.body).to.not.eql("");
                expect(res.body.length).to.eql(2);
            });
    });

    it("should return the correct number of tasks when querying /tasks with GET by status", async () => {
        await request(server) //create second task
            .get("/tasks")
            .send({ "status": "To Do" })
            .set("Authorization", "Bearer " + accessToken)
            .expect(200)
            .then((res) => {
                expect(res.body).to.not.eql("");
                expect(res.body.length).to.eql(2);
            });
    });

    it("should return the correct number of tasks when querying /tasks with GET by priority", async () => {
        await request(server) //create second task
            .get("/tasks")
            .send({ "priority": "low" })
            .set("Authorization", "Bearer " + accessToken)
            .expect(200)
            .then((res) => {
                expect(res.body).to.not.eql("");
                expect(res.body.length).to.eql(2);
            });
    });

    it("should return 0 tasks when querying /tasks with GET by priority", async () => {
        await request(server)
            .get("/tasks")
            .send({ "priority": "medium" })
            .set("Authorization", "Bearer " + accessToken)
            .expect(404)
            .then((res) => {});
    });

    it("should unsuccessfully call delete  on /tasks/:id (valid id, no auth token)", async () => {
        await request(server)
            .delete("/tasks/" + tid)
            .expect(401)
            .then((res) => {});
        const foundTask = await Task.findOne({ _id: tid, userID: uid }).exec();
        expect(foundTask).to.not.eql(null);
    });

    it("should successfully call delete  on /tasks/:id (valid id)", async () => {
        await request(server)
            .delete("/tasks/" + tid)
            .set("Authorization", "Bearer " + accessToken)
            .expect(204)
            .then((res) => {});
        const foundTask = await Task.findOne({ _id: tid, userID: uid }).exec();
        expect(foundTask).to.eql(null);

        await request(server)
            .delete("/tasks/" + tid2)
            .set("Authorization", "Bearer " + accessToken)
            .expect(204)
            .then((res) => {});
        const foundTask2 = await Task.findOne({ _id: tid2, userID: uid }).exec();
        expect(foundTask2).to.eql(null);
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
