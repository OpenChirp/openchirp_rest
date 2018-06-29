//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require('mongoose');
let Device = require('../src/models/device');
let User = require('../src/models/user');


//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src/app');
let should = chai.should();

chai.use(chaiHttp);

// saved user id, to be owner of created objects
var ownerUserId;

//Our parent block
describe('Devices', function() {
    before('Creating User for tests...', (done) => { // Before all tests we add a user to be owner of our new test devices
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
                done();
            } else ownerUserId = user.id;
            done();
         });
    });

    beforeEach((done) => { //Before each test we remove all devices
        Device.remove({}, (err) => {
            done();
        });
    });

    /*
     * Test the /GET route
     */
    describe('/GET device', function() {
        it('it should GET all the devices', (done) => {
            chai.request(server)
                .get('/api/device/')
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
    describe('/POST device', function() {
        it('it should *not* POST a device without name field', (done) => {
            let dev = {
                'type': 'LORA',
                'enabled': 'true'
            }
            chai.request(server)
                .post('/api/device/')
                .send(dev)
                .end((err, res) => {
                    /**expected :
                    res.should.have.status(400); */
                    res.should.have.status(500);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    res.body.error.should.have.property('message');
                    res.body.error.message.should.equal('Device validation failed: name: Path `name` is required.');
                    done();
                });
        });

        it('it should POST a new device', (done) => {
            let dev = {
                'name': 'Test Device',
                'type': 'LORA',
                'enabled': 'true',
                'owner': ownerUserId,
                'transducers': [{
					  'name':'Temperature',
					  'unit':'Celsius',
					  'properties':{
					    'protobuf':'uint:32'
					    }
					}]
            }
            chai.request(server)
                .post('/api/device/')
                .send(dev)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('name');
                    res.body.name.should.equal('Test Device');
                    res.body.should.have.property('type');
                    res.body.type.should.equal('LORA');
                    res.body.should.have.property('enabled');
                    res.body.enabled.should.equal(true);
                    res.body.should.have.property('transducers');
                    res.body.transducers.should.be.a('array');
                    res.body.transducers.length.should.be.eql(1);
                    done();
                });
        });
    });

    /*
     * Test the /GET/:id route
     */
    describe('/GET/:id device', function() {
        it('it should GET a device by id', (done) => {
            let device = new Device({
                'name': 'Test Device',
                'type': 'LORA',
                'enabled': 'true',
                'owner': ownerUserId
            });
            device.save((err, device) => {
                chai.request(server)
                    .get('/api/device/' + device.id)
                    .send(device)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.id.should.equal(device.id);
                        res.body.should.have.property('name');
                        res.body.name.should.equal('Test Device');
                        res.body.should.have.property('type');
                        res.body.type.should.equal('LORA');
                        res.body.should.have.property('enabled');
                        res.body.enabled.should.equal(true);
                        done();
                    });
            });
        });
    });

    /*
     * Test the /PUT/:id route
     */
    describe('/PUT/:id device', function() {
        it('it should UPDATE a device by id', (done) => {
            let device = new Device({
                'name': 'Test Device',
                'type': 'LORA',
                'enabled': 'true',
                'owner': ownerUserId,
                'transducers': [{
					  'name':'Temperature',
					  'unit':'Celsius',
					  'properties':{
					    'protobuf':'uint:32'
					    }
					}]
            });
            device.save((err, device) => {
                let ndevice = {
                    'name': 'Updated Test Device',
                    'type': 'LORA',
                    'enabled': 'false'
                };
                chai.request(server)
                    .put('/api/device/' + device.id)
                    .send(ndevice)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.id.should.equal(device.id);
                        res.body.should.have.property('name');
                        res.body.name.should.equal('Updated Test Device');
                        res.body.should.have.property('type');
                        res.body.type.should.equal('LORA');
                        res.body.should.have.property('enabled');
                        res.body.enabled.should.equal(false);
                        res.body.should.have.property('transducers'); /* transducers array stays the same ...*/
                        res.body.transducers.should.be.a('array');
                        res.body.transducers.length.should.be.eql(1);
                        done();
                    });
            });
        });
    });

    /*
     * Test the /DELETE/:id route
     */
    describe('/DELETE/:id device', function() {
        it('it should DELETE a device by id', (done) => {
            let device = new Device({
                'name': 'Test Device',
                'type': 'LORA',
                'enabled': 'true',
                'owner': ownerUserId
            });
            device.save((err, device) => {
                chai.request(server)
                    .delete('/api/device/' + device.id)
                    .send(device)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Delete successful');
                        done();
                    });
            });
        });
    });

});


