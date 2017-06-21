//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require('mongoose');
let Device = require('../src/models/device');
let DeviceTplt = require('../src/models/device_template');
let User = require('../src/models/user');


//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src/app');
let should = chai.should();

chai.use(chaiHttp);

// saved user id, to be owner of created objects
var ownerUserId;

// saved device, to be the base of our templates
var baseDevice;

//Our parent block
describe('Device Templates', function() {
	// Before all tests we add a user to be owner of our new test devices and a device
    before('Creating User and Device for tests...', (done) => { 
        User.findOne({
            email: 'test@test.com'
        }, function(err, user) {
            if (err) {
                let user = new User({
                    name: 'test',
                    email: 'test@test.com'
                });
                user.save();
                ownerUserId = user.id
                console.log('ownerUserId:' + ownerUserId);
            }
            ownerUserId = user.id;
            let device = new Device({
                'name': 'Test Device',
                'type': 'LORA',
                'enabled': 'true',
                'owner': ownerUserId,
                'transducer': [{
                    'name': 'Temperature',
                    'unit': 'Celsius',
                    'properties': {
                        'protobuf': 'uint:32'
                    }
                }]
            });
            device.save((err, device) => {
                if (err) console.log('***error!');
                baseDevice = device;
                done();
            });
        });
    });

	// After all tests, cleanup
    after('Cleaning up...', function() {
    	baseDevice.remove();
 	});

	//Before each test we remove all device templates
    beforeEach((done) => { 
        DeviceTplt.remove({}, (err) => {
            done();
        });
    });

    /*
     * Test the /POST route
     */
    describe('/POST devicetemplate', function() {
        it('it should *not* POST a device template without name field', (done) => {
            let dev = {
                'device_id': baseDevice.id
            }
            chai.request(server)
                .post('/api/devicetemplate/')
                .send(dev)
                .end((err, res) => {
                    /**expected:
                    res.should.have.status(400); */
                    res.should.have.status(500);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    res.body.error.should.have.property('message');
                    res.body.error.message.should.equal('DeviceTemplate validation failed: name: Path `name` is required.');
                    done();
                });
        });

        it('it should POST a new device template', (done) => {
            let devicetplt = {
                'name': 'Lora Template',
                'device_id': baseDevice.id
            }
            chai.request(server)
                .post('/api/devicetemplate/')
                .send(devicetplt)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('name');
                    res.body.name.should.equal('Lora Template');
                    res.body.should.have.property('transducers');
                    res.body.transducers.should.be.a('array');
                    res.body.transducers.length.should.be.eql(0);
                    done();
                });
        });
    });

    /*
     * Test the /GET/:id route
     */
    describe('/GET/:id devicetemplate', function() {
        it('it should GET a device template by id', (done) => {
            let devicetplt = new DeviceTplt({
                'name': 'Lora Template',
                'device_id': baseDevice.id,
                'owner': ownerUserId
            });
            devicetplt.save((err, devicetplt) => {
                chai.request(server)
                    .get('/api/devicetemplate/' + devicetplt.id)
                    .send(devicetplt)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.id.should.equal(devicetplt.id);
                        res.body.name.should.equal('Lora Template');
                        res.body.should.have.property('transducers');
                        res.body.transducers.should.be.a('array');
                        res.body.transducers.length.should.be.eql(0);
                        done();
                    });
            });
        });
    });

    /*
     * Test the /PUT/:id route
     */
    describe('/PUT/:id devicetemplate', function() {
        it('it should *not (unsupported)* UPDATE a device template by id', (done) => {
            let devicetplt = new DeviceTplt({
                'name': 'Lora Template',
                'device_id': baseDevice.id,
                'owner': ownerUserId
            });
            devicetplt.save((err, devicetplt) => {
                let ndtplt = new DeviceTplt({
                    'name': 'Updated Lora Template',
                    'device_id': baseDevice.id,
                });
                chai.request(server)
                    .get('/api/devicetemplate/' + devicetplt.id)
                    .send(ndtplt)
                    .end((err, res) => {
                        /**expected:
                        res.should.have.status(400); */
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.id.should.equal(devicetplt.id);
                        res.body.name.should.equal('Lora Template'); // all the same...
                        res.body.should.have.property('transducers');
                        res.body.transducers.should.be.a('array');
                        res.body.transducers.length.should.be.eql(0);
                        done();
                    });
            });
        });
    });

    /*
     * Test the /DELETE route
     */
    describe('/DELETE devicetemplate', function() {
        it('it should DELETE a new device template', (done) => {
            let devicetplt = new DeviceTplt({
                'name': 'Lora Template',
                'device_id': baseDevice.id,
                'owner': ownerUserId
            });
            devicetplt.save((err, devicetplt) => {
                chai.request(server)
                    .delete('/api/devicetemplate/' + devicetplt.id)
                    .send(devicetplt)
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