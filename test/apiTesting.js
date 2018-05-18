var mocha = require('mocha')
var chai = require('chai')
  , chaiHttp = require('chai-http');
//var describe = require('mocha').describe
//var it = require('mocha').it
var assert = require('chai').assert
var expect = require('chai').expect
chai.use(chaiHttp);
var app = 'http://localhost'

console.log('User Watch History API Testing');

describe('#Update Watch History', function() {
    it('checking positive request: update watch history', function(done) {
        chai.request(app)
            .post('/api/user/5afe5076734d1d7d453ef93c/storeHistory')
            .send({
                watch_history:
                  [490214,333339]
              })
            .end(function(err, res) {
                //console.log(JSON.stringify(res))
                expect(res).to.have.status(200);
                var resp = JSON.parse(res.text)
                assert.equal(resp.status, "success");
                done(); 
            });
    });    
});