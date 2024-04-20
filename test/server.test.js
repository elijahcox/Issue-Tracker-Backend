const request = require('supertest');
const chai = require("fix-esm").require('chai');
const expect = chai.expect;

const server = require('../server');
//const expect = chai.expect;

describe('GET /', () => {
  it('should return status 200', (done) => {
    request(server)
      .get('/')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });
});