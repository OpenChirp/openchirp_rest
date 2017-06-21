//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require('mongoose');
let User = require('../src/models/user');
let Gateway = require('../src/models/gateway');
let Location = require('../src/models/location');


//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src/app');
let should = chai.should();

chai.use(chaiHttp);

// saved user id, to be owner of created objects
var ownerUserId;

// saved location, to be the location of test gateways
var theLocation;

//Our parent block
describe('Gateways', function() {
    before('Creating User for tests...', (done) => { // Before all tests we add a user to be owner of our new test gateways
        User.findOne({
            email: 'test@test.com'
        }, function(err, user) {
            if (user == undefined) {
                let user = new User({
                    name: 'test',
                    email: 'test@test.com'
                });
                user.save();
                ownerUserId = user.id
            } else ownerUserId = user.id;
            let location = new Location({
                'name': 'Building 1',
                'type': 'BUILDING',
                'geo_loc': {
                    'coordinates': [40.4509146, -79.9024777]
                },
                'owner': ownerUserId
            });
            location.save((err, loc) => {
                if (err) console.log('***error!');
                theLocation = loc;
                done();
            });
        });
    });

    // After all tests, cleanup
    after('Cleaning up...', function() {
        theLocation.remove();
    });

    beforeEach((done) => { //Before each test we remove all gateways
        Gateway.remove({}, (err) => {
            done();
        });
    });

    /*
     * Test the /GET route
     */
    describe('/GET gateway', function() {
        it('it should GET all the gateways', (done) => {
            chai.request(server)
                .get('/api/gateway/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

    /*
     * Test the /POST route
     */
    describe('/POST gateway', function() {
        it('it should *not* POST a gateway without name field', (done) => {
            let ngateway = {
                'type': 'LORA',
                'location_id': theLocation.id,
                'owner': ownerUserId
            }
            chai.request(server)
                .post('/api/gateway/')
                .send(ngateway)
                .end((err, res) => {
                    /**expected to be :
                    res.should.have.status(400); */
                    res.should.have.status(500);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    res.body.error.should.have.property('message');
                    res.body.error.message.should.equal('Gateway validation failed: name: Path `name` is required.');
                    done();
                });
        });

        it('it should POST a new gateway', (done) => {
            let ngateway = {
                'name': 'Test Gateway',
                'type': 'LORA',
                'location_id': theLocation.id,
                'owner': ownerUserId
            }
            chai.request(server)
                .post('/api/gateway/')
                .send(ngateway)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('name');
                    res.body.name.should.equal('Test Gateway');
                    res.body.should.have.property('type');
                    res.body.type.should.equal('LORA');
                    res.body.should.have.property('location_id');
                    res.body.location_id.should.equal(theLocation.id);
                    res.body.should.have.property('enabled');
                    res.body.enabled.should.equal(true);
                    res.body.should.have.property('pubsub');
                    done();
                });
        });
    });

    /*
     * Test the /GET/:id route
     */
    describe('/GET/:id gateway', function() {
        it('it should GET a gateway by id', (done) => {
            let gateway = new Gateway({
                'name': 'Test Gateway',
                'type': 'LORA',
                'location_id': theLocation.id,
                'owner': ownerUserId
            });
            gateway.save((err, gateway) => {
                chai.request(server)
                    .get('/api/gateway/' + gateway.id)
                    .send(gateway)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.id.should.equal(gateway.id);
                        res.body.name.should.equal('Test Gateway');
                        res.body.should.have.property('type');
                        res.body.type.should.equal('LORA');
                        res.body.should.have.property('location_id');
                        res.body.location_id.should.equal(theLocation.id);
                        res.body.should.have.property('enabled');
                        res.body.enabled.should.equal(true);
                        res.body.should.have.property('pubsub');
                        done();
                    });
            });
        });
    });

    /*
     * Test the /PUT/:id route
     */
    describe('/PUT/:id gateway', function() {
        it('it should UPDATE a gateway by id', (done) => {
            let gateway = new Gateway({
                'name': 'Test Gateway',
                'type': 'LORA',
                'location_id': theLocation.id,
                'owner': ownerUserId
            });
            gateway.save((err, gateway) => {
                let ngateway = {
                    'name': 'Updated Test Gateway',
                    /**expected to also allow changing type:
                    'type': 'ZIGBEE',
                    */
                    'enabled': false
                };
                chai.request(server)
                    .put('/api/gateway/' + gateway.id)
                    .send(ngateway)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.id.should.equal(gateway.id);
                        res.body.name.should.equal('Updated Test Gateway');
                        res.body.should.have.property('type');
                        /**expected to also allow changing type:                        
                        res.body.type.should.equal('ZIGBEE');*/
                        res.body.should.have.property('location_id');
                        res.body.location_id.should.equal(theLocation.id);
                        res.body.should.have.property('enabled');
                        res.body.enabled.should.equal(false);
                        res.body.should.have.property('pubsub');
                        done();
                    });
            });
        });
    });

    /*
     * Test the /DELETE/:id route
     */
    describe('/DELETE/:id gateway', function() {
        it('it should DELETE a gateway by id', (done) => {
            let gateway = new Gateway({
                'name': 'Test Gateway',
                'type': 'LORA',
                'location_id': theLocation.id,
                'owner': ownerUserId
            });
            gateway.save((err, gateway) => {
                chai.request(server)
                    .delete('/api/gateway/' + gateway.id)
                    .send(gateway)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Done');
                        done();
                    });
            });
        });
    });

});