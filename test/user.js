//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require('mongoose');
let Device = require('../src/models/device');
let User = require('../src/models/user');
let Location = require('../src/models/location');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src/app');
let should = chai.should();
let Service = require('../src/models/service');

chai.use(chaiHttp);

// saved user id
var ownerUserId;

// saved device
var theDevice;

// saved location
var theLocation;

// saved service
var theService;

//Our parent block
describe('Users', function() {
    before('Creating User, Device, Location and Service for tests...', (done) => { // Before all tests we add a user to be owner of our new test devices and a device, location and service
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
            let device = new Device({
                'name': 'Test Device',
                'type': 'LORA',
                'enabled': 'true',
                'owner': ownerUserId,
                'transducers': [{
                    'name': 'Temperature',
                    'unit': 'Celsius',
                    'is_actuable': 'true'
                }]
            });
            device.save((err, device) => {
                if (err) console.log('***error!');
                theDevice = device;
            });
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
            });
            let service = new Service({
                'name': 'Test Service',
                'description': 'A test service',
                'owner': ownerUserId
            });
            service.save((err, srv) => {
                if (err) console.log('***error!');
                theService = srv;
            });
            done();
        });
    });

    // After all tests, cleanup
    after('Cleaning up...', function() {
        theDevice.remove();
        theLocation.remove();
        theService.remove();
    });

    /*
     * Test the /GET route
     */
    describe('/GET user', function() {
        it('it should GET logged-in users', (done) => {
            chai.request(server)
                .get('/api/user/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('email');
                    done();
                });
        });

        it('it should GET the services of a user', (done) => {
            chai.request(server)
                .get('/api/user/myservices')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);
                    res.body[0].should.have.property('id');
                    res.body[0].id.should.equal(theService.id); // only check id
                    done();
                });
        });

        it('it should GET the devices of a user', (done) => {
            chai.request(server)
                .get('/api/user/mydevices')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);
                    res.body[0].should.have.property('id');
                    res.body[0].id.should.equal(theDevice.id); // only check id
                    done();
                });
        });

        it('it should GET the locations of a user', (done) => {
            chai.request(server)
                .get('/api/user/mylocations')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);
                    res.body[0].should.have.property('id');
                    res.body[0].id.should.equal(theLocation.id); // only check id
                    done();
                });
        });

    });

});